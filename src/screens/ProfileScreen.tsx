import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Linking, Platform } from 'react-native';
import * as Device from 'expo-device';
import { Category, getCategories, toggleCategory } from '../utils/categoryStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
// eslint-disable-next-line import/no-named-as-default
import PushNotificationService from '../services/PushNotificationService';
import AudioFooter from "../components/AudioFooter";

// Simple debug helper
const dlog = (...args: any[]) => console.log('[ProfileScreen]', ...args);

// Timeout wrapper to prevent hanging promises
const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => {
			const err = new Error(`Timeout after ${ms}ms: ${label}`);
			//dlog('withTimeout: timeout hit', { label, ms });
			reject(err);
		}, ms);
		promise
			.then((val) => {
				clearTimeout(timer);
				resolve(val);
			})
			.catch((err) => {
				clearTimeout(timer);
				reject(err);
			});
	});
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#2B6DA8',
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 16,
	},
	menuItem: {
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#fff',
	},
	menuText: {
		fontSize: 18,
		color: '#fff',
	},
	subMenu: {
		paddingLeft: 20,
	},
	subMenuItem: {
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
	},
	selectedCategory: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 4,
		paddingHorizontal: 8,
	},
	subMenuText: {
		fontSize: 16,
		color: '#fff',
	},
	settingsRow: {
		paddingVertical: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	settingsLeft: {
		flex: 1,
		paddingRight: 12,
	},
	settingsTitle: {
		fontSize: 16,
		color: '#fff',
		fontWeight: '600',
	},
	settingsSubtitle: {
		marginTop: 4,
		fontSize: 12,
		color: 'rgba(255,255,255,0.75)',
	},
});

const ProfileScreen = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [pushEnabled, setPushEnabled] = useState(false);
	const [pushLoading, setPushLoading] = useState(false);
	const [notificationStatus, setNotificationStatus] = useState<'working' | 'pending' | 'error' | 'checking'>('checking');

	useEffect(() => {
		//dlog('useEffect init -> loading categories and push setting');
		loadCategories();
		loadPushSetting();
	}, []);

	const loadCategories = async () => {
		//dlog('loadCategories: start');
		const loadedCategories = await getCategories();
		setCategories(loadedCategories);
		//dlog('loadCategories: done', { count: loadedCategories.length });
	};

	// const loadPushSetting = async () => {
	//   try {
	//     //dlog('loadPushSetting: reading AsyncStorage');
	//     const value = await AsyncStorage.getItem('push_notifications_enabled');
	//     if (value !== null) {
	//       const parsed = value === 'true';
	//       //dlog('loadPushSetting: found stored value', { value, parsed });
	//       setPushEnabled(parsed);
	//       return;

	//     }
	//     // No saved preference: infer from permissions/token
	//     //dlog('loadPushSetting: no stored value, checking permissions/token');
	//     const status = await withTimeout(
	//       PushNotificationService.getPermissionsStatus(),
	//       8000,
	//       'getPermissionsStatus (initial)'
	//     );
	//     const hasToken = PushNotificationService.isPushTokenAvailable();
	//     const inferred = status.status === 'granted' && hasToken;
	//     //dlog('loadPushSetting: inferred from system', { status: status.status, hasToken, inferred });
	//     setPushEnabled(inferred);
	//   } catch (e) {
	//     //console.warn('Failed to load push setting', e);
	//   }
	// };


	const loadPushSetting = async () => {
		try {
			const value = await AsyncStorage.getItem('push_notifications_enabled');
			if (value !== null) {
				const parsed = value === 'true';
				setPushEnabled(parsed);

				// Check actual status for existing users
				if (parsed) {
					await checkNotificationStatus();
				} else {
					setNotificationStatus('pending');
				}
				return;
			}

			// New user: default to enabled
			setPushEnabled(true);
			await AsyncStorage.setItem('push_notifications_enabled', 'true');
			setNotificationStatus('checking');

			// Try to register for push notifications in the background
			try {
				if (!Device.isDevice) {
					// Simulator: Keep enabled, show pending status
					dlog('loadPushSetting: simulator detected, keeping UI enabled but skipping registration');
					setNotificationStatus('pending');
					await AsyncStorage.setItem('notifications_status', 'pending');
					return;
				}

				const perm = await withTimeout(
					PushNotificationService.checkPermission(),
					8000,
					'getPermissionsStatus (initial default)'
				);

				let token: string | null = null;
				if (perm) {
					const hasToken = PushNotificationService.isPushTokenAvailable();
					token = hasToken
						? PushNotificationService.getPushToken?.() || 'cached-token'
						: await withTimeout(
							PushNotificationService.registerForPushNotifications(),
							15000,
							'registerForPushNotifications (granted default)'
						);
				} else {
					// Request permissions for new user
					token = await withTimeout(
						PushNotificationService.registerForPushNotifications(),
						20000,
						'registerForPushNotifications (request default)'
					);
				}

				// Update status based on result
				if (token) {
					dlog('loadPushSetting: successfully registered for push notifications');
					setNotificationStatus('working');
					await AsyncStorage.setItem('notifications_status', 'working');
				} else {
					dlog('loadPushSetting: token registration failed, permission needed');
					setNotificationStatus('pending');
					await AsyncStorage.setItem('notifications_status', 'pending');
				}
			} catch (err) {
				dlog('loadPushSetting: error during registration', err);
				setNotificationStatus('error');
				await AsyncStorage.setItem('notifications_status', 'error');
			}
		} catch (e) {
			// Fallback: enable by default even on error
			setPushEnabled(true);
			setNotificationStatus('error');
		}
	};

	const checkNotificationStatus = async () => {
		try {
			if (!Device.isDevice) {
				setNotificationStatus('pending');
				return;
			}

			const perm = await withTimeout(
				PushNotificationService.checkPermission(),
				5000,
				'getPermissionsStatus (check)'
			);

			const hasToken = PushNotificationService.isPushTokenAvailable();

			if (perm && hasToken) {
				setNotificationStatus('working');
				await AsyncStorage.setItem('notifications_status', 'working');
			} else if (perm && !hasToken) {
				setNotificationStatus('error');
				await AsyncStorage.setItem('notifications_status', 'error');
			} else {
				setNotificationStatus('pending');
				await AsyncStorage.setItem('notifications_status', 'pending');
			}
		} catch (err) {
			setNotificationStatus('error');
		}
	};

	const handleCategoryToggle = async (id: string) => {
		const updatedCategories = await toggleCategory(id);
		setCategories(updatedCategories);
	};

	const getNotificationStatusMessage = () => {
		if (!pushEnabled) {
			return 'Receive breaking news alerts and updates';
		}

		switch (notificationStatus) {
			case 'working':
				return 'Active and receiving notifications';
			case 'pending':
				return 'Permission needed - tap to enable';
			case 'error':
				return 'Setup incomplete - tap to retry';
			case 'checking':
				return 'Checking status...';
			default:
				return 'Receive breaking news alerts and updates';
		}
	};

	const getNotificationStatusColor = () => {
		if (!pushEnabled) {
			return 'rgba(255,255,255,0.75)';
		}

		switch (notificationStatus) {
			case 'working':
				return '#4CAF50'; // Green
			case 'pending':
				return '#FFC107'; // Amber
			case 'error':
				return '#FF9800'; // Orange
			case 'checking':
				return 'rgba(255,255,255,0.75)';
			default:
				return 'rgba(255,255,255,0.75)';
		}
	};

	const handlePushToggle = async (value: boolean) => {
		if (pushLoading) {
			return;
		}

		setPushEnabled(value);
		setPushLoading(true);

		try {
			if (value) {
				// User wants to enable notifications
				setNotificationStatus('checking');

				if (!Device.isDevice) {
					// Simulator: Keep enabled but show pending status
					await AsyncStorage.setItem('push_notifications_enabled', 'true');
					setNotificationStatus('pending');
					await AsyncStorage.setItem('notifications_status', 'pending');
					Alert.alert(
						'Simulator Detected',
						'Push notifications require a physical device. The toggle will stay enabled, but notifications won\'t work on simulator.',
						[{ text: 'OK' }]
					);
					setPushLoading(false);
					return;
				}

				const perm = await withTimeout(
					PushNotificationService.checkPermission(),
					8000,
					'getPermissionsStatus (toggle)'
				);
				let token: string | null = null;

				if (perm) {
					const hadToken = PushNotificationService.isPushTokenAvailable();
					if (hadToken) {
						token = PushNotificationService.getPushToken?.() || 'cached-token';
					} else {
						token = await withTimeout(
							PushNotificationService.registerForPushNotifications(),
							15000,
							'registerForPushNotifications (granted)'
						);
					}
				} else {
					token = await withTimeout(
						PushNotificationService.registerForPushNotifications(),
						20000,
						'registerForPushNotifications (request)'
					);
				}

				if (token) {
					// Success: Notifications working
					await AsyncStorage.setItem('push_notifications_enabled', 'true');
					setNotificationStatus('working');
					await AsyncStorage.setItem('notifications_status', 'working');
					dlog('handlePushToggle: Notifications enabled and working');
				} else {
					// Permission denied: Keep toggle ON but show pending status
					await AsyncStorage.setItem('push_notifications_enabled', 'true');
					setNotificationStatus('pending');
					await AsyncStorage.setItem('notifications_status', 'pending');

					Alert.alert(
						'Permission Needed',
						Platform.select({
							ios: 'Notifications are enabled but need permission. Go to Settings > Notifications to allow notifications for this app.',
							android: 'Notifications are enabled but need permission. Go to Settings to allow notifications for this app.',
							default: 'Please enable notifications in system settings.'
						}) as string,
						[
							{ text: 'Later', style: 'cancel' },
							{
								text: 'Open Settings',
								onPress: () => Linking.openSettings?.(),
							},
						]
					);
					dlog('handlePushToggle: Notifications enabled but permission needed');
				}
			} else {
				// User wants to disable notifications
				await AsyncStorage.setItem('push_notifications_enabled', 'false');
				setNotificationStatus('pending');
				await AsyncStorage.setItem('notifications_status', 'pending');

				setPushLoading(false);
				withTimeout(
					PushNotificationService.disablePushNotifications(),
					5000,
					'disablePushNotifications'
				)
					.then(() => dlog('handlePushToggle: disable call completed (async)'))
					.catch((err) => dlog('handlePushToggle: disable async timeout/error', err));
				return;
			}
		} catch (e) {
			dlog('handlePushToggle: error', e);
			setNotificationStatus('error');
			await AsyncStorage.setItem('notifications_status', 'error');

			try {
				const persisted = await AsyncStorage.getItem('push_notifications_enabled');
				setPushEnabled(persisted === 'true');
			} catch {}
		} finally {
			setPushLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<TouchableOpacity style={styles.menuItem}>
					<Text style={styles.menuText} onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/`)}>Home</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/about/`)}>
					<Text style={styles.menuText}>About Us</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/contact-us/`)}>
					<Text style={styles.menuText}>Contact Us</Text>
				</TouchableOpacity>
				<View style={styles.subMenu}>
					<TouchableOpacity style={styles.subMenuItem}>
						<Text style={styles.subMenuText} onPress={() => Linking.openURL(`tel://1-713-748-8888`)}>Call Houston Public Media</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.subMenuItem}>
						<Text style={styles.subMenuText} onPress={() => Linking.openURL(`tel://1-713-743-8483`)}>Call Membership Services</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.subMenuItem}>
						<Text style={styles.subMenuText} onPress={() => Linking.openURL(`mailto:membership@houstonpublicmedia.org?subject=HPM%20Member%20Services%20Query`)}>Email Membership Services</Text>
					</TouchableOpacity>


				</View>
				<TouchableOpacity style={styles.menuItem}>
					<Text style={styles.menuText} onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/hellohouston/`)}>Hello Houston Newsletter</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.menuItem}>
					<Text style={styles.menuText} onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/donate`)}>Donate Now</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.menuItem}>
					<Text style={styles.menuText}>Houston Public Media Interactives</Text>
				</TouchableOpacity>
				<View style={styles.subMenu}>
					<TouchableOpacity style={styles.subMenuItem}>
						<Text style={styles.subMenuText} onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/hurricane-tropical-storm-tracker-texas-houston/`)}>Hurricane and Tropical Storm Tracker</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.subMenuItem}>
						<Text style={styles.subMenuText} onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/texas-houston-power-outage-tracker-map/`)}>Texas Power Outage Tracker Map</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.subMenuItem}>
						<Text style={styles.subMenuText} onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/houston-weather-temperatures-heat-map/`)}>Temperature Map Tracker – Houston, Texas, United States</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity style={styles.menuItem}>
					<Text style={styles.menuText}>App Settings</Text>
				</TouchableOpacity>
				<View style={styles.subMenu}>
					<TouchableOpacity
						style={[styles.settingsRow, pushLoading && { opacity: 0.6 }]}
						activeOpacity={0.7}
						onPress={() => {
							dlog('UI: row pressed', { pushLoading, pushEnabled, notificationStatus });
							if (pushLoading) return;
							handlePushToggle(!pushEnabled);
						}}
					>
						<View style={styles.settingsLeft}>
							<Text style={styles.settingsTitle}>Push Notifications</Text>
							<Text style={[
								styles.settingsSubtitle,
								{ color: getNotificationStatusColor() }
							]}>
								{getNotificationStatusMessage()}
							</Text>
						</View>
						<Switch
							value={pushEnabled}
							onValueChange={(v) => {
								dlog('UI: switch toggled', { value: v, pushLoading, pushEnabled, notificationStatus });
								handlePushToggle(v);
							}}
							disabled={pushLoading}
							thumbColor={pushEnabled ? '#ffffff' : '#f4f3f4'}
							trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#0E4C8A' }}
							ios_backgroundColor="rgba(255,255,255,0.3)"
						/>
					</TouchableOpacity>
					<TouchableOpacity style={styles.subMenuItem}>
						<Text style={styles.subMenuText}>Personalize Stories</Text>
					</TouchableOpacity>
					<View style={styles.subMenu}>
						{categories.map((category) => (
							<TouchableOpacity
								key={category.id}
								style={[
									styles.subMenuItem,
									category.selected && styles.selectedCategory
								]}
								onPress={() => handleCategoryToggle(category.id)}
							>
								<Text style={styles.subMenuText}>
									{category.name} {category.selected ? '✓' : ''}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</ScrollView>
			<AudioFooter />
		</View>
	);
};
export default ProfileScreen;