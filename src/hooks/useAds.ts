import { useEffect, useState } from 'react';
import InterstitialAdService from '../services/InterstitialAdService';
import RewardedAdService from '../services/RewardedAdService';

export const useAds = () => {
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);

  const interstitialService = InterstitialAdService.getInstance();
  const rewardedService = RewardedAdService.getInstance();

  useEffect(() => {
    // Preload ads when hook is initialized
    preloadAds();
  }, []);

  const preloadAds = async () => {
    try {
      // Preload interstitial ad
      await interstitialService.preloadInterstitialAd();
      setIsInterstitialLoaded(interstitialService.isInterstitialAdLoaded());

      // Preload rewarded ad
      await rewardedService.preloadRewardedAd();
      setIsRewardedLoaded(rewardedService.isRewardedAdLoaded());
    } catch (error) {
      //console.error('Error preloading ads:', error);
    }
  };

  const showInterstitialAd = async (): Promise<boolean> => {
    try {
      const success = await interstitialService.showInterstitialAd();
      if (success) {
        // Reload interstitial ad after showing
        setTimeout(() => {
          interstitialService.preloadInterstitialAd();
        }, 1000);
      }
      return success;
    } catch (error) {
      //console.error('Error showing interstitial ad:', error);
      return false;
    }
  };

  const showRewardedAd = async (): Promise<boolean> => {
    try {
      const success = await rewardedService.showRewardedAd();
      if (success) {
        // Reload rewarded ad after showing
        setTimeout(() => {
          rewardedService.preloadRewardedAd();
        }, 1000);
      }
      return success;
    } catch (error) {
      //console.error('Error showing rewarded ad:', error);
      return false;
    }
  };

  const loadInterstitialAd = async (): Promise<boolean> => {
    try {
      const success = await interstitialService.loadInterstitialAd();
      setIsInterstitialLoaded(interstitialService.isInterstitialAdLoaded());
      return success;
    } catch (error) {
      //console.error('Error loading interstitial ad:', error);
      return false;
    }
  };

  const loadRewardedAd = async (): Promise<boolean> => {
    try {
      const success = await rewardedService.loadRewardedAd();
      setIsRewardedLoaded(rewardedService.isRewardedAdLoaded());
      return success;
    } catch (error) {
     // console.error('Error loading rewarded ad:', error);
      return false;
    }
  };

  return {
    isInterstitialLoaded,
    isRewardedLoaded,
    showInterstitialAd,
    showRewardedAd,
    loadInterstitialAd,
    loadRewardedAd,
    preloadAds,
  };
}; 