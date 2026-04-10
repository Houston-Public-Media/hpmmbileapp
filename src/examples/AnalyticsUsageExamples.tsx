/**
 * Firebase Analytics Usage Examples
 * 
 * This file demonstrates how to use Firebase Analytics throughout your app.
 * Copy these patterns to your actual components.
 */

import React, { useEffect } from 'react';
import { View, Button, TouchableOpacity, Text } from 'react-native';
import { 
  useScreenTracking, 
  useButtonTracking, 
  useAudioTracking,
  useVideoTracking,
  useErrorTracking,
  useAnalytics 
} from '../hooks/useAnalytics';
import { analyticsService } from '../services/AnalyticsService';

// ==================== EXAMPLE 1: Screen Tracking ====================

/**
 * Automatic screen tracking - simplest approach
 * Just add one line at the top of your screen component
 */
export function SimpleScreenExample() {
  // ✅ This automatically tracks when user views this screen
  useScreenTracking('Simple_Screen');

  return (
    <View>
      <Text>This screen is automatically tracked!</Text>
    </View>
  );
}

/**
 * Screen tracking with parameters
 * Track additional data with the screen view
 */
export function ScreenWithParamsExample({ route }: any) {
  const { categoryId, categoryName } = route.params;

  // ✅ Track screen with additional parameters
  useScreenTracking('Category_Screen', {
    category_id: categoryId,
    category_name: categoryName,
  });

  return (
    <View>
      <Text>Category: {categoryName}</Text>
    </View>
  );
}

// ==================== EXAMPLE 2: Button Click Tracking ====================

/**
 * Track button clicks using the hook
 */
export function ButtonTrackingExample() {
  const trackClick = useButtonTracking('Home_Screen');

  return (
    <View>
      <Button
        title="Play Podcast"
        onPress={() => {
          // ✅ Track the button click
          trackClick('play_podcast_button', {
            podcast_id: '123',
            podcast_title: 'Example Podcast',
          });
          
          // ... handle button press
        }}
      />

      <TouchableOpacity
        onPress={() => {
          // ✅ Track another button
          trackClick('share_button');
          
          // ... handle share
        }}
      >
        <Text>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==================== EXAMPLE 3: Audio Playback Tracking ====================

/**
 * Track audio playback events
 */
export function AudioPlayerExample() {
  const { trackPlay, trackPause, trackComplete, trackError } = useAudioTracking();

  const handlePlay = (podcastId: string, episodeTitle: string) => {
    // ✅ Track when audio starts playing
    trackPlay(podcastId, episodeTitle);
    
    // ... start audio playback
  };

  const handlePause = (podcastId: string, currentPosition: number) => {
    // ✅ Track when audio is paused
    trackPause(podcastId, currentPosition);
    
    // ... pause audio
  };

  const handleComplete = (podcastId: string, totalDuration: number) => {
    // ✅ Track when audio completes
    trackComplete(podcastId, totalDuration);
    
    // ... handle completion
  };

  const handleError = (error: Error) => {
    // ✅ Track audio errors
    trackError('playback_error', error.message);
    
    // ... handle error
  };

  return (
    <View>
      <Button title="Play" onPress={() => handlePlay('123', 'Episode 1')} />
      <Button title="Pause" onPress={() => handlePause('123', 45)} />
    </View>
  );
}

// ==================== EXAMPLE 4: Video Playback Tracking ====================

/**
 * Track video playback events
 */
export function VideoPlayerExample() {
  const { trackStart, trackComplete } = useVideoTracking();

  const handleVideoStart = (videoId: string, videoTitle: string) => {
    // ✅ Track when video starts
    trackStart(videoId, videoTitle);
    
    // ... start video
  };

  const handleVideoComplete = (videoId: string, duration: number) => {
    // ✅ Track when video completes
    trackComplete(videoId, duration);
    
    // ... handle completion
  };

  return (
    <View>
      <Button 
        title="Play Video" 
        onPress={() => handleVideoStart('video_123', 'News Report')} 
      />
    </View>
  );
}

// ==================== EXAMPLE 5: Direct Analytics Service Usage ====================

/**
 * Use analytics service directly for more control
 */
export function DirectServiceExample() {
  const analytics = useAnalytics();

  useEffect(() => {
    // ✅ Track custom event on mount
    analytics.logEvent('component_mounted', {
      component_name: 'DirectServiceExample',
      timestamp: Date.now(),
    });
  }, []);

  const handleDonation = (amount: number) => {
    // ✅ Track donation
    analytics.logEvent('donation_initiated', {
      amount: amount,
      currency: 'USD',
      source: 'in_app_button',
    });
    
    // ... process donation
  };

  const handleShare = (contentType: string, contentId: string) => {
    // ✅ Track share
    analytics.trackShare(contentType, contentId, 'native_share');
    
    // ... handle share
  };

  return (
    <View>
      <Button title="Donate $10" onPress={() => handleDonation(10)} />
      <Button title="Share" onPress={() => handleShare('article', '123')} />
    </View>
  );
}

// ==================== EXAMPLE 6: Listen Live Screen ====================

/**
 * Complete example for Listen Live screen
 */
export function ListenLiveScreenExample() {
  useScreenTracking('Listen_Live');
  const trackClick = useButtonTracking('Listen_Live');

  const handlePlayStation = (stationName: string) => {
    // ✅ Track listen live started
    analyticsService.trackListenLiveStarted(stationName);
    trackClick('play_station', { station_name: stationName });
    
    // ... start playing station
  };

  const handleStopStation = (stationName: string, duration: number) => {
    // ✅ Track listen live stopped
    analyticsService.trackListenLiveStopped(stationName, duration);
    
    // ... stop playing station
  };

  return (
    <View>
      <Button 
        title="Play News 88.7" 
        onPress={() => handlePlayStation('News 88.7')} 
      />
    </View>
  );
}

// ==================== EXAMPLE 7: News Detail Screen ====================

/**
 * Complete example for News Detail screen
 */
export function NewsDetailScreenExample({ route }: any) {
  const { article } = route.params;

  // ✅ Track news article view
  useEffect(() => {
    analyticsService.trackNewsDetailScreen(article.id, article.title);
  }, [article]);

  const trackClick = useButtonTracking('News_Detail');

  const handleShare = () => {
    // ✅ Track share
    analyticsService.trackShare('news_article', article.id, 'native_share');
    trackClick('share_article');
    
    // ... handle share
  };

  return (
    <View>
      <Text>{article.title}</Text>
      <Button title="Share" onPress={handleShare} />
    </View>
  );
}

// ==================== EXAMPLE 8: Podcast Details Screen ====================

/**
 * Complete example for Podcast Details screen
 */
export function PodcastDetailsScreenExample({ route }: any) {
  const { podcast } = route.params;
  const { trackPlay, trackPause } = useAudioTracking();

  // ✅ Track podcast viewed
  useEffect(() => {
    analyticsService.trackPodcastDetailsScreen(podcast.id, podcast.title);
  }, [podcast]);

  const handlePlayEpisode = (episodeId: string, episodeTitle: string) => {
    // ✅ Track podcast play
    trackPlay(episodeId, episodeTitle);
    
    // ... play episode
  };

  return (
    <View>
      <Text>{podcast.title}</Text>
      <Button 
        title="Play Episode" 
        onPress={() => handlePlayEpisode('ep_123', 'Episode 1')} 
      />
    </View>
  );
}

// ==================== EXAMPLE 9: Error Tracking ====================

/**
 * Track errors and exceptions
 */
export function ErrorTrackingExample() {
  const trackError = useErrorTracking();

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) {
        throw new Error('API request failed');
      }
      // ... process data
    } catch (error: any) {
      // ✅ Track the error
      trackError('api_error', error.message, error.stack);
      
      // ... handle error
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return <View><Text>Loading...</Text></View>;
}

// ==================== EXAMPLE 10: User Properties ====================

/**
 * Set user properties for segmentation
 */
export function UserPropertiesExample() {
  const analytics = useAnalytics();

  useEffect(() => {
    // ✅ Set user properties
    analytics.setUserProperty('user_type', 'premium');
    analytics.setUserProperty('favorite_category', 'news');
    analytics.setUserProperty('notification_enabled', 'true');
    
    // ✅ Set user ID (if you have user authentication)
    // analytics.setUserId('user_12345');
  }, []);

  return <View><Text>User properties set!</Text></View>;
}

// ==================== EXAMPLE 11: Ad Tracking ====================

/**
 * Track ad impressions and clicks
 */
export function AdTrackingExample() {
  const handleAdImpression = (adType: string, location: string) => {
    // ✅ Track ad impression
    analyticsService.trackAdImpression(adType, location);
  };

  const handleAdClick = (adType: string, location: string) => {
    // ✅ Track ad click
    analyticsService.trackAdClick(adType, location);
  };

  useEffect(() => {
    // Track when ad is shown
    handleAdImpression('banner', 'home_screen_top');
  }, []);

  return (
    <TouchableOpacity onPress={() => handleAdClick('banner', 'home_screen_top')}>
      <Text>Ad Banner</Text>
    </TouchableOpacity>
  );
}

// ==================== EXAMPLE 12: Search Tracking ====================

/**
 * Track search queries
 */
export function SearchExample() {
  const analytics = useAnalytics();

  const handleSearch = async (searchTerm: string) => {
    // ... perform search
    const results = await performSearch(searchTerm);
    
    // ✅ Track search
    analytics.trackSearch(searchTerm, results.length);
  };

  return (
    <View>
      {/* Your search input */}
    </View>
  );
}

// Mock function
const performSearch = async (term: string) => {
  return []; // Mock results
};

// ==================== EXAMPLE 13: Watch Live Screen ====================

/**
 * Complete example for Watch Live screen
 */
export function WatchLiveScreenExample() {
  useScreenTracking('Watch_Live');

  const handleStartWatching = (streamName: string) => {
    // ✅ Track watch live started
    analyticsService.trackWatchLiveStarted(streamName);
    
    // ... start video stream
  };

  return (
    <View>
      <Button 
        title="Watch Live Stream" 
        onPress={() => handleStartWatching('HPM Live')} 
      />
    </View>
  );
}

/**
 * QUICK REFERENCE GUIDE
 * 
 * 1. Screen Tracking:
 *    useScreenTracking('Screen_Name');
 * 
 * 2. Button Clicks:
 *    const trackClick = useButtonTracking('Screen_Name');
 *    trackClick('button_name');
 * 
 * 3. Audio Events:
 *    const { trackPlay, trackPause } = useAudioTracking();
 *    trackPlay(audioId, audioTitle);
 * 
 * 4. Video Events:
 *    const { trackStart, trackComplete } = useVideoTracking();
 *    trackStart(videoId, videoTitle);
 * 
 * 5. Custom Events:
 *    const analytics = useAnalytics();
 *    analytics.logEvent('event_name', { param: 'value' });
 * 
 * 6. Errors:
 *    const trackError = useErrorTracking();
 *    trackError('error_type', 'error_message');
 * 
 * 7. Direct Service:
 *    import { analyticsService } from '../services/AnalyticsService';
 *    analyticsService.trackListenLiveStarted('Station Name');
 */
