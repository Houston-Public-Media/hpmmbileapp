import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, ScrollView, RefreshControl } from 'react-native';
import { WebView } from 'react-native-webview';
import ScreenHeader from '../components/ScreenHeader';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';
import AudioFooter from '../components/AudioFooter';
import { fetchPriorityData } from "../services/newsApi";
import { TalkshowEntry } from '../type';

const WatchLiveScreen = () => {
	const userAgent =
		Platform.OS === 'ios'
			// ? 'HPM iOS/iPad Test App (Safari/WebKit)'
			// : 'HPM Android Test App (Blink/Chrome)'
			? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
			: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';

	const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);
	const [breakingData, setBreakingData] = useState<any>(null);
	const [refreshing, setRefreshing] = useState(false);
	const loadBannerData = async () => {
		try {
			const data = await fetchPriorityData();
			setTalkshowData(Array.isArray(data?.talkshow) ? data.talkshow : []);
			setBreakingData(data?.breaking || null);
		} catch (e) {
			console.log('ListenLive load failed', e);
		}
	};

	useEffect(() => {
		loadBannerData();
	}, []);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadBannerData();
		setRefreshing(false);
	}, []);

	return (
		<>
			{/*<ScrollView contentContainerStyle={{ flexGrow: 1 }}*/}
			{/*	refreshControl={*/}
			{/*		<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />*/}
			{/*	}*/}
			{/*>*/}
				<BreakingBanner data={breakingData} />
				<TalkshowBanner data={talkshowData} />
				<ScreenHeader
					title="Watch Live"
					description="Watch Houston Public Media's live television programming and special events"
				/>

				<View style={styles.container}>
					<WebView
						style={styles.webview}
						originWhitelist={["*"]}
						source={{ uri: 'https://cdn.houstonpublicmedia.org/assets/watch-live.html' }}
						javaScriptEnabled={true}
						domStorageEnabled={true}
						allowsInlineMediaPlayback={true}
						mediaPlaybackRequiresUserAction={false}
						allowsFullscreenVideo={true}
						automaticallyAdjustContentInsets={false}
						mixedContentMode="always"
						sharedCookiesEnabled={true}
						thirdPartyCookiesEnabled={true}
						setSupportMultipleWindows={true}
						onShouldStartLoadWithRequest={() => true}
						allowsProtectedMedia={true}
						scalesPageToFit={false}
						userAgent={userAgent}
					/>
				</View>
			{/*</ScrollView>*/}
			<AudioFooter />
		</>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	webview: { flex: 1 },
});

export default WatchLiveScreen;