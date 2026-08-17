import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(tenantId: string, userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { tenantId, userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true,
        type: true,
      },
    });

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.message,
        read: n.isRead,
        time: n.createdAt
          ? n.createdAt.toISOString()
          : new Date().toISOString(),
        type: n.type,
      })),
    };
  }

  async markAsRead(tenantId: string, userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (
      !notification ||
      notification.tenantId !== tenantId ||
      notification.userId !== userId
    ) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { success: true };
  }

  async markAllAsRead(tenantId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }
}
