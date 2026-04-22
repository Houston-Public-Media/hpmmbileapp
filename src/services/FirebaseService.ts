export interface PushNotificationPayload {
  to: string; 
  title: string;
  image?: string;
  body: string;
  screen?: string;
  params?: Record<string, any>; 
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

  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      const message = {
        to: payload.to,
        title: payload.title,
        
        body: payload.body,
        sound: payload.sound ?? 'default',
        badge: payload.badge,
        channelId: payload.channelId ?? 'default',
        priority: payload.priority ?? 'high',
        categoryId: payload.categoryId,
        mutableContent: payload.mutableContent,
        subtitle: payload.subtitle,
        

        data: {
          image: payload.image,
          ...(payload.screen ? { screen: payload.screen } : {}),
          ...(payload.params ? payload.params : {}),
          timestamp: Date.now(),
        },
      };

      const response = await fetch(this.expoPushEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      return result.data && result.data.status === 'ok';
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  async sendPushNotificationToMultiple(
    tokens: string[],
    title: string,
    body: string,
    screen?: string,
    params?: Record<string, any>
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };

    for (const token of tokens) {
      const success = await this.sendPushNotification({
        to: token,
        title,
        body,
        screen,
        params,
      });

      if (success) results.success.push(token);
      else results.failed.push(token);
    }

    return results;
  }
}

export default FirebaseService.getInstance();