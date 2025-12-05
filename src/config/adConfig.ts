import { Platform } from 'react-native';

// AdMob Configuration
export const AD_CONFIG = {
  // Real App IDs for HPM News Mobile
  ANDROID_APP_ID: 'ca-app-pub-2797448917961410~9781974870',
  IOS_APP_ID: 'ca-app-pub-2797448917961410~9781974870',
  
  // Real Ad Unit IDs for HPM News Mobile
  BANNER_AD_UNIT_ID: {
    android: '/9147267/HPM_News_Mobile',
    ios: '/9147267/HPM_News_Mobile',
  },
  
  INTERSTITIAL_AD_UNIT_ID: {
    android: '/9147267/HPM_News_Mobile',
    ios: '/9147267/HPM_News_Mobile',
  },
  
  REWARDED_AD_UNIT_ID: {
    android: '/9147267/HPM_News_Mobile',
    ios: '/9147267/HPM_News_Mobile',
  },
  
  // Test Device IDs (add your test device IDs here)
  TEST_DEVICE_IDS: [
    'EMULATOR',
    'SIMULATOR',
    // Add your device IDs here for testing
    // 'YOUR_DEVICE_ID_HERE',
  ],
  
  // Ad loading timeout (in milliseconds)
  AD_LOAD_TIMEOUT: 10000,
  
  // Whether to show test ads
  SHOW_TEST_ADS: false,
};

// Helper function to get the correct ad unit ID for current platform
export const getAdUnitId = (adType: 'banner' | 'interstitial' | 'rewarded') => {
  const platform = Platform.OS as 'android' | 'ios';
  
  switch (adType) {
    case 'banner':
      return AD_CONFIG.BANNER_AD_UNIT_ID[platform];
    case 'interstitial':
      return AD_CONFIG.INTERSTITIAL_AD_UNIT_ID[platform];
    case 'rewarded':
      return AD_CONFIG.REWARDED_AD_UNIT_ID[platform];
    default:
      return AD_CONFIG.BANNER_AD_UNIT_ID[platform];
  }
};

// Helper function to check if we should show test ads
export const shouldShowTestAds = () => {
  return __DEV__ || AD_CONFIG.SHOW_TEST_ADS;
}; 