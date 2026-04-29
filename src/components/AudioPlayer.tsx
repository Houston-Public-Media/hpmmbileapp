import React, { useRef, useState, useEffect } from 'react';
import {View, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useHPMAudio } from '../contexts/HPMAudioContext';
import { State } from 'react-native-track-player';

interface AudioPlayerProps {
	src: string;
	title: string;
	subtitle: string;
	thumbnail: any; // You can use require() for local images or {uri: '...'} for remote
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, subtitle, thumbnail }) => {
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	// Generate unique ID for this audio player
	const audioId = useRef(`html_audio_${Date.now()}_${Math.random()}`).current;

	// Use universal audio context
	const {
		state,
		position,
		duration: trackDuration,
		playPodcast,
		pause,
		seekTo,
		isCurrentTrack,
		resume,
		stop
	} = useHPMAudio();

	// Check if this is the current audio
	const isThisAudio = isCurrentTrack(audioId);

	// Update duration and position when playing
	useEffect(() => {
		if (isThisAudio) {
			setDuration(trackDuration);
			setCurrentTime(position);
			console.log("current Position: ", position);
			console.log("Duration: ", trackDuration);
		}
	}, [isThisAudio, trackDuration, position]);

	const onPlayPause = async () => {
		try {
			if (isThisAudio) {
				if (state === State.Playing) {
					await pause();
				} else if (state === State.Paused) {
					await resume();
				} else {
					await playPodcast(audioId, src, title, subtitle, "Houston Public Media");
				}
			} else {
				await stop();
				await playPodcast(audioId, src, title, subtitle, "Houston Public Media");
			}
		} catch (error) {
			console.error('Error toggling HTML audio:', error);
		}
	};

	const onSeek = async (value: number) => {
		try {
			if (isThisAudio) {
				await seekTo(value);
				setCurrentTime(value);
			}
		} catch (error) {
			console.error('Error seeking HTML audio:', error);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
					<MaterialIcons name={state === State.Playing ? 'pause' : 'play-arrow'} size={24} color="black" />
				</TouchableOpacity>
				<View style={styles.progressContainer}>
					<Slider
						style={styles.slider}
						minimumValue={0}
						maximumValue={duration}
						value={currentTime}
						thumbImage={require('../assets/icons/transparent.png')}
						minimumTrackTintColor="#4A90E2"
						maximumTrackTintColor="#ccc"
						//thumbTintColor="#ccc"
						onSlidingComplete={onSeek}
					/>
					{/* <View style={styles.timeRow}>
						<Text style={styles.timeText}>{formatTime(currentTime)}</Text>
						<Text style={styles.timeText}>{formatTime(duration)}</Text>
					</View> */}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		padding: 20,
		backgroundColor: '#f2f2f2',
		borderRadius: 8,
		marginVertical: 5,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	playButton: {
		width: 24,
		height: 24,
		borderRadius: 20,
		//backgroundColor: '#4A90E2',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
	},
	progressContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	slider: {
		width: '100%',
		height: 1,
	},
	timeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	timeText: {
		fontSize: 9,
		color: '#000',
	},
	hidden: {
		width: 0,
		height: 0,
	},
});

export default AudioPlayer;