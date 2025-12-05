import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId, shouldShowTestAds, AD_CONFIG } from '../config/adConfig';

class InterstitialAdService {
  private static instance: InterstitialAdService;
  private interstitialAd: InterstitialAd | null = null;
  private isLoading = false;

  private constructor() {}

  static getInstance(): InterstitialAdService {
    if (!InterstitialAdService.instance) {
      InterstitialAdService.instance = new InterstitialAdService();
    }
    return InterstitialAdService.instance;
  }

  async loadInterstitialAd(): Promise<boolean> {
    if (this.isLoading) {
      //console.log('⚠️ Interstitial ad is already loading');
      return false;
    }

    try {
      this.isLoading = true;
      
      // Get the appropriate ad unit ID
      const adUnitId = shouldShowTestAds() 
        ? TestIds.INTERSTITIAL 
        : getAdUnitId('interstitial');

      // Create new interstitial ad
      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['news', 'media', 'public', 'radio'],
      });

      // Set up event listeners
      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        //console.log('✅ Interstitial ad loaded successfully');
        this.isLoading = false;
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
       // console.error('❌ Interstitial ad error:', error);
        this.isLoading = false;
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
       // console.log('📱 Interstitial ad closed');
        this.interstitialAd = null;
      });

      // Load the ad
      await this.interstitialAd.load();
      return true;
    } catch (error) {
      //console.error('❌ Error loading interstitial ad:', error);
      this.isLoading = false;
      return false;
    }
  }

  async showInterstitialAd(): Promise<boolean> {
    if (!this.interstitialAd) {
      console.log('⚠️ No interstitial ad loaded');
      return false;
    }

    try {
      await this.interstitialAd.show();
      return true;
    } catch (error) {
      //console.error('❌ Error showing interstitial ad:', error);
      return false;
    }
  }

  isInterstitialAdLoaded(): boolean {
    return this.interstitialAd !== null;
  }

  isInterstitialAdLoading(): boolean {
    return this.isLoading;
  }

  // Preload interstitial ad for better user experience
  async preloadInterstitialAd(): Promise<void> {
    if (!this.isInterstitialAdLoaded() && !this.isInterstitialAdLoading()) {
      await this.loadInterstitialAd();
    }
  }
}

export default InterstitialAdService; 