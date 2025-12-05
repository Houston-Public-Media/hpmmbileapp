import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Linking, Platform } from 'react-native';
import * as Device from 'expo-device';
import { Category, getCategories, toggleCategory } from '../utils/categoryStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationService from '../services/PushNotificationService';

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

  const loadPushSetting = async () => {
    try {
      //dlog('loadPushSetting: reading AsyncStorage');
      const value = await AsyncStorage.getItem('push_notifications_enabled');
      if (value !== null) {
        const parsed = value === 'true';
        //dlog('loadPushSetting: found stored value', { value, parsed });
        setPushEnabled(parsed);
        return;
      }
      // No saved preference: infer from permissions/token
      //dlog('loadPushSetting: no stored value, checking permissions/token');
      const status = await withTimeout(
        PushNotificationService.getPermissionsStatus(),
        8000,
        'getPermissionsStatus (initial)'
      );
      const hasToken = PushNotificationService.isPushTokenAvailable();
      const inferred = status.status === 'granted' && hasToken;
      //dlog('loadPushSetting: inferred from system', { status: status.status, hasToken, inferred });
      setPushEnabled(inferred);
    } catch (e) {
      //console.warn('Failed to load push setting', e);
    }
  };

  const handleCategoryToggle = async (id: string) => {
    const updatedCategories = await toggleCategory(id);
    setCategories(updatedCategories);
  };

  const handlePushToggle = async (value: boolean) => {
    //dlog('handlePushToggle: invoked', { value, pushLoading });
    if (pushLoading) {
      //dlog('handlePushToggle: early return due to pushLoading');
      return; // Prevent double taps while processing
    }
    // Optimistic UI update first for smooth UX
    setPushEnabled(value);
    setPushLoading(true);
    //dlog('handlePushToggle: optimistic set', { pushEnabled: value });
    try {
      if (value) {
        // Enabling
        if (!Device.isDevice) {
          //dlog('handlePushToggle: not a physical device, abort enabling');
          setPushEnabled(false);
          await AsyncStorage.setItem('push_notifications_enabled', 'false');
          Alert.alert('Physical Device Required', 'Push notifications require a physical device (not a simulator/emulator).');
          return;
        }

        // Check existing permissions first
        const perm = await withTimeout(
          PushNotificationService.getPermissionsStatus(),
          8000,
          'getPermissionsStatus (toggle)'
        );
        //dlog('handlePushToggle: permission status', { status: perm.status });
        let token: string | null = null;

        if (perm.status === 'granted') {
          // Already granted, ensure token
          const hadToken = PushNotificationService.isPushTokenAvailable();
          //dlog('handlePushToggle: permission granted, token available?', { hadToken });
          if (hadToken) {
            token = PushNotificationService.getPushToken?.() || 'cached-token';
            //dlog('handlePushToggle: using cached token');
          } else {
            token = await withTimeout(
              PushNotificationService.registerForPushNotifications(),
              15000,
              'registerForPushNotifications (granted)'
            );
          }
        } else {
          // Request permission and token
          //dlog('handlePushToggle: requesting permission and registering for token');
          token = await withTimeout(
            PushNotificationService.registerForPushNotifications(),
            20000,
            'registerForPushNotifications (request)'
          );
        }

        //dlog('handlePushToggle: token result', { hasToken: !!token });
        if (!token) {
          // Offer to open settings if denied
          Alert.alert(
            'Push Notifications Disabled',
            Platform.select({
              ios: 'To enable notifications, allow permissions in Settings > Notifications for this app.',
              android: 'To enable notifications, allow permissions and notifications for this app in Settings.',
              default: 'Please enable notifications in system settings.'
            }) as string,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings?.(),
              },
            ]
          );
          setPushEnabled(false);
          await AsyncStorage.setItem('push_notifications_enabled', 'false');
          //dlog('handlePushToggle: token missing, persisted false and prompted settings');
          return;
        }

        await AsyncStorage.setItem('push_notifications_enabled', 'true');
        //dlog('handlePushToggle: enabled and persisted true');
        // Optional success feedback kept subtle to avoid noisy alerts
      } else {
        // Disabling: unregister/clear and persist
        //dlog('handlePushToggle: disabling (instant UX)');
        // UI already set to false optimistically above; persist immediately
        try {
          await AsyncStorage.setItem('push_notifications_enabled', 'false');
          //dlog('handlePushToggle: persisted false immediately');
        } catch (persistErr) {
          //dlog('handlePushToggle: failed to persist false', persistErr);
        }
        // Release loading immediately for snappy UX
        setPushLoading(false);
        //dlog('handlePushToggle: released loading for disable');
        // Fire-and-forget background cleanup (no await)
        withTimeout(
          PushNotificationService.disablePushNotifications(),
          5000,
          'disablePushNotifications'
        )
          .then(() => dlog('handlePushToggle: disable call completed (async)'))
          .catch((err) => dlog('handlePushToggle: disable async timeout/error', err));
        return; // Exit early; nothing else to block UI
      }
    } catch (e) {
      //console.warn('Failed to update push setting', e);
      // Revert UI to previously persisted state on error
      try {
        const persisted = await AsyncStorage.getItem('push_notifications_enabled');
        setPushEnabled(persisted === 'true');
      } catch {}
      // Keep UX quiet; show subtle feedback only if needed
      //dlog('handlePushToggle: error occurred, reverted to persisted state');
    } finally {
      setPushLoading(false);
      //dlog('handlePushToggle: set pushLoading false');
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
              dlog('UI: row pressed', { pushLoading, pushEnabled });
              if (pushLoading) return;
              handlePushToggle(!pushEnabled);
            }}
          >
            <View style={styles.settingsLeft}>
              <Text style={styles.settingsTitle}>Push Notifications</Text>
              <Text style={styles.settingsSubtitle}>
                Receive breaking news alerts and updates
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(v) => {
                dlog('UI: switch toggled', { value: v, pushLoading, pushEnabled });
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
    </View>
  );
};

export default ProfileScreen;