



export class NotificationService {
  private static notificationSettings = {
    channels: [
      { id: "ch1", name: "Email Notifications", enabled: true },
      { id: "ch2", name: "Push Notifications", enabled: true },
      { id: "ch3", name: "In-App Alerts", enabled: true }
    ],
    categories: [
      {
        id: "cat1", title: "Leads & Sales",
        notifications: [
          { id: "n1", title: "New Lead Assigned", description: "When a lead is assigned to you", critical: true, enabled: true },
          { id: "n2", title: "Deal Won", description: "When a deal is marked as won", critical: false, enabled: true }
        ]
      },
      {
        id: "cat2", title: "Tasks & Meetings",
        notifications: [
          { id: "n3", title: "Task Due Soon", description: "24 hours before a task is due", critical: true, enabled: true },
          { id: "n4", title: "Meeting Reminder", description: "15 minutes before a meeting", critical: true, enabled: true }
        ]
      }
    ],
    realtimePulseEnabled: true
  };

  static async getNotificationSettings(_tenantId: string) {
    return this.notificationSettings;
  }

  static async updateNotificationSettings(_tenantId: string, data: ReturnType<typeof JSON.parse>) {
    if (data.channels) this.notificationSettings.channels = data.channels;
    if (data.categories) this.notificationSettings.categories = data.categories;
    if (data.realtimePulseEnabled !== undefined) this.notificationSettings.realtimePulseEnabled = data.realtimePulseEnabled;
    return this.notificationSettings;
  }
}


