import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useUniversalAudio } from '../contexts/UniversalAudioContext';

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
		currentTrack,
		isPlaying,
		isLoading,
		position,
		duration: trackDuration,
		playHtmlAudio,
		pause,
		seekTo,
		isCurrentTrack,
	} = useUniversalAudio();

	// Check if this is the current audio
	const isThisAudio = isCurrentTrack(`html_${audioId}`);
	const paused = !isThisAudio || !isPlaying;

	// Update duration and position when playing
	useEffect(() => {
		if (isThisAudio) {
			setDuration(trackDuration);
			setCurrentTime(position);
		}
	}, [isThisAudio, trackDuration, position]);

	const onPlayPause = async () => {
		try {
			if (paused) {
				// Play this HTML audio
				await playHtmlAudio(audioId, src, title, subtitle);
			} else {
				// Pause the current audio
				await pause();
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
					<MaterialIcons name={paused ? 'play-arrow' : 'pause'} size={24} color="black" />
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