import * as Device from 'expo-device';
import {PermissionsAndroid, Platform} from 'react-native';
import {
	AuthorizationStatus,
	deleteToken,
	getAPNSToken,
	getMessaging,
	getToken,
	hasPermission,
	isDeviceRegisteredForRemoteMessages,
	Messaging,
	onTokenRefresh,
	registerDeviceForRemoteMessages,
	requestPermission,
	unregisterDeviceForRemoteMessages
} from '@react-native-firebase/messaging';

export class PushNotificationService {
	private static instance: PushNotificationService;
	private fcmPushToken: string | null = null;
	private messaging: Messaging = getMessaging();

	private constructor() {}

	private async ensureRemoteMessageRegistration(): Promise<void> {
		if (
			Platform.OS === 'ios' &&
			!isDeviceRegisteredForRemoteMessages(this.messaging)
		) {
			await registerDeviceForRemoteMessages(this.messaging);
		}
	}

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
		if (!Device.isDevice) {
			console.log('Push notifications require a physical device');
			return null;
		}

		const permission = await this.checkPermission();
		if (!permission) {
			const authStatus = await this.requestUserPermission();
			if (!authStatus) {
				console.log('Push permission not granted');
				return null;
			}
		}

		try {
			await this.ensureRemoteMessageRegistration();

			if (Platform.OS === 'ios') {
				const apnsToken = await getAPNSToken(this.messaging);
				if (!apnsToken) {
					console.error(
						'APNs registration did not return a token. Check iOS signing, Push Notifications capability, and the provisioning profile.'
					);
					return null;
				}
			}

			const token = await getToken(this.messaging);
			this.fcmPushToken = token;

			if (!token) {
				console.error('Failed to generate push token');
				return null;
			}

			if (__DEV__) {
				console.log('FCM push token:', token);
			}

			return token;
		} catch (error) {
			console.error('Error getting push token:', error);
			return null;
		}
	}

	listenForTokenRefresh(): () => void {
		return onTokenRefresh(this.messaging, token => {
			this.fcmPushToken = token;

			if (__DEV__) {
				console.log('FCM push token refreshed:', token);
			}
		});
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
