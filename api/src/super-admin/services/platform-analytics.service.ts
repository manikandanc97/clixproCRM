import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformAnalytics() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalTenants,
      activeTenants,
      totalUsers,
      totalLeads,
      totalDeals,
      totalCustomers,
      totalQuotations,
      allTenants,
      planStats,
    ] = await this.prisma.withTenantContext(
      { isSuperAdmin: true },
      async (tx) => {
        return Promise.all([
          tx.tenant.count(),
          tx.tenant.count({ where: { status: 'ACTIVE' } }),
          tx.user.count(),
          tx.lead.count(),
          tx.deal.count(),
          tx.customer.count(),
          tx.quotation.count(),
          tx.tenant.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { id: true, plan: true, createdAt: true },
          }),
          tx.tenant.groupBy({
            by: ['plan'],
            _count: { _all: true },
          }),
        ]);
      },
    );

    // Build monthly growth trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends: Record<string, { month: string; organizations: number; users: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyTrends[key] = {
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        organizations: 0,
        users: 0,
      };
    }

    allTenants.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyTrends[key]) {
        monthlyTrends[key].organizations += 1;
      }
    });

    // Plan pricing model estimates for MRR in INR
    const planPrices: Record<string, number> = {
      free: 0,
      starter: 1999,
      pro: 4999,
      enterprise: 14999,
    };

    let estimatedMRR = 0;
    const planBreakdown = planStats.map((p) => {
      const count = p._count._all;
      const price = planPrices[p.plan?.toLowerCase()] || 0;
      const revenue = count * price;
      estimatedMRR += revenue;
      return {
        plan: p.plan || 'free',
        count,
        price,
        monthlyRevenue: revenue,
      };
    });

    return {
      totals: {
        totalTenants,
        activeTenants,
        totalUsers,
        totalLeads,
        totalDeals,
        totalCustomers,
        totalQuotations,
        estimatedMRR,
        estimatedARR: estimatedMRR * 12,
      },
      monthlyTrends: Object.values(monthlyTrends),
      planBreakdown,
    };
  }
}
