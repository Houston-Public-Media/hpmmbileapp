// src/services/HtmlAudioService.ts

import { useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, AudioStatus, AudioPlayer, setAudioModeAsync } from 'expo-audio';

interface HtmlAudioState {
	currentAudioId: string | null;
	status: AudioStatus | null;
	player: AudioPlayer | null;
}
function SetAudioPlayer(src: string) {
	const player = useAudioPlayer({uri: src});
	useEffect(() => { setAudioModeAsync({ playsInSilentMode: true }); }, []);
	return player;
}

function AudioPlayerStatus(player: AudioPlayer) {
	return useAudioPlayerStatus(player);
}

class HtmlAudioService {
	private state: HtmlAudioState = {
		currentAudioId: null,
		status: null,
		player: null
	};

	private stateChangeListeners: Set<() => void> = new Set();

	// Get current state
	getCurrentState(): HtmlAudioState {
		return { ...this.state };
	}

	// Add state change listener
	addStateChangeListener(callback: () => void): () => void {
		this.stateChangeListeners.add(callback);
		return () => this.stateChangeListeners.delete(callback);
	}

	// Notify state change
	private notifyStateChange(): void {
		this.stateChangeListeners.forEach(callback => callback());
	}

	// Play audio from HTML content
	async playAudio(audioId: string, src: string): Promise<void> {
		try {
			// Stop current audio if playing
			await this.stopCurrentAudio();

			// Create new audio instance
			//const { sound } = await Audio.Sound.createAsync({ uri: src });
			const player = SetAudioPlayer(src);
			const status = AudioPlayerStatus(player);
			
			this.state.player = player;
			this.state.status = status;
			this.state.currentAudioId = audioId;
			this.notifyStateChange();

			// Start playing
			player.play();

		} catch (error) {
			console.error('Error playing HTML audio:', error);
			this.state.currentAudioId = null;
			this.state.status = null;
			this.state.player = null;
			this.notifyStateChange();
		}
	}

	// Pause current audio
	async pauseCurrentAudio(): Promise<void> {
		if (this.state.player && this.state.status?.playing) {
			try {
				this.state.player?.pause();
				this.notifyStateChange();
			} catch (error) {
				console.error('Error pausing HTML audio:', error);
				this.notifyStateChange();
			}
		}
	}

	// Stop current audio
	async stopCurrentAudio(): Promise<void> {
		if (this.state.player) {
			try {
				this.state.player?.remove();
			} catch (error) {
				console.error('Error stopping HTML audio:', error);
			}
			
			this.state.status = null;
			this.state.currentAudioId = null;
			this.state.player = null;
			this.notifyStateChange();
		}
	}

	// Check if specific audio is playing
	isAudioPlaying(audioId: string): boolean {
		if (this.state.status === null) {
			return false;
		}
		return this.state.currentAudioId === audioId && this.state.status?.playing;
	}

	// Cleanup all audio
	async cleanup(): Promise<void> {
		await this.stopCurrentAudio();
		this.stateChangeListeners.clear();
	}
}

// Export singleton instance
export const htmlAudioService = new HtmlAudioService();
