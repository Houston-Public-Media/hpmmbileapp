import * as Device from 'expo-device';
import {PermissionsAndroid, Platform} from 'react-native';
import {
	AuthorizationStatus, deleteToken,
	getMessaging,
	getToken, Messaging,
	registerDeviceForRemoteMessages,
	requestPermission, unregisterDeviceForRemoteMessages
} from '@react-native-firebase/messaging';

export class PushNotificationService {
	private static instance: PushNotificationService;
	private fcmPushToken: string | null = null;
	private messaging: Messaging = getMessaging();

	private constructor() {}

	public static getInstance(): PushNotificationService {
		if (!PushNotificationService.instance) {
			PushNotificationService.instance = new PushNotificationService();
		}
		return PushNotificationService.instance;
	}

	/* ✅ NEW: Sync token with permission state */
	async syncPushTokenWithServer(): Promise<void> {
		try {
			const status = await this.requestUserPermission();

			// If permission revoked → remove token
			if (status !== AuthorizationStatus.AUTHORIZED && status !== AuthorizationStatus.PROVISIONAL) {
				if (this.fcmPushToken) {
					await unregisterDeviceForRemoteMessages(this.messaging);
					this.fcmPushToken = null;
					console.log('Push disabled → token removed');
				}
				return;
			}

			// If permission granted but no token → re-register
			if (!this.fcmPushToken) {
				await this.registerForPushNotifications();
			}

		} catch (error) {
			console.error('Error syncing push token:', error);
		}
	}

	async requestUserPermission() {
		let iOSSettings = {};
		if (Platform.OS !== 'android') {
			iOSSettings = {
				"alert": true,
				"announcement": false,
				"badge": true,
				"criticalAlert": false,
				"carPlay": true,
				"provisional": false,
				"sound": true,
				"providesAppNotificationSettings": true
			};
		}
		return await requestPermission(this.messaging, iOSSettings);
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
				const androidStatus = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
				if (androidStatus !== PermissionsAndroid.RESULTS.GRANTED) {
					//console.log('Notification permission not granted on Android 13+!');
					return null;
				}
			}
			// Android notification channel setup
			// await Notifications.setNotificationChannelAsync('default', {
			// 	name: 'Default',
			// 	importance: Notifications.AndroidImportance.MAX,
			// 	vibrationPattern: [0, 250, 250, 250],
			// 	lightColor: '#FF231F7C',
			// 	sound: 'default',
			// 	enableVibrate: true,
			// 	showBadge: true,
			// });
			//
			// // Additional channels for different notification types
			// await Notifications.setNotificationChannelAsync('reminders', {
			// 	name: 'Reminders',
			// 	importance: Notifications.AndroidImportance.HIGH,
			// 	vibrationPattern: [0, 250, 250, 250],
			// 	lightColor: '#FF231F7C',
			// 	sound: 'default',
			// 	enableVibrate: true,
			// 	showBadge: true,
			// });
			//
			// await Notifications.setNotificationChannelAsync('messages', {
			// 	name: 'Messages',
			// 	importance: Notifications.AndroidImportance.DEFAULT,
			// 	vibrationPattern: [0, 250, 250, 250],
			// 	lightColor: '#FF231F7C',
			// 	sound: 'default',
			// 	enableVibrate: true,
			// 	showBadge: true,
			// });
		}

		if (Device.isDevice) {
			const authStatus = await this.requestUserPermission();
			if (authStatus !== AuthorizationStatus.AUTHORIZED) {
				//console.log('Failed to get push token for push notification!');
				return null;
			}

			try {
				// Get the project ID from Constants
				// const projectId = Constants.expoConfig?.extra?.eas?.projectId;
				//
				// if (!projectId) {
				// 	console.warn('No EAS project ID found. Push tokens may not work for server notifications.');
				// 	console.log('Available Constants:', JSON.stringify(Constants.expoConfig, null, 2));
				// }

				// Get the token that uniquely identifies this device
				// This works for both Android and iOS
				await registerDeviceForRemoteMessages(this.messaging);

				const enabled =
					authStatus === AuthorizationStatus.AUTHORIZED ||
					authStatus === AuthorizationStatus.PROVISIONAL;

				if (!enabled) {
					console.log('Push permission not granted');
					return null;
				}

				token = await getToken(this.messaging);
				this.fcmPushToken = token;
				console.log('FCM push token:', token);

				if (token) {
					console.log('Push token generated successfully');
				} else {
					console.error('Failed to generate push token');
				}
			} catch (error) {
				console.error('Error getting push token:', error);
				// console.log('Constants.expoConfig:', Constants.expoConfig);
				// console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
				// console.log('Constants.expoConfig?.extra?.eas:', Constants.expoConfig?.extra?.eas);
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
		return this.fcmPushToken;
	}

	/**
	 * Check if push token is available
	 */
	isPushTokenAvailable(): boolean {
		return !!this.fcmPushToken;
	}

	public getMessaging(): Messaging {
		return this.messaging;
	}

	// /**
	//  * Get detailed push token status for debugging
	//  */
	// getPushTokenStatus(): {
	// 	isAvailable: boolean;
	// 	token: string | null;
	// 	projectId: string | null;
	// 	deviceInfo: {
	// 		isDevice: boolean;
	// 		platform: string;
	// 		version: string;
	// 	};
	// } {
	// 	return {
	// 		isAvailable: !!this.fcmPushToken,
	// 		token: this.fcmPushToken,
	// 		projectId: Constants.expoConfig?.extra?.eas?.projectId || null,
	// 		deviceInfo: {
	// 			isDevice: Device.isDevice,
	// 			platform: Platform.OS,
	// 			version: Platform.Version.toString(),
	// 		},
	// 	};
	// }
	//
	// /**
	//  * Add notification received listener (works in foreground)
	//  */
	// addNotificationReceivedListener(
	// 	callback: (notification: Notifications.Notification) => void
	// ): Notifications.EventSubscription {
	// 	return Notifications.addNotificationReceivedListener(callback);
	// }
	//
	// /**
	//  * Add notification response listener (when user taps notification)
	//  * Works for both foreground and background notifications
	//  */
	// addNotificationResponseReceivedListener(
	// 	callback: (response: Notifications.NotificationResponse) => void
	// ): Notifications.EventSubscription {
	// 	return Notifications.addNotificationResponseReceivedListener(callback);
	// }
	//
	// /**
	//  * Schedule a local notification
	//  */
	// async scheduleLocalNotification(
	// 	title: string,
	// 	body: string,
	// 	data?: Record<string, any>,
	// 	trigger?: Notifications.NotificationTriggerInput,
	// 	channelId?: string
	// ): Promise<string> {
	// 	console.log("Local notification scheduled", data)
	// 	return await Notifications.scheduleNotificationAsync({
	// 		content: {
	// 			title,
	// 			body,
	// 			data,
	// 			sound: 'default',
	// 			priority: Notifications.AndroidNotificationPriority.HIGH,
	// 		},
	// 		trigger: trigger || null,
	// 	});
	// }
	//
	// async cancelScheduledNotification(identifier: string): Promise<void> {
	// 	await Notifications.cancelScheduledNotificationAsync(identifier);
	// }
	//
	// async cancelAllScheduledNotifications(): Promise<void> {
	// 	await Notifications.cancelAllScheduledNotificationsAsync();
	// }
	//
	// async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
	// 	return await Notifications.getAllScheduledNotificationsAsync();
	// }
	//
	async getPermissionsStatus(): Promise<boolean> {
		const authStatus = await this.requestUserPermission();
		return authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
	}
	//
	// async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
	// 	return await Notifications.requestPermissionsAsync();
	// }
	//
	// async sendTestNotification(title: string = 'Test Notification', body: string = 'This is a test notification'): Promise<string> {
	// 	return await this.scheduleLocalNotification(title, body, { type: 'test' });
	// }
	//
	// async sendReminderNotification(
	// 	title: string,
	// 	body: string,
	// 	delaySeconds: number = 5,
	// 	data?: Record<string, any>
	// ): Promise<string> {
	// 	return await this.scheduleLocalNotification(
	// 		title,
	// 		body,
	// 		{ type: 'reminder', ...data },
	// 		{ seconds: delaySeconds } as any,
	// 		'reminders'
	// 	);
	// }
	//
	// async sendMessageNotification(
	// 	title: string,
	// 	body: string,
	// 	data?: Record<string, any>
	// ): Promise<string> {
	// 	return await this.scheduleLocalNotification(
	// 		title,
	// 		body,
	// 		{ type: 'message', ...data },
	// 		undefined,
	// 		'messages'
	// 	);
	// }
	//
	async disablePushNotifications(): Promise<void> {
		try {
			await unregisterDeviceForRemoteMessages(this.messaging);
			await deleteToken(this.messaging);
		} finally {
			this.fcmPushToken = null;
		}
	}
}

export default PushNotificationService.getInstance();