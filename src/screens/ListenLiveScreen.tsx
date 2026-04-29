import React, { JSX, useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ListenLivePlayer from '../components/ListenLivePlayer';
import { useHPMAudio } from '../contexts/HPMAudioContext';
import { color } from '../utils/colorUtils';
import ScreenHeader from '../components/ScreenHeader';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';
import { fetchPriorityData } from '../services/newsApi';
import { TalkshowEntry } from '../type';
import { useFocusEffect } from '@react-navigation/native';
import AudioFooter from '../components/AudioFooter';

function ListenLiveScreen(): JSX.Element {
	const { isPlayerReady, error, tracks, isLoading, loadLiveStreams } = useHPMAudio();
	const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);
	const [breakingData, setBreakingData] = useState<any>(null);

	const loadBannerData = async () => {
		try {
			const data = await fetchPriorityData();
			setTalkshowData(Array.isArray(data?.talkshow) ? data.talkshow : []);
			setBreakingData(data?.breaking || null);
		} catch (e) {
			console.log('ListenLive load failed', e);
		}
	};

	useFocusEffect(
		useCallback(() => {
			loadBannerData();
			const interval = setInterval(() => {
				loadBannerData();
			}, 60 * 1000);

			return () => clearInterval(interval);
		}, [])
	);

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
		<>
			<BreakingBanner data={breakingData} />
			<TalkshowBanner data={talkshowData} />
			<ScreenHeader
				title="Listen Live"
				description="Stream Houston Public Media's live radio channels including News 88.7, Classical, and more"
			/>
			<ScrollView style={styles.container}>
				<Text style={styles.header}>Live Streams</Text>
				{
					tracks.map((track, index) => <ListenLivePlayer key={index} track={track} /> )
				}
			</ScrollView>
			<AudioFooter />
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 10,
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
});


export default ListenLiveScreen;