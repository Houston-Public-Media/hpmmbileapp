// src/services/PodcastAudioService.ts

import { useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, AudioStatus, AudioPlayer, setAudioModeAsync, AudioSource } from 'expo-audio';

export interface PodcastAudioState {
	currentEpisodeId: string | null;
	player: AudioPlayer | null;
	status: AudioStatus | null;
	currentPosition: number;
	duration: number;
	loadedSounds: Map<string, AudioSource>;
}

function SetAudioPlayer(src: string) {
	const player = useAudioPlayer({uri: src});
	useEffect(() => {
		setAudioModeAsync({
			playsInSilentMode: true,
			allowsRecording: false,
			shouldPlayInBackground: true,
			interruptionMode: 'doNotMix'
		});
	}, []);
	return player;
}

function AudioPlayerStatus(player: AudioPlayer) {
	return useAudioPlayerStatus(player);
}

class PodcastAudioService {
	private state: PodcastAudioState = {
		currentEpisodeId: null,
		player: null,
		status: null,
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
		if (this.state.status && this.state.status.playing) {
			try {
				this.state.player?.pause();
				this.notifyStateChange();
			} catch (error) {
				//console.error('Error pausing current episode:', error);
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
				if (this.state.status?.playing) {
					await this.pauseEpisode();
				} else {
					await this.resumeEpisode();
				}
			}
		} catch (error) {
			this.notifyStateChange();
			//console.error('Error toggling play/pause:', error);
			throw error;
		}
	}

	private async loadAndPlayEpisode(episodeId: string, audioUrl: string): Promise<void> {
		try {
			this.state.currentEpisodeId = episodeId;
			const player = SetAudioPlayer(audioUrl);
			const status = AudioPlayerStatus(player);
			this.state.player = player;
			this.state.status = status;
			this.notifyStateChange();
			this.state.player.play();
		} catch (error) {
			this.state.player = null;
			this.state.status = null;
			this.state.currentEpisodeId = null;
			this.notifyStateChange();
			//console.error('Error loading episode:', error);
			throw error;
		}
	}

	private async pauseEpisode(): Promise<void> {
		if (this.state.status) {
			this.state.player?.pause();
			this.notifyStateChange();
		}
	}

	private async resumeEpisode(): Promise<void> {
		if (this.state.status) {
			this.state.player?.play();
			this.notifyStateChange();
		}
	}

	private async stopCurrentEpisode(): Promise<void> {
		if (this.state.status) {
			try {
				this.state.player?.remove();
			} catch (error) {
				//console.error('Error stopping current episode:', error);
			}
			this.state.status = null;
			this.state.currentEpisodeId = null;
			this.state.player = null;
			this.state.currentPosition = 0;
			this.state.duration = 0;
		}
	}

	private onPlaybackStatusUpdate(status: any): void {
		if (status.isLoaded) {
			this.state.currentPosition = status.positionMillis || 0;
			this.state.duration = status.durationMillis || 0;

			// If episode finished playing
			if (status.didJustFinish) {
				this.state.currentPosition = 0;
			}
		}

		// Call status update callback if set
		if (this.statusUpdateCallback) {
			this.statusUpdateCallback(status);
		}
	}

	async seekToPosition(positionMillis: number): Promise<void> {
		if (this.state.status) {
			this.state.player?.seekTo(positionMillis);
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
		this.stateChangeListeners.clear();
		this.statusUpdateCallback = null;
		this.isInitialized = false;
	}
}

// Export a singleton instance
export const podcastAudioService = new PodcastAudioService();
