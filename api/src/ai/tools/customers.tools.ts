import { tool } from 'ai';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';
import { AiSecurityService, UserSecurityContext } from '../ai-security.service';
import { PERMISSION_MODULES } from '../../common/role-permissions.constants';

/**
 * @file ai/tools/customers.tools.ts
 * AI tool implementations for Customers.
 */
export function buildCustomersTools(
  prisma: PrismaService,
  aiSecurityService: AiSecurityService,
  userContext: UserSecurityContext,
) {
  return {
    getCustomers: tool({
      description: 'Get a list of customers visible to the user. Optionally filter by status.',
      parameters: z.object({
        limit: z.number().optional().describe('Maximum number of customers to return. Default is 5, max 50.'),
        status: z.string().optional().describe('Customer status to filter by (e.g. ACTIVE, PREMIUM, INACTIVE)'),
        search: z.string().optional().describe('Search query for customer or company name'),
      }),
      execute: async (args: { limit?: number; status?: string; search?: string }) => {
        const toolName = 'getCustomers';
        const hasContactsPerm = aiSecurityService.hasModulePermission(userContext, PERMISSION_MODULES.CONTACTS);
        const hasCompaniesPerm = aiSecurityService.hasModulePermission(userContext, PERMISSION_MODULES.COMPANIES);
        const hasDashboardPerm = aiSecurityService.hasModulePermission(userContext, PERMISSION_MODULES.DASHBOARD);

        if (!hasContactsPerm && !hasCompaniesPerm && !hasDashboardPerm) {
          await aiSecurityService.logToolExecution(userContext, toolName, 'DENIED', {
            reason: 'Missing Contacts/Companies/Dashboard permission',
          });
          return { error: 'ACCESS_DENIED', message: 'You do not have permission to view Customers.' };
        }

        try {
          const { limit = 5, status, search } = args;
          const safeLimit = Math.max(1, Math.min(limit, 50));
          const visibilityFilter = aiSecurityService.getCustomersVisibilityFilter(userContext);

          const whereClause: any = { ...visibilityFilter };
          if (status) whereClause.status = status;
          if (search) {
            whereClause.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ];
          }

          const customers = await prisma.customer.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: safeLimit,
            select: { id: true, name: true, company: true, email: true, status: true, revenue: true, createdAt: true },
          });

          await aiSecurityService.logToolExecution(userContext, toolName, 'ALLOWED', { count: customers.length });

          return customers.map((c) => ({
            id: c.id, name: c.name, company: c.company, email: c.email,
            status: c.status, revenue: c.revenue ? Number(c.revenue) : 0,
            createdAt: c.createdAt.toISOString(),
          }));
        } catch (e: any) {
          await aiSecurityService.logToolExecution(userContext, toolName, 'ERROR', { error: e.message });
          return { error: 'Failed to fetch customers.', details: e.message };
        }
      },
    } as any),
  };
}
