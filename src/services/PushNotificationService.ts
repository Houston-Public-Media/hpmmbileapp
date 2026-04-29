import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior for both foreground and background
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export interface PushNotificationData {
	title: string;
	body: string;
	data?: Record<string, any>;
}

export class PushNotificationService {
	private static instance: PushNotificationService;
	private expoPushToken: string | null = null;

	private constructor() {}

	public static getInstance(): PushNotificationService {
		if (!PushNotificationService.instance) {
			PushNotificationService.instance = new PushNotificationService();
		}
		return PushNotificationService.instance;
	}


	/* Save Expo token to database */
	async saveTokenToServer(token: string) {
		try {
			const response = await fetch('https://push.hpm.io/token.php', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token: token,
					platform: Platform.OS,
				}),
			});

			const result = await response.json();
			console.log('Token saved to DB:', result);

		} catch (error) {
			console.error('Failed to save token:', error);
		}
	}
	/* Remove Expo token from database */
	async removeTokenFromServer(token: string) {
		try {
			const response = await fetch('https://push.hpm.io/remove-token.php', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token: token,
				}),
			});

			const result = await response.json();
			console.log('Token removed from DB:', result);

		} catch (error) {
			console.error('Failed to remove token:', error);
		}
	}

	/* ✅ NEW: Sync token with permission state */
	async syncPushTokenWithServer(): Promise<void> {
		try {
			const { status } = await Notifications.getPermissionsAsync();

			// If permission revoked → remove token
			if (status !== 'granted') {
				if (this.expoPushToken) {
					await this.removeTokenFromServer(this.expoPushToken);
					this.expoPushToken = null;
					console.log('Push disabled → token removed');
				}
				return;
			}

			// If permission granted but no token → re-register
			if (!this.expoPushToken) {
				await this.registerForPushNotifications();
			}

		} catch (error) {
			console.error('Error syncing push token:', error);
		}
	}

	/**
	 * Register for push notifications and get the token
	 * Works for both Android and iOS
	 */
	async registerForPushNotifications(): Promise<string | null> {
		let token: string | null = null;

		if (Platform.OS === 'android') {
			// Android 13+ (API 33+) requires POST_NOTIFICATIONS permission at runtime
			if (Platform.Version >= 33) {
				const { status: androidStatus } = await Notifications.requestPermissionsAsync();
				if (androidStatus !== 'granted') {
					//console.log('Notification permission not granted on Android 13+!');
					return null;
				}
			}
			// Android notification channel setup
			await Notifications.setNotificationChannelAsync('default', {
				name: 'Default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
				sound: 'default',
				enableVibrate: true,
				showBadge: true,
			});

			// Additional channels for different notification types
			await Notifications.setNotificationChannelAsync('reminders', {
				name: 'Reminders',
				importance: Notifications.AndroidImportance.HIGH,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
				sound: 'default',
				enableVibrate: true,
				showBadge: true,
			});

			await Notifications.setNotificationChannelAsync('messages', {
				name: 'Messages',
				importance: Notifications.AndroidImportance.DEFAULT,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
				sound: 'default',
				enableVibrate: true,
				showBadge: true,
			});
		}

		if (Device.isDevice) {
			const { status: existingStatus } = await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;

			if (existingStatus !== 'granted') {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}

			if (finalStatus !== 'granted') {
				//console.log('Failed to get push token for push notification!');
				return null;
			}

			try {
				// Get the project ID from Constants
				const projectId = Constants.expoConfig?.extra?.eas?.projectId;

				if (!projectId) {
					console.warn('No EAS project ID found. Push tokens may not work for server notifications.');
					console.log('Available Constants:', JSON.stringify(Constants.expoConfig, null, 2));
				}

				// Get the token that uniquely identifies this device
				// This works for both Android and iOS
				const tokenResponse = await Notifications.getExpoPushTokenAsync({
					projectId: projectId || 'hpm-application', // Fallback to the project ID from Firebase config
				});

				token = tokenResponse.data;
				this.expoPushToken = token;
				await this.saveTokenToServer(token);
				console.log('Expo push token:', token);

				if (token) {
					console.log('PPush token generated successfully');
				} else {
					console.error('Failed to generate push token');
				}
			} catch (error) {
				console.error('Error getting push token:', error);
				console.log('Constants.expoConfig:', Constants.expoConfig);
				console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
				console.log('Constants.expoConfig?.extra?.eas:', Constants.expoConfig?.extra?.eas);
				return null;
			}
		} else {
			console.log('Must use physical device for Push Notifications');
		}

		return token;
	}

	/**
	 * Get the current push token
	 */
	getPushToken(): string | null {
		return this.expoPushToken;
	}

	/**
	 * Check if push token is available
	 */
	isPushTokenAvailable(): boolean {
		return !!this.expoPushToken;
	}

	/**
	 * Get detailed push token status for debugging
	 */
	getPushTokenStatus(): {
		isAvailable: boolean;
		token: string | null;
		projectId: string | null;
		deviceInfo: {
			isDevice: boolean;
			platform: string;
			version: string;
		};
	} {
		return {
			isAvailable: !!this.expoPushToken,
			token: this.expoPushToken,
			projectId: Constants.expoConfig?.extra?.eas?.projectId || null,
			deviceInfo: {
				isDevice: Device.isDevice,
				platform: Platform.OS,
				version: Platform.Version.toString(),
			},
		};
	}

	/**
	 * Add notification received listener (works in foreground)
	 */
	addNotificationReceivedListener(
		callback: (notification: Notifications.Notification) => void
	): Notifications.Subscription {
		return Notifications.addNotificationReceivedListener(callback);
	}

	/**
	 * Add notification response listener (when user taps notification)
	 * Works for both foreground and background notifications
	 */
	addNotificationResponseReceivedListener(
		callback: (response: Notifications.NotificationResponse) => void
	): Notifications.Subscription {
		return Notifications.addNotificationResponseReceivedListener(callback);
	}

	/**
	 * Schedule a local notification
	 */
	async scheduleLocalNotification(
		title: string,
		body: string,
		data?: Record<string, any>,
		trigger?: Notifications.NotificationTriggerInput,
		channelId?: string
	): Promise<string> {
		const identifier = await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				data,
				sound: 'default',
				priority: Notifications.AndroidNotificationPriority.HIGH,
			},
			trigger: trigger || null,
		});
		return identifier;
	}

	async cancelScheduledNotification(identifier: string): Promise<void> {
		await Notifications.cancelScheduledNotificationAsync(identifier);
	}

	async cancelAllScheduledNotifications(): Promise<void> {
		await Notifications.cancelAllScheduledNotificationsAsync();
	}

	async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
		return await Notifications.getAllScheduledNotificationsAsync();
	}

	async getPermissionsStatus(): Promise<Notifications.NotificationPermissionsStatus> {
		return await Notifications.getPermissionsAsync();
	}

	async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
		return await Notifications.requestPermissionsAsync();
	}

	async sendTestNotification(title: string = 'Test Notification', body: string = 'This is a test notification'): Promise<string> {
		return await this.scheduleLocalNotification(title, body, { type: 'test' });
	}

	async sendReminderNotification(
		title: string,
		body: string,
		delaySeconds: number = 5,
		data?: Record<string, any>
	): Promise<string> {
		return await this.scheduleLocalNotification(
			title,
			body,
			{ type: 'reminder', ...data },
			{ seconds: delaySeconds } as any,
			'reminders'
		);
	}

	async sendMessageNotification(
		title: string,
		body: string,
		data?: Record<string, any>
	): Promise<string> {
		return await this.scheduleLocalNotification(
			title,
			body,
			{ type: 'message', ...data },
			undefined,
			'messages'
		);
	}

	async disablePushNotifications(): Promise<void> {
		try {
			await Notifications.cancelAllScheduledNotificationsAsync();
			if ((Notifications as any).dismissAllNotificationsAsync) {
				await (Notifications as any).dismissAllNotificationsAsync();
			}
		} finally {
			this.expoPushToken = null;
		}
	}
}

export default PushNotificationService.getInstance();