import { RewardedAd, AdEventType, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId, shouldShowTestAds } from '../config/adConfig';

class RewardedAdService {
  private static instance: RewardedAdService;
  private rewardedAd: RewardedAd | null = null;
  private isLoading = false;

  private constructor() {}

  static getInstance(): RewardedAdService {
    if (!RewardedAdService.instance) {
      RewardedAdService.instance = new RewardedAdService();
    }
    return RewardedAdService.instance;
  }

  async loadRewardedAd(): Promise<boolean> {
    if (this.isLoading) {
      //console.log('⚠️ Rewarded ad is already loading');
      return false;
    }

    try {
      this.isLoading = true;
      
      // Get the appropriate ad unit ID
      const adUnitId = shouldShowTestAds() 
        ? TestIds.REWARDED 
        : getAdUnitId('rewarded');

      // Create new rewarded ad
      this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['news', 'media', 'public', 'radio'],
      });

      // Set up event listeners
      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        //console.log('✅ Rewarded ad loaded successfully');
        this.isLoading = false;
      });

      this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
        //console.error('❌ Rewarded ad error:', error);
        this.isLoading = false;
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        //console.log('📱 Rewarded ad closed');
        this.rewardedAd = null;
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        //console.log('🎁 User earned reward:', reward);
        // Handle reward here (e.g., unlock premium content, give coins, etc.)
      });

      // Load the ad
      await this.rewardedAd.load();
      return true;
    } catch (error) {
      //console.error('❌ Error loading rewarded ad:', error);
      this.isLoading = false;
      return false;
    }
  }

  async showRewardedAd(): Promise<boolean> {
    if (!this.rewardedAd) {
      //console.log('⚠️ No rewarded ad loaded');
      return false;
    }

    try {
      await this.rewardedAd.show();
      return true;
    } catch (error) {
      //console.error('❌ Error showing rewarded ad:', error);
      return false;
    }
  }

  isRewardedAdLoaded(): boolean {
    return this.rewardedAd !== null;
  }

  isRewardedAdLoading(): boolean {
    return this.isLoading;
  }

  // Preload rewarded ad for better user experience
  async preloadRewardedAd(): Promise<void> {
    if (!this.isRewardedAdLoaded() && !this.isRewardedAdLoading()) {
      await this.loadRewardedAd();
    }
  }
}

export default RewardedAdService; 