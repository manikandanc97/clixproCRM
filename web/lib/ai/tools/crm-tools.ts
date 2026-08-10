import { tool } from 'ai';
import { z } from 'zod';
import prisma from '../../prisma';

// A helper to verify if the user has access to a specific record in their tenant
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyTenantAccess(tenantId: string, model: any, id: string) {
  const record = await model.findFirst({
    where: { id, tenantId }
  });
  if (!record) {
    throw new Error('Record not found or access denied.');
  }
  return record;
}

export const crmTools = (tenantId: string, userId: string) => ({
  getLead: tool({
    description: 'Get details of a specific lead by their ID or search by name.',
    inputSchema: z.object({
      id: z.string().optional().describe('The ID of the lead.'),
      name: z.string().optional().describe('The name of the lead to search for.'),
    }),
    execute: async (args: { id?: string; name?: string }) => {
      const { id, name } = args;
      if (id) {
        return await verifyTenantAccess(tenantId, prisma.lead, id);
      }
      if (name) {
        return await prisma.lead.findFirst({
          where: { tenantId, name: { contains: name, mode: 'insensitive' } },
          include: { customer: true, assignedTo: true }
        });
      }
      throw new Error('Must provide either id or name.');
    },
  }),

  getDashboardAnalytics: tool({
    description: 'Get high-level dashboard analytics for the company, including revenue, hot leads, and pending tasks.',
    inputSchema: z.object({}), // No params needed, context is inferred from tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (_args: any) => {
      const [leadsCount, totalRevenue, pendingTasks] = await Promise.all([
        prisma.lead.count({ where: { tenantId, stage: { notIn: ['WON', 'LOST'] } } }),
        prisma.customer.aggregate({ where: { tenantId }, _sum: { revenue: true } }),
        prisma.task.count({ where: { tenantId, status: 'PENDING' } })
      ]);

      return {
        activeLeads: leadsCount,
        totalRevenue: totalRevenue._sum.revenue || 0,
        pendingTasks,
      };
    }
  }),

  createLead: tool({
    description: 'Create a new lead in the CRM.',
    inputSchema: z.object({
      name: z.string().describe('Name of the lead.'),
      company: z.string().describe('Company name.'),
      email: z.string().email().describe('Email address.'),
      phone: z.string().optional().describe('Phone number.'),
      value: z.number().optional().describe('Expected value in currency.'),
    }),
    execute: async (args: { name: string; company: string; email: string; phone?: string; value?: number }) => {
      const { name, company, email, phone, value } = args;
      // In a real app, verify RBAC here (can this user create leads?)
      const lead = await prisma.lead.create({
        data: {
          tenantId,
          name,
          company,
          email,
          phone,
          value: value || 0,
          createdById: userId,
          assignedToId: userId, // Default assign to creator
        }
      });
      return { success: true, leadId: lead.id, lead };
    }
  }),

  searchCustomers: tool({
    description: 'Search for customers by name or company.',
    inputSchema: z.object({
      query: z.string().describe('Search query for name or company.'),
    }),
    execute: async (args: { query: string }) => {
      const { query } = args;
      const customers = await prisma.customer.findMany({
        where: {
          tenantId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: { id: true, name: true, company: true, status: true, revenue: true }
      });
      return { customers };
    }
  })
});
