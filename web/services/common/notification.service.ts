import prisma from "@/lib/prisma";




export class CommonNotificationService {
  static async getNotifications(tenantId: string, userId: string) {
    const notifications = await prisma.notification.findMany({ 
      where: { tenantId, userId }, 
      take: 20, 
      orderBy: { createdAt: 'desc' } 
    });
    return { notifications: notifications.map((n) => ({ id: n.id, title: n.title, description: n.message, read: n.isRead, time: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(), type: n.type })) };
  }

  static async markAsRead(tenantId: string, userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.tenantId !== tenantId || notification.userId !== userId) {
      throw new Error("NOT_FOUND");
    }
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(tenantId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true }
    });
  }
}



