import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	ListRenderItemInfo,
	Modal,
	Platform,
	Pressable,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "@react-navigation/native";
import Video, {
	ResizeMode,
	VideoRef,
} from "react-native-video";
import ScreenHeader from "../components/ScreenHeader";
import BreakingBanner from "../components/BreakingBanner";
import TalkshowBanner from "../components/TalkshowBanner";
import { fetchBrightcoveVideos, fetchPriorityData } from '../services/newsApi';
import { TalkshowEntry, BrightcoveVideo } from '../type';
import AudioFooter from "../components/AudioFooter";
import { useHPMAudio } from "../contexts/HPMAudioContext";

const NUM_COLUMNS = 2;
const ITEM_MARGIN = 8;
const PAGE_SIZE = 10;
const MAX_VIDEOS = 50;

type LoadVideosOptions = {
	reset?: boolean;
};

type ShortsVideoCardProps = {
	item: BrightcoveVideo;
	onPress: (video: BrightcoveVideo) => void;
};

type ShortsPlayerProps = {
	onClose: () => void;
	onPlaybackStart: () => void;
	video: BrightcoveVideo;
};

const toVideoId = (video: BrightcoveVideo): string => String(video.id);

const normalizeVideo = (video: BrightcoveVideo): BrightcoveVideo => ({
	...video,
	id: toVideoId(video),
});

const ShortsVideoCard = memo(({ item, onPress }: ShortsVideoCardProps) => {
	const imageUrl = item.poster || item.thumbnail;

	return (
		<TouchableOpacity
			activeOpacity={0.85}
			onPress={() => onPress(item)}
			style={styles.card}
		>
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					style={styles.thumbnail}
					resizeMode="cover"
				/>
			) : (
				<View style={styles.thumbnailFallback}>
					<MaterialIcons name="play-circle-outline" size={44} color="#fff" />
				</View>
			)}

			<View pointerEvents="none" style={styles.overlay}>
				<Text style={styles.title} numberOfLines={1}>
					{item.name}
				</Text>
				{item.description ? (
					<Text style={styles.description} numberOfLines={1}>
						{item.description}
					</Text>
				) : null}
			</View>

			<View pointerEvents="none" style={styles.playIconWrapper}>
				<MaterialIcons name="play-arrow" size={58} color="#fff" />
			</View>
		</TouchableOpacity>
	);
});
ShortsVideoCard.displayName = 'ShortsVideoCard';

const ShortsPlayer = ({ video, onClose, onPlaybackStart }: ShortsPlayerProps) => {
	const videoRef = useRef<VideoRef>(null);
	const closeHandledRef = useRef(false);
	const [buffering, setBuffering] = useState(false);
	const [failed, setFailed] = useState(false);
	const [controlsVisible, setControlsVisible] = useState(true);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [muted, setMuted] = useState(false);
	const [paused, setPaused] = useState(false);
	const [slidingValue, setSlidingValue] = useState(0);
	const [seeking, setSeeking] = useState(false);
	const [ended, setEnded] = useState(false);

	const source = useMemo(() => ({
		uri: video.source,
		type: video.type === 'hls' ? 'm3u8' : video.type,
	}), [video.source, video.type]);

	const poster = useMemo(() => (
		video.poster
			? { source: { uri: video.poster }, resizeMode: ResizeMode.COVER }
			: undefined
	), [video.poster]);

	const closePlayer = useCallback(() => {
		if (closeHandledRef.current) return;

		closeHandledRef.current = true;
		videoRef.current?.pause?.();
		onClose();
	}, [onClose]);

	const toggleControls = useCallback(() => {
		setControlsVisible(current => {
			if (!current) return true;
			return paused ? true : false;
		});
	}, [paused]);

	const togglePlayback = useCallback(() => {
		if (ended || (duration > 0 && currentTime >= duration - 0.5)) {
			videoRef.current?.seek(0);
			setCurrentTime(0);
			setSlidingValue(0);
			setEnded(false);
		}

		setPaused(current => !current);
		setControlsVisible(true);
	}, [currentTime, duration, ended]);

	const toggleMute = useCallback(() => {
		setMuted(current => !current);
		setControlsVisible(true);
	}, []);

	const seekBy = useCallback((seconds: number) => {
		const nextTime = Math.max(0, Math.min(duration, currentTime + seconds));
		videoRef.current?.seek(nextTime);
		setCurrentTime(nextTime);
		setSlidingValue(nextTime);
		setEnded(false);
		setControlsVisible(true);
	}, [currentTime, duration]);

	const onSlidingStart = useCallback(() => {
		setSeeking(true);
		setControlsVisible(true);
	}, []);

	const onSlidingComplete = useCallback((value: number) => {
		videoRef.current?.seek(value);
		setCurrentTime(value);
		setSlidingValue(value);
		setSeeking(false);
		setEnded(false);
		setControlsVisible(true);
	}, []);

	const formatTime = useCallback((seconds: number) => {
		if (!Number.isFinite(seconds)) return '0:00';

		const roundedSeconds = Math.max(0, Math.floor(seconds));
		const minutes = Math.floor(roundedSeconds / 60);
		const remainingSeconds = roundedSeconds % 60;

		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}, []);

	useEffect(() => {
		onPlaybackStart();
	}, [onPlaybackStart]);

	useEffect(() => {
		if (!controlsVisible || paused || buffering || failed) return;

		const timer = setTimeout(() => {
			setControlsVisible(false);
		}, 3000);

		return () => clearTimeout(timer);
	}, [buffering, controlsVisible, failed, paused]);

	return (
		<Modal
			animationType="fade"
			onRequestClose={closePlayer}
			presentationStyle="fullScreen"
			statusBarTranslucent
			supportedOrientations={['portrait', 'landscape']}
			visible
		>
			<StatusBar hidden />
			<View style={styles.playerContainer}>
				<Video
					ref={videoRef}
					source={source}
					style={styles.fullscreenVideo}
					controls={false}
					ignoreSilentSwitch="ignore"
					mixWithOthers="duck"
					muted={muted}
					paused={paused}
					playInBackground={false}
					playWhenInactive={false}
					poster={poster}
					preventsDisplaySleepDuringVideoPlayback
					resizeMode={ResizeMode.COVER}
					bufferConfig={{
						minBufferMs: 3000,
						maxBufferMs: 12000,
						bufferForPlaybackMs: 750,
						bufferForPlaybackAfterRebufferMs: 1500,
					}}
					onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
					onEnd={() => {
						setPaused(true);
						setEnded(true);
						setControlsVisible(true);
					}}
					onError={() => {
						setFailed(true);
						setBuffering(false);
						setControlsVisible(true);
					}}
					onLoad={({ duration: videoDuration }) => {
						setDuration(videoDuration || 0);
						setSlidingValue(0);
						setEnded(false);
					}}
					onLoadStart={() => {
						setBuffering(true);
						setControlsVisible(true);
					}}
					onProgress={({ currentTime: nextTime }) => {
						if (seeking) return;
						setCurrentTime(nextTime);
						setSlidingValue(nextTime);
						setEnded(false);
					}}
					onReadyForDisplay={() => setBuffering(false)}
				/>

				<Pressable
					accessibilityLabel="Toggle video controls"
					onPress={toggleControls}
					style={styles.playerTapLayer}
				/>

				{controlsVisible ? (
					<View pointerEvents="box-none" style={styles.controlsLayer}>
						<TouchableOpacity
							accessibilityLabel="Close video"
							hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
							onPress={closePlayer}
							style={styles.closeButton}
						>
							<MaterialIcons name="close" size={28} color="#fff" />
						</TouchableOpacity>

						<View style={styles.centerControls}>
							<TouchableOpacity
								accessibilityLabel="Seek backward 10 seconds"
								hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
								onPress={() => seekBy(-10)}
								style={styles.roundControl}
							>
								<MaterialIcons name="replay-10" size={34} color="#fff" />
							</TouchableOpacity>

							<TouchableOpacity
								accessibilityLabel={paused ? "Play video" : "Pause video"}
								hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
								onPress={togglePlayback}
								style={styles.primaryControl}
							>
								<MaterialIcons name={paused ? "play-arrow" : "pause"} size={44} color="#fff" />
							</TouchableOpacity>

							<TouchableOpacity
								accessibilityLabel="Seek forward 10 seconds"
								hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
								onPress={() => seekBy(10)}
								style={styles.roundControl}
							>
								<MaterialIcons name="forward-10" size={34} color="#fff" />
							</TouchableOpacity>
						</View>

						<View style={styles.bottomControls}>
							<View style={styles.bottomControlRow}>
								<TouchableOpacity
									accessibilityLabel={muted ? "Unmute video" : "Mute video"}
									hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
									onPress={toggleMute}
									style={styles.iconButton}
								>
									<MaterialIcons name={muted ? "volume-off" : "volume-up"} size={26} color="#fff" />
								</TouchableOpacity>

								<Text style={styles.timeText}>{formatTime(slidingValue)}</Text>

								<View style={styles.sliderWrapper}>
									<Slider
										minimumValue={0}
										maximumValue={duration || 0}
										value={slidingValue}
										minimumTrackTintColor="#fff"
										maximumTrackTintColor="rgba(255,255,255,0.35)"
										thumbTintColor="#fff"
										onSlidingStart={onSlidingStart}
										onSlidingComplete={onSlidingComplete}
										onValueChange={setSlidingValue}
									/>
								</View>

								<Text style={styles.timeText}>{formatTime(duration)}</Text>
							</View>
						</View>
					</View>
				) : null}

				{buffering && !failed ? (
					<View pointerEvents="none" style={styles.playerStateOverlay}>
						<ActivityIndicator color="#fff" />
					</View>
				) : null}

				{failed ? (
					<TouchableOpacity
						activeOpacity={0.9}
						onPress={closePlayer}
						style={styles.playerStateOverlay}
					>
						<Text style={styles.playerErrorText}>Unable to play this video.</Text>
						<Text style={styles.playerErrorSubtext}>Tap to close</Text>
					</TouchableOpacity>
				) : null}
			</View>
		</Modal>
	);
};

const VerticalVideosScreen = () => {
	const [videos, setVideos] = useState<BrightcoveVideo[]>([]);
	const videosRef = useRef<BrightcoveVideo[]>([]);
	const seenVideoIdsRef = useRef<Set<string>>(new Set());
	const requestedOffsetsRef = useRef<Set<number>>(new Set());
	const offsetRef = useRef(0);
	const isFetchingRef = useRef(false);
	const hasMoreRef = useRef(true);
	const reachedMaxRef = useRef(false);
	const [initialLoading, setInitialLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);
	const [breakingData, setBreakingData] = useState<any>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedVideo, setSelectedVideo] = useState<BrightcoveVideo | null>(null);
	const { pause } = useHPMAudio();

	const setVideoList = useCallback((nextVideos: BrightcoveVideo[]) => {
		const limitedVideos = nextVideos.slice(0, MAX_VIDEOS);
		videosRef.current = limitedVideos;
		reachedMaxRef.current = limitedVideos.length >= MAX_VIDEOS;
		setVideos(limitedVideos);
	}, []);

	const loadPriorityData = useCallback(async () => {
		const data = await fetchPriorityData();
		setTalkshowData(Array.isArray(data?.talkshow) ? data.talkshow : []);
		setBreakingData(data?.breaking || null);
	}, []);

	const loadVideos = useCallback(async ({ reset = false }: LoadVideosOptions = {}) => {
		const currentCount = reset ? 0 : videosRef.current.length;

		if (isFetchingRef.current) return;
		if (reachedMaxRef.current) return;
		if (!reset && (!hasMoreRef.current || currentCount >= MAX_VIDEOS)) return;

		const fetchOffset = reset ? 0 : offsetRef.current;
		if (!reset && requestedOffsetsRef.current.has(fetchOffset)) return;

		const remaining = MAX_VIDEOS - currentCount;
		if (remaining <= 0) {
			reachedMaxRef.current = true;
			hasMoreRef.current = false;
			return;
		}

		isFetchingRef.current = true;
		requestedOffsetsRef.current.add(fetchOffset);
		setError(null);

		if (reset && videosRef.current.length === 0) {
			setInitialLoading(true);
		} else if (!reset) {
			setLoadingMore(true);
		}

		try {
			const limit = Math.min(PAGE_SIZE, remaining);
			const newVideos = await fetchBrightcoveVideos({
				playlist: false,
				limit,
				offset: fetchOffset,
				screen: true,
				throwOnError: true,
			});

			const nextSeenVideoIds = reset ? new Set<string>() : seenVideoIdsRef.current;
			const uniqueVideos: BrightcoveVideo[] = [];

			for (const video of newVideos) {
				if (!video?.id || !video?.source) continue;

				const id = toVideoId(video);
				if (nextSeenVideoIds.has(id)) continue;

				nextSeenVideoIds.add(id);
				uniqueVideos.push(normalizeVideo(video));
			}

			offsetRef.current = fetchOffset + newVideos.length;
			seenVideoIdsRef.current = nextSeenVideoIds;

			if (reset) {
				requestedOffsetsRef.current = new Set([0]);
			}

			const nextVideos = reset
				? uniqueVideos
				: [...videosRef.current, ...uniqueVideos];

			setVideoList(nextVideos);

			const reachedApiEnd = newVideos.length < limit || newVideos.length === 0;
			hasMoreRef.current = !reachedMaxRef.current && !reachedApiEnd;
		} catch {
			requestedOffsetsRef.current.delete(fetchOffset);
			setError('Unable to load Shorts. Please try again.');
		} finally {
			isFetchingRef.current = false;
			setInitialLoading(false);
			setLoadingMore(false);
		}
	}, [setVideoList]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		setSelectedVideo(null);
		await loadPriorityData();
		if (!reachedMaxRef.current) {
			await loadVideos({ reset: true });
		}
		setRefreshing(false);
	}, [loadPriorityData, loadVideos]);

	useEffect(() => {
		loadPriorityData();
		loadVideos({ reset: true });
	}, [loadPriorityData, loadVideos]);

	useFocusEffect(
		useCallback(() => {
			return () => {
				setSelectedVideo(null);
			};
		}, [])
	);

	const onPlaybackStart = useCallback(() => {
		pause();
	}, [pause]);

	const onOpenVideo = useCallback((video: BrightcoveVideo) => {
		setSelectedVideo(video);
	}, []);

	const onCloseVideo = useCallback(() => {
		setSelectedVideo(null);
	}, []);

	const renderItem = useCallback(({ item }: ListRenderItemInfo<BrightcoveVideo>) => (
		<ShortsVideoCard
			item={item}
			onPress={onOpenVideo}
		/>
	), [onOpenVideo]);

	const onEndReached = useCallback(() => {
		loadVideos();
	}, [loadVideos]);

	const onRetry = useCallback(() => {
		loadVideos({ reset: videosRef.current.length === 0 });
	}, [loadVideos]);

	const footer = useMemo(() => {
		if (loadingMore) {
			return (
				<View style={styles.footerState}>
					<ActivityIndicator />
				</View>
			);
		}

		if (error && videos.length > 0) {
			return (
				<TouchableOpacity onPress={onRetry} style={styles.footerState}>
					<Text style={styles.retryText}>{error}</Text>
					<Text style={styles.retryActionText}>Tap to retry</Text>
				</TouchableOpacity>
			);
		}

		return null;
	}, [error, loadingMore, onRetry, videos.length]);

	const emptyState = useMemo(() => {
		if (initialLoading) {
			return (
				<View style={styles.centerState}>
					<ActivityIndicator size="large" />
				</View>
			);
		}

		if (error) {
			return (
				<View style={styles.centerState}>
					<Text style={styles.emptyText}>{error}</Text>
					<TouchableOpacity onPress={onRetry} style={styles.retryButton}>
						<Text style={styles.retryButtonText}>Try again</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<View style={styles.centerState}>
				<Text style={styles.emptyText}>No Shorts available right now.</Text>
			</View>
		);
	}, [error, initialLoading, onRetry]);

	return (
		<>
			<BreakingBanner data={breakingData} />
			<TalkshowBanner data={talkshowData} />
			<ScreenHeader title="HPM Shorts" description="" />

			<View style={styles.container}>
				<FlatList
					data={videos}
					keyExtractor={(item) => toVideoId(item)}
					renderItem={renderItem}
					numColumns={NUM_COLUMNS}
					onEndReached={onEndReached}
					onEndReachedThreshold={0.6}
					columnWrapperStyle={styles.columnWrapper}
					contentContainerStyle={[
						styles.contentContainer,
						videos.length === 0 && styles.emptyContentContainer,
					]}
					initialNumToRender={8}
					ListEmptyComponent={emptyState}
					ListFooterComponent={footer}
					maxToRenderPerBatch={8}
					refreshing={refreshing}
					removeClippedSubviews={Platform.OS === 'android'}
					scrollEventThrottle={16}
					showsVerticalScrollIndicator={false}
					updateCellsBatchingPeriod={80}
					windowSize={7}
					onRefresh={onRefresh}
				/>
			</View>

			{selectedVideo ? (
				<ShortsPlayer
					video={selectedVideo}
					onClose={onCloseVideo}
					onPlaybackStart={onPlaybackStart}
				/>
			) : null}

			<AudioFooter />
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	contentContainer: {
		padding: ITEM_MARGIN,
	},
	emptyContentContainer: {
		flexGrow: 1,
	},
	columnWrapper: {
		justifyContent: "space-between",
	},
	card: {
		flex: 1,
		aspectRatio: 9 / 16,
		marginBottom: ITEM_MARGIN,
		marginHorizontal: ITEM_MARGIN / 2,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: "#000",
	},
	thumbnail: {
		height: "100%",
		width: "100%",
	},
	thumbnailFallback: {
		alignItems: "center",
		backgroundColor: "#111",
		flex: 1,
		justifyContent: "center",
	},
	overlay: {
		backgroundColor: "rgba(0,0,0,0.36)",
		left: 0,
		padding: 8,
		position: "absolute",
		right: 0,
		top: 0,
	},
	title: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "bold",
	},
	description: {
		color: "#fff",
		fontSize: 13,
		marginTop: 8,
	},
	playIconWrapper: {
		alignItems: "center",
		bottom: 0,
		justifyContent: "center",
		left: 0,
		position: "absolute",
		right: 0,
		top: 0,
	},
	footerState: {
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
	},
	retryText: {
		color: "#1a1a1a",
		fontSize: 14,
		fontWeight: "700",
		textAlign: "center",
	},
	retryActionText: {
		color: "#666",
		fontSize: 13,
		marginTop: 6,
		textAlign: "center",
	},
	centerState: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
		padding: 24,
	},
	emptyText: {
		color: "#1a1a1a",
		fontSize: 16,
		fontWeight: "700",
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: "#C8102E",
		borderRadius: 6,
		marginTop: 16,
		paddingHorizontal: 18,
		paddingVertical: 10,
	},
	retryButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "700",
	},
	playerContainer: {
		backgroundColor: "#000",
		flex: 1,
	},
	fullscreenVideo: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "#000",
	},
	playerTapLayer: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1,
	},
	controlsLayer: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.14)",
		zIndex: 2,
	},
	closeButton: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.48)",
		borderRadius: 20,
		height: 40,
		justifyContent: "center",
		left: 16,
		position: "absolute",
		top: Platform.OS === 'ios' ? 54 : 24,
		width: 40,
		zIndex: 2,
	},
	centerControls: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		left: 56,
		position: "absolute",
		right: 56,
		top: "45%",
	},
	roundControl: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.32)",
		borderRadius: 27,
		height: 54,
		justifyContent: "center",
		width: 54,
	},
	primaryControl: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.4)",
		borderRadius: 36,
		height: 72,
		justifyContent: "center",
		width: 72,
	},
	bottomControls: {
		bottom: Platform.OS === 'ios' ? 36 : 24,
		left: 16,
		position: "absolute",
		right: 16,
	},
	bottomControlRow: {
		alignItems: "center",
		flexDirection: "row",
		minHeight: 48,
	},
	iconButton: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.32)",
		borderRadius: 20,
		height: 40,
		justifyContent: "center",
		marginRight: 8,
		width: 40,
	},
	timeText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "700",
		textAlign: "center",
		width: 44,
	},
	sliderWrapper: {
		flex: 1,
		justifyContent: "center",
		marginHorizontal: 8,
	},
	playerStateOverlay: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		padding: 24,
		zIndex: 3,
	},
	playerErrorText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
		textAlign: "center",
	},
	playerErrorSubtext: {
		color: "#fff",
		fontSize: 13,
		marginTop: 8,
		opacity: 0.82,
		textAlign: "center",
	},
});
export default VerticalVideosScreen;
