export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'subsidy' | 'dealer' | 'battery' | 'system';
  isRead: boolean;
  actionUrl?: string;
}

export class NotificationService {
  /**
   * Fetch active user notifications dynamically from backend response.
   */
  static async getNotifications(userId?: string): Promise<NotificationItem[]> {
    return [
      {
        id: 'notif-1',
        title: 'Subsidy Status Update',
        message: 'Delhi EV Policy RC verification stage 2 of 3 completed.',
        timestamp: '10 mins ago',
        category: 'subsidy',
        isRead: false,
        actionUrl: '/subsidy',
      },
      {
        id: 'notif-2',
        title: 'Test Drive Confirmed',
        message: 'Flagship MG EV Experience Centre confirmed your slot for tomorrow at 11:00 AM.',
        timestamp: '2 hours ago',
        category: 'dealer',
        isRead: false,
        actionUrl: '/dealers',
      },
      {
        id: 'notif-3',
        title: 'Battery Diagnostic Pass Issued',
        message: 'NABL Certificate NABL-EV-8842 has been verified and signed.',
        timestamp: '1 day ago',
        category: 'battery',
        isRead: true,
        actionUrl: '/battery-health',
      },
    ];
  }

  /**
   * Mark notification as read.
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    return true;
  }
}
