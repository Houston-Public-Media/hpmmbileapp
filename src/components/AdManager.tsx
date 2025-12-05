import React, { useEffect, useState } from 'react';
import mobileAds, {
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';
import { AD_CONFIG, shouldShowTestAds } from '../config/adConfig';

interface AdManagerProps {
  children: React.ReactNode;
  initializeOnMount?: boolean;
  testDeviceIds?: string[];
}

const AdManager: React.FC<AdManagerProps> = ({
  children,
  initializeOnMount = true,
  testDeviceIds = [],
}) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!initializeOnMount) return;

    const initializeAds = async () => {
      try {
        // Initialize AdMob
        await mobileAds().initialize();
        
        // Configure AdMob settings
        await mobileAds().setRequestConfiguration({
          // Max ad content rating
          maxAdContentRating: MaxAdContentRating.PG,
          // Tag for child-directed treatment
          tagForChildDirectedTreatment: false,
          // Tag for under age of consent
          tagForUnderAgeOfConsent: false,
          // Test device IDs
          testDeviceIdentifiers: [...AD_CONFIG.TEST_DEVICE_IDS, ...testDeviceIds],
        });

        //console.log('✅ AdMob initialized successfully');
        setInitialized(true);
      } catch (err) {
        console.error('❌ Error initializing AdMob: ', err);
        setError(err as Error);
      }
    };

    initializeAds();
  }, [initializeOnMount, testDeviceIds]);

  // Handle initialization errors gracefully
  if (error) {
    console.warn('⚠️ AdMob initialization error:', error);
    // Continue rendering children even if ad system fails to initialize
  }

  return <>{children}</>;
};

export default AdManager;
