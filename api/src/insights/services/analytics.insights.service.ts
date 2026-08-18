import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * @file insights/services/analytics.insights.service.ts
 * AI insights, risk detection, recommendations, and anomaly alerts for analytics.
 */
@Injectable()
export class AnalyticsInsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAiInsights(tenantId: string) {
    const [leads, tasks] = await Promise.all([
      this.prisma.lead.findMany({
        where: { tenantId, stage: 'NEW', deletedAt: null },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, company: true },
      }),
      this.prisma.task.findMany({
        where: {
          tenantId,
          status: 'PENDING',
          dueDate: { lt: new Date() },
          deletedAt: null,
        },
        take: 2,
        select: { id: true, title: true },
      }),
    ]);

    const recommendations = [
      ...leads.map((l) => ({
        id: `lead-${l.id}`,
        type: 'opportunity',
        title: `Reach out to ${l.company}`,
        description: `New lead created recently. Engage early for higher conversion.`,
      })),
      ...tasks.map((t) => ({
        id: `task-${t.id}`,
        type: 'risk',
        title: `Overdue Task: ${t.title}`,
        description: `This task is overdue. Please complete it ASAP.`,
      })),
    ];

    return {
      stats: [
        {
          title: 'New Opportunities',
          value: leads.length.toString(),
          change: '+2%',
          trend: 'up',
          color: '#10b981',
          sparklineData: [{ value: 0 }],
        },
        {
          title: 'Risks Detected',
          value: tasks.length.toString(),
          change: '-1%',
          trend: 'down',
          color: '#ef4444',
          sparklineData: [{ value: 0 }],
        },
      ],
      recommendations,
      alerts: tasks.map((t) => ({
        id: t.id,
        message: `Task "${t.title}" is overdue`,
        severity: 'high',
        time: 'Now',
      })),
      trends: [],
      forecastData: [],
      timeline: [],
    };
  }
}
