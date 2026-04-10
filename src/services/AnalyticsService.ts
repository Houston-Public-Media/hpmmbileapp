import analytics from '@react-native-firebase/analytics';

/**
 * Analytics Service - Centralized Firebase Analytics tracking
 * 
 * This service provides a clean interface for tracking user behavior,
 * screen views, and custom events throughout the app.
 */

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics
   */
  private async initialize() {
    try {
      // Enable analytics collection
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('✅ Firebase Analytics initialized');
    } catch (error) {
      console.error('❌ Analytics initialization error:', error);
    }
  }

  /**
   * Log a custom event
   * @param eventName - Name of the event (use snake_case)
   * @param params - Event parameters (optional)
   */
  async logEvent(eventName: string, params?: { [key: string]: any }) {
    try {
      await analytics().logEvent(eventName, params);
      console.log(`📊 Event logged: ${eventName}`, params);
    } catch (error) {
      console.error(`❌ Error logging event ${eventName}:`, error);
    }
  }

  /**
   * Log screen view
   * @param screenName - Name of the screen
   * @param screenClass - Class/component name (optional)
   */
  async logScreenView(screenName: string, screenClass?: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      console.log(`📱 Screen view: ${screenName}`);
    } catch (error) {
      console.error(`❌ Error logging screen view ${screenName}:`, error);
    }
  }

  /**
   * Set user ID for tracking
   * @param userId - Unique user identifier
   */
  async setUserId(userId: string) {
    try {
      await analytics().setUserId(userId);
      console.log(`👤 User ID set: ${userId}`);
    } catch (error) {
      console.error('❌ Error setting user ID:', error);
    }
  }

  /**
   * Set user property
   * @param name - Property name
   * @param value - Property value
   */
  async setUserProperty(name: string, value: string) {
    try {
      await analytics().setUserProperty(name, value);
      console.log(`🏷️ User property set: ${name} = ${value}`);
    } catch (error) {
      console.error(`❌ Error setting user property ${name}:`, error);
    }
  }

  /**
   * Reset analytics data (useful for logout)
   */
  async resetAnalyticsData() {
    try {
      await analytics().resetAnalyticsData();
      console.log('🔄 Analytics data reset');
    } catch (error) {
      console.error('❌ Error resetting analytics data:', error);
    }
  }

  // ==================== SCREEN TRACKING ====================

  /**
   * Track home screen view
   */
  async trackHomeScreen() {
    await this.logScreenView('Home', 'HomeScreen');
  }

  /**
   * Track listen live screen view
   */
  async trackListenLiveScreen() {
    await this.logScreenView('Listen_Live', 'ListenLiveScreen');
  }

  /**
   * Track watch live screen view
   */
  async trackWatchLiveScreen() {
    await this.logScreenView('Watch_Live', 'WatchLiveScreen');
  }

  /**
   * Track podcast screen view
   */
  async trackPodcastScreen() {
    await this.logScreenView('Podcast', 'PodcastScreen');
  }

  /**
   * Track podcast details screen
   */
  async trackPodcastDetailsScreen(podcastId: string, podcastTitle: string) {
    await this.logScreenView('Podcast_Details', 'PodcastDetailsScreen');
    await this.logEvent('podcast_viewed', {
      podcast_id: podcastId,
      podcast_title: podcastTitle,
    });
  }

  /**
   * Track news detail screen
   */
  async trackNewsDetailScreen(articleId: string, articleTitle: string) {
    await this.logScreenView('News_Detail', 'NewsDetailScreen');
    await this.logEvent('news_article_viewed', {
      article_id: articleId,
      article_title: articleTitle,
    });
  }

  /**
   * Track category list screen
   */
  async trackCategoryListScreen(category: string) {
    await this.logScreenView('Category_List', 'CategoryListScreen');
    await this.logEvent('category_viewed', {
      category_name: category,
    });
  }

  /**
   * Track profile/settings screen
   */
  async trackProfileScreen() {
    await this.logScreenView('Profile', 'ProfileScreen');
  }

  /**
   * Track vertical videos screen
   */
  async trackVerticalVideosScreen() {
    await this.logScreenView('Vertical_Videos', 'VerticalVideosScreen');
  }

  // ==================== AUDIO EVENTS ====================

  /**
   * Track listen live started
   */
  async trackListenLiveStarted(stationName: string) {
    await this.logEvent('listen_live_started', {
      station_name: stationName,
      timestamp: Date.now(),
    });
  }

  /**
   * Track listen live stopped
   */
  async trackListenLiveStopped(stationName: string, duration: number) {
    await this.logEvent('listen_live_stopped', {
      station_name: stationName,
      duration_seconds: duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Track podcast play
   */
  async trackPodcastPlayed(podcastId: string, episodeTitle: string) {
    await this.logEvent('podcast_played', {
      podcast_id: podcastId,
      episode_title: episodeTitle,
      timestamp: Date.now(),
    });
  }

  /**
   * Track podcast pause
   */
  async trackPodcastPaused(podcastId: string, position: number) {
    await this.logEvent('podcast_paused', {
      podcast_id: podcastId,
      position_seconds: position,
      timestamp: Date.now(),
    });
  }

  /**
   * Track podcast completed
   */
  async trackPodcastCompleted(podcastId: string, duration: number) {
    await this.logEvent('podcast_completed', {
      podcast_id: podcastId,
      duration_seconds: duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Track audio error
   */
  async trackAudioError(errorType: string, errorMessage: string) {
    await this.logEvent('audio_error', {
      error_type: errorType,
      error_message: errorMessage,
      timestamp: Date.now(),
    });
  }

  // ==================== VIDEO EVENTS ====================

  /**
   * Track video started
   */
  async trackVideoStarted(videoId: string, videoTitle: string) {
    await this.logEvent('video_started', {
      video_id: videoId,
      video_title: videoTitle,
      timestamp: Date.now(),
    });
  }

  /**
   * Track video completed
   */
  async trackVideoCompleted(videoId: string, duration: number) {
    await this.logEvent('video_completed', {
      video_id: videoId,
      duration_seconds: duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Track watch live started
   */
  async trackWatchLiveStarted(streamName: string) {
    await this.logEvent('watch_live_started', {
      stream_name: streamName,
      timestamp: Date.now(),
    });
  }

  // ==================== NAVIGATION EVENTS ====================

  /**
   * Track tab change
   */
  async trackTabChanged(tabName: string) {
    await this.logEvent('tab_changed', {
      tab_name: tabName,
      timestamp: Date.now(),
    });
  }

  /**
   * Track drawer opened
   */
  async trackDrawerOpened() {
    await this.logEvent('drawer_opened', {
      timestamp: Date.now(),
    });
  }

  // ==================== USER INTERACTION EVENTS ====================

  /**
   * Track button click
   */
  async trackButtonClick(buttonName: string, screenName: string) {
    await this.logEvent('button_clicked', {
      button_name: buttonName,
      screen_name: screenName,
      timestamp: Date.now(),
    });
  }

  /**
   * Track search
   */
  async trackSearch(searchTerm: string, resultCount: number) {
    await this.logEvent('search', {
      search_term: searchTerm,
      result_count: resultCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Track share
   */
  async trackShare(contentType: string, contentId: string, method: string) {
    await this.logEvent('share', {
      content_type: contentType,
      content_id: contentId,
      method: method,
      timestamp: Date.now(),
    });
  }

  /**
   * Track donation button click
   */
  async trackDonateButtonClicked(source: string) {
    await this.logEvent('donate_button_clicked', {
      source: source,
      timestamp: Date.now(),
    });
  }

  // ==================== AD EVENTS ====================

  /**
   * Track ad impression
   */
  async trackAdImpression(adType: string, adLocation: string) {
    await this.logEvent('ad_impression', {
      ad_type: adType,
      ad_location: adLocation,
      timestamp: Date.now(),
    });
  }

  /**
   * Track ad click
   */
  async trackAdClick(adType: string, adLocation: string) {
    await this.logEvent('ad_clicked', {
      ad_type: adType,
      ad_location: adLocation,
      timestamp: Date.now(),
    });
  }

  // ==================== ERROR TRACKING ====================

  /**
   * Track app error
   */
  async trackError(errorType: string, errorMessage: string, stackTrace?: string) {
    await this.logEvent('app_error', {
      error_type: errorType,
      error_message: errorMessage,
      stack_trace: stackTrace,
      timestamp: Date.now(),
    });
  }

  // ==================== ENGAGEMENT EVENTS ====================

  /**
   * Track app open
   */
  async trackAppOpen() {
    await this.logEvent('app_open', {
      timestamp: Date.now(),
    });
  }

  /**
   * Track app background
   */
  async trackAppBackground(sessionDuration: number) {
    await this.logEvent('app_background', {
      session_duration_seconds: sessionDuration,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user engagement
   */
  async trackUserEngagement(engagementType: string, duration: number) {
    await this.logEvent('user_engagement', {
      engagement_type: engagementType,
      duration_seconds: duration,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Export default for convenience
export default analyticsService;
