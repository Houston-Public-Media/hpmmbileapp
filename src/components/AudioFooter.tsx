import React from 'react';
import {Alert, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useHPMAudio} from '../contexts/HPMAudioContext';
import {MaterialIcons} from '@expo/vector-icons';
import {color} from '../utils/colorUtils';
import {State} from 'react-native-track-player';
import { AudioType, AudioTrack } from "../services/HPMAudioService";

const AudioFooter = () => {
	// Use universal audio context
	const {
		currentTrack,
		state,
		canSeek: audioCanSeek,
		togglePlayPause,
		seekForward,
		seekBackward
	} = useHPMAudio();

	const onPlayPausePress = async (track: AudioTrack) => {
		try {
			await togglePlayPause(track);
		} catch (error) {
			console.error('Error toggling play/pause:', error);
			
			// Provide specific error messages based on the error type
			let errorMessage = 'Unable to play this track. Please try again.';
			
			if (error instanceof Error) {
				if (error.message.includes('network') || error.message.includes('connection')) {
					errorMessage = 'Network error. Please check your internet connection and try again.';
				} else if (error.message.includes('format') || error.message.includes('codec')) {
					errorMessage = 'This audio format is not supported on your device.';
				} else if (error.message.includes('timeout')) {
					errorMessage = 'The stream is taking too long to load. Please try again.';
				} else if (error.message.includes('URL not found') || error.message.includes('not found')) {
					errorMessage = 'This stream is currently unavailable. Please try another one.';
				} else if (error.message.includes('not loaded')) {
					errorMessage = 'Audio streams are not ready yet. Please wait and try again.';
				}
			}
			
			Alert.alert('Playback Error', errorMessage);
		}
	};
	if ( state !== State.Playing && state !== State.Paused && state !== State.Buffering && state !== State.Loading ) {
		return;
	}
	if (currentTrack === null) {
		return;
	}
	let nowPlay = currentTrack?.artist + " - " + currentTrack?.title;
	if (currentTrack.type === AudioType.PODCAST || currentTrack.artist.includes('Houston Public Media') ) {
		nowPlay = currentTrack.title;
	}

	return (
		<View style={styles.trackItem}>
			<View style={styles.cardLayout}>
				{/* Left section: Artwork */}
				<View style={styles.artworkContainer}>
					{currentTrack?.artwork ? (
						<Image source={{uri: currentTrack?.artwork}} style={styles.artwork} />
					) : (
						<View style={styles.placeholderArtwork}>
							<MaterialIcons name="music-note" size={32} color="#666" />
						</View>
					)}
				</View>
				
				{/* Right section: Content area */}
				<View style={styles.rightSection}>
					{/* Top of right: Track Info */}
					<View style={styles.trackInfo}>
						<Text style={[
							styles.title, styles.currentTrackTitle
						]} numberOfLines={1}>
							{currentTrack?.album}
						</Text>
						<Text style={[
							styles.artist, styles.currentTrackArtist
						]} numberOfLines={2}>
							{nowPlay}
						</Text>

					</View>
				</View>	
					{/* Bottom of right: Controls */}
				<View style={styles.controlsSection}>
					{!currentTrack.isLiveStream ? (
					<TouchableOpacity
						style={[
							styles.seekButton,
							(state === State.Loading || state === State.Buffering) && styles.disabledButton
						]}
						onPress={() => seekBackward(10)}
						disabled={state === State.Loading || state === State.Buffering}
					>
						<MaterialIcons
							name="replay-10"
							size={18}
							color={state !== State.Loading && state !== State.Buffering ? color.primary : '#888'}
						/>
					</TouchableOpacity>
					): ''}
					<TouchableOpacity
						style={[
							styles.mainPlayButton,
							state === State.Playing && styles.pauseButton,
						]}
						onPress={() => onPlayPausePress(currentTrack)}
					>
						<View style={styles.buttonIconContainer}>
							<View style={styles.iconWrapper}>
								<MaterialIcons 
									name={state === State.Playing ? 'pause' : 'play-arrow'}
									size={22} 
									color="#fff" 
								/>
							</View>
						</View>
					</TouchableOpacity>
					{!currentTrack.isLiveStream ? (
						<TouchableOpacity
							style={[
								styles.seekButton,
								(state === State.Loading || state === State.Buffering) && styles.disabledButton
							]}
							onPress={() => seekForward(10)}
							disabled={state === State.Loading || state === State.Buffering}
						>
							<MaterialIcons
								name="forward-10"
								size={18}
								color={state !== State.Loading && state !== State.Buffering ? color.primary : '#888'}
							/>
						</TouchableOpacity>
					): ''}
				</View>
			</View>
		</View>
	);
};
const styles = StyleSheet.create({
	footerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 5,
		paddingHorizontal: 25,
		backgroundColor: '#f9f6f6',
		borderWidth: 1,
		borderColor: '#e7e7e7',
	},
	trackItem: {
		// margin: 8,
		backgroundColor: '#fff',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderColor: '#808080',
		elevation: 4
	},

	cardLayout: {
		flexDirection: 'row',
		alignItems: 'stretch',
		flexWrap: 'nowrap'
	},
	artworkContainer: {
		position: 'relative',
		width: 50,
		height: 50,
		borderRadius: 14,
		overflow: 'hidden',
		marginRight: 12,
		backgroundColor: '#f5f7fa',
		alignItems: 'center'
	},
	artwork: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
		borderRadius: 14,
	},
	placeholderArtwork: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f5f7fa',
		borderRadius: 14,
	},
	playingIndicator: {
		position: 'absolute',
		bottom: 8,
		right: 8,
		backgroundColor: color.primary,
		borderRadius: 12,
		padding: 6,
		shadowColor: color.primary,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
		elevation: 4,
	},
	loadingIndicator: {
		position: 'absolute',
		bottom: 8,
		right: 8,
		backgroundColor: '#6c757d',
		borderRadius: 12,
		padding: 6,
		shadowColor: '#6c757d',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4,
		elevation: 4,
	},
	rightSection: {
		flex: 1,
		justifyContent: 'space-between',
		paddingVertical: 4,
	},
	trackInfo: {
		flex: 2,
		justifyContent: 'center',
		paddingRight: 8,
	},
	title: {
		color: '#1a1a1a',
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 2,
		lineHeight: 20,
	},
	artist: {
		color: '#666666',
		fontSize: 13,
		fontWeight: '500',
		lineHeight: 16,
	},
	currentTrackItem: {
		borderColor: color.primary,
		borderWidth: 2,
		backgroundColor: '#f8fbff',
	},
	currentTrackTitle: {
		color: color.primary,
		fontWeight: '800',
	},
	currentTrackArtist: {
		color: color.primary,
		opacity: 0.9,
		fontWeight: '600',
	},
	controlsSection: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 8,
		paddingTop: 0,
		gap: 8,
		minWidth: 48,
		maxWidth: 120
	},
	seekButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 32,
		height: 32,
		backgroundColor: '#f8f9fa',
		borderRadius: 24,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.08,
		shadowRadius: 2,
		elevation: 2,
	},
	disabledButton: {
		backgroundColor: '#f0f0f0',
		shadowOpacity: 0.05,
	},
	mainPlayButton: {
		width: 32,
		height: 32,
		backgroundColor: color.primary,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: color.primary,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 5,
	},
	pauseButton: {
		backgroundColor: '#e74c3c',
		shadowColor: '#e74c3c',
	},
	loadingButton: {
		backgroundColor: '#6c757d',
		shadowColor: '#6c757d',
	},
	buttonIconContainer: {
		width: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconWrapper: {
		width: 22,
		height: 22,
		justifyContent: 'center',
		alignItems: 'center',
	},
	indicatorIconContainer: {
		width: 12,
		height: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
export default AudioFooter;