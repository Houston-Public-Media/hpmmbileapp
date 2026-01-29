// src/services/TrackPlayerService.ts

import TrackPlayer, {
	AppKilledPlaybackBehavior,
	Capability,
	Event,
	State,
	Track as TPTrack,
} from 'react-native-track-player';

interface Track {
	id: string;
	title: string;
	artist: string;
	album?: string;
	artwork?: string;
	url: string;
}

interface TrackPlayerState {
	currentTrackId: string | null;
	isPlaying: boolean;
	isLoading: boolean;
	actuallyPlaying: boolean;
	tracksReady: boolean;
}

class TrackPlayerService {
	private state: TrackPlayerState = {
		currentTrackId: null,
		isPlaying: false,
		isLoading: false,
		actuallyPlaying: false,
		tracksReady: false,
	};

	private isInitialized = false;
	private tracksLoaded = false;
	private stateChangeListeners: Set<() => void> = new Set();
	private cachedTracks: Track[] = [];
	private loadingPromise: Promise<Track[]> | null = null;

	async initialize(): Promise<boolean> {
		if (this.isInitialized) {
			return true;
		}

		try {
			// Setup the player with background capabilities
			await TrackPlayer.setupPlayer({
				autoHandleInterruptions: true,
			});

			// Configure the player for live streaming
			await TrackPlayer.updateOptions({
				android: {
					appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
				},
				capabilities: [
					Capability.Play,
					Capability.Pause,
					Capability.SeekTo,
					Capability.SkipToNext,
					Capability.SkipToPrevious,
				],
				compactCapabilities: [
					Capability.Play,
					Capability.Pause,
				],
				progressUpdateEventInterval: 2,
			});

			// Set up event listeners
			this.setupEventListeners();

			this.isInitialized = true;
			return true;
		} catch (error) {
			// If already initialized, that's okay
			if (error instanceof Error && error.message.includes('already been initialized')) {
				this.isInitialized = true;
				return true;
			}
			console.error('Error initializing TrackPlayer:', error);
			return false;
		}
	}

	private setupEventListeners(): void {
		// Listen to playback state changes
		TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
			const { state } = event;
			
			// Update states based on TrackPlayer state
			let isPlayingOrBuffering = false;
			let isActuallyPlaying = false;
			let isBuffering = false;

			// Handle different states explicitly
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

			// Only update if state actually changed
			if (this.state.isPlaying !== isPlayingOrBuffering || 
					this.state.actuallyPlaying !== isActuallyPlaying ||
					this.state.isLoading !== isBuffering) {
				
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
					this.state.currentTrackId = track.id as string;
					this.notifyStateChange();
				}
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
	}

	async loadTracks(): Promise<Track[]> {
		// If already loaded, return cached tracks
		if (this.tracksLoaded && this.cachedTracks.length > 0) {
			return this.cachedTracks;
		}

		// If currently loading, wait for the existing promise
		if (this.loadingPromise) {
			return this.loadingPromise;
		}

		// Create new loading promise
		this.loadingPromise = this._loadTracksInternal();
		
		try {
			const tracks = await this.loadingPromise;
			this.tracksLoaded = true;
			this.state.tracksReady = true;
			this.notifyStateChange();
			return tracks;
		} catch (error) {
			this.loadingPromise = null;
			throw error;
		}
	}

	private async _loadTracksInternal(): Promise<Track[]> {
		try {
			// Fetch audio metadata
			const audioResponse = await fetch(
				'https://cdn.houstonpublicmedia.org/assets/nowplay/all.json'
			);
			const audioData = await audioResponse.json();

			const response = await fetch('https://cdn.houstonpublicmedia.org/assets/streams.json');
			const playListData: { audio: any[] } = await response.json();

			// Create track objects
			const tracks = playListData.audio
				.map((track, index) => ({
					id: track.id.toString(),
					title: audioData.radio?.[index]?.title || '',
					artist: audioData.radio?.[index]?.artist || '',
					album: audioData.radio?.[index]?.name || audioData.radio?.[index]?.album || '',
					artwork: track.artwork,
					url: track.aacSource || track.hlsSource || '',
				}))
				.filter((track) => track.url && track.url.trim() !== '');

			if (tracks.length === 0) {
				throw new Error('No valid tracks found');
			}

			// Cache tracks for later reference
			this.cachedTracks = tracks;

			// Convert to TrackPlayer format and add to queue
			await this.addTracksToQueue(tracks);

			return tracks;
		} catch (error) {
			console.error('Error loading tracks:', error);
			throw error;
		}
	}

	private async addTracksToQueue(tracks: Track[]): Promise<void> {
		try {
			// Clear existing queue
			await TrackPlayer.reset();

			// Add all tracks to the queue
			const trackPlayerTracks: TPTrack[] = tracks.map((track) => ({
				id: track.id,
				url: track.url,
				title: track.title,
				artist: track.artist,
				album: track.album,
				artwork: track.artwork,
				isLiveStream: true, // Mark as live stream for proper handling
			}));

			await TrackPlayer.add(trackPlayerTracks);
		} catch (error) {
			console.error('Error adding tracks to queue:', error);
			throw error;
		}
	}

	private async prewarmStreams(trackCount: number): Promise<void> {
		try {
			// Pre-warm each stream by playing briefly to establish connection and buffer
			for (let i = 0; i < trackCount; i++) {
				await TrackPlayer.skip(i);
				await TrackPlayer.play();
				await new Promise(resolve => setTimeout(resolve, 1000));
				await TrackPlayer.pause();
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			await TrackPlayer.skip(0);
			await TrackPlayer.stop();
		} catch (error) {
			// Swallow pre-warm warnings in production
		}
	}

	async playTrack(trackId: string): Promise<void> {
		try {
			// Wait for tracks to be loaded if they're not ready yet
			if (!this.tracksLoaded || this.cachedTracks.length === 0) {
				// Wait for tracks to load first (don't set loading state yet)
				if (this.loadingPromise) {
					await this.loadingPromise;
				} else {
					throw new Error('Tracks not loaded and no loading in progress');
				}
			}

			// Verify tracks are actually ready
			if (!this.tracksLoaded || this.cachedTracks.length === 0) {
				throw new Error('Tracks failed to load');
			}

			// Find track index first
			const trackIndex = this.cachedTracks.findIndex((t) => t.id === trackId);
			if (trackIndex === -1) {
				throw new Error(`Track ${trackId} not found in queue`);
			}

			// Set loading state only now that we're actually playing
			this.state.currentTrackId = trackId;
			this.state.isLoading = true;
			this.state.isPlaying = true;
			this.state.actuallyPlaying = false;
			this.notifyStateChange();

			// Skip to the track and play
			await TrackPlayer.skip(trackIndex);
			await TrackPlayer.play();
			
			// Add timeout to clear loading state if playback doesn't start
			setTimeout(() => {
				if (this.state.isLoading && this.state.currentTrackId === trackId && !this.state.actuallyPlaying) {
					this.state.isLoading = false;
					this.notifyStateChange();
				}
			}, 3000);

		} catch (error) {
			console.error('Error playing track:', error);
			this.state.currentTrackId = null;
			this.state.isPlaying = false;
			this.state.isLoading = false;
			this.state.actuallyPlaying = false;
			this.notifyStateChange();
			throw error;
		}
	}

	async pauseTrack(): Promise<void> {
		try {
			if (this.state.isPlaying) {
				await TrackPlayer.pause();
				this.state.isPlaying = false;
				this.state.actuallyPlaying = false;
				this.notifyStateChange();
			}
		} catch (error) {
			console.error('Error pausing track:', error);
			this.state.isPlaying = false;
			this.state.actuallyPlaying = false;
			this.notifyStateChange();
		}
	}

	async stopCurrentTrack(): Promise<void> {
		try {
			if (this.state.isPlaying || this.state.actuallyPlaying) {
				this.state.isPlaying = false;
				this.state.actuallyPlaying = false;
				this.state.isLoading = false;
				this.notifyStateChange();

				await TrackPlayer.pause();
			}
		} catch (error) {
			console.error('Error stopping track:', error);
			this.state.isPlaying = false;
			this.state.actuallyPlaying = false;
			this.state.isLoading = false;
			this.notifyStateChange();
		}
	}

	async seekForward(): Promise<void> {
		const wasPlaying = this.state.isPlaying;

		try {
			this.state.isLoading = true;
			this.notifyStateChange();

			const position = await TrackPlayer.getPosition();
			const duration = await TrackPlayer.getDuration();

			// Seek forward by 10 seconds, but not beyond the duration
			const newPosition = Math.min(position + 10, duration || position + 10);
			await TrackPlayer.seekTo(newPosition);

			this.state.isLoading = false;
			this.state.isPlaying = wasPlaying;
			this.notifyStateChange();
		} catch (error) {
			console.error('Error seeking forward:', error);
			this.state.isLoading = false;
			this.state.isPlaying = wasPlaying;
			this.notifyStateChange();
		}
	}

	async seekBackward(): Promise<void> {
		const wasPlaying = this.state.isPlaying;

		try {
			this.state.isLoading = true;
			this.notifyStateChange();

			const position = await TrackPlayer.getPosition();

			// Seek backward by 10 seconds, but not before 0
			const newPosition = Math.max(position - 10, 0);
			await TrackPlayer.seekTo(newPosition);

			this.state.isLoading = false;
			this.state.isPlaying = wasPlaying;
			this.notifyStateChange();
		} catch (error) {
			console.error('Error seeking backward:', error);
			this.state.isLoading = false;
			this.state.isPlaying = wasPlaying;
			this.notifyStateChange();
		}
	}

	async togglePlayPause(trackId: string): Promise<void> {
		// Wait for tracks to be ready first
		if (!this.tracksLoaded) {
			if (this.loadingPromise) {
				try {
					await this.loadingPromise;
				} catch (error) {
					console.error('Failed to load tracks:', error);
					return;
				}
			} else {
				return;
			}
		}

		// If same track, toggle play/pause
		if (this.state.currentTrackId === trackId) {
			if (this.state.isPlaying) {
				await this.pauseTrack();
			} else {
				try {
					await TrackPlayer.play();
					// State will be updated by event listener
				} catch (error) {
					console.error('Error resuming track:', error);
					this.state.isPlaying = false;
					this.state.isLoading = false;
					this.notifyStateChange();
				}
			}
		} else {
			// Different track, switch to it
			await this.playTrack(trackId);
		}
	}

	getCurrentState(): TrackPlayerState {
		return { ...this.state };
	}

	addStateChangeListener(callback: () => void): () => void {
		this.stateChangeListeners.add(callback);
		return () => this.stateChangeListeners.delete(callback);
	}

	private notifyStateChange(): void {
		this.stateChangeListeners.forEach((callback) => {
			try {
				callback();
			} catch (error) {
				console.error('Error in state change listener:', error);
			}
		});
	}

	async canSeek(): Promise<boolean> {
		try {
			const duration = await TrackPlayer.getDuration();
			return duration > 0;
		} catch (error) {
			return false;
		}
	}

	isTracksReady(): boolean {
		return this.tracksLoaded && this.cachedTracks.length > 0;
	}

	async cleanup(): Promise<void> {
		try {
			await this.stopCurrentTrack();
			await TrackPlayer.reset();

			this.state.currentTrackId = null;
			this.state.isPlaying = false;
			this.state.isLoading = false;
			this.state.actuallyPlaying = false;
			this.state.tracksReady = false;
			this.tracksLoaded = false;
			this.loadingPromise = null;

			this.stateChangeListeners.clear();
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	}
}

// Export singleton instance
export const trackPlayerService = new TrackPlayerService();