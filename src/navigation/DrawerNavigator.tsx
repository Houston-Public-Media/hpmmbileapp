import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabNavigator from './BottomTabNavigator';
import SettingsScreen from '../screens/ProfileScreen';
import LogoBar from '../components/LogoBar';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: true,
      header: () => <LogoBar />,
      drawerType: 'slide',
      drawerStyle: { width: 220 },
    }}
  >
    <Drawer.Screen name="Main" component={BottomTabNavigator} />
    <Drawer.Screen name="Settings" component={SettingsScreen} />
  </Drawer.Navigator>
);

export default DrawerNavigator;