import React, { useRef, useEffect } from 'react';
import { StatusBar, StyleSheet, LogBox, AppState } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { color } from './src/utils/colorUtils';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import AdManager from './src/components/AdManager';
import { ListenLiveProvider } from './src/contexts/ListenLiveContext';
import { UniversalAudioProvider } from './src/contexts/UniversalAudioContext';
import { analyticsService } from './src/services/AnalyticsService';
import PushNotificationService from './src/services/PushNotificationService';

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

  // ✅ Register push notifications (your existing logic kept)
  useEffect(() => {
    const initPushNotifications = async () => {
      const token =
        await PushNotificationService.registerForPushNotifications();
      console.log('Push notification token:', token);
    };

    initPushNotifications();
  }, []);

  useEffect(() => {
    const subscription =
      PushNotificationService.addNotificationResponseReceivedListener(
        (response) => {
          const data =
            response.notification.request.content.data;

          handleNotificationNavigation(data);
        }
      );

    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const checkInitialNotification = async () => {
      const response =
        await Notifications.getLastNotificationResponseAsync();

      if (!response) return;

      const data =
        response.notification.request.content.data;

      handleNotificationNavigation(data);
    };

    checkInitialNotification();
  }, []);

  const handleNotificationNavigation = (data: any) => {
    if (!navigationRef.current) return;

    if (data?.screen === 'NewsDetail') {
      navigationRef.current.navigate('NewsDetail', {
        postId: Number(data.postId),
        title: data.title,
      });
    }
  };
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (
          appStateRef.current.match(/active/) &&
          nextAppState === 'background'
        ) {
          const sessionDuration = Math.floor(
            (Date.now() - sessionStartTime.current) / 1000
          );

          analyticsService.trackAppBackground(
            sessionDuration
          );
        } else if (
          appStateRef.current.match(
            /inactive|background/
          ) &&
          nextAppState === 'active'
        ) {
          analyticsService.trackAppOpen();
          sessionStartTime.current = Date.now();
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
      <UniversalAudioProvider>
        <ListenLiveProvider>
          <AdManager>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
              <StatusBar barStyle={'light-content'} />
              <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                  routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
                }}
                onStateChange={async () => {
                  const previousRouteName = routeNameRef.current;
                  const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

                  if (previousRouteName !== currentRouteName && currentRouteName) {
                    // Track screen view
                    await analyticsService.logScreenView(
                      currentRouteName,
                      currentRouteName
                    );
                  }

                  routeNameRef.current = currentRouteName;
                }}
              > 
                <DrawerNavigator />
              </NavigationContainer>
            </SafeAreaView>
          </AdManager>
        </ListenLiveProvider>
      </UniversalAudioProvider>
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
