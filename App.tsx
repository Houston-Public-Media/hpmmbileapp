/* eslint-disable import/no-named-as-default */
import React, {useEffect, useRef} from 'react';
import {Alert, AppState, LogBox, StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {color} from './src/utils/colorUtils';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import AdManager from './src/components/AdManager';
import {HPMAudioProvider} from './src/contexts/HPMAudioContext';
import {analyticsService} from './src/services/AnalyticsService';
import PushNotificationService from './src/services/PushNotificationService';
import {onMessage, onNotificationOpenedApp, RemoteMessage} from "@react-native-firebase/messaging";

// Ignore specific warnings
LogBox.ignoreLogs([
	'ViewPropTypes will be removed from React Native',
	'AsyncStorage has been extracted',
	'[expo-av]: Expo AV has been deprecated and will be removed in SDK 54. Use the `expo-audio` and `expo-video` packages to replace the required functionality.',
]);

function App() {
	const routeNameRef = useRef<string | undefined>(undefined);
	const navigationRef = useRef<any>(null);
	const appStateRef = useRef(AppState.currentState);
	const sessionStartTime = useRef(Date.now());


	useEffect(() => {
		const initPushNotifications = async () => {
			const token = await PushNotificationService.registerForPushNotifications();
			console.log('Push notification token:', token);
		};

		initPushNotifications();
		onNotificationOpenedApp(PushNotificationService.getMessaging(), remoteMessage => {
			console.log('Push notification Information:', remoteMessage);
			handleNotificationNavigation(remoteMessage);
		});
	}, []);

	useEffect(() => {
		return onMessage(PushNotificationService.getMessaging(), remoteMessage => {
			Alert.alert("New Story Alert", remoteMessage?.data?.title as string, [
				{
					text: 'Read Now',
					onPress: () => handleNotificationNavigation(remoteMessage),
					style: 'default'
				},
				{
					text: 'Cancel',
					onPress: () => console.log('User tapped dismiss button'),
					style: 'cancel'
				}
			],
			{
				cancelable: true,
				onDismiss: () => console.log('This alert was dismissed by tapping outside of the alert dialog.'),
			});
			console.log("Push Notification Received", remoteMessage);
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

	const handleNotificationNavigation = (remoteMessage: RemoteMessage) => {
		if (!navigationRef.current) return;

		if (remoteMessage?.data?.screen === 'NewsDetail') {
			navigationRef.current.navigate('NewsDetail', {
				postId: Number(remoteMessage.data.postId),
				title: remoteMessage.data.title,
			});
		}
	};

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
							onReady={() => {
								routeNameRef.current =
									navigationRef.current?.getCurrentRoute()
										?.name;
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

										console.log('Screen tracked:', currentRouteName);
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