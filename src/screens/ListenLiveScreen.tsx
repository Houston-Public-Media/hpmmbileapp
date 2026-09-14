import React, {JSX, useCallback, useEffect, useState} from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, RefreshControl, Linking, ScrollView } from 'react-native';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import ListenLivePlayer from '../components/ListenLivePlayer';
import { useHPMAudio } from '../contexts/HPMAudioContext';
import { color } from '../utils/colorUtils';
import ScreenHeader from '../components/ScreenHeader';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';
import { fetchPriorityData } from '../services/newsApi';
import { TalkshowEntry } from '../type';
import AudioFooter from '../components/AudioFooter';
import WebView from 'react-native-webview';

function ListenLiveScreen(): JSX.Element {
	const { isPlayerReady, error, tracks, isLoading, loadLiveStreams } = useHPMAudio();
	const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);
	const [breakingData, setBreakingData] = useState<any>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState(0);

	const handleWebViewNavigation = useCallback((request: any) => {
		const url = request.url;
		if ( url.startsWith('about:') ||  url.startsWith('javascript:') || url.startsWith('data:') ) {
			return true;
		}
		if (request.navigationType !== 'click') {
			return true;
		}
		try {
			const parsedUrl = new URL(url);
			const isHpmSchedule =  parsedUrl.hostname === 'www.houstonpublicmedia.org' && parsedUrl.pathname === '/embeds/mobile-radio-schedules/';
			if (isHpmSchedule) {
				return true;
			}
			Linking.openURL(url).catch((err) => {
				console.log('Failed to open external URL:', err);
			});
			return false;
		}
		catch (error) {
			console.log('Unable to parse URL:', url);
			return true;
		}
	}, []);

	const RadioScheduleTabs = [
		{
			title: 'News 88.7',
			url: 'https://www.houstonpublicmedia.org/embeds/mobile-radio-schedules/?sched_station=news887',
			id: "live_0",
		},
		{
			title: 'Classical',
			url: 'https://www.houstonpublicmedia.org/embeds/mobile-radio-schedules/?sched_station=classical',
			id: "live_1",
		},
		{
			title: 'The Vibe',
			url: 'https://www.houstonpublicmedia.org/embeds/mobile-radio-schedules/?sched_station=thevibe',
			id: "live_2",
		}
	];

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

	if (isLoading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color={color.primary} />
				<Text style={styles.loadingText}>Loading audio streams...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.container}>
				<MaterialIcons name="error-outline" size={64} color="#e74c3c" />
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity
					style={styles.retryButton}
					onPress={loadLiveStreams}
				>
					<MaterialIcons name="refresh" size={20} color="#fff" />
					<Text style={styles.retryButtonText}>Try Again</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (!isPlayerReady || tracks.length === 0) {
		return (
			<View style={styles.container}>
				<MaterialIcons name="radio" size={64} color="#ccc" />
				<Text style={styles.errorText}>No audio streams available</Text>
				<TouchableOpacity
					style={styles.retryButton}
					onPress={loadLiveStreams}
				>
					<MaterialIcons name="refresh" size={20} color="#fff" />
					<Text style={styles.retryButtonText}>Reload</Text>
				</TouchableOpacity>
			</View>
		);
	}
	return (
		<View style={styles.container}>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
			>
				<BreakingBanner data={breakingData} />
				<TalkshowBanner data={talkshowData} />
				<ScreenHeader title="Listen Live" description="Stream Houston Public Media's live radio channels including News 88.7, Classical, and more" />
				<View style={styles.liveStreamContainer}>
					<Text style={styles.header}>Live Streams</Text>
					{tracks.map((track, index) => (
						<ListenLivePlayer
							key={track.id ?? index}
							track={track}
							onPlay={() => {
								setActiveTab(index);
							}}
						/>
					))}
				</View>

				<View style={styles.webViewSection}>
					<View style={styles.tabContainer}>
						{RadioScheduleTabs.map((tab, index) => (
							<TouchableOpacity
								key={tab.title}
								activeOpacity={0.8}
								style={[
									styles.tabButton,
									activeTab === index && styles.activeTabButton,
								]}
								onPress={() => setActiveTab(index)}
							>
								<Text
									style={[
										styles.tabText,
										activeTab === index && styles.activeTabText,
									]}
								>
									{tab.title}
								</Text>
							</TouchableOpacity>
						))}
					</View>
					<View style={styles.webViewContainer}>
						<WebView
							source={{
								uri: RadioScheduleTabs[activeTab].url,
							}}
							style={styles.webView}
							scrollEnabled={true}
							nestedScrollEnabled={true}
							javaScriptEnabled={true}
							originWhitelist={['*']}
							startInLoadingState={true}
							setSupportMultipleWindows={false}
							onShouldStartLoadWithRequest={handleWebViewNavigation}
						/>
					</View>
				</View>
			</ScrollView>
			<AudioFooter />
  		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 0,
	},
	listContainer: {
		flex: 1,
		paddingBottom: 20,
	},
	loadingText: {
		color: '#666',
		fontSize: 16,
		textAlign: 'center',
		marginTop: 16,
	},
	errorText: {
		color: '#333',
		fontSize: 16,
		textAlign: 'center',
		marginVertical: 20,
		paddingHorizontal: 20,
		lineHeight: 24,
	},
	retryButton: {
		backgroundColor: color.primary,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 25,
		marginTop: 10,
		shadowColor: color.primary,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 4,
	},
	retryButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
	header: {
		padding: 8,
		marginBottom: 5,
		color: '#222054',
		fontWeight: 'bold',
		fontSize: 16
	},
	liveStreamContainer: {
		backgroundColor: '#fff',
		padding: 10,
	},
	webViewSection: {
		marginTop: 20,
		backgroundColor: '#fff',
	},
	tabContainer: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#ddd',
		marginHorizontal: 10,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: 3,
		borderBottomColor: 'transparent',
	},
	activeTabButton: {
		borderBottomColor: '#C8102E',
	},
	tabText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#777',
	},
	activeTabText: {
		color: '#C8102E',
	},
	webViewContainer: {
		height: 500,
		marginHorizontal: 10,
		marginTop: 10,
		overflow: 'hidden',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	webView: {
		flex: 1,
	},
	webViewLoading: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
	}
});

export default ListenLiveScreen;