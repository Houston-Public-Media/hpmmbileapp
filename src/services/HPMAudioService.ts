// src/services/HPMAudioService.ts

import TrackPlayer, {
	AppKilledPlaybackBehavior,
	Capability,
	Event,
	IOSCategoryOptions, Progress,
	RepeatMode,
	State,
	Track as TPTrack,
} from 'react-native-track-player';
import {Platform, AppState} from "react-native";

// Audio source types
export enum AudioType {
	LIVE_STREAM = 'hls',
	PODCAST = 'default'
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
	isLiveStream: boolean;
	episodeId?: string; // For podcasts
	podcastId?: string; // For podcasts
	htmlElementId?: string; // For HTML audios
}

// Player state interface
export interface HPMAudioState {
	currentTrack: AudioTrack | null;
	state: State;
	position: number;
	duration: number;
	canSeek: boolean;
	repeatMode: RepeatMode;
}

// Event callbacks interface
export interface AudioEventCallbacks {
	onStateChange?: (state: HPMAudioState) => void;
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

class HPMAudioService {
	private state: HPMAudioState = {
		currentTrack: null,
		state: State.Stopped,
		position: 0,
		duration: 0,
		canSeek: false,
		repeatMode: RepeatMode.Off
	};

	private isInitialized = false;
	private stateChangeListeners: Set<() => void> = new Set();
	private liveStreamTracks: AudioTrack[] = [];
	private playListData: Station[] = [];
	private liveStreamsPromise: Promise<AudioTrack[]> | null = null;

	/**
	 * Initialize the audio player with the proper configuration
	 */
	async initialize(): Promise<boolean> {
		if (this.isInitialized) {
			//console.log('HPM Audio Service already initialized');
			return true;
		}

		// On Android, the app must be in the foreground to setup the player
		if (Platform.OS === 'android' && AppState.currentState !== 'active') {
			console.log('HPM Audio Service: Skipping initialization on Android because app is in background');
			return false;
		}

		console.log('HPM Audio Service: Starting initialization...');

		try {
			// Setup the player with background capabilities
			console.log('HPM Audio Service: Setting up TrackPlayer...');
			await TrackPlayer.setupPlayer({
				autoHandleInterruptions: true,
				autoUpdateMetadata: true,
				iosCategoryOptions: [
					IOSCategoryOptions.AllowAirPlay,
				]
			});
			//console.log('HPM Audio Service: TrackPlayer setup complete');

			// Configure capabilities for all audio types
			//console.log('HPM Audio Service: Configuring options...');
			await TrackPlayer.updateOptions({
				android: {
					appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
				},
				capabilities: [
					Capability.Play,
					Capability.Pause,
					Capability.Stop
				],
				forwardJumpInterval: 15,
				backwardJumpInterval: 15,
				compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
				progressUpdateEventInterval: 1
			});
			//console.log('HPM Audio Service: Options configured');

			// Set up event listeners
			//console.log('HPM Audio Service: Setting up event listeners...');
			this.setupEventListeners();
			//console.log('HPM Audio Service: Event listeners setup complete');

			this.isInitialized = true;
			//console.log('HPM Audio Service initialized successfully');
			return true;
		} catch (error) {
			// If already initialized, that's okay
			if (error instanceof Error && error.message.includes('already been initialized')) {
				//console.log('HPM Audio Service was already initialized');
				this.isInitialized = true;
				return true;
			}
			console.error('Error initializing HPM Audio Service:', error);
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
			this.state.state = state as State;
			this.notifyStateChange();
		});

		// Listen to track changes
		TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
			this.notifyStateChange();
		});

		// Listen to playback errors
		TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
			console.error('Playback error:', event);
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
			this.notifyStateChange();
		});

		TrackPlayer.addEventListener(Event.MetadataTimedReceived, (event) => {
			const meta = event.metadata[0].raw;
			meta.forEach((item) => {
				if (item.keySpace === 'org.id3') {
					const url = new URL('https://www.houstonpublicmedia.org/?' + item.value);
					const artist= url.searchParams.get('artist') || '';
					const title = url.searchParams.get('title') || '';
					if (artist !== '' && title !== '' && this.state.currentTrack !== null) {
						this.state.currentTrack.artist = artist;
						this.state.currentTrack.title = title;
						TrackPlayer.getActiveTrack().then(r => {
							let track = r;
							if (track !== undefined && track.artist !== artist && track.title !== title) {
								track.artist = artist;
								track.title = title;
								TrackPlayer.updateNowPlayingMetadata(track);
							}
						})
						this.notifyStateChange();
					}
				}
			});

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
			return await this.liveStreamsPromise;
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
			// Fetch audio metadata with timeout
			const audioResponse = await Promise.race([
				fetch('https://cdn.houstonpublicmedia.org/assets/nowplay/all.json'),
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error('Timeout fetching Now Playing')), 10000)
				)
			]);

			if (!audioResponse.ok) {
				throw new Error(`Failed to fetch Now Playing: ${audioResponse.status} ${audioResponse.statusText}`);
			}

			const audioData = await audioResponse.json();
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

				if (!playListDataPull.audio || playListDataPull.audio.length === 0) {
					throw new Error('No audio streams found in playlist data');
				}
				this.playListData = playListDataPull.audio;
			}



			// Create track objects
			const tracks: AudioTrack[] = this.playListData.map((track, index) => {
				return {
					id: `live_${track.id}`,
					type: AudioType.LIVE_STREAM,
					title: audioData.radio?.[index]?.title || track.name,
					artist: audioData.radio?.[index]?.artist || 'Houston Public Media',
					album: track.name || audioData.radio?.[index]?.album || '',
					artwork: track.artwork,
					url: Platform.OS === 'ios' ? track.hlsSource : track.aacSource,
					isLiveStream: true
				};
			})
			.filter((track) => track.url && track.url.trim() !== '');

			if (tracks.length === 0) {
				throw new Error('No valid live stream tracks found - all tracks missing URLs');
			}

			// Cache tracks
			this.liveStreamTracks = tracks;
			return tracks;
		} catch (error) {
			console.error('HPMAudioService: Error loading live stream tracks:', error);
			if (error instanceof Error) {
				console.error('HPMAudioService: Error message:', error.message);
				console.error('HPMAudioService: Error stack:', error.stack);
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
			return await this.liveStreamsPromise;
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
			const success = await this.initialize();
			if (!success) return;

			if (track.isLiveStream) {
				await TrackPlayer.updateOptions({
					capabilities: [
						Capability.Play,
						Capability.Pause,
						Capability.Stop
					]
				});
			} else {
				await TrackPlayer.updateOptions({
					capabilities: [
						Capability.Play,
						Capability.Pause,
						Capability.Stop,
						Capability.SeekTo,
						Capability.JumpForward,
						Capability.JumpBackward
					]
				});
			}
			// Set loading state
			this.state.currentTrack = track;
			this.notifyStateChange();

			await TrackPlayer.reset();
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

			// Update state
			this.state.currentTrack = track;

			// Add timeout to clear loading state if playback doesn't start
			setTimeout(() => {
				if (this.state.state === State.Loading && this.state.currentTrack?.id === track.id) {
					this.notifyStateChange();
				}
			}, 3000);
		} catch (error) {
			console.error('Error playing track:', error);
			this.state.currentTrack = null;
			this.notifyStateChange();
			throw error;
		}
	}

	/**
	 * Play a live stream track
	 */
	async playLiveStream(track: AudioTrack): Promise<void> {
		try {
			// Load live streams if not loaded
			if (this.liveStreamTracks.length === 0) {
				await this.loadLiveStreams();
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
			id: episodeId,
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
	 * Toggle play/pause
	 */
	async togglePlayPause(track: AudioTrack): Promise<void> {
		try {
			const success = await this.initialize();
			if (!success) return;

			const currentTrack = this.state.currentTrack;

			// If same track, toggle play/pause
			if (currentTrack && currentTrack.id === track.id) {
				if (this.state.state === State.Playing) {
					await this.pause();
				} else {
					await this.resume();
				}
			} else {
				await this.play(track);
			}
		} catch (error) {
			console.error('Error toggling play/pause:', error);
			throw error;
		}
	}

	/**
	 * Pause the current track
	 */
	async pause(): Promise<void> {
		try {
			if (this.state.state === State.Playing) {
				await TrackPlayer.pause();
				this.notifyStateChange();
			}
		} catch (error) {
			console.error('Error pausing track:', error);
			this.notifyStateChange();
		}
	}

	/**
	 * Resume the current track
	 */
	async resume(): Promise<void> {
		try {
			await TrackPlayer.play();
			this.notifyStateChange();
		} catch (error) {
			console.error('Error resuming track:', error);
			this.notifyStateChange();
			throw error;
		}
	}

	/**
	 * Stop the current track
	 */
	async stop(): Promise<void> {
		try {
			if (this.state.state === State.Playing) {
				await TrackPlayer.stop();
				this.state.currentTrack = null;
				this.notifyStateChange();
			}
		} catch (error) {
			console.error('Error stopping track:', error);
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
			const progress = await TrackPlayer.getProgress();
			const newPosition = Math.min(progress.position + seconds, progress.duration || progress.position + seconds);
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
			const progress = await TrackPlayer.getProgress();
			const newPosition = Math.max(progress.position - seconds, 0);
			await this.seekTo(newPosition);
		} catch (error) {
			console.error('Error seeking backward:', error);
			throw error;
		}
	}

	/**
	 * Skip to the next track
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
	 * Skip to the previous track
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
	 * Get the current position
	 */
	async getPosition(): Promise<number> {
		try {
			let progress = await TrackPlayer.getProgress();
			return progress.position;
		} catch (error) {
			console.error('Error getting position:', error);
			return 0;
		}
	}

	/**
	 * Get current duration
	 */
	async getDuration(): Promise<number> {
		try {
			let progress = await TrackPlayer.getProgress();
			return progress.duration;
		} catch (error) {
			console.error('Error getting duration:', error);
			return 0;
		}
	}
	async getProgress(): Promise<Progress> {
		try {
			return await TrackPlayer.getProgress();
		} catch (error) {
			console.error('Error getting duration:', error);
			return {buffered: 0, position: 0, duration: 0 };
		}
	}

	/**
	 * Check if can seek
	 */
	async canSeek(): Promise<boolean> {
		try {
			const duration = await TrackPlayer.getProgress();
			return duration.duration > 0 && !this.state.currentTrack?.isLiveStream;
		} catch (error) {
			console.error('Error checking seekability:', error);
			return false;
		}
	}

	/**
	 * Get current state
	 */
	getCurrentState(): HPMAudioState {
		return { ...this.state };
	}

	/**
	 * Get the current track
	 */
	getCurrentTrack(): AudioTrack | null {
		return this.state.currentTrack;
	}

	/**
	 * Check if a specific track is playing
	 */
	isTrackPlaying(trackId: string): boolean {
		return (
			this.state.currentTrack?.id === trackId &&
			this.state.state === State.Playing
		);
	}

	/**
	 * Check if a specific track is current
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
				state: State.Stopped,
				position: 0,
				duration: 0,
				canSeek: false,
				repeatMode: RepeatMode.Off
			};

			this.stateChangeListeners.clear();

			//console.log('HPM Audio Service cleaned up');
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	}
}

// Export singleton instance
export const hpmAudioService = new HPMAudioService();

export async function PlaybackService() {
	TrackPlayer.addEventListener(Event.RemotePlay, () => {
		TrackPlayer.play();
	});

	TrackPlayer.addEventListener(Event.RemotePause, () => {
		TrackPlayer.pause();
	});

	TrackPlayer.addEventListener(Event.RemoteStop, () => {
		TrackPlayer.pause();
	});

	TrackPlayer.addEventListener(Event.RemoteNext, async () => {
		const position = await TrackPlayer.getProgress();
		await TrackPlayer.seekTo(position.position + 10);
	});

	TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
		const position = await TrackPlayer.getProgress();
		await TrackPlayer.seekTo(Math.max(0, position.position - 10));
	});

	TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
		await TrackPlayer.seekTo(event.position);
	});

	TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
		const position = await TrackPlayer.getProgress();
		await TrackPlayer.seekTo(position.position + (event.interval || 10));
	});

	TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
		const position = await TrackPlayer.getProgress();
		await TrackPlayer.seekTo(Math.max(0, position.position - (event.interval || 10)));
	});
}