// src/components/ListenLivePlayer.tsx

import React, {useEffect, useState, useRef} from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color } from '../utils/colorUtils';
import { useUniversalAudio } from '../contexts/UniversalAudioContext';
import { AudioTrack } from '../services/UniversalAudioService';

interface StreamPlayerProps {
	track: AudioTrack;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ track }) => {
	const [canSeek, setCanSeek] = useState(false);
	const rotateAnim = useRef(new Animated.Value(0)).current;
	
	// Use universal audio context
	const {
		currentTrack,
		isPlaying,
		isLoading,
		canSeek: audioCanSeek,
		togglePlayPause,
	} = useUniversalAudio();

	const currentTrackId = currentTrack?.id || null;
	const tracksReady = true;

	// Update seek capability
	useEffect(() => {
		setCanSeek(audioCanSeek && !currentTrack?.isLiveStream);
	}, [audioCanSeek, currentTrack]);

	// Optimized rotation animation for loading spinner
	useEffect(() => {
		if (isLoading) {
			rotateAnim.setValue(0);
			const animation = Animated.loop(
				Animated.timing(rotateAnim, {
					toValue: 1,
					duration: 1200, // Slightly slower for better UX
					useNativeDriver: true,
				})
			);
			animation.start();
			
			return () => animation.stop();
		} else {
			rotateAnim.setValue(0);
		}
	}, [isLoading, rotateAnim]);

	const onPlayPausePress = async (trackId: string) => {
		try {
			// Don't allow new actions while tracks are still loading
			if (!tracksReady) {
				Alert.alert('Please Wait', 'Audio streams are still loading. Please wait a moment and try again.');
				return;
			}

			// Don't allow new actions while already loading
			if (isLoading && currentTrackId && currentTrackId !== trackId) {
				return;
			}
			await togglePlayPause(trackId);
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

	// Handle seek forward
	// const handleSeekForward = async () => {
	// 	 if (currentTrackId && canSeek) {
	// 		 try {
	// 			 await seekForward(10);
	// 		 } catch (error) {
	// 			 console.error('Error seeking forward:', error);
	// 		 }
	// 	 }
	// };

	// Handle seek backward
	// const handleSeekBackward = async () => {
	// 	 if (currentTrackId && canSeek) {
	// 		 try {
	// 			 await seekBackward(10);
	// 		 } catch (error) {
	// 			 console.error('Error seeking backward:', error);
	// 		 }
	// 	 }
	// };

	const renderItem = (item: AudioTrack) => {
		const isCurrent = currentTrackId === item.id;
		const isCurrentlyPlaying = isCurrent && isPlaying && !isLoading && tracksReady;
		// Only show loading if this is the current track AND (it's actually loading OR tracks are being loaded)
		const isCurrentlyLoading = isCurrent && (isLoading || (!tracksReady && currentTrackId !== null));
		const isDisabled = !tracksReady;

		return (
			<View style={[
				styles.trackItem,
				isCurrent && styles.currentTrackItem,
				isDisabled && styles.disabledTrackItem
			]}>
				<View style={styles.cardLayout}>
					{/* Left section: Artwork */}
					<View style={styles.artworkContainer}>
						{item.artwork ? (
							<Image source={{uri: item.artwork}} style={styles.artwork} />
						) : (
							<View style={styles.placeholderArtwork}>
								<MaterialIcons name="music-note" size={32} color="#666" />
							</View>
						)}
						{isCurrentlyPlaying && (
							<View style={styles.playingIndicator}>
								<MaterialIcons name="volume-up" size={12} color="#fff" />
							</View>
						)}
						{isCurrentlyLoading && (
							<View style={styles.loadingIndicator}>
								<View style={styles.indicatorIconContainer}>
									<Animated.View
										style={{
											transform: [{
												rotate: rotateAnim.interpolate({
													inputRange: [0, 1],
													outputRange: ['0deg', '360deg'],
												}),
											}],
										}}
									>
										<MaterialIcons name="sync" size={12} color="#fff" />
									</Animated.View>
								</View>
							</View>
						)}
					</View>
					
					{/* Right section: Content area */}
					<View style={styles.rightSection}>
						{/* Top of right: Track Info */}
						<View style={styles.trackInfo}>
							<Text style={[
								styles.title,
								isCurrent && styles.currentTrackTitle
							]} numberOfLines={1}>
								{item.album}
							</Text>
							<Text style={[
								styles.artist,
								isCurrent && styles.currentTrackArtist
							]} numberOfLines={2}>
								{item.artist} - {item.title}
							</Text>

						</View>
					</View>	
						{/* Bottom of right: Controls */}
					<View style={styles.controlsSection}>
						{/* <TouchableOpacity
							style={[
								styles.seekButton,
								(!isCurrent || isCurrentlyLoading) && styles.disabledButton
							]}
							onPress={handleSeekBackward}
							disabled={!isCurrent || isCurrentlyLoading}
						>
							<MaterialIcons 
								name="replay-10" 
								size={18} 
								color={isCurrent && !isCurrentlyLoading ? (canSeek ? color.primary : '#888') : '#bbb'} 
							/>
						</TouchableOpacity> */}
						
						<TouchableOpacity
							style={[
								styles.mainPlayButton,
								isCurrentlyPlaying && styles.pauseButton,
								isCurrentlyLoading && styles.loadingButton,
								isDisabled && styles.disabledButton
							]}
							onPress={() => onPlayPausePress(item.id)}
							activeOpacity={isCurrentlyLoading || isDisabled ? 1 : 0.8}
							disabled={isCurrentlyLoading || isDisabled}
						>
							<View style={styles.buttonIconContainer}>
								{isCurrentlyLoading ? (
									<Animated.View
										style={[
											styles.iconWrapper,
											{
												transform: [{
													rotate: rotateAnim.interpolate({
														inputRange: [0, 1],
														outputRange: ['0deg', '360deg'],
													}),
												}],
											}
										]}
									>
										<MaterialIcons 
											name="sync" 
											size={22} 
											color="#fff" 
										/>
									</Animated.View>
								) : (
									<View style={styles.iconWrapper}>
										<MaterialIcons 
											name={isCurrentlyPlaying ? 'pause' : 'play-arrow'} 
											size={22} 
											color="#fff" 
										/>
									</View>
								)}
							</View>
						</TouchableOpacity>
						
						{/* <TouchableOpacity
							style={[
								styles.seekButton,
								(!isCurrent || isCurrentlyLoading) && styles.disabledButton
							]}
							onPress={handleSeekForward}
							disabled={!isCurrent || isCurrentlyLoading}
						>
							<MaterialIcons 
								name="forward-10" 
								size={18} 
								color={isCurrent && !isCurrentlyLoading ? (canSeek ? color.primary : '#888') : '#bbb'} 
							/>
						</TouchableOpacity> */}
					</View>
				</View>
			</View>
		);
	};

	return renderItem(track);
};

const styles = StyleSheet.create({
	trackItem: {
		margin: 8,
		backgroundColor: '#fff',
		borderRadius: 14,
		padding: 12,
		borderWidth: 2,
		borderColor: 'transparent',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 4,
	},
	disabledTrackItem: {
		opacity: 0.6,
		backgroundColor: '#f5f5f5',
	},
	cardLayout: {
		flexDirection: 'row',
		alignItems: 'stretch',
		flexWrap: 'nowrap'
	},
	artworkContainer: {
		position: 'relative',
		width: 75,
		height: 75,
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
		marginBottom: 6,
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
		paddingTop: 8,
		width: 48
	},
	seekButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 36,
		height: 36,
		backgroundColor: '#f8f9fa',
		borderRadius: 18,
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
		width: 48,
		height: 48,
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

export default StreamPlayer;