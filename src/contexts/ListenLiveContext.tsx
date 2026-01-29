// src/contexts/ListenLiveContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { universalAudioService, AudioTrack } from '../services/UniversalAudioService';

interface ListenLiveContextType {
	isPlayerReady: boolean;
	tracks: AudioTrack[];
	error: string | null;
	isLoading: boolean;
	refreshListenLiveData: () => Promise<void>;
}

const ListenLiveContext = createContext<ListenLiveContextType | undefined>(undefined);

interface ListenLiveProviderProps {
	children: ReactNode;
}

export const ListenLiveProvider: React.FC<ListenLiveProviderProps> = ({ children }) => {
	const [isPlayerReady, setIsPlayerReady] = useState(false);
	const [tracks, setTracks] = useState<AudioTrack[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const initializeListenLiveService = async () => {
		try {
			console.log('ListenLive: Starting initialization...');
			setIsLoading(true);
			setError(null);
			
			// Wait for audio service to be ready (it's initialized by UniversalAudioProvider)
			// Just load the live stream tracks
			console.log('ListenLive: Loading live stream tracks...');
			const fetchedTracks = await universalAudioService.loadLiveStreams();
			console.log('ListenLive: Loaded tracks:', fetchedTracks.length);
			
			setTracks(fetchedTracks);
			setIsPlayerReady(true);
			console.log(`ListenLive initialized successfully with ${fetchedTracks.length} tracks`);
		} catch (error) {
			console.error("ListenLive setup error:", error);
			
			// Provide more specific error messages
			let errorMessage = "Failed to load audio streams. Please try again later.";
			
			if (error instanceof Error) {
				console.error("Error details:", error.message);
				if (error.message.includes('internet') || error.message.includes('connection') || error.message.includes('network')) {
					errorMessage = "No internet connection. Please check your network and try again.";
				} else if (error.message.includes('Failed to load') || error.message.includes('No valid')) {
					errorMessage = "All audio streams are currently unavailable. Please try again later.";
				} else if (error.message.includes('permission')) {
					errorMessage = "Audio permission denied. Please check your app permissions.";
				} else {
					// Include the actual error message for debugging
					errorMessage = `Failed to load audio streams: ${error.message}`;
				}
			}
			
			setError(errorMessage);
		} finally {
			setIsLoading(false);
			console.log('ListenLive: Initialization complete');
		}
	};

	const refreshListenLiveData = async () => {
		await initializeListenLiveService();
	};

	useEffect(() => {
		// Add a small delay to ensure UniversalAudioProvider is initialized first
		const timeoutId = setTimeout(() => {
			console.log('ListenLive: Starting delayed initialization...');
			initializeListenLiveService();
		}, 100);
		const fetchData = async () => {
			const data = await universalAudioService.updateLiveStreamTracks();
			setTracks(data);
		}

		fetchData();
		const interval = setInterval(() => {
			fetchData();
		}, 30000);

		return () => {
			clearTimeout(timeoutId);
			clearInterval(interval);
		};
	}, []);

	const value: ListenLiveContextType = {
		isPlayerReady,
		tracks,
		error,
		isLoading,
		refreshListenLiveData,
	};

	return (
		<ListenLiveContext.Provider value={value}>
			{children}
		</ListenLiveContext.Provider>
	);
};

export const useListenLive = (): ListenLiveContextType => {
	const context = useContext(ListenLiveContext);
	if (context === undefined) {
		throw new Error('useListenLive must be used within an ListenLiveProvider');
	}
	return context;
};