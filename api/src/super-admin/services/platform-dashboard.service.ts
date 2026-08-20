import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformOverview() {
    const [
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      totalUsers,
      activeUsers,
      totalLeads,
      totalCustomers,
      totalDeals,
      recentOrganizations,
      recentAuditLogs,
      tenantsByPlan,
    ] = await this.prisma.withTenantContext(
      { isSuperAdmin: true },
      async (tx) => {
        return Promise.all([
          tx.tenant.count(),
          tx.tenant.count({ where: { status: 'ACTIVE' } }),
          tx.tenant.count({ where: { status: 'SUSPENDED' } }),
          tx.user.count(),
          tx.user.count({ where: { status: 'ACTIVE' } }),
          tx.lead.count({ where: { deletedAt: null } }),
          tx.customer.count({ where: { deletedAt: null } }),
          tx.deal.count({ where: { deletedAt: null } }),
          tx.tenant.findMany({
            take: 8,
            orderBy: { createdAt: 'desc' },
            include: {
              _count: {
                select: { users: true, leads: true, customers: true },
              },
            },
          }),
          tx.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          }),
          tx.tenant.groupBy({
            by: ['plan'],
            _count: { _all: true },
          }),
        ]);
      },
    );

    // Format plan distribution
    const planDistribution = tenantsByPlan.map((p) => ({
      plan: p.plan || 'free',
      count: p._count._all,
    }));

    return {
      metrics: {
        totalOrganizations,
        activeOrganizations,
        suspendedOrganizations,
        totalUsers,
        activeUsers,
        totalLeads,
        totalCustomers,
        totalDeals,
      },
      planDistribution,
      recentOrganizations: recentOrganizations.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        status: t.status,
        userCount: t._count.users,
        leadCount: t._count.leads,
        customerCount: t._count.customers,
        createdAt: t.createdAt.toISOString(),
      })),
      recentAuditLogs: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        module: log.module || 'System',
        actor: log.user ? log.user.name || log.user.email : 'System',
        actorEmail: log.user?.email || null,
        tenantId: log.tenantId,
        details: log.details,
        createdAt: log.createdAt.toISOString(),
      })),
    };
  }
}
