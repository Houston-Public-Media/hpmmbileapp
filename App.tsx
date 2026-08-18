import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, Linking, LogBox, StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {LinkingOptions, NavigationContainer} from '@react-navigation/native';
import {color} from './src/utils/colorUtils';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import AdManager from './src/components/AdManager';
import {HPMAudioProvider} from './src/contexts/HPMAudioContext';
import {analyticsService} from './src/services/AnalyticsService';
import PushNotificationService from './src/services/PushNotificationService';
import {getInitialNotification, onNotificationOpenedApp, onMessage, RemoteMessage} from "@react-native-firebase/messaging";
import ToastMessage, {ToastMessageRef} from "./src/components/ToastMessage";

// Ignore specific warnings
LogBox.ignoreLogs([
	'ViewPropTypes will be removed from React Native',
	'AsyncStorage has been extracted',
	'[expo-av]: Expo AV has been deprecated and will be removed in SDK 54. Use the `expo-audio` and `expo-video` packages to replace the required functionality.',
]);

type NewsDetailNotificationParams = {
	postId: number;
	title?: string;
};

type RootNavigationParamList = {
	Main: undefined;
	Settings: undefined;
};

const NOTIFICATION_LINK_PREFIX = 'exp+hpm://';

const getNewsDetailNotificationParams = (
	remoteMessage?: RemoteMessage
): NewsDetailNotificationParams | null => {
	const data = remoteMessage?.data;

	if (data?.screen !== 'NewsDetail') {
		return null;
	}

	const postId = Number(data.postId);

	if (!Number.isInteger(postId) || postId <= 0) {
		console.warn('Notification missing a valid NewsDetail postId:', data);
		return null;
	}

	const title = typeof data.title === 'string' ? data.title.trim() : undefined;

	return {
		postId,
		title,
	};
};

const getNotificationUrl = (remoteMessage?: RemoteMessage): string | undefined => {
	const params = getNewsDetailNotificationParams(remoteMessage);

	if (!params) return undefined;

	const title = params.title
		? `?title=${encodeURIComponent(params.title)}`
		: '';

	return `${NOTIFICATION_LINK_PREFIX}news/${params.postId}${title}`;
};

const readInitialNotification = async (): Promise<RemoteMessage | null> => {
	try {
		return await getInitialNotification(
			PushNotificationService.getMessaging()
		);
	} catch (error) {
		console.log('getInitialNotification failed:', error);
		return null;
	}
};

const notificationLinking: LinkingOptions<RootNavigationParamList> = {
	prefixes: [NOTIFICATION_LINK_PREFIX],
	config: {
		screens: {
			Main: {
				path: '',
				screens: {
					Today: {
						path: '',
						initialRouteName: 'Home',
						screens: {
							Home: '',
							NewsDetail: {
								path: 'news/:postId',
								parse: {
									postId: Number,
								},
							},
						},
					},
				},
			},
		},
	},
	async getInitialURL() {
		const remoteMessage = await readInitialNotification();
		const notificationUrl = getNotificationUrl(remoteMessage ?? undefined);

		if (notificationUrl) return notificationUrl;

		return Linking.getInitialURL();
	},
	subscribe(listener) {
		const linkingSubscription = Linking.addEventListener('url', ({url}) => {
			listener(url);
		});
		const unsubscribeNotificationOpened = onNotificationOpenedApp(
			PushNotificationService.getMessaging(),
			remoteMessage => {
				const notificationUrl = getNotificationUrl(remoteMessage);

				if (notificationUrl) {
					listener(notificationUrl);
				}
			}
		);

		return () => {
			linkingSubscription.remove();
			unsubscribeNotificationOpened();
		};
	},
};

function App() {
	const routeNameRef = useRef<string | undefined>(undefined);
	const navigationRef = useRef<any>(null);
	const appStateRef = useRef(AppState.currentState);
	const sessionStartTime = useRef(Date.now());
	const [toastType, setToastType] = useState<RemoteMessage>();

	const toastRef = useRef<ToastMessageRef>(null);

	const handleNotificationNavigation = useCallback((remoteMessage?: RemoteMessage) => {
		const params = getNewsDetailNotificationParams(remoteMessage);

		if (!params) return;
		if (!navigationRef.current) return;

		if (toastRef.current) {
			toastRef.current.hide();
		}

		navigationRef.current.navigate('Main', {
			screen: 'Today',
			params: {
				screen: 'NewsDetail',
				params,
			},
		});
	}, []);

	const handleInitialNotificationAfterReady = useCallback(async () => {
		const remoteMessage = await readInitialNotification();

		if (remoteMessage) {
			handleNotificationNavigation(remoteMessage);
		}
	}, [handleNotificationNavigation]);

	useEffect(() => {
		const initPushNotifications = async () => {
			const hasPermission = await PushNotificationService.requestUserPermission();
			if (hasPermission) {
				//console.log('Notification permission granted');
				await PushNotificationService.registerForPushNotifications();
			} else {
				console.log('Notification permission denied');
			}
		};

		const unsubscribeTokenRefresh =
			PushNotificationService.listenForTokenRefresh();

		void initPushNotifications();

		return unsubscribeTokenRefresh;
	}, []);

	useEffect(() => {
		return onMessage(PushNotificationService.getMessaging(), remoteMessage => {
			setToastType(remoteMessage);
			if (toastRef.current) {
				toastRef.current.show();
			}
			console.log('onMessage:', remoteMessage);
		});
	}, []);

	useEffect(() => {
		const subscription = AppState.addEventListener(
			'change',
			async (nextAppState) => {
				if (appStateRef.current.match(/active/) && nextAppState === 'background') {
					const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
					await analyticsService.trackAppBackground(sessionDuration);
				} else if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
					await analyticsService.trackAppOpen();
					sessionStartTime.current = Date.now();
					await PushNotificationService.syncPushTokenWithServer();
				}

				appStateRef.current = nextAppState;
			}
		);

		return () => {
			subscription.remove();
		};
	}, []);

	return (
		<SafeAreaProvider>
			<HPMAudioProvider>
				<AdManager>
					<SafeAreaView
						style={styles.container}
						edges={['top', 'left', 'right']}
					>
						<StatusBar barStyle={'light-content'} />
						<NavigationContainer
							ref={navigationRef}
							linking={notificationLinking}
							onReady={() => {
								routeNameRef.current =
									navigationRef.current?.getCurrentRoute()
										?.name;
								void handleInitialNotificationAfterReady();
							}}
							onStateChange={async () => {
								const previousRouteName = routeNameRef.current;
								const currentRouteName =
									navigationRef.current?.getCurrentRoute()?.name;

								if (
									currentRouteName &&
									previousRouteName !== currentRouteName
								) {
									routeNameRef.current = currentRouteName;

									try {
										await analyticsService.logScreenView(
											currentRouteName,
											currentRouteName
										);

										//console.log('Screen tracked:', currentRouteName);
									} catch (e) {
										console.log('Screen tracking failed:', e);
									}
								}
							}}
						>
							<DrawerNavigator />
						</NavigationContainer>
					</SafeAreaView>
				</AdManager>
			</HPMAudioProvider>
			<ToastMessage ref={toastRef} message={toastType} onPress={() => handleNotificationNavigation(toastType)} />
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: color.dark,
	},
});

export default App;
