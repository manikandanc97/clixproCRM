import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformSettings() {
    const [tenantCount, userCount, superAdminCount] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isSuperAdmin: true } }),
    ]);

    return {
      platform: {
        name: 'ClixProCRM Multi-Tenant Platform',
        version: '2.4.0',
        environment: process.env.NODE_ENV || 'development',
        systemStatus: 'HEALTHY',
        maintenanceMode: false,
        allowPublicRegistrations: true,
        defaultTenantPlan: 'free',
        apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
      },
      stats: {
        totalOrganizations: tenantCount,
        totalUsers: userCount,
        superAdminCount,
      },
      features: {
        aiCopilot: true,
        documentRag: true,
        multiCurrency: true,
        auditLogging: true,
        rateLimiting: true,
      },
    };
  }

  async updatePlatformSettings(data: any, adminActorId: string) {
    await this.prisma.auditLog.create({
      data: {
        userId: adminActorId,
        action: 'PLATFORM_SETTINGS_UPDATED',
        module: 'SuperAdmin',
        details: data,
      },
    });

    return {
      success: true,
      message: 'Platform settings updated successfully',
      settings: data,
    };
  }
}
