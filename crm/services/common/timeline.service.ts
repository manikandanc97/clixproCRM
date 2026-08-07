import prisma from "@/lib/prisma";




export class TimelineService {
  static async logTimeline(tenantId: string, leadId: string, action: string, description: string | null = null, userId?: string) {
    return prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        action,
        description,
        userId
      }
    });
  }
}


