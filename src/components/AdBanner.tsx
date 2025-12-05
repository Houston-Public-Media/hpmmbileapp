import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId, shouldShowTestAds, AD_CONFIG } from '../config/adConfig';

interface AdBannerProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner' | 'leaderboard' | 'smartBanner' | 'fluid' | 'wide';
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
}

const AdBanner: React.FC<AdBannerProps> = ({
  size = 'banner',
  onAdLoaded,
  onAdFailedToLoad,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<Error | null>(null);
  const [adTimeout, setAdTimeout] = useState(false);

  // Get the appropriate ad unit ID
  const adUnitId = shouldShowTestAds() 
    ? TestIds.BANNER 
    : getAdUnitId('banner');
  
  // Set up timeout for ad loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!adLoaded && !adError) {
        console.warn('⚠️ AdBanner - Ad loading timeout');
        setAdTimeout(true);
        setAdError(new Error('Ad loading timeout'));
      }
    }, AD_CONFIG.AD_LOAD_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [adLoaded, adError]);

  // Map size prop to BannerAdSize
  const getBannerAdSize = () => {
    switch (size) {
      case 'banner':
        return BannerAdSize.BANNER;
      case 'largeBanner':
        return BannerAdSize.LARGE_BANNER;
      case 'mediumRectangle':
        return BannerAdSize.MEDIUM_RECTANGLE;
      case 'fullBanner':
        return BannerAdSize.FULL_BANNER;
      case 'leaderboard':
        return BannerAdSize.LEADERBOARD;
      case 'smartBanner':
        return BannerAdSize.BANNER; // Fallback to BANNER for smart banner
      case 'fluid':
        return BannerAdSize.BANNER; // Fallback to BANNER for fluid
      case 'wide':
        return BannerAdSize.LEADERBOARD;
      default:
        return BannerAdSize.BANNER;
    }
  };

  const bannerAdSize = getBannerAdSize();

  const handleAdLoaded = () => {
    console.log('✅ Banner ad loaded successfully');
    setAdLoaded(true);
    setAdError(null);
    setAdTimeout(false);
    onAdLoaded?.();
  };

  const handleAdFailedToLoad = (error: Error) => {
    console.error('❌ Banner ad failed to load:', error);
    setAdError(error);
    setAdTimeout(false);
    onAdFailedToLoad?.(error);
  };

  // Show placeholder if ad fails to load
  if (adError) {
    return (
      <View style={[styles.container, styles.placeholderContainer]}>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adText}>Ad Space</Text>
          <Text style={styles.adSubtext}>{size} ({adTimeout ? 'Timeout' : 'Failed to load'})</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={bannerAdSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  placeholderContainer: {
    minHeight: 50,
  },
  adPlaceholder: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    minHeight: 50,
  },
  adText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  adSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default AdBanner;
