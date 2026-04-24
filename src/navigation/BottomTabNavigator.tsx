import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../services/AnalyticsService';

import ProfileScreen from '../screens/ProfileScreen';
import ContactScreen from '../screens/ContactScreen';
import ListenStack from './ListenStack';
import HomeStack from './HomeStack';
import WatchLiveScreen from '../screens/WatchLiveScreen';
import VerticalVideosScreen from '../screens/VerticalVideosScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => (
	<Tab.Navigator
		screenOptions={({ route }) => ({
			headerShown: false,
			tabBarActiveTintColor: '#0077b6',
			tabBarInactiveTintColor: '#888',
			tabBarStyle: {
				backgroundColor: '#fff',
				borderTopWidth: 0.5,
				borderTopColor: '#eee',
			},
			tabBarIcon: ({ color, size, focused }) => {
				let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
				let iconColor = color;

				switch (route.name) {
					case 'Home':
						iconName = 'home-outline';
						break;
					case 'Listen':
						iconName = 'musical-notes-outline';
						break;
					case 'Watch':
						iconName = 'videocam-outline';
						break;
					case 'Shorts':
						iconName = 'play-circle-outline';
						break;
					case 'Settings':
						iconName = 'person-outline';
						break;
				}

				return <Ionicons name={iconName} size={size} color={iconColor} />;
			},
			tabBarLabel: ({ focused, color }) => {
				return <Text style={{ color, fontSize: 13 }}>{route.name}</Text>;
			},
		})}
	>
		<Tab.Screen name="Today" component={HomeStack} />
		<Tab.Screen name="Listen" component={ListenStack} />
		<Tab.Screen name="Watch" component={WatchLiveScreen} />
		<Tab.Screen name="Shorts" component={VerticalVideosScreen} />
		<Tab.Screen name="Settings" component={ProfileScreen} />
	</Tab.Navigator>
);

export default BottomTabNavigator;
