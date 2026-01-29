// src/services/PodcastAudioService.ts

import { Audio } from 'expo-av';

export interface PodcastAudioState {
	currentEpisodeId: string | null;
	isPlaying: boolean;
	isLoading: boolean;
	sound: Audio.Sound | null;
	currentPosition: number;
	duration: number;
	loadedSounds: Map<string, Audio.Sound>;
}

class PodcastAudioService {
	private state: PodcastAudioState = {
		currentEpisodeId: null,
		isPlaying: false,
		isLoading: false,
		sound: null,
		currentPosition: 0,
		duration: 0,
		loadedSounds: new Map(),
	};

	private isInitialized = false;
	private statusUpdateCallback: ((status: any) => void) | null = null;
	private stateChangeListeners: Set<() => void> = new Set();

	async initialize(): Promise<boolean> {
		if (this.isInitialized) return true;

		try {
			// Configure audio mode for optimal podcast playback
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: false,
				staysActiveInBackground: true,
				playsInSilentModeIOS: true,
				shouldDuckAndroid: true,
				playThroughEarpieceAndroid: false,
			});

			this.isInitialized = true;
			return true;
		} catch (error) {
			//console.error("Error initializing podcast audio player:", error);
			return false;
		}
	}

	getCurrentState(): PodcastAudioState {
		return { ...this.state };
	}

	// Public method to pause current episode
	async pauseCurrentEpisode(): Promise<void> {
		if (this.state.sound && this.state.isPlaying) {
			try {
				await this.state.sound.pauseAsync();
				this.state.isPlaying = false;
				this.notifyStateChange();
			} catch (error) {
				//console.error('Error pausing current episode:', error);
				this.state.isPlaying = false;
				this.notifyStateChange();
			}
		}
	}

	isEpisodeLoaded(episodeId: string): boolean {
		return this.state.loadedSounds.has(episodeId);
	}



	// Event-driven state management
	addStateChangeListener(callback: () => void): () => void {
		this.stateChangeListeners.add(callback);
		return () => this.stateChangeListeners.delete(callback);
	}

	private notifyStateChange(): void {
		this.stateChangeListeners.forEach(callback => {
			try {
				callback();
			} catch (error) {
				//console.error('Error in state change listener:', error);
			}
		});
	}



	async togglePlayPause(episodeId: string, audioUrl: string): Promise<void> {
		await this.initialize();

		try {
			// If this is a different episode, pause current and load new one
			if (this.state.currentEpisodeId !== episodeId) {
				await this.pauseCurrentEpisode();
				await this.loadAndPlayEpisode(episodeId, audioUrl);
			} else {
				// Same episode - toggle play/pause
				if (this.state.isPlaying) {
					await this.pauseEpisode();
				} else {
					await this.resumeEpisode();
				}
			}
		} catch (error) {
			this.state.isLoading = false;
			this.notifyStateChange();
			//console.error('Error toggling play/pause:', error);
			throw error;
		}
	}

	private async loadAndPlayEpisode(episodeId: string, audioUrl: string): Promise<void> {
		try {
			this.state.currentEpisodeId = episodeId;
			
			// Check if episode is already loaded in cache
			const cachedSound = this.state.loadedSounds.get(episodeId);
			
			if (cachedSound) {
				//console.log(`Playing cached episode: ${episodeId}`);
				
				// Set up status callback for cached sound
				cachedSound.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate.bind(this));
				
				// Reset to beginning and play immediately
				await cachedSound.setPositionAsync(0);
				await cachedSound.playAsync();
				
				this.state.sound = cachedSound;
				this.state.isPlaying = true;
				this.notifyStateChange();
				
				//console.log(`Now playing cached episode: ${episodeId}`);
			} else {
				//console.log(`Loading new episode: ${episodeId}`);
				
				this.state.isLoading = true;
				this.notifyStateChange();

				const { sound } = await Audio.Sound.createAsync(
					{ uri: audioUrl },
					{ shouldPlay: true, progressUpdateIntervalMillis: 100 },
					this.onPlaybackStatusUpdate.bind(this)
				);

				// Cache the loaded sound
				this.state.loadedSounds.set(episodeId, sound);
				this.state.sound = sound;
				this.state.isPlaying = true;
				this.state.isLoading = false;

				this.notifyStateChange();
				//console.log(`Now playing and cached episode: ${episodeId}`);
			}
		} catch (error) {
			this.state.isLoading = false;
			this.state.currentEpisodeId = null;
			this.notifyStateChange();
			//console.error('Error loading episode:', error);
			throw error;
		}
	}



	private async pauseEpisode(): Promise<void> {
		if (this.state.sound) {
			await this.state.sound.pauseAsync();
			this.state.isPlaying = false;
			this.notifyStateChange();
		}
	}


	private async resumeEpisode(): Promise<void> {
		if (this.state.sound) {
			await this.state.sound.playAsync();
			this.state.isPlaying = true;
			this.notifyStateChange();
		}
	}

	private async stopCurrentEpisode(): Promise<void> {
		if (this.state.sound) {
			try {
				await this.state.sound.stopAsync();
				await this.state.sound.unloadAsync();
			} catch (error) {
				//console.error('Error stopping current episode:', error);
			}
			
			this.state.sound = null;
			this.state.currentEpisodeId = null;
			this.state.isPlaying = false;
			this.state.currentPosition = 0;
			this.state.duration = 0;
		}
	}

	private onPlaybackStatusUpdate(status: any): void {
		if (status.isLoaded) {
			this.state.currentPosition = status.positionMillis || 0;
			this.state.duration = status.durationMillis || 0;
			this.state.isPlaying = status.isPlaying || false;

			// If episode finished playing
			if (status.didJustFinish) {
				this.state.isPlaying = false;
				this.state.currentPosition = 0;
			}
		}

		// Call status update callback if set
		if (this.statusUpdateCallback) {
			this.statusUpdateCallback(status);
		}
	}

	async seekToPosition(positionMillis: number): Promise<void> {
		if (this.state.sound) {
			await this.state.sound.setPositionAsync(positionMillis);
		}
	}

	async seekForward(seconds: number = 15): Promise<void> {
		const newPosition = Math.min(
			this.state.currentPosition + seconds * 1000,
			this.state.duration
		);
		await this.seekToPosition(newPosition);
	}

	async seekBackward(seconds: number = 15): Promise<void> {
		const newPosition = Math.max(this.state.currentPosition - seconds * 1000, 0);
		await this.seekToPosition(newPosition);
	}

	setStatusUpdateCallback(callback: (status: any) => void): void {
		this.statusUpdateCallback = callback;
	}

	removeStatusUpdateCallback(): void {
		this.statusUpdateCallback = null;
	}

	async cleanup(): Promise<void> {
		await this.stopCurrentEpisode();
		
		// Clean up all cached sounds
		for (const [episodeId, sound] of this.state.loadedSounds) {
			try {
				await sound.unloadAsync();
				//console.log(`Cleaned up cached episode: ${episodeId}`);
			} catch (error) {
				//console.error(`Error cleaning up cached episode ${episodeId}:`, error);
			}
		}
		this.state.loadedSounds.clear();
		
		this.stateChangeListeners.clear();
		this.statusUpdateCallback = null;
		this.isInitialized = false;
	}
}

// Export a singleton instance
export const podcastAudioService = new PodcastAudioService();
