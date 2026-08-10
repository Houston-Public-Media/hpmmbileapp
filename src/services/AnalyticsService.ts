import analytics from '@react-native-firebase/analytics';

const ANALYTICS_ENABLED = true;

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
	private async initialize() {
		try {
			await analytics().setAnalyticsCollectionEnabled(ANALYTICS_ENABLED);
			//console.log(`Firebase Analytics ${ANALYTICS_ENABLED ? 'enabled' : 'disabled'}`);
		} catch (error) {
			console.error('Analytics initialization error:', error);
		}
	}

	async logEvent(eventName: string, params?: Record<string, any>) {
		if (!ANALYTICS_ENABLED) return;

		try {
			await analytics().logEvent(eventName, params);
		} catch (error) {
			console.error(`Error logging event: ${eventName}`, error);
		}
	}
	async logScreenView(screenName: string, screenClass?: string) {
		if (!ANALYTICS_ENABLED) return;

		try {
			await logEvent(analytics, 'screen_view', {
				firebase_screen: screenName,
				firebase_screen_class: screenClass || screenName,
			});

			//console.log('Screen logged:', screenName);
		} catch (error) {
			console.error('Screen tracking error:', error);
		}
	}

	async trackHomeScreen() {
		await this.logScreenView('Home', 'HomeScreen');
		//console.log("Home Screen analytics");
	}
	async trackListenLiveScreen() {
		await this.logScreenView('Listen Live', 'ListenLiveScreen');
		//console.log("Listen live Screen analytics");
	}
	async trackWatchLiveScreen() {
		await this.logScreenView('Watch Live', 'WatchLiveScreen');
		//console.log("Watchß Screen analytics");
	}
	async trackPodcastScreen() {
		await this.logScreenView('Podcast', 'PodcastScreen');
	}

	async trackProfileScreen() {
		await this.logScreenView('Profile', 'ProfileScreen');
	}

	async trackVerticalVideosScreen() {
		await this.logScreenView('Vertical Videos', 'VerticalVideosScreen');
	}
	async trackPodcastDetailsScreen(podcastId: string, podcastTitle: string) {
		await this.logScreenView('Podcast Details', 'PodcastDetailsScreen');

		await this.logEvent('podcast_viewed', {
			podcast_id: podcastId,
			podcast_title: podcastTitle,
		});
	}
	async trackNewsDetailScreen(articleId: string, articleTitle: string) {
		await this.logScreenView('News Detail', 'NewsDetailScreen');
		await this.logEvent('news_article_viewed', {
			article_id: articleId,
			article_title: articleTitle,
		});
	}
	async trackCategoryListScreen(category: string) {
		await this.logScreenView('Category List', 'CategoryListScreen');

		await this.logEvent('category_viewed', {
			category_name: category,
		});
	}
	async setUserId(userId: string) {
		if (!ANALYTICS_ENABLED) return;

		try {
			await analytics().setUserId(userId);
		} catch (error) {
			console.error(error);
		}
	}
	async setUserProperty(name: string, value: string) {
		if (!ANALYTICS_ENABLED) return;

		try {
			await analytics().setUserProperties({
				[name]: value,
			});
		} catch (error) {
			console.error(error);
		}
	}
	async resetAnalyticsData() {
		await this.logEvent('reset_analytics');
	}
	async trackListenLiveStarted(stationName: string) {
		await this.logEvent('listen_live_started', {
			station_name: stationName,
			timestamp: Date.now(),
		});
	}
	async trackListenLiveStopped(stationName: string, duration: number) {
		await this.logEvent('listen_live_stopped', {
			station_name: stationName,
			duration_seconds: duration,
		});
	}
	async trackPodcastPlayed(podcastId: string, episodeTitle: string) {
		await this.logEvent('podcast_played', {
			podcast_id: podcastId,
			episode_title: episodeTitle,
		});
	}
	async trackPodcastPaused(podcastId: string, position: number) {
		await this.logEvent('podcast_paused', {
			podcast_id: podcastId,
			position_seconds: position,
		});
	}
	async trackPodcastCompleted(podcastId: string, duration: number) {
		await this.logEvent('podcast_completed', {
			podcast_id: podcastId,
			duration_seconds: duration,
		});
	}
	async trackAudioError(errorType: string, errorMessage: string) {
		await this.logEvent('audio_error', {
			error_type: errorType,
			error_message: errorMessage,
		});
	}
	async trackVideoStarted(videoId: string, videoTitle: string) {
		await this.logEvent('video_started', {
			video_id: videoId,
			video_title: videoTitle,
		});
	}
	async trackVideoCompleted(videoId: string, duration: number) {
		await this.logEvent('video_completed', {
			video_id: videoId,
			duration_seconds: duration,
		});
	}
	async trackWatchLiveStarted(streamName: string) {
		await this.logEvent('watch_live_started', {
			stream_name: streamName,
		});
	}
	async trackTabChanged(tabName: string) {
		await this.logEvent('tab_changed', {
			tab_name: tabName,
		});
	}
	async trackDrawerOpened() {
		await this.logEvent('drawer_opened');
	}
	async trackButtonClick(buttonName: string, screenName: string) {
		await this.logEvent('button_clicked', {
			button_name: buttonName,
			screen_name: screenName,
		});
	}
	async trackSearch(searchTerm: string, resultCount: number) {
		await this.logEvent('search', {
			search_term: searchTerm,
			result_count: resultCount,
		});
	}

	async trackShare(contentType: string, contentId: string, method: string) {
		await this.logEvent('share', {
			content_type: contentType,
			content_id: contentId,
			method,
		});
	}
	async trackDonateButtonClicked(source: string) {
		await this.logEvent('donate_button_clicked', {
			source,
		});
	}
	async trackAdImpression(adType: string, adLocation: string) {
		await this.logEvent('ad_impression', {
			ad_type: adType,
			ad_location: adLocation,
		});
	}
	async trackAdClick(adType: string, adLocation: string) {
		await this.logEvent('ad_clicked', {
			ad_type: adType,
			ad_location: adLocation,
		});
	}
	async trackError(errorType: string, errorMessage: string, stackTrace?: string) {
		await this.logEvent('app_error', {
			error_type: errorType,
			error_message: errorMessage,
			stack_trace: stackTrace,
		});
	}
	async trackAppOpen() {
		await this.logEvent('app_open');
	}
	async trackAppBackground(sessionDuration: number) {
		await this.logEvent('app_into_background', {
			session_duration_seconds: sessionDuration,
		});
	}
	async trackUserEngagement(type: string, duration: number) {
		await this.logEvent('user_engagement', {
			engagement_type: type,
			duration_seconds: duration,
		});
	}
}
export const analyticsService = AnalyticsService.getInstance();
export default analyticsService;