// src/services/ListenLiveServices.ts

import { trackPlayerService } from './TrackPlayerService';

interface Track { 
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  url: string;
}

interface ApiTrack {
  id: number;
  name: string;
  artwork: string;
  aacSource: string;
  mp3Source?: string;
}

interface ListenLiveState {
  currentTrackId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  actuallyPlaying: boolean;
  tracksReady: boolean;
}

class ListenLiveService {
  async initialize(): Promise<boolean> {
    return await trackPlayerService.initialize();
  }

  async loadTracks(): Promise<Track[]> {
    return await trackPlayerService.loadTracks();
  }

  async playTrack(trackId: string): Promise<void> {
    return await trackPlayerService.playTrack(trackId);
  }

  async pauseTrack(): Promise<void> {
    return await trackPlayerService.pauseTrack();
  }

  async stopCurrentTrack(): Promise<void> {
    return await trackPlayerService.stopCurrentTrack();
  }

  async seekForward(): Promise<void> {
    return await trackPlayerService.seekForward();
  }

  async seekBackward(): Promise<void> {
    return await trackPlayerService.seekBackward();
  }

  async togglePlayPause(trackId: string): Promise<void> {
    return await trackPlayerService.togglePlayPause(trackId);
  }

  getCurrentState(): ListenLiveState {
    return trackPlayerService.getCurrentState();
  }

  addStateChangeListener(callback: () => void): () => void {
    return trackPlayerService.addStateChangeListener(callback);
  }

  async canSeek(): Promise<boolean> {
    return await trackPlayerService.canSeek();
  }

  async cleanup(): Promise<void> {
    return await trackPlayerService.cleanup();
  }
}

// Export singleton instance
export const listenLiveService = new ListenLiveService();

// Legacy functions for backward compatibility
export async function setupPlayer(): Promise<boolean> {
  return listenLiveService.initialize();
}

export async function addTrack(): Promise<Track[]> {
  return listenLiveService.loadTracks();
}

export async function playbackService(): Promise<void> {
  console.log('Playback service initialized');
}
