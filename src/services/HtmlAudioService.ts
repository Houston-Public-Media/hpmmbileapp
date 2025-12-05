// src/services/HtmlAudioService.ts

import { Audio } from 'expo-av';

interface HtmlAudioState {
  currentAudioId: string | null;
  isPlaying: boolean;
  sound: Audio.Sound | null;
}

class HtmlAudioService {
  private state: HtmlAudioState = {
    currentAudioId: null,
    isPlaying: false,
    sound: null,
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
      const { sound } = await Audio.Sound.createAsync({ uri: src });
      
      this.state.sound = sound;
      this.state.currentAudioId = audioId;
      this.state.isPlaying = true;
      this.notifyStateChange();

      // Start playing
      await sound.playAsync();

      // Set up status update listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.state.isPlaying = status.isPlaying || false;
          this.notifyStateChange();
        }
      });

    } catch (error) {
      console.error('Error playing HTML audio:', error);
      this.state.isPlaying = false;
      this.state.currentAudioId = null;
      this.state.sound = null;
      this.notifyStateChange();
    }
  }

  // Pause current audio
  async pauseCurrentAudio(): Promise<void> {
    if (this.state.sound && this.state.isPlaying) {
      try {
        await this.state.sound.pauseAsync();
        this.state.isPlaying = false;
        this.notifyStateChange();
      } catch (error) {
        console.error('Error pausing HTML audio:', error);
        this.state.isPlaying = false;
        this.notifyStateChange();
      }
    }
  }

  // Stop current audio
  async stopCurrentAudio(): Promise<void> {
    if (this.state.sound) {
      try {
        await this.state.sound.stopAsync();
        await this.state.sound.unloadAsync();
      } catch (error) {
        console.error('Error stopping HTML audio:', error);
      }
      
      this.state.sound = null;
      this.state.currentAudioId = null;
      this.state.isPlaying = false;
      this.notifyStateChange();
    }
  }

  // Check if specific audio is playing
  isAudioPlaying(audioId: string): boolean {
    return this.state.currentAudioId === audioId && this.state.isPlaying;
  }

  // Cleanup all audio
  async cleanup(): Promise<void> {
    await this.stopCurrentAudio();
    this.stateChangeListeners.clear();
  }
}

// Export singleton instance
export const htmlAudioService = new HtmlAudioService();
