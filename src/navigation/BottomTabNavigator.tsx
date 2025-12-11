import React from 'react';
import { Text, Linking } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ProfileScreen from '../screens/ProfileScreen';
import ListenLiveScreen from '../screens/ListenLiveScreen';
import HomeStack from './HomeStack';
import WatchLiveScreen from '../screens/WatchLiveScreen';
import PodcastStack from './PodcastStack';

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
          case 'Podcast':
            iconName = 'book-outline';
            break;
          case 'Donate':
            iconName = focused ? 'heart' : 'heart-outline';
            //iconColor = 'red';
            break;
          case 'Settings':
            iconName = 'person-outline';
            break;
        }

        return <Ionicons name={iconName} size={size} color={iconColor} />;
      },
      tabBarLabel: ({ focused, color }) => {
        if (route.name === 'Donate') {
          return (
            <Text style={{ color/* : 'red', fontWeight: 'bold' */, fontSize: 13 }}>
              Donate
            </Text>
          );
        }
        return <Text style={{ color, fontSize: 13 }}>{route.name}</Text>;
      },
    })}
  >
    <Tab.Screen name="Today" component={HomeStack} />
    <Tab.Screen name="Listen" component={ListenLiveScreen} />
    <Tab.Screen name="Watch" component={WatchLiveScreen} />
    <Tab.Screen name="Podcast" component={PodcastStack} />

    {/* ✅ Updated Donate screen */}
    <Tab.Screen
      name="Donate"
      listeners={{
        tabPress: (e) => {
          e.preventDefault();
          Linking.openURL('https://www.houstonpublicmedia.org/donate');
        },
      }}
    >
      {() => null}
    </Tab.Screen>

    <Tab.Screen name="Settings" component={ProfileScreen} />
  </Tab.Navigator>
);

export default BottomTabNavigator;
