
// Firebase configuration for push notifications
// This service handles sending push notifications via Expo's push notification service
// Works for both Android and iOS platforms

export interface PushNotificationPayload {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  categoryId?: string;
  mutableContent?: boolean;
  subtitle?: string;
}

export class FirebaseService {
  private static instance: FirebaseService;
  private expoPushEndpoint = 'https://exp.host/--/api/v2/push/send';

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Send a push notification using Expo's push notification service
   * This works for both Android and iOS, including when app is closed
   */
  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      const message = {
        to: payload.to,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || 'default',
        badge: payload.badge,
        channelId: payload.channelId || 'default',
        priority: payload.priority || 'high',
        categoryId: payload.categoryId,
        mutableContent: payload.mutableContent || true,
        subtitle: payload.subtitle,
      };

      const response = await fetch(this.expoPushEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      
      if (result.data && result.data.status === 'ok') {
        //console.log('Push notification sent successfully');
        return true;
      } else {
        //console.error('Failed to send push notification:', result);
        return false;
      }
    } catch (error) {
      //console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send push notification to multiple devices
   * Works for both Android and iOS
   */
  async sendPushNotificationToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<{ success: string[], failed: string[] }> {
    const results = {
      success: [] as string[],
      failed: [] as string[],
    };

    for (const token of tokens) {
      const success = await this.sendPushNotification({
        to: token,
        title,
        body,
        data,
      });

      if (success) {
        results.success.push(token);
      } else {
        results.failed.push(token);
      }
    }

    return results;
  }

  /**
   * Send a test notification
   * Works for both Android and iOS
   */
  async sendTestNotification(token: string): Promise<boolean> {
    return await this.sendPushNotification({
      to: token,
      title: 'Test Notification',
      body: 'This is a test notification from Firebase service',
      data: { type: 'test', timestamp: Date.now() },
      priority: 'high',
    });
  }

  /**
   * Send a welcome notification
   * Works for both Android and iOS
   */
  async sendWelcomeNotification(token: string, userName?: string): Promise<boolean> {
    return await this.sendPushNotification({
      to: token,
      title: 'Welcome!',
      body: userName ? `Welcome ${userName}!` : 'Welcome to our app!',
      data: { type: 'welcome', timestamp: Date.now() },
      priority: 'high',
    });
  }

  /**
   * Send a reminder notification
   * Works for both Android and iOS, including background
   */
  async sendReminderNotification(
    token: string,
    title: string,
    body: string,
    reminderData?: Record<string, any>
  ): Promise<boolean> {
    return await this.sendPushNotification({
      to: token,
      title,
      body,
      data: { type: 'reminder', ...reminderData, timestamp: Date.now() },
      priority: 'high',
      channelId: 'reminders',
    });
  }

  /**
   * Send a message notification
   * Works for both Android and iOS
   */
  async sendMessageNotification(
    token: string,
    title: string,
    body: string,
    messageData?: Record<string, any>
  ): Promise<boolean> {
    return await this.sendPushNotification({
      to: token,
      title,
      body,
      data: { type: 'message', ...messageData, timestamp: Date.now() },
      priority: 'normal',
      channelId: 'messages',
    });
  }

  /**
   * Send a high priority notification (urgent)
   * Works for both Android and iOS
   */
  async sendUrgentNotification(
    token: string,
    title: string,
    body: string,
    urgentData?: Record<string, any>
  ): Promise<boolean> {
    return await this.sendPushNotification({
      to: token,
      title,
      body,
      data: { type: 'urgent', ...urgentData, timestamp: Date.now() },
      priority: 'high',
      sound: 'default',
    });
  }
}

export default FirebaseService.getInstance(); 