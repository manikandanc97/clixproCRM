import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLoggerService } from '../../common/audit/audit-logger.service';
import { AuditIntegrityMonitorService } from '../../common/audit/integrity/audit-integrity-monitor.service';
import { Redis } from '@upstash/redis';
import * as crypto from 'crypto';

export interface CreateIncidentDto {
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  incidentType?: string;
  tenantId?: string | null;
  affectedUserId?: string | null;
}

export interface ListIncidentsDto {
  severity?: string;
  status?: string;
  tenantId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class SecurityIncidentsService {
  private readonly logger = new Logger(SecurityIncidentsService.name);
  private redisClient: Redis | null = null;
  private readonly dedupCooldownSeconds: number = 86400; // 24 hours

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogger: AuditLoggerService,
    private readonly integrityMonitor: AuditIntegrityMonitorService,
  ) {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      try {
        this.redisClient = new Redis({
          url: redisUrl,
          token: redisToken,
        });
      } catch (err: any) {
        this.logger.warn(`Redis client init failed for incident deduplication: ${err?.message || err}`);
      }
    }
  }

  private generateIncidentNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `INC-${dateStr}-${rand}`;
  }

  /**
   * Creates a security incident with audit event emission.
   */
  async createIncident(dto: CreateIncidentDto, actorId: string) {
    if (!dto.title || dto.title.trim().length < 5) {
      throw new BadRequestException('Title must be at least 5 characters');
    }
    if (!dto.description || dto.description.trim().length < 10) {
      throw new BadRequestException('Description must be at least 10 characters');
    }

    const incidentNumber = this.generateIncidentNumber();

    const incident = await (this.prisma as any).securityIncident.create({
      data: {
        incidentNumber,
        title: dto.title.trim(),
        description: dto.description.trim(),
        severity: dto.severity || 'MEDIUM',
        status: 'OPEN',
        incidentType: dto.incidentType || 'SECURITY_ALERT',
        tenantId: dto.tenantId || null,
        affectedUserId: dto.affectedUserId || null,
        detectedBy: actorId,
        createdBy: actorId,
      },
    });

    await this.auditLogger.log({
      tenantId: dto.tenantId || null,
      userId: actorId,
      targetUserId: dto.affectedUserId || null,
      action: 'SECURITY_INCIDENT_CREATED',
      module: 'Security',
      details: {
        incidentId: incident.id,
        incidentNumber: incident.incidentNumber,
        severity: incident.severity,
        title: incident.title,
      },
    });

    this.logger.warn(`Security Incident ${incidentNumber} created by ${actorId}: [${incident.severity}] ${incident.title}`);
    return incident;
  }

  /**
   * Automated incident creation from background triggers with Redis deduplication.
   */
  async autoTriggerIncident(params: {
    incidentType: string;
    scope: string; // tenantId or 'platform'
    targetId: string;
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    tenantId?: string | null;
    affectedUserId?: string | null;
  }) {
    const dedupKey = `security-incident:${params.scope}:${params.incidentType}:${params.targetId}`;

    if (this.redisClient) {
      try {
        const isNew = await this.redisClient.set(dedupKey, '1', {
          nx: true,
          ex: this.dedupCooldownSeconds,
        });
        if (!isNew) {
          this.logger.debug(`Suppressed duplicate auto incident: ${dedupKey}`);
          return null;
        }
      } catch (redisErr: any) {
        this.logger.warn(`Redis dedup check failed: ${redisErr?.message || redisErr}`);
      }
    }

    return this.createIncident(
      {
        title: params.title,
        description: params.description,
        severity: params.severity,
        incidentType: params.incidentType,
        tenantId: params.tenantId || null,
        affectedUserId: params.affectedUserId || null,
      },
      'SYSTEM',
    );
  }

  /**
   * Lists security incidents with filters and pagination.
   */
  async listIncidents(params: ListIncidentsDto) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.severity) where.severity = params.severity;
    if (params.status) where.status = params.status;
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { incidentNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      (this.prisma as any).securityIncident.count({ where }),
      (this.prisma as any).securityIncident.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      incidents: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves single incident details.
   */
  async getIncidentById(id: string) {
    const incident = await (this.prisma as any).securityIncident.findUnique({
      where: { id },
    });
    if (!incident) {
      throw new NotFoundException(`Security Incident ${id} not found`);
    }
    return incident;
  }

  /**
   * Updates incident status (INVESTIGATING, CONTAINED, FALSE_POSITIVE).
   */
  async updateIncidentStatus(id: string, status: string, notes: string | undefined, actorId: string) {
    const validStatuses = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'FALSE_POSITIVE'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status "${status}". Allowed: ${validStatuses.join(', ')}`);
    }

    const existing = await this.getIncidentById(id);

    const updated = await (this.prisma as any).securityIncident.update({
      where: { id },
      data: {
        status,
        resolutionNotes: notes || existing.resolutionNotes,
      },
    });

    await this.auditLogger.log({
      tenantId: existing.tenantId,
      userId: actorId,
      targetUserId: existing.affectedUserId,
      action: 'SECURITY_INCIDENT_UPDATED',
      module: 'Security',
      details: {
        incidentId: id,
        previousStatus: existing.status,
        newStatus: status,
        notes: notes || null,
      },
    });

    return updated;
  }

  /**
   * Resolves an incident.
   */
  async resolveIncident(id: string, resolutionNotes: string, actorId: string) {
    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      throw new BadRequestException('Resolution notes of at least 5 characters are required');
    }

    const existing = await this.getIncidentById(id);

    const resolved = await (this.prisma as any).securityIncident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedBy: actorId,
        resolvedAt: new Date(),
        resolutionNotes: resolutionNotes.trim(),
      },
    });

    await this.auditLogger.log({
      tenantId: existing.tenantId,
      userId: actorId,
      targetUserId: existing.affectedUserId,
      action: 'SECURITY_INCIDENT_RESOLVED',
      module: 'Security',
      details: {
        incidentId: id,
        incidentNumber: existing.incidentNumber,
        resolutionNotes: resolutionNotes.trim(),
        resolvedAt: new Date().toISOString(),
      },
    });

    return resolved;
  }

  /**
   * Retrieves high-level security center status for the dashboard.
   */
  async getSecurityCenterStatus() {
    const [
      openIncidents,
      criticalIncidents,
      lockedUsers,
      lockedTenants,
      platformState,
      integrityStatus,
    ] = await Promise.all([
      (this.prisma as any).securityIncident.count({
        where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
      }),
      (this.prisma as any).securityIncident.count({
        where: {
          severity: 'CRITICAL',
          status: { in: ['OPEN', 'INVESTIGATING'] },
        },
      }),
      (this.prisma as any).user.count({
        where: { securityStatus: 'LOCKED' },
      }),
      (this.prisma as any).tenant.count({
        where: { securityStatus: 'LOCKED' },
      }),
      (this.prisma as any).platformSecurityState.findUnique({
        where: { id: 'global' },
      }),
      this.integrityMonitor.getSystemStatus().catch(() => null),
    ]);

    return {
      emergencyMode: platformState?.emergencyMode || false,
      emergencyReason: platformState?.reason || null,
      openIncidents,
      criticalIncidents,
      lockedUsers,
      lockedTenants,
      auditIntegrityStatus: integrityStatus?.status || 'HEALTHY',
      archiveCoveragePercent: integrityStatus?.archiveCoveragePercent || 100,
      checkedRecords: integrityStatus?.checkedRecords || 0,
      brokenChains: integrityStatus?.brokenLinks || 0,
      failedArchives: integrityStatus?.failedArchives || 0,
      lastCheckAt: integrityStatus?.lastCheckAt || new Date().toISOString(),
    };
  }
}
