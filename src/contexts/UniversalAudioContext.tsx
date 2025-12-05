// src/contexts/UniversalAudioContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  universalAudioService,
  AudioTrack,
  AudioType,
  UniversalAudioState,
} from '../services/UniversalAudioService';

interface UniversalAudioContextType extends UniversalAudioState {
  // Live Stream methods
  loadLiveStreams: () => Promise<AudioTrack[]>;
  playLiveStream: (trackId: string) => Promise<void>;
  getLiveStreamTracks: () => AudioTrack[];
  
  // Podcast methods
  playPodcast: (
    episodeId: string,
    audioUrl: string,
    title: string,
    artist: string,
    artwork?: string,
    duration?: number
  ) => Promise<void>;
  
  // HTML Audio methods
  playHtmlAudio: (
    audioId: string,
    audioUrl: string,
    title?: string,
    artist?: string
  ) => Promise<void>;
  
  // Common playback controls
  play: (track: AudioTrack) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  togglePlayPause: (trackId: string) => Promise<void>;
  
  // Seek controls
  seekTo: (position: number) => Promise<void>;
  seekForward: (seconds?: number) => Promise<void>;
  seekBackward: (seconds?: number) => Promise<void>;
  
  // Navigation
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  
  // Utility methods
  isTrackPlaying: (trackId: string) => boolean;
  isCurrentTrack: (trackId: string) => boolean;
  getPosition: () => Promise<number>;
  getDuration: () => Promise<number>;
  
  // State
  isInitialized: boolean;
  error: string | null;
}

const UniversalAudioContext = createContext<UniversalAudioContextType | undefined>(undefined);

interface UniversalAudioProviderProps {
  children: ReactNode;
}

export const UniversalAudioProvider: React.FC<UniversalAudioProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<UniversalAudioState>(
    universalAudioService.getCurrentState()
  );

  // Initialize the audio service
  useEffect(() => {
    const initializeService = async () => {
      try {
        console.log('UniversalAudioContext: Initializing service...');
        const success = await universalAudioService.initialize();
        if (success) {
          setIsInitialized(true);
          console.log('UniversalAudioContext: Universal Audio Service initialized successfully');
        } else {
          const errorMsg = 'Failed to initialize audio service';
          console.error('UniversalAudioContext:', errorMsg);
          setError(errorMsg);
        }
      } catch (err) {
        console.error('UniversalAudioContext: Error initializing audio service:', err);
        if (err instanceof Error) {
          console.error('UniversalAudioContext: Error details:', err.message);
        }
        setError('Failed to initialize audio service');
      }
    };

    initializeService();

    // Subscribe to state changes
    const unsubscribe = universalAudioService.addStateChangeListener(() => {
      setAudioState(universalAudioService.getCurrentState());
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Load live streams
  const loadLiveStreams = async (): Promise<AudioTrack[]> => {
    try {
      return await universalAudioService.loadLiveStreams();
    } catch (err) {
      console.error('Error loading live streams:', err);
      setError('Failed to load live streams');
      throw err;
    }
  };

  // Get live stream tracks
  const getLiveStreamTracks = (): AudioTrack[] => {
    return universalAudioService.getLiveStreamTracks();
  };

  // Play live stream
  const playLiveStream = async (trackId: string): Promise<void> => {
    try {
      await universalAudioService.playLiveStream(trackId);
    } catch (err) {
      console.error('Error playing live stream:', err);
      throw err;
    }
  };

  // Play podcast
  const playPodcast = async (
    episodeId: string,
    audioUrl: string,
    title: string,
    artist: string,
    artwork?: string,
    duration?: number
  ): Promise<void> => {
    try {
      await universalAudioService.playPodcast(episodeId, audioUrl, title, artist, artwork, duration);
    } catch (err) {
      console.error('Error playing podcast:', err);
      throw err;
    }
  };

  // Play HTML audio
  const playHtmlAudio = async (
    audioId: string,
    audioUrl: string,
    title: string = 'Audio',
    artist: string = 'Houston Public Media'
  ): Promise<void> => {
    try {
      await universalAudioService.playHtmlAudio(audioId, audioUrl, title, artist);
    } catch (err) {
      console.error('Error playing HTML audio:', err);
      throw err;
    }
  };

  // Play track
  const play = async (track: AudioTrack): Promise<void> => {
    try {
      await universalAudioService.play(track);
    } catch (err) {
      console.error('Error playing track:', err);
      throw err;
    }
  };

  // Pause
  const pause = async (): Promise<void> => {
    try {
      await universalAudioService.pause();
    } catch (err) {
      console.error('Error pausing:', err);
      throw err;
    }
  };

  // Resume
  const resume = async (): Promise<void> => {
    try {
      await universalAudioService.resume();
    } catch (err) {
      console.error('Error resuming:', err);
      throw err;
    }
  };

  // Stop
  const stop = async (): Promise<void> => {
    try {
      await universalAudioService.stop();
    } catch (err) {
      console.error('Error stopping:', err);
      throw err;
    }
  };

  // Toggle play/pause
  const togglePlayPause = async (trackId: string): Promise<void> => {
    try {
      await universalAudioService.togglePlayPause(trackId);
    } catch (err) {
      console.error('Error toggling play/pause:', err);
      throw err;
    }
  };

  // Seek to position
  const seekTo = async (position: number): Promise<void> => {
    try {
      await universalAudioService.seekTo(position);
    } catch (err) {
      console.error('Error seeking:', err);
      throw err;
    }
  };

  // Seek forward
  const seekForward = async (seconds: number = 10): Promise<void> => {
    try {
      await universalAudioService.seekForward(seconds);
    } catch (err) {
      console.error('Error seeking forward:', err);
      throw err;
    }
  };

  // Seek backward
  const seekBackward = async (seconds: number = 10): Promise<void> => {
    try {
      await universalAudioService.seekBackward(seconds);
    } catch (err) {
      console.error('Error seeking backward:', err);
      throw err;
    }
  };

  // Skip to next
  const skipToNext = async (): Promise<void> => {
    try {
      await universalAudioService.skipToNext();
    } catch (err) {
      console.error('Error skipping to next:', err);
      throw err;
    }
  };

  // Skip to previous
  const skipToPrevious = async (): Promise<void> => {
    try {
      await universalAudioService.skipToPrevious();
    } catch (err) {
      console.error('Error skipping to previous:', err);
      throw err;
    }
  };

  // Check if track is playing
  const isTrackPlaying = (trackId: string): boolean => {
    return universalAudioService.isTrackPlaying(trackId);
  };

  // Check if track is current
  const isCurrentTrack = (trackId: string): boolean => {
    return universalAudioService.isCurrentTrack(trackId);
  };

  // Get position
  const getPosition = async (): Promise<number> => {
    try {
      return await universalAudioService.getPosition();
    } catch (err) {
      return 0;
    }
  };

  // Get duration
  const getDuration = async (): Promise<number> => {
    try {
      return await universalAudioService.getDuration();
    } catch (err) {
      return 0;
    }
  };

  const value: UniversalAudioContextType = {
    // State
    ...audioState,
    isInitialized,
    error,

    // Live Stream methods
    loadLiveStreams,
    playLiveStream,
    getLiveStreamTracks,

    // Podcast methods
    playPodcast,

    // HTML Audio methods
    playHtmlAudio,

    // Common playback controls
    play,
    pause,
    resume,
    stop,
    togglePlayPause,

    // Seek controls
    seekTo,
    seekForward,
    seekBackward,

    // Navigation
    skipToNext,
    skipToPrevious,

    // Utility methods
    isTrackPlaying,
    isCurrentTrack,
    getPosition,
    getDuration,
  };

  return (
    <UniversalAudioContext.Provider value={value}>
      {children}
    </UniversalAudioContext.Provider>
  );
};

// Hook to use the Universal Audio Context
export const useUniversalAudio = (): UniversalAudioContextType => {
  const context = useContext(UniversalAudioContext);
  if (context === undefined) {
    throw new Error('useUniversalAudio must be used within a UniversalAudioProvider');
  }
  return context;
};

