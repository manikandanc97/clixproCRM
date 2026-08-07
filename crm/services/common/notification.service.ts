import prisma from "@/lib/prisma";




export class CommonNotificationService {
  static async getNotifications(tenantId: string) {
    const notifications = await prisma.notification.findMany({ where: { tenantId }, take: 5, orderBy: { createdAt: 'desc' } });
    return { notifications: notifications.map((n) => ({ id: n.id, title: n.title, description: n.message, read: n.isRead, time: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(), type: n.type })) };
  }
}



