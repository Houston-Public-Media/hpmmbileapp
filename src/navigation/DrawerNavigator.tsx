import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabNavigator from './BottomTabNavigator';
import SettingsScreen from '../screens/ProfileScreen';
import { Header } from '../components/Header';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: true,
      header: () => <Header />,
      drawerType: 'slide',
      drawerStyle: { width: 220 },
    }}
  >
    <Drawer.Screen name="Main" component={BottomTabNavigator} />
    <Drawer.Screen name="Settings" component={SettingsScreen} />
  </Drawer.Navigator>
);

export default DrawerNavigator;