// src/services/PlaybackService.ts
// This service handles remote control events (lock screen, notification controls, headphone buttons)

import TrackPlayer, { Event } from 'react-native-track-player';

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
		await TrackPlayer.skipToNext();
	});

	TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
		await TrackPlayer.skipToPrevious();
	});

	TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
		await TrackPlayer.seekTo(event.position);
	});

	TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
		const position = await TrackPlayer.getPosition();
		await TrackPlayer.seekTo(position + (event.interval || 10));
	});

	TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
		const position = await TrackPlayer.getPosition();
		await TrackPlayer.seekTo(Math.max(0, position - (event.interval || 10)));
	});
}

