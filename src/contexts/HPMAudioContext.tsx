// src/contexts/HPMAudioContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState } from 'react-native';
import {
	hpmAudioService,
	AudioTrack,
	HPMAudioState,
} from '../services/HPMAudioService';
import {Progress} from "react-native-track-player";

interface HPMAudioContextType extends HPMAudioState {
	// Live Stream methods
	loadLiveStreams: () => Promise<AudioTrack[]>;
	playLiveStream: (track: AudioTrack) => Promise<void>;
	getLiveStreamTracks: () => AudioTrack[];

	// Podcast methods
	playPodcast: (
		episodeId: string,
		audioUrl: string,
		title: string,
		artist: string,
		album: string,
		artwork?: string,
		duration?: number
	) => Promise<void>;

	// Common playback controls
	play: (track: AudioTrack) => Promise<void>;
	pause: () => Promise<void>;
	resume: () => Promise<void>;
	stop: () => Promise<void>;
	togglePlayPause: (trackId: AudioTrack) => Promise<void>;

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
	isLoading: boolean;
	isPlayerReady: boolean;
	error: string | null;
	tracks: AudioTrack[];
}

const HPMAudioContext = createContext<HPMAudioContextType | undefined>(undefined);

interface HPMAudioProviderProps {
	children: ReactNode;
}

export const HPMAudioProvider: React.FC<HPMAudioProviderProps> = ({ children }) => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlayerReady, setIsPlayerReady] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [audioState, setAudioState] = useState<HPMAudioState>(
		hpmAudioService.getCurrentState()
	);
	const [tracks, setTracks] = useState<AudioTrack[]>([]);

	// Initialize the audio service
	useEffect(() => {
		let isMounted = true;

		const initializeService = async () => {
			// On Android, the app must be in the foreground to setup the player
			if (AppState.currentState !== 'active') {
				console.log('HPMAudioContext: App is not active, waiting for foreground to initialize...');
				return;
			}

			try {
				console.log('HPMAudioContext: Initializing service...');
				const success = await hpmAudioService.initialize();
				if (success && isMounted) {
					setIsInitialized(true);
					setIsLoading(true);
					console.log('HPMAudioContext: HPM Audio Service initialized successfully');
				} else if (!success && isMounted) {
					const errorMsg = 'Failed to initialize audio service';
					console.error('HPMAudioContext:', errorMsg);
					setError(errorMsg);
				}
			} catch (err) {
				console.error('HPMAudioContext: Error initializing audio service:', err);
				if (err instanceof Error && isMounted) {
					console.error('HPMAudioContext: Error details:', err.message);
				}
				if (isMounted) {
					setError('Failed to initialize audio service');
				}
			}
		};

		initializeService();

		// Listen for app state changes to initialize when returning to foreground
		const appStateListener = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'active') {
				initializeService();
			}
		});

		// Subscribe to state changes
		const unsubscribe = hpmAudioService.addStateChangeListener(() => {
			if (isMounted) {
				setAudioState(hpmAudioService.getCurrentState());
			}
		});

		const fetchData = async () => {
			const data = await hpmAudioService.updateLiveStreamTracks();
			if (isMounted) {
				setTracks(data);
				setIsPlayerReady(true);
				setIsLoading(false);
			}
		}

		fetchData();
		const interval = setInterval(() => {
			fetchData();
		}, 60000);

		// Cleanup on dismount
		return () => {
			isMounted = false;
			unsubscribe();
			appStateListener.remove();
			clearInterval(interval);
		};
	}, []);

	// Load live streams
	const loadLiveStreams = async (): Promise<AudioTrack[]> => {
		try {
			return await hpmAudioService.loadLiveStreams();
		} catch (err) {
			console.error('Error loading live streams:', err);
			setError('Failed to load live streams');
			throw err;
		}
	};

	// Get live stream tracks
	const getLiveStreamTracks = (): AudioTrack[] => {
		const tracks = hpmAudioService.getLiveStreamTracks();
		setTracks(tracks);
		return tracks;
	};

	// Play live stream
	const playLiveStream = async (track: AudioTrack): Promise<void> => {
		try {
			await hpmAudioService.playLiveStream(track);
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
		album: string,
		artwork?: string,
		duration?: number
	): Promise<void> => {
		try {
			await hpmAudioService.playPodcast(episodeId, audioUrl, title, artist, album, artwork, duration);
		} catch (err) {
			console.error('Error playing podcast:', err);
			throw err;
		}
	};

	// Play track
	const play = async (track: AudioTrack): Promise<void> => {
		try {
			await hpmAudioService.play(track);
		} catch (err) {
			console.error('Error playing track:', err);
			throw err;
		}
	};

	// Pause
	const pause = async (): Promise<void> => {
		try {
			await hpmAudioService.pause();
		} catch (err) {
			console.error('Error pausing:', err);
			throw err;
		}
	};

	// Resume
	const resume = async (): Promise<void> => {
		try {
			await hpmAudioService.resume();
		} catch (err) {
			console.error('Error resuming:', err);
			throw err;
		}
	};

	// Stop
	const stop = async (): Promise<void> => {
		try {
			await hpmAudioService.stop();
		} catch (err) {
			console.error('Error stopping:', err);
			throw err;
		}
	};

	// Toggle play/pause
	const togglePlayPause = async (track: AudioTrack): Promise<void> => {
		try {
			await hpmAudioService.togglePlayPause(track);
		} catch (err) {
			console.error('Error toggling play/pause:', err);
			throw err;
		}
	};

	// Seek to position
	const seekTo = async (position: number): Promise<void> => {
		try {
			await hpmAudioService.seekTo(position);
		} catch (err) {
			console.error('Error seeking:', err);
			throw err;
		}
	};

	// Seek forward
	const seekForward = async (seconds: number = 10): Promise<void> => {
		try {
			await hpmAudioService.seekForward(seconds);
		} catch (err) {
			console.error('Error seeking forward:', err);
			throw err;
		}
	};

	// Seek backward
	const seekBackward = async (seconds: number = 10): Promise<void> => {
		try {
			await hpmAudioService.seekBackward(seconds);
		} catch (err) {
			console.error('Error seeking backward:', err);
			throw err;
		}
	};

	// Skip to next
	const skipToNext = async (): Promise<void> => {
		try {
			await hpmAudioService.skipToNext();
		} catch (err) {
			console.error('Error skipping to next:', err);
			throw err;
		}
	};

	// Skip to previous
	const skipToPrevious = async (): Promise<void> => {
		try {
			await hpmAudioService.skipToPrevious();
		} catch (err) {
			console.error('Error skipping to previous:', err);
			throw err;
		}
	};

	// Check if track is playing
	const isTrackPlaying = (trackId: string): boolean => {
		return hpmAudioService.isTrackPlaying(trackId);
	};

	// Check if track is current
	const isCurrentTrack = (trackId: string): boolean => {
		return hpmAudioService.isCurrentTrack(trackId);
	};

	// Get position
	const getPosition = async (): Promise<number> => {
		try {
			return await hpmAudioService.getPosition();
		} catch (err) {
			console.error('Error getting position:', err);
			return 0;
		}
	};

	// Get duration
	const getDuration = async (): Promise<number> => {
		try {
			return await hpmAudioService.getDuration();
		} catch (err) {
			console.error('Error getting duration:', err);
			return 0;
		}
	};
	const getProgress = async (): Promise<Progress> => {
		try {
			return await hpmAudioService.getProgress();
		} catch (err) {
			console.error('Error getting duration:', err);
			return {buffered: 0, position: 0, duration: 0 };
		}
	};

	const value: HPMAudioContextType = {
		// State
		...audioState,
		isInitialized,
		error,
		tracks,
		isLoading,
		isPlayerReady,

		// Live Stream methods
		loadLiveStreams,
		playLiveStream,
		getLiveStreamTracks,

		// Podcast methods
		playPodcast,

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
		<HPMAudioContext.Provider value={value}>
			{children}
		</HPMAudioContext.Provider>
	);
};

// Hook to use the HPM Audio Context
export const useHPMAudio = (): HPMAudioContextType => {
	const context = useContext(HPMAudioContext);
	if (context === undefined) {
		throw new Error('useHPMAudio must be used within a HPMAudioProvider');
	}
	return context;
};

