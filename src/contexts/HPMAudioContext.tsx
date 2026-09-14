import React, { createContext, useCallback,	useContext,	useEffect,	useState,	ReactNode,} from 'react';
import { AppState } from 'react-native';
import { hpmAudioService, AudioTrack, HPMAudioState, SleepState, SleepTimerState, } from '../services/HPMAudioService';

interface HPMAudioContextType extends HPMAudioState {
	loadLiveStreams: () => Promise<AudioTrack[]>;
	playLiveStream: (track: AudioTrack) => Promise<void>;
	getLiveStreamTracks: () => AudioTrack[];

	playPodcast: (
		episodeId: string,
		audioUrl: string,
		title: string,
		artist: string,
		album: string,
		artwork?: string,
		duration?: number
	) => Promise<void>;

	play: (track: AudioTrack) => Promise<void>;
	pause: () => Promise<void>;
	resume: () => Promise<void>;
	stop: () => Promise<void>;
	togglePlayPause: (track: AudioTrack) => Promise<void>;

		seekTo: (position: number) => Promise<void>;
	seekForward: (seconds?: number) => Promise<void>;
	seekBackward: (seconds?: number) => Promise<void>;

	skipToNext: () => Promise<void>;
	skipToPrevious: () => Promise<void>;

	// Utility methods
	isTrackPlaying: (trackId: string) => boolean;
	isCurrentTrack: (trackId: string) => boolean;
	getPosition: () => Promise<number>;
	getDuration: () => Promise<number>;

	// Sleep timer
	setSleep: (ahead: number) => Promise<void>;
	getSleep: () => Promise<SleepTimerState>;
	cancelSleep: () => Promise<void>;

	// State
	isInitialized: boolean;
	isLoading: boolean;
	isPlayerReady: boolean;
	error: string | null;
	tracks: AudioTrack[];
}

const HPMAudioContext = createContext<HPMAudioContextType | undefined>(
	undefined
);

interface HPMAudioProviderProps {
	children: ReactNode;
}

export const HPMAudioProvider: React.FC<HPMAudioProviderProps> = ({
	children,
}) => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlayerReady, setIsPlayerReady] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [audioState, setAudioState] = useState<HPMAudioState>(
		hpmAudioService.getCurrentState()
	);

	const [tracks, setTracks] = useState<AudioTrack[]>([]);

	/**
	 * Keep React state synchronized with the audio service.
	 */
	const syncAudioState = useCallback(() => {
		setAudioState(hpmAudioService.getCurrentState());
	}, []);

	/**
	 * Fetch live stream data.
	 */
	const fetchData = useCallback(async () => {
		try {
			const data = await hpmAudioService.updateLiveStreamTracks();

			setTracks(data);
			setIsPlayerReady(true);
			setIsLoading(false);
		} catch (err) {
			console.error(' Error loading live streams:',
				err);

			setError('Failed to load live streams');
			setIsLoading(false);
		}
	}, []);

	/**
	 * Initialize audio service.
	 *
	 * IMPORTANT:
	 * This does not reset TrackPlayer when the screen changes.
	 * Video playback therefore remains independent from the audio service.
	 */
	const initializeService = useCallback(async () => {
		if (AppState.currentState !== 'active') {
			console.log(' App is not active, waiting for foreground...');
			return;
		}
		try {
			console.log('HPMAudioContext: Initializing service...');
			const success = await hpmAudioService.initialize();
			if (!success) {
				setError('Failed to initialize audio service');
				return;
			}
			setIsInitialized(true);
			await fetchData();
			syncAudioState();

			console.log(' HPM Audio Service initialized successfully');
		} catch (err) {
			console.error(' Error initializing audio service:',
				err);
			setError('Failed to initialize audio service');
		}
	}, [fetchData, syncAudioState]);

	/**
	 * Initialize once and listen for foreground/background changes.
	 */
	useEffect(() => {
		let isMounted = true;

		const start = async () => {
			if (!isMounted) return;
			await initializeService();
		};

		start();

		const appStateListener = AppState.addEventListener(
			'change',
			nextAppState => {
				if (nextAppState === 'active') {
					initializeService();
				}
			}
		);

		const unsubscribe = hpmAudioService.addStateChangeListener(() => {
			if (!isMounted) return;

			setAudioState(hpmAudioService.getCurrentState());
		});

		const interval = setInterval(() => {
			if (isMounted) {
				fetchData();
			}
		}, 30000);

		return () => {
			isMounted = false;

			unsubscribe();
			appStateListener.remove();
			clearInterval(interval);
		};
	}, [initializeService, fetchData]);

	/**
	 * Load live streams.
	 */
	const loadLiveStreams = useCallback(async (): Promise<AudioTrack[]> => {
		try {
			if (error !== null) {
				setError(null);
			}
			const result = await hpmAudioService.loadLiveStreams();
			setTracks(result);
			return result;
		} catch (err) {
			console.error(' Error loading live streams:',
				err);
			setError('Failed to load live streams');
			throw err;
		}
	}, [error]);

	/**
	 * Get cached live streams.
	 */
	const getLiveStreamTracks = useCallback((): AudioTrack[] => {
		const result = hpmAudioService.getLiveStreamTracks();

		setTracks(result);

		return result;
	}, []);

	/**
	 * Play live stream.
	 */
	const playLiveStream = useCallback(
		async (track: AudioTrack): Promise<void> => {
			try {
				await hpmAudioService.playLiveStream(track);
			} catch (err) {
				console.error(
					'HPMAudioContext: Error playing live stream:');

				throw err;
			}
		},
		[]
	);

	/**
	 * Play podcast.
	 */
	const playPodcast = useCallback(
		async (
			episodeId: string,
			audioUrl: string,
			title: string,
			artist: string,
			album: string,
			artwork?: string,
			duration?: number
		): Promise<void> => {
			try {
				await hpmAudioService.playPodcast(
					episodeId,
					audioUrl,
					title,
					artist,
					album,
					artwork,
					duration
				);
			} catch (err) {
				console.error(
					'HPMAudioContext: Error playing podcast:');

				throw err;
			}
		},
		[]
	);

	/**
	 * Play track.
	 */
	const play = useCallback(async (track: AudioTrack): Promise<void> => {
		try {
			await hpmAudioService.play(track);
		} catch (err) {
			console.error(' Error playing track:', err);

			throw err;
		}
	}, []);

	/**
	 * Pause.
	 */
	const pause = useCallback(async (): Promise<void> => {
		try {
			await hpmAudioService.pause();
		} catch (err) {
			console.error(' Error pausing:',err);

			throw err;
		}
	}, []);

	/**
	 * Resume.
	 */
	const resume = useCallback(async (): Promise<void> => {
		try {
			await hpmAudioService.resume();
		} catch (err) {
			console.error(' Error resuming:',
				err);

			throw err;
		}
	}, []);

	/**
	 * Stop.
	 */
	const stop = useCallback(async (): Promise<void> => {
		try {
			await hpmAudioService.stop();
		} catch (err) {
			console.error(' Error stopping:',err);

			throw err;
		}
	}, []);

	/**
	 * Toggle play/pause.
	 */
	const togglePlayPause = useCallback(
		async (track: AudioTrack): Promise<void> => {
			try {
				await hpmAudioService.togglePlayPause(track);
			} catch (err) {
				console.error('Error toggling play/pause:');
				throw err;
			}
		},
		[]
	);

	/**
	 * Seek.
	 */
	const seekTo = useCallback(async (position: number): Promise<void> => {
		try {
			await hpmAudioService.seekTo(position);
		} catch (err) {
			console.error(' Error seeking:', err);

			throw err;
		}
	}, []);

	/**
	 * Seek forward.
	 */
	const seekForward = useCallback(
		async (seconds: number = 10): Promise<void> => {
			try {
				await hpmAudioService.seekForward(seconds);
			} catch (err) {
				console.error('Error seeking forward:');
				throw err;
			}
		},
		[]
	);

	/**
	 * Seek backward.
	 */
	const seekBackward = useCallback(
		async (seconds: number = 10): Promise<void> => {
			try {
				await hpmAudioService.seekBackward(seconds);
			} catch (err) {
				console.error(
					'HPMAudioContext: Error seeking backward:');

				throw err;
			}
		},
		[]
	);

	/**
	 * Skip next.
	 */
	const skipToNext = useCallback(async (): Promise<void> => {
		try {
			await hpmAudioService.skipToNext();
		} catch (err) {
			console.error(' Error skipping to next:',
				err);

			throw err;
		}
	}, []);

	/**
	 * Skip previous.
	 */
	const skipToPrevious = useCallback(async (): Promise<void> => {
		try {
			await hpmAudioService.skipToPrevious();
		} catch (err) {
			console.error(' Error skipping to previous:',err);

			throw err;
		}
	}, []);

	/**
	 * Track status helpers.
	 */
	const isTrackPlaying = useCallback(
		(trackId: string): boolean => {
			return hpmAudioService.isTrackPlaying(trackId);
		},
		[]
	);

	const isCurrentTrack = useCallback(
		(trackId: string): boolean => {
			return hpmAudioService.isCurrentTrack(trackId);
		},
		[]
	);

	/**
	 * Position.
	 */
	const getPosition = useCallback(async (): Promise<number> => {
		try {
			return await hpmAudioService.getPosition();
		} catch (err) {
			console.error(' Error getting position:',
				err);

			return 0;
		}
	}, []);

	/**
	 * Duration.
	 */
	const getDuration = useCallback(async (): Promise<number> => {
		try {
			return await hpmAudioService.getDuration();
		} catch (err) {
			console.error(' Error getting duration:',
				err);

			return 0;
		}
	}, []);

	/**
	 * Sleep timer.
	 */
	const setSleep = useCallback(async (ahead: number): Promise<void> => {
		try {
			const now = Date.now();

			await hpmAudioService.setSleepTimer(
				now + ahead);
		} catch (err) {
			console.error(' Error setting sleep timer:',err);
		}
	}, []);

	const getSleep = useCallback(
		async (): Promise<SleepTimerState> => {
			try {
				return await hpmAudioService.getSleepTimer();
			} catch (err) {
				console.error('Error getting sleep timer:');
				return {
					timer: 0,
					state: SleepState.None,
				};
			}
		},
		[]
	);

	const cancelSleep = useCallback(async (): Promise<void> => {
		try {
			await hpmAudioService.cancelSleepTimer();
		} catch (err) {
			console.error(' Error canceling sleep timer:',err);
		}
	}, []);

	const value: HPMAudioContextType = {
		...audioState,

		isInitialized,
		isLoading,
		isPlayerReady,
		error,
		tracks,

		loadLiveStreams,
		playLiveStream,
		getLiveStreamTracks,

		playPodcast,

		play,
		pause,
		resume,
		stop,
		togglePlayPause,

		seekTo,
		seekForward,
		seekBackward,

		skipToNext,
		skipToPrevious,

		isTrackPlaying,
		isCurrentTrack,

		getPosition,
		getDuration,

		setSleep,
		getSleep,
		cancelSleep,
	};

	return (
		<HPMAudioContext.Provider value={value}>
			{children}
		</HPMAudioContext.Provider>
	);
};

export const useHPMAudio = (): HPMAudioContextType => {
	const context = useContext(HPMAudioContext);

	if (context === undefined) {
		throw new Error('useHPMAudio must be used within an HPMAudioProvider');
	}
	return context;
};
