import * as Device from 'expo-device';
import {PermissionsAndroid, Platform} from 'react-native';
import {
	AuthorizationStatus,
	deleteToken,
	getMessaging,
	getToken, hasPermission,
	Messaging,
	requestPermission,
	unregisterDeviceForRemoteMessages
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
			const status = await this.checkPermission();

			// If permission revoked → remove token
			if (!status) {
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
		if (Platform.OS === 'ios') {
			const authStatus = await requestPermission(this.messaging);
			return authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
		}

		if (Platform.OS === 'android') {
			if (Platform.Version >= 33) {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
				);
				return granted === PermissionsAndroid.RESULTS.GRANTED;
			}
			return true; // Android < 13 doesn't require runtime permission
		}
		return false;
	}

	async checkPermission(): Promise<boolean> {
		const authStatus = await hasPermission(this.messaging);
		return authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
	}

	/**
	 * Register for push notifications and get the token
	 * Works for both Android and iOS
	 */
	async registerForPushNotifications(): Promise<string | null> {
		let token: string | null = null;
		const permission = await this.checkPermission();
		if (Device.isDevice) {
			if (!permission) {
				const authStatus = await this.requestUserPermission();
				if (!authStatus) {
					console.log('Push permission not granted');
					return null;
				}
			}
		}

		try {
			// Get the token that uniquely identifies this device
			// This works for both Android and iOS
			token = await getToken(this.messaging);
			this.fcmPushToken = token;

			if (!token) {
				console.error('Failed to generate push token');
			}
		} catch (error) {
			console.error('Error getting push token:', error);
			return null;
		}
		//console.log('Push Token:', token);
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