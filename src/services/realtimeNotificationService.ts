// Real-time notification service using localStorage events
export interface RealtimeNotification {
  id: string;
  type: 'like' | 'reply' | 'comment';
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NOTIFICATIONS_KEY = 'gamehub_realtime_notifications';

export const realtimeNotificationService = {
  // Send a real-time notification
  sendNotification(notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    // Get existing notifications
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: RealtimeNotification[] = stored ? JSON.parse(stored) : [];
    
    // Add new notification
    notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    
    // Save to localStorage
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: NOTIFICATIONS_KEY,
      newValue: JSON.stringify(notifications)
    }));
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('GameHub', {
        body: notification.message,
        icon: '/logofinal.png'
      });
    }
  },

  // Get notifications for a user
  getNotifications(userId: string): RealtimeNotification[] {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: RealtimeNotification[] = stored ? JSON.parse(stored) : [];
    return notifications.filter(n => n.toUserId === userId);
  },

  // Mark notification as read
  markAsRead(notificationId: string) {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: RealtimeNotification[] = stored ? JSON.parse(stored) : [];
    
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  },

  // Listen for real-time notifications
  onNotification(userId: string, callback: (notifications: RealtimeNotification[]) => void) {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NOTIFICATIONS_KEY) {
        const notifications = this.getNotifications(userId);
        callback(notifications);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Return cleanup function
    return () => window.removeEventListener('storage', handleStorageChange);
  },

  // Request notification permission
  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }
};