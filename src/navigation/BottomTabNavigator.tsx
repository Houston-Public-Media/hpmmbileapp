import React from 'react';
import { Text, Linking } from 'react-native';
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
          case 'Today':
            iconName = 'home-outline';
            return <Ionicons name={iconName} size={size} color={iconColor} />;

          case 'Listen':
            iconName = 'musical-notes-outline';
            return <Ionicons name={iconName} size={size} color={iconColor} />;

          case 'Watch':
            iconName = 'videocam-outline';
            return <Ionicons name={iconName} size={size} color={iconColor} />;

          case 'Podcast':
            return <FontAwesome name="podcast" size={size} color={iconColor} />;

          case 'Shorts':
            iconName = 'play-circle-outline';
            return <Ionicons name={iconName} size={size} color={iconColor} />;

          case 'Settings':
            iconName = 'person-outline';
            return <Ionicons name={iconName} size={size} color={iconColor} />;
        }
      },
       tabBarLabel: ({ focused, color }) => {        
         return <Text style={{ color, fontSize: 13 }}>{route.name}</Text>;
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

    {/* <Tab.Screen
      name="Donate"
      listeners={{
        tabPress: (e) => {
          e.preventDefault();
          analyticsService.trackDonateButtonClicked('bottom_tab');
          Linking.openURL('https://www.houstonpublicmedia.org/donate');
        },
      }}
    >
      {() => null}
    </Tab.Screen> */}

    <Tab.Screen name="Settings" component={ProfileScreen} />
  </Tab.Navigator>
);

export default BottomTabNavigator;