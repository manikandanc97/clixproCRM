import prisma from "@/lib/prisma";




export class LeadTimelineService {
  static async getLeadTimeline(tenantId: string, leadId: string) {
    return prisma.timelineEvent.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createTimelineEvent(tenantId: string, leadId: string, action: string, description?: string, userId?: string) {
    return prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        userId,
        action,
        description
      },
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }
}


