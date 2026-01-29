// src/services/UniversalAudioService.ts

import TrackPlayer, {
	AppKilledPlaybackBehavior,
	Capability,
	Event,
	State,
	Track as TPTrack,
	RepeatMode,
} from 'react-native-track-player';
import { Platform } from 'react-native';

// Audio source types
export enum AudioType {
	LIVE_STREAM = 'LIVE_STREAM',
	PODCAST = 'PODCAST',
	HTML_AUDIO = 'HTML_AUDIO',
}

// Track interface with extended metadata
export interface AudioTrack {
	id: string;
	type: AudioType;
	url: string;
	title: string;
	artist: string;
	album?: string;
	artwork?: string;
	duration?: number;
	isLiveStream?: boolean;
	episodeId?: string; // For podcasts
	podcastId?: string; // For podcasts
	htmlElementId?: string; // For HTML audios
}

// Player state interface
export interface UniversalAudioState {
	currentTrack: AudioTrack | null;
	isPlaying: boolean;
	isLoading: boolean;
	actuallyPlaying: boolean;
	position: number;
	duration: number;
	canSeek: boolean;
	queue: AudioTrack[];
	repeatMode: RepeatMode;
}

// Event callbacks interface
export interface AudioEventCallbacks {
	onStateChange?: (state: UniversalAudioState) => void;
	onTrackChange?: (track: AudioTrack | null) => void;
	onPlaybackError?: (error: any) => void;
}

export interface Station {
	id: number;
	name: string;
	type: string;
	artwork: string;
	aacSource: string;
	mp3Source: string;
	hlsSource: string;
}

class UniversalAudioService {
	private state: UniversalAudioState = {
		currentTrack: null,
		isPlaying: false,
		isLoading: false,
		actuallyPlaying: false,
		position: 0,
		duration: 0,
		canSeek: false,
		queue: [],
		repeatMode: RepeatMode.Off,
	};

	private isInitialized = false;
	private stateChangeListeners: Set<() => void> = new Set();
	private trackRegistry: Map<string, AudioTrack> = new Map();
	private liveStreamTracks: AudioTrack[] = [];
	private playListData: Station[] = [];
	private isLoadingLiveStreams = false;
	private liveStreamsPromise: Promise<AudioTrack[]> | null = null;

	/**
	 * Initialize the audio player with proper configuration
	 */
	async initialize(): Promise<boolean> {
		if (this.isInitialized) {
			console.log('Universal Audio Service already initialized');
			return true;
		}

		console.log('Universal Audio Service: Starting initialization...');

		try {
			// Setup the player with background capabilities
			console.log('Universal Audio Service: Setting up TrackPlayer...');
			await TrackPlayer.setupPlayer({
				autoHandleInterruptions: true,
			});
			console.log('Universal Audio Service: TrackPlayer setup complete');

			// Configure capabilities for all audio types
			console.log('Universal Audio Service: Configuring options...');
			await TrackPlayer.updateOptions({
				android: {
				appKilledPlaybackBehavior:
					AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
				},
				capabilities: [
					Capability.Play,
					Capability.Pause,
					Capability.Stop,
					Capability.SeekTo,
					Capability.JumpForward,
					Capability.JumpBackward,
				],
				compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
				progressUpdateEventInterval: 1,
			});
			console.log('Universal Audio Service: Options configured');

			// Set up event listeners
			console.log('Universal Audio Service: Setting up event listeners...');
			this.setupEventListeners();
			console.log('Universal Audio Service: Event listeners setup complete');

			this.isInitialized = true;
			console.log('Universal Audio Service initialized successfully');
			return true;
		} catch (error) {
			// If already initialized, that's okay
			if (error instanceof Error && error.message.includes('already been initialized')) {
				console.log('Universal Audio Service was already initialized');
				this.isInitialized = true;
				return true;
			}
			console.error('Error initializing Universal Audio Service:', error);
			if (error instanceof Error) {
				console.error('Error message:', error.message);
				console.error('Error stack:', error.stack);
			}
			return false;
		}
	}

	/**
	 * Setup event listeners for track player
	 */
	private setupEventListeners(): void {
		// Listen to playback state changes
		TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
			const { state } = event;

			let isPlayingOrBuffering = false;
			let isActuallyPlaying = false;
			let isBuffering = false;

			if (state === State.Playing) {
				isPlayingOrBuffering = true;
				isActuallyPlaying = true;
				isBuffering = false;
			} else if (state === State.Buffering || state === State.Loading) {
				isPlayingOrBuffering = true;
				isActuallyPlaying = false;
				isBuffering = true;
			} else if (state === State.Paused || state === State.Stopped || state === State.Ready) {
				isPlayingOrBuffering = false;
				isActuallyPlaying = false;
				isBuffering = false;
			}

			// Update state
			if (
				this.state.isPlaying !== isPlayingOrBuffering ||
				this.state.actuallyPlaying !== isActuallyPlaying ||
				this.state.isLoading !== isBuffering
			) {
				this.state.isPlaying = isPlayingOrBuffering;
				this.state.actuallyPlaying = isActuallyPlaying;
				this.state.isLoading = isBuffering;

				this.notifyStateChange();
			}
		});

		// Listen to track changes
		TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
			const { index } = event;
			if (index !== undefined && index !== null) {
				const track = await TrackPlayer.getTrack(index);
				if (track) {
				const audioTrack = this.trackRegistry.get(track.id as string);
				this.state.currentTrack = audioTrack || null;
				this.notifyStateChange();
				}
			} else {
				this.state.currentTrack = null;
				this.notifyStateChange();
			}
		});

		// Listen to playback errors
		TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
			console.error('Playback error:', event);
			this.state.isPlaying = false;
			this.state.actuallyPlaying = false;
			this.state.isLoading = false;
			this.notifyStateChange();
		});

		// Listen to progress updates
		TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (event) => {
			this.state.position = event.position;
			this.state.duration = event.duration || 0;
			
			// Update canSeek based on duration
			this.state.canSeek = event.duration > 0;
			
			// Don't notify on every progress update to avoid excessive re-renders
			// Components can subscribe to progress updates separately if needed
		});

		// Listen to queue end
		TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
			this.state.isPlaying = false;
			this.state.actuallyPlaying = false;
			this.notifyStateChange();
		});
	}

	/**
	 * Load live stream tracks from API
	 */
	async loadLiveStreams(): Promise<AudioTrack[]> {
		// If already loaded, return cached tracks
		if (this.liveStreamTracks.length > 0) {
			return this.liveStreamTracks;
		}

		// If currently loading, wait for the existing promise
		if (this.liveStreamsPromise) {
			return this.liveStreamsPromise;
		}

		// Create new loading promise
		this.liveStreamsPromise = this._loadLiveStreamsInternal();

		try {
			const tracks = await this.liveStreamsPromise;
			return tracks;
		} catch (error) {
			this.liveStreamsPromise = null;
			throw error;
		}
	}

	/**
	 * Internal method to load live streams
	 */
	private async _loadLiveStreamsInternal(): Promise<AudioTrack[]> {
		try {
			console.log('UniversalAudioService: Fetching audio metadata from S3...');
		
			// Fetch audio metadata with timeout
			const audioResponse = await Promise.race([
				fetch('https://s3-us-west-2.amazonaws.com/hpmwebv2/assets/nowplay/all.json'),
				new Promise<never>((_, reject) => 
					setTimeout(() => reject(new Error('Timeout fetching audio metadata')), 10000)
				)
			]);
		
			if (!audioResponse.ok) {
				throw new Error(`Failed to fetch audio metadata: ${audioResponse.status} ${audioResponse.statusText}`);
			}
		
			const audioData = await audioResponse.json();
			console.log('UniversalAudioService: Audio metadata fetched successfully');

			console.log('UniversalAudioService: Fetching streams list from CDN...');
			if ( this.playListData.length === 0 ) {
				// Fetch streams with timeout
				const response = await Promise.race([
					fetch('https://cdn.houstonpublicmedia.org/assets/streams.json'),
					new Promise<never>((_, reject) => 
						setTimeout(() => reject(new Error('Timeout fetching streams list')), 10000)
					)
				]);
			
				if (!response.ok) {
					throw new Error(`Failed to fetch streams list: ${response.status} ${response.statusText}`);
				}
				const playListDataPull: { audio: any[] } = await response.json();
				console.log(`UniversalAudioService: Fetched ${playListDataPull.audio?.length || 0} stream(s) from CDN`);

				if (!playListDataPull.audio || playListDataPull.audio.length === 0) {
					throw new Error('No audio streams found in playlist data');
				}
				this.playListData = playListDataPull.audio;
			}
			
			

			// Create track objects
			const tracks: AudioTrack[] = this.playListData.map((track, index) => {
				const audioTrack = {
					id: `live_${track.id}`,
					type: AudioType.LIVE_STREAM,
					title: audioData.radio?.[index]?.title || track.name,
					artist: audioData.radio?.[index]?.artist || 'Houston Public Media',
					album: track.name || audioData.radio?.[index]?.album || '',
					artwork: track.artwork,
					url: Platform.OS === 'ios' ? track.hlsSource : track.aacSource,
					isLiveStream: true,
				};
				console.log(`UniversalAudioService: Track ${index + 1}: ${audioTrack.title} - URL: ${audioTrack.url ? 'Valid' : 'Missing'}`);
				return audioTrack;
			})
			.filter((track) => track.url && track.url.trim() !== '');

			console.log(`UniversalAudioService: Filtered to ${tracks.length} valid tracks`);

			if (tracks.length === 0) {
				throw new Error('No valid live stream tracks found - all tracks missing URLs');
			}

			// Cache tracks
			this.liveStreamTracks = tracks;
			tracks.forEach((track) => this.trackRegistry.set(track.id, track));

			console.log(`UniversalAudioService: Successfully loaded ${tracks.length} live stream tracks`);
			return tracks;
		} catch (error) {
			console.error('UniversalAudioService: Error loading live stream tracks:', error);
			if (error instanceof Error) {
				console.error('UniversalAudioService: Error message:', error.message);
				console.error('UniversalAudioService: Error stack:', error.stack);
			}
			throw error;
		}
	}

	/**
	 * Get all live stream tracks
	 */
	getLiveStreamTracks(): AudioTrack[] {
		return this.liveStreamTracks;
	}
	async updateLiveStreamTracks(): Promise<AudioTrack[]> {
		// Create new loading promise
		this.liveStreamsPromise = this._loadLiveStreamsInternal();

		try {
			const tracks = await this.liveStreamsPromise;
			return tracks;
		} catch (error) {
			this.liveStreamsPromise = null;
			throw error;
		}
	}

	/**
	 * Play a specific track
	 */
	async play(track: AudioTrack): Promise<void> {
		try {
			await this.initialize();

			// Set loading state
			this.state.isLoading = true;
			this.state.currentTrack = track;
			this.notifyStateChange();

			// Check if track is already in queue
			const queue = await TrackPlayer.getQueue();
			const existingTrackIndex = queue.findIndex((t) => t.id === track.id);

			if (existingTrackIndex >= 0) {
				// Track exists, skip to it
				await TrackPlayer.skip(existingTrackIndex);
				await TrackPlayer.play();
			} else {
				// Clear queue and add new track
				await TrackPlayer.reset();
				
				// Register track
				this.trackRegistry.set(track.id, track);
				
				// Add track to queue
				const tpTrack: TPTrack = {
					id: track.id,
					url: track.url,
					title: track.title,
					artist: track.artist,
					album: track.album,
					artwork: track.artwork,
					isLiveStream: track.isLiveStream || false,
					duration: track.duration,
				};

				await TrackPlayer.add(tpTrack);
				await TrackPlayer.play();
			}

			// Update state
			this.state.isPlaying = true;
			this.state.actuallyPlaying = true;
			this.state.currentTrack = track;

			// Add timeout to clear loading state if playback doesn't start
			setTimeout(() => {
				if (this.state.isLoading && this.state.currentTrack?.id === track.id) {
					this.state.isLoading = false;
					this.notifyStateChange();
				}
			}, 3000);
		} catch (error) {
			console.error('Error playing track:', error);
			this.state.isLoading = false;
			this.state.isPlaying = false;
			this.state.actuallyPlaying = false;
			this.state.currentTrack = null;
			this.notifyStateChange();
			throw error;
		}
	}

	/**
	 * Play a live stream track
	 */
	async playLiveStream(trackId: string): Promise<void> {
		try {
			// Load live streams if not loaded
			if (this.liveStreamTracks.length === 0) {
				await this.loadLiveStreams();
			}

			const track = this.liveStreamTracks.find((t) => t.id === trackId);
			if (!track) {
				throw new Error(`Live stream track ${trackId} not found`);
			}
			await this.play(track);
		} catch (error) {
			console.error('Error playing live stream:', error);
			throw error;
		}
	}

	/**
	 * Play a podcast episode
	 */
	async playPodcast(
		episodeId: string,
		audioUrl: string,
		title: string,
		artist: string,
		album: string,
		artwork?: string,
		duration?: number
	): Promise<void> {
		const track: AudioTrack = {
			id: `podcast_${episodeId}`,
			type: AudioType.PODCAST,
			url: audioUrl,
			title,
			artist,
			album,
			artwork,
			duration,
			isLiveStream: false,
			episodeId,
		};

		await this.play(track);
	}

	/**
	 * Play HTML audio
	 */
	async playHtmlAudio(
		audioId: string,
		audioUrl: string,
		title: string = 'Audio',
		artist: string = 'Houston Public Media'
	): Promise<void> {
		const track: AudioTrack = {
			id: `html_${audioId}`,
			type: AudioType.HTML_AUDIO,
			url: audioUrl,
			title,
			artist,
			isLiveStream: false,
			htmlElementId: audioId,
		};

		await this.play(track);
	}

	/**
	 * Toggle play/pause
	 */
	async togglePlayPause(trackId: string): Promise<void> {
		try {
			await this.initialize();

			const currentTrack = this.state.currentTrack;
			
			// If same track, toggle play/pause
			if (currentTrack && currentTrack.id === trackId) {
				if (this.state.isPlaying) {
					await this.pause();
				} else {
					await this.resume();
				}
			} else {
				// Different track - find and play it
				const track = this.trackRegistry.get(trackId);
				if (track) {
					await this.play(track);
				} else {
				// Check if it's a live stream
				if (trackId.startsWith('live_')) {
					await this.playLiveStream(trackId);
				} else {
					throw new Error(`Track ${trackId} not found`);
				}
				}
			}
		} catch (error) {
			console.error('Error toggling play/pause:', error);
			throw error;
		}
	}

	/**
	 * Pause current track
	 */
	async pause(): Promise<void> {
		try {
			if (this.state.isPlaying) {
				await TrackPlayer.pause();
				this.state.isPlaying = false;
				this.notifyStateChange();
			}
		} catch (error) {
			console.error('Error pausing track:', error);
			this.state.isPlaying = false;
			this.state.actuallyPlaying = false;
			this.notifyStateChange();
		}
	}

	/**
	 * Resume current track
	 */
	async resume(): Promise<void> {
		try {
			await TrackPlayer.play();
			this.state.isPlaying = true;
			this.state.actuallyPlaying = true;
			this.notifyStateChange();
		} catch (error) {
			console.error('Error resuming track:', error);
			this.state.isPlaying = false;
			this.state.actuallyPlaying = false;
			this.notifyStateChange();
			throw error;
		}
	}

	/**
	 * Stop current track
	 */
	async stop(): Promise<void> {
		try {
			if (this.state.isPlaying || this.state.actuallyPlaying) {
				await TrackPlayer.pause();
				this.state.isPlaying = false;
				this.state.actuallyPlaying = false;
				this.state.isLoading = false;
				this.state.currentTrack = null;
				this.notifyStateChange();
			}
		} catch (error) {
			console.error('Error stopping track:', error);
			this.state.isPlaying = false;
			this.state.actuallyPlaying = false;
			this.state.isLoading = false;
			this.notifyStateChange();
		}
	}

	/**
	 * Seek to position
	 */
	async seekTo(position: number): Promise<void> {
		try {
			await TrackPlayer.seekTo(position);
		} catch (error) {
			console.error('Error seeking:', error);
			throw error;
		}
	}

	/**
	 * Seek forward by seconds
	 */
	async seekForward(seconds: number = 10): Promise<void> {
		try {
			const position = await TrackPlayer.getPosition();
			const duration = await TrackPlayer.getDuration();
			const newPosition = Math.min(position + seconds, duration || position + seconds);
			await this.seekTo(newPosition);
		} catch (error) {
			console.error('Error seeking forward:', error);
			throw error;
		}
	}

	/**
	 * Seek backward by seconds
	 */
	async seekBackward(seconds: number = 10): Promise<void> {
		try {
			const position = await TrackPlayer.getPosition();
			const newPosition = Math.max(position - seconds, 0);
			await this.seekTo(newPosition);
		} catch (error) {
			console.error('Error seeking backward:', error);
			throw error;
		}
	}

	/**
	 * Skip to next track
	 */
	async skipToNext(): Promise<void> {
		try {
			await TrackPlayer.skipToNext();
		} catch (error) {
			console.error('Error skipping to next:', error);
			throw error;
		}
	}

	/**
	 * Skip to previous track
	 */
	async skipToPrevious(): Promise<void> {
		try {
			await TrackPlayer.skipToPrevious();
		} catch (error) {
			console.error('Error skipping to previous:', error);
			throw error;
		}
	}

	/**
	 * Get current position
	 */
	async getPosition(): Promise<number> {
		try {
			return await TrackPlayer.getPosition();
		} catch (error) {
			return 0;
		}
	}

	/**
	 * Get current duration
	 */
	async getDuration(): Promise<number> {
		try {
			return await TrackPlayer.getDuration();
		} catch (error) {
			return 0;
		}
	}

	/**
	 * Check if can seek
	 */
	async canSeek(): Promise<boolean> {
		try {
			const duration = await TrackPlayer.getDuration();
			return duration > 0 && !this.state.currentTrack?.isLiveStream;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Get current state
	 */
	getCurrentState(): UniversalAudioState {
		return { ...this.state };
	}

	/**
	 * Get current track
	 */
	getCurrentTrack(): AudioTrack | null {
		return this.state.currentTrack;
	}

	/**
	 * Check if specific track is playing
	 */
	isTrackPlaying(trackId: string): boolean {
		return (
			this.state.currentTrack?.id === trackId &&
			this.state.isPlaying &&
			!this.state.isLoading
		);
	}

	/**
	 * Check if specific track is current
	 */
	isCurrentTrack(trackId: string): boolean {
		return this.state.currentTrack?.id === trackId;
	}

	/**
	 * Add state change listener
	 */
	addStateChangeListener(callback: () => void): () => void {
		this.stateChangeListeners.add(callback);
		return () => this.stateChangeListeners.delete(callback);
	}

	/**
	 * Notify all state change listeners
	 */
	private notifyStateChange(): void {
		this.stateChangeListeners.forEach((callback) => {
			try {
				callback();
			} catch (error) {
				console.error('Error in state change listener:', error);
			}
		});
	}

	/**
	 * Cleanup and reset
	 */
	async cleanup(): Promise<void> {
		try {
			await this.stop();
			await TrackPlayer.reset();

			this.state = {
				currentTrack: null,
				isPlaying: false,
				isLoading: false,
				actuallyPlaying: false,
				position: 0,
				duration: 0,
				canSeek: false,
				queue: [],
				repeatMode: RepeatMode.Off,
			};

			this.stateChangeListeners.clear();
			this.trackRegistry.clear();
			
			console.log('Universal Audio Service cleaned up');
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	}
}

// Export singleton instance
export const universalAudioService = new UniversalAudioService();