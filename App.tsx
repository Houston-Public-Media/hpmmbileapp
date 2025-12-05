import React from 'react';
import { StatusBar, StyleSheet, LogBox } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { color } from './src/utils/colorUtils';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import AdManager from './src/components/AdManager';
import { ListenLiveProvider } from './src/contexts/ListenLiveContext';
import { UniversalAudioProvider } from './src/contexts/UniversalAudioContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed from React Native',
  'AsyncStorage has been extracted',
  '[expo-av]: Expo AV has been deprecated and will be removed in SDK 54. Use the `expo-audio` and `expo-video` packages to replace the required functionality.',
]);

function App() {
  return (
    <SafeAreaProvider>
      <UniversalAudioProvider>
        <ListenLiveProvider>
          <AdManager>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
              <StatusBar barStyle={'light-content'} />
              <NavigationContainer> 
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
