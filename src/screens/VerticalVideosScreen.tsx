import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import ScreenHeader from "../components/ScreenHeader";
import BreakingBanner from "../components/BreakingBanner";
import TalkshowBanner from "../components/TalkshowBanner";
import { fetchBrightcoveVideos, fetchPriorityData } from '../services/newsApi';
import { TalkshowEntry, BrightcoveVideo } from '../type';
import AudioFooter from "../components/AudioFooter";
import { useHPMAudio } from "../contexts/HPMAudioContext";
import { useFocusEffect } from "@react-navigation/native";

const NUM_COLUMNS = 2;
const ITEM_MARGIN = 8; // spacing between cards

const VerticalVideosScreen = () => {
	const [videos, setVideos] = useState<BrightcoveVideo[]>([]);
	const [offset, setOffset] = useState(0);
	const [loading, setLoading] = useState(false);
	const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);
	const [breakingData, setBreakingData] = useState<any>(null);
	const [refreshing, setRefreshing] = useState(false);
	const { pause } = useHPMAudio();
	const loadVideos = async () => {
		if (loading) return;
		setLoading(true);
		const data = await fetchPriorityData();
		setTalkshowData(Array.isArray(data?.talkshow) ? data.talkshow : []);
		setBreakingData(data?.breaking || null);
		const newVideos = await fetchBrightcoveVideos({ playlist: false, limit: 0, offset: offset, screen: true });
		const validVideos = newVideos.filter(v => v.id);
		setVideos(prev => [...prev, ...validVideos]);
		setOffset(prev => prev + newVideos.length);
		setLoading(false);
	};

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadVideos();
		setRefreshing(false);
	}, [loadVideos]);


	useEffect(() => {
		loadVideos();
	}, [loadVideos]);

	const renderItem = ({ item }: { item: BrightcoveVideo }) => {
		return (
			<View style={styles.card}>
				<WebView
					source={{ uri: item.playerUrl }}
					style={styles.webview}
					allowsFullscreenVideo
					javaScriptEnabled
					injectedJavaScript={`document.body.style.backgroundColor = 'transparent'; true;`}
					scrollEnabled={false}
					backgroundColor="transparent"
				/>
			</View>
		);
	};

	return (
		<>
			<BreakingBanner data={breakingData} />
			<TalkshowBanner data={talkshowData} />
			<ScreenHeader title="HPM Shorts" description="" />

			<View style={styles.container}>
				{loading && videos.length === 0 ? (
					<ActivityIndicator size="large" style={{ marginTop: 50 }} />
				) : (
					<FlatList
						data={videos}
						keyExtractor={(item, index) => `${item.id}-${index}`}
						renderItem={renderItem}
						numColumns={NUM_COLUMNS}
						onEndReached={loadVideos}
						onEndReachedThreshold={0.5}
						columnWrapperStyle={{ justifyContent: "space-between" }}
						contentContainerStyle={{ padding: ITEM_MARGIN }}
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				)}
			</View>
			<AudioFooter />
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	card: {
		flex: 1,
		aspectRatio: 9 / 16,
		marginBottom: ITEM_MARGIN,
		marginHorizontal: ITEM_MARGIN / 2,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: "#ffffff",
	},
	webview: {
		flex: 1,
		backgroundColor: "transparent",
	},
	overlay: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "rgba(0,0,0,0.4)", padding: 8 },
	title: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
export default VerticalVideosScreen;