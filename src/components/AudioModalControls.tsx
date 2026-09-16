import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, Animated, Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useHPMAudio} from '../contexts/HPMAudioContext';
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import {color} from '../utils/colorUtils';
import {State, useProgress} from 'react-native-track-player';
import {AudioType, AudioTrack} from "../services/HPMAudioService";
import RBSheet from 'react-native-raw-bottom-sheet';
import SleepTimerControls from "./SleepTimerControls";
const {height: SCREEN_HEIGHT} = Dimensions.get("window");

const AudioModalControls = () => {
	// Use universal audio context
	const {
		currentTrack,
		state,
		togglePlayPause,
		seekForward,
		seekBackward,
		seekTo,
		stop
	} = useHPMAudio();
	const rotateAnim = useRef(new Animated.Value(0)).current;
	const progress = useProgress();
	// @ts-ignore
	const refRBSheet = useRef();
	const [slidingValue, setSlidingValue] = useState(0);
	const [sliderWidth, setSliderWidth] = useState(0);
	const [seeking, setSeeking] = useState(false);

	const seekingRef = useRef(false);
	const slidingValueRef = useRef(0);
	const sliderXRef = useRef(0);
	const sliderWidthRef = useRef(0);
	const sliderRef = useRef<View>(null);

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
	if (state !== State.Playing && state !== State.Paused && state !== State.Buffering && state !== State.Loading && state !== State.Ready) {
		return;
	}
	if (currentTrack === null) {
		return;
	}
	let nowPlay = currentTrack?.artist + " - " + currentTrack?.title;
	if (currentTrack.type === AudioType.PODCAST || currentTrack.artist.includes('Houston Public Media')) {
		nowPlay = currentTrack.title;
	}

	const formatTime = useCallback((seconds: number) => {
		if (!Number.isFinite(seconds)) return '0:00';

		const roundedSeconds = Math.max(0, Math.floor(seconds));
		const minutes = Math.floor(roundedSeconds / 60);
		const remainingSeconds = roundedSeconds % 60;

		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}, []);

	const seekFromPosition = useCallback(
		(pageX: number) => {
			if (progress.duration <= 0) {
				return;
			}

			const width = sliderWidthRef.current;

			if (width <= 0) {
				return;
			}

			const x = pageX - sliderXRef.current;
			const clampedX = Math.max(0, Math.min(x, width));

			const nextTime = (clampedX / width) * progress.duration;

			// IMPORTANT:
			// Keep the value in a ref so onProgress cannot overwrite
			// the value while the user is dragging.
			slidingValueRef.current = nextTime;

			setSlidingValue(nextTime);
		},
		[progress.duration]
	);

	const measureSlider = useCallback(() => {
		sliderRef.current?.measureInWindow((x, _y, width) => {
			sliderXRef.current = x;
			sliderWidthRef.current = width;
			setSliderWidth(width);
		});
	}, []);

	const finishSeek = useCallback(() => {
		if (progress.duration <= 0) {
			seekingRef.current = false;
			return;
		}

		const nextTime = Math.max(
			0,
			Math.min(slidingValueRef.current, progress.duration)
		);

		seekingRef.current = false;
		seekTo(nextTime);
		setSlidingValue(nextTime);
		setSeeking(false);
	}, [progress.duration, seekTo]);

	const sliderPanResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,

				onPanResponderGrant: event => {
					const nativeEvent = event.nativeEvent;
					if (!nativeEvent || progress.duration <= 0) {
						return;
					}

					// Capture pageX immediately because event pooling might nullify nativeEvent
					// by the time measureInWindow callback runs.
					const initialPageX = nativeEvent.pageX;
					setSeeking(true);
					seekingRef.current = true;
					// Measure immediately in case orientation/layout changed.
					sliderRef.current?.measureInWindow((x, _y, width) => {
						sliderXRef.current = x;
						sliderWidthRef.current = width;
						setSliderWidth(width);

						const relativeX = initialPageX - x;
						const clampedX = Math.max(
							0,
							Math.min(relativeX, width)
						);

						const nextTime = (clampedX / width) * progress.duration;

						slidingValueRef.current = nextTime;
						setSlidingValue(nextTime);
					});
				},

				onPanResponderMove: event => {
					const nativeEvent = event.nativeEvent;
					if (!nativeEvent || !seekingRef.current || progress.duration <= 0) {
						return;
					}

					seekFromPosition(nativeEvent.pageX);
				},

				onPanResponderRelease: () => {
					finishSeek();
				},

				onPanResponderTerminate: () => {
					finishSeek();
				},
			}),
		[progress.duration, seekFromPosition, finishSeek]
	);

	return (
		<>
			<View style={styles.modalButtonContainer}>
				<TouchableOpacity
					style={styles.modalButton}
					// @ts-ignore
					onPress={() => refRBSheet.current.open()}
					disabled={state === State.Loading || state === State.Buffering}
				>
					<MaterialIcons
						name="keyboard-double-arrow-up"
						size={24}
						color={color.primary}
					/>
				</TouchableOpacity>
			</View>
			<RBSheet
				// @ts-ignore
				ref={refRBSheet}
				useNativeDriver={false}
				customStyles={{
					wrapper: {
						backgroundColor: 'rgba(0,0,0,0.35)',
					},
					container: {
						maxWidth: 600,
						maxHeight: 450,
						alignSelf: "center",
						justifyContent: "flex-start",
						borderTopStartRadius: 12,
						borderTopEndRadius: 12
					},
					draggableIcon: {
						backgroundColor: '#000',
					},
				}}
				customModalProps={{
					animationType: 'slide',
					statusBarTranslucent: true,
				}}
				draggable={true}
				dragOnContent={false}
				customAvoidingViewProps={{
					enabled: false,
				}}
				height={SCREEN_HEIGHT / 2}
				closeOnPressBack={true}
			>
				<View style={styles.trackItem}>
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'flex-end',
						paddingHorizontal: 8,
						paddingVertical: 8,
						gap: 24,
						width: '100%',
						position: 'relative'
					}}>
						<TouchableOpacity
							style={{
								width: 32,
								height: 32,
								borderRadius: 16,
								justifyContent: 'center',
								alignItems: 'center',
								elevation: 5,
								position: 'absolute',
								top: -16
							}}
							// @ts-ignore
							onPress={() => refRBSheet.current.close()}
						>
							<View style={{
								width: 32,
								height: 32,
								alignItems: 'center',
								justifyContent: 'center'
							}}>
								<MaterialIcons
									name="close"
									size={32}
									color={'#808080'}
								/>
							</View>
						</TouchableOpacity>
					</View>
					<View style={styles.topRow}>
					{/* Top Row: Artwork and Now Playing */}
						<View style={styles.artworkContainer}>
							{currentTrack?.artwork ? (
								<Image source={{uri: currentTrack?.artwork}} style={styles.artwork} />
							) : (
								<View style={styles.placeholderArtwork}> <MaterialIcons name="music-note" size={50} color="#666" />
								</View>
							)}
						</View>
						<View style={styles.rightSection}>
							<View style={styles.trackInfo}>
								<Text style={[styles.title, styles.currentTrackTitle]} numberOfLines={1}>
									{currentTrack?.album}
								</Text>
								<Text style={[styles.artist, styles.currentTrackArtist]} numberOfLines={4}>
									{nowPlay}
								</Text>
							</View>
						</View>
					</View>
					{/* Audio Scrubber */}
					{!currentTrack.isLiveStream ? (
						<View style={styles.topRow}>
							<Text style={styles.timeText}>{formatTime(progress.position)}</Text>
							<View
								ref={sliderRef}
								style={styles.sliderWrapper}
								onLayout={measureSlider}
								{...sliderPanResponder.panHandlers}
							>
								<View style={styles.scrubberTrack}>
									<View style={[
										styles.scrubberProgress,
										{
											width: progress.duration > 0 ?
												`${Math.min(100, Math.max(0, (slidingValue / progress.duration) * 100))}%`
												: "0%",
										},
									]} />
									<View style={[
										styles.scrubberThumb,
										{
											left: progress.duration > 0 && sliderWidth > 0 ?
												Math.min(sliderWidth - 12, Math.max(0, (slidingValue / progress.duration) * sliderWidth - 6))
												: 0,
										}
									]}>
										{seeking ? (
										<View style={styles.scrubberThumbTooltip}>
											<Text style={styles.scrubberThumbTooltipText}>{formatTime(slidingValue)}</Text>
										</View>
										) : ''}
									</View>
								</View>
							</View>
							<Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
						</View>
					) : ''}

					{/* Audio Controls */}
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
								size={64}
								color={state !== State.Loading && state !== State.Buffering ? color.primary : '#888'}
							/>
						</TouchableOpacity>
					) : ''}
						<TouchableOpacity
							style={[
								styles.mainPlayButton,
								state === State.Playing && styles.pauseButton,
								(state === State.Loading || state === State.Buffering) && styles.disabledButton
							]}
							onPress={() => onPlayPausePress(currentTrack)}
						>
							<View style={styles.buttonIconContainer}>
								{(state === State.Loading || state === State.Buffering) ? (
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
										<FontAwesome6 name="rotate" size={64} color="#fff" iconStyle={"solid"} />
									</Animated.View>
								) : (
									<View style={styles.iconWrapper}>
										<MaterialIcons
											name={(state === State.Paused || state === State.Ready) ? 'play-arrow' : 'pause'}
											size={64}
											color="#fff"
										/>
									</View>
								)}
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.mainPlayButton}
							onPress={() => {
								// @ts-ignore
								refRBSheet.current.close();
								stop();
							}}
						>
							<View style={styles.iconWrapper}>
								<MaterialIcons
									name='stop'
									size={64}
									color="#fff"
								/>
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
									size={64}
									color={state !== State.Loading && state !== State.Buffering ? color.primary : '#888'}
								/>
							</TouchableOpacity>
						) : ''}
					</View>
					<SleepTimerControls />
				</View>
			</RBSheet>
		</>
	);
};
const styles = StyleSheet.create({
	contentContainer: {
		flex: 1
	},
	trackItem: {
		backgroundColor: '#fff',
		paddingHorizontal: 16,
		paddingTop: 10,
		elevation: 4,
		paddingBottom: 50
	},
	topRow: {
		flexDirection: 'row',
		paddingBottom: 8,
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	sliderWrapper: {
		flex: 1,
		height: 40,
		justifyContent: "center",
		marginHorizontal: 8,
	},
	scrubberTrack: {
		height: 4,
		width: "100%",
		backgroundColor: "rgba(0,0,0,0.35)",
		borderRadius: 2,
		position: "relative",
	},
	scrubberProgress: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		backgroundColor: color.primary,
		borderRadius: 2,
	},
	scrubberThumb: {
		position: "absolute",
		top: -6,
		width: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: color.primary
	},
	scrubberThumbTooltip: {
		position: 'absolute',
		top: -50,
		width: 60,
		left: -30,
		padding: 8,
		backgroundColor: '#000',
		alignItems: 'center',
		shadowColor: '#808080',
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowOpacity: 0.4,
		shadowRadius: 4
	},
	scrubberThumbTooltipText: {
		fontSize: 14,
		color: '#fff',
		fontWeight: "bold"
	},
	artworkContainer: {
		position: 'relative',
		width: 100,
		height: 100,
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
		flex: 2,
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
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 2,
		lineHeight: 24,
	},
	artist: {
		color: '#666666',
		fontSize: 16,
		fontWeight: '500',
		lineHeight: 20,
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
		paddingVertical: 8,
		gap: 24,
		width: '100%',
		height: 80
	},
	seekButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 64,
		height: 64,
		backgroundColor: '#f8f9fa',
		borderRadius: 32,
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
		width: 64,
		height: 64,
		backgroundColor: color.primary,
		borderRadius: 32,
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
		width: 64,
		height: 64,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconWrapper: {
		width: 64,
		height: 64,
		justifyContent: 'center',
		alignItems: 'center',
	},
	indicatorIconContainer: {
		width: 12,
		height: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	timeText: {
		color: "#000",
		fontSize: 12,
		fontWeight: "700",
		textAlign: "center",
		width: 44,
	},
	modalButtonContainer: {
		position: 'relative',
		width: 32,
		height: 32,
		borderRadius: 14,
		overflow: 'hidden',
		marginLeft: 12,
		backgroundColor: '#f5f7fa',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.08,
		shadowRadius: 2,
		elevation: 2,
	},
	modalButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	}
});
export default AudioModalControls;