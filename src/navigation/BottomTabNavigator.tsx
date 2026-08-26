import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { analyticsService } from '../services/AnalyticsService';

import ProfileScreen from '../screens/ProfileScreen';
import ListenLiveScreen from '../screens/ListenLiveScreen';
import HomeStack from './HomeStack';
import WatchLiveScreen from '../screens/WatchLiveScreen';
import PodcastStack from './PodcastStack';
import VerticalVideosScreen from '../screens/VerticalVideosScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => (
	<Tab.Navigator
		screenOptions={({ route }) => ({
			headerShown: false,
			tabBarActiveTintColor: '#C8102E',
			tabBarInactiveTintColor: '#888',
			tabBarStyle: {
				backgroundColor: '#fff',
				borderTopWidth: 0.5,
				borderTopColor: '#eee',
			},
			tabBarIcon: ({ color, size, focused }) => {
				let iconColor = color;

                switch (route.name) {
                    case 'Today':
                        return <Ionicons name='home-outline' size={size} color={iconColor} />;
                    case 'Listen':
                        return <Ionicons name='musical-notes-outline' size={size} color={iconColor} />;
                    case 'Watch':
                        return <Ionicons name='videocam-outline' size={size} color={iconColor} />;
                    case 'Podcast':
                        return <FontAwesome name="podcast" size={size} color={iconColor} />;
                    case 'Shorts':
                        return <Ionicons name='play-circle-outline' size={size} color={iconColor} />;
                    case 'Settings':
                        return <Ionicons name='person-outline' size={size} color={iconColor} />;
                }
            },
            tabBarLabel: ({ focused, color }) => {
                return <Text style={{ color, fontSize: 12, textAlign: 'center', }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} >
			        {route.name}
		        </Text>;
            },
        })}
        screenListeners={{
            tabPress: (e) => {
                // Track tab changes
                const tabName = e.target?.split('-')[0] || 'Unknown';
                analyticsService.trackTabChanged(tabName);
            },
        }}
    >
    <Tab.Screen name="Today" component={HomeStack} />
    <Tab.Screen name="Listen" component={ListenLiveScreen} />
    <Tab.Screen name="Watch" component={WatchLiveScreen} />
    <Tab.Screen name="Podcast" component={PodcastStack} />
    <Tab.Screen name="Shorts" component={VerticalVideosScreen} />
    <Tab.Screen name="Settings" component={ProfileScreen} />
  </Tab.Navigator>
);

export default BottomTabNavigator;