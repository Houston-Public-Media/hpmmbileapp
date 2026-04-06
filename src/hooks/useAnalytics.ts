import { useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { analyticsService } from '../services/AnalyticsService';

/**
 * Custom hook for Firebase Analytics
 * 
 * Provides easy access to analytics methods and automatic screen tracking
 */
export const useAnalytics = () => {
  return analyticsService;
};

/**
 * Hook for automatic screen tracking
 * Call this at the top of each screen component
 * 
 * @param screenName - Name of the screen (e.g., 'Home', 'Podcast_Details')
 * @param params - Optional parameters to log with screen view
 * 
 * @example
 * ```tsx
 * function HomeScreen() {
 *   useScreenTracking('Home');
 *   // ... rest of component
 * }
 * ```
 */
export const useScreenTracking = (
  screenName: string,
  params?: { [key: string]: any }
) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      analyticsService.logScreenView(screenName, screenName);
      
      if (params) {
        analyticsService.logEvent(`${screenName.toLowerCase()}_viewed`, params);
      }
      
      hasTracked.current = true;
    }
  }, [screenName, params]);
};

/**
 * Hook for tracking navigation state changes
 * Use this in your navigation container
 * 
 * @example
 * ```tsx
 * function App() {
 *   const routeNameRef = useRef<string>();
 *   const navigationRef = useNavigationContainerRef();
 *   
 *   return (
 *     <NavigationContainer
 *       ref={navigationRef}
 *       onReady={() => {
 *         routeNameRef.current = navigationRef.getCurrentRoute()?.name;
 *       }}
 *       onStateChange={async () => {
 *         const previousRouteName = routeNameRef.current;
 *         const currentRouteName = navigationRef.getCurrentRoute()?.name;
 *         
 *         if (previousRouteName !== currentRouteName) {
 *           await analyticsService.logScreenView(
 *             currentRouteName || 'Unknown',
 *             currentRouteName || 'Unknown'
 *           );
 *         }
 *         
 *         routeNameRef.current = currentRouteName;
 *       }}
 *     >
 *       {/* Your app content *\/}
 *     </NavigationContainer>
 *   );
 * }
 * ```
 */
export const useNavigationTracking = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const previousRoute = useRef<string>();

  useEffect(() => {
    const currentRoute = route.name;
    
    if (previousRoute.current !== currentRoute) {
      analyticsService.logScreenView(currentRoute, currentRoute);
      previousRoute.current = currentRoute;
    }
  }, [route.name]);

  return { navigation, route };
};

/**
 * Hook for tracking button clicks
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trackClick = useButtonTracking('MyScreen');
 *   
 *   return (
 *     <Button
 *       onPress={() => {
 *         trackClick('play_button');
 *         // ... handle button press
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export const useButtonTracking = (screenName: string) => {
  return (buttonName: string, additionalParams?: { [key: string]: any }) => {
    analyticsService.logEvent('button_clicked', {
      button_name: buttonName,
      screen_name: screenName,
      ...additionalParams,
    });
  };
};

/**
 * Hook for tracking audio playback
 * 
 * @example
 * ```tsx
 * function AudioPlayer() {
 *   const { trackPlay, trackPause, trackComplete } = useAudioTracking();
 *   
 *   const handlePlay = () => {
 *     trackPlay('podcast_123', 'Episode Title');
 *     // ... play audio
 *   };
 * }
 * ```
 */
export const useAudioTracking = () => {
  return {
    trackPlay: (audioId: string, audioTitle: string) => {
      analyticsService.trackPodcastPlayed(audioId, audioTitle);
    },
    trackPause: (audioId: string, position: number) => {
      analyticsService.trackPodcastPaused(audioId, position);
    },
    trackComplete: (audioId: string, duration: number) => {
      analyticsService.trackPodcastCompleted(audioId, duration);
    },
    trackError: (errorType: string, errorMessage: string) => {
      analyticsService.trackAudioError(errorType, errorMessage);
    },
  };
};

/**
 * Hook for tracking video playback
 * 
 * @example
 * ```tsx
 * function VideoPlayer() {
 *   const { trackStart, trackComplete } = useVideoTracking();
 *   
 *   const handlePlay = () => {
 *     trackStart('video_123', 'Video Title');
 *     // ... play video
 *   };
 * }
 * ```
 */
export const useVideoTracking = () => {
  return {
    trackStart: (videoId: string, videoTitle: string) => {
      analyticsService.trackVideoStarted(videoId, videoTitle);
    },
    trackComplete: (videoId: string, duration: number) => {
      analyticsService.trackVideoCompleted(videoId, duration);
    },
  };
};

/**
 * Hook for tracking errors
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trackError = useErrorTracking();
 *   
 *   try {
 *     // ... some code
 *   } catch (error) {
 *     trackError('api_error', error.message);
 *   }
 * }
 * ```
 */
export const useErrorTracking = () => {
  return (errorType: string, errorMessage: string, stackTrace?: string) => {
    analyticsService.trackError(errorType, errorMessage, stackTrace);
  };
};

export default useAnalytics;
