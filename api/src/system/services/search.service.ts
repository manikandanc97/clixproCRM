import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(
    tenantId: string,
    userId: string,
    isEmployee: boolean,
    query: string,
  ) {
    if (!query || query.length < 2) {
      return [];
    }

    const employeeFilter = isEmployee ? { ownerId: userId } : {};

    const [leads, customers, companies, deals, tasks] = await Promise.all([
      // Leads
      this.prisma.lead.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
          ],
          ...employeeFilter,
        },
        take: 10,
        select: { id: true, name: true, email: true, company: true },
      }),
      // Customers
      this.prisma.customer.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
          ],
          ...employeeFilter,
        },
        take: 10,
        select: { id: true, name: true, email: true, company: true },
      }),
      // Companies
      this.prisma.company.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
          ...employeeFilter,
        },
        take: 10,
        select: { id: true, name: true, email: true },
      }),
      // Deals
      this.prisma.deal.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [{ name: { contains: query, mode: 'insensitive' } }],
          ...employeeFilter,
        },
        take: 10,
        select: { id: true, name: true, value: true },
      }),
      // Tasks
      this.prisma.task.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [{ title: { contains: query, mode: 'insensitive' } }],
        },
        take: 30,
        select: {
          id: true,
          title: true,
          priority: true,
          assignedToId: true,
          createdById: true,
        },
      }),
    ]);

    const filteredTasks = isEmployee
      ? tasks.filter(
          (t) => t.assignedToId === userId || t.createdById === userId,
        )
      : tasks;

    const results = [
      ...leads.map((l) => ({
        id: l.id,
        title: l.name,
        subtitle: l.company || l.email || 'Lead',
        type: 'Lead',
        url: `/leads/${l.id}`,
      })),
      ...customers.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.company || c.email || 'Customer',
        type: 'Customer',
        url: `/customers/${c.id}`,
      })),
      ...companies.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.email || 'Company',
        type: 'Company',
        url: `/companies/${c.id}`,
      })),
      ...deals.map((d) => ({
        id: d.id,
        title: d.name,
        subtitle: `Value: ${d.value}`,
        type: 'Deal',
        url: `/pipeline`,
      })),
      ...filteredTasks.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.priority || 'Task',
        type: 'Task',
        url: `/tasks`,
      })),
    ];

    return results;
  }
}
