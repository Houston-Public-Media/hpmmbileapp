// src\screens\ListenLiveScreen.tsx

import React, { JSX, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StreamPlayer from '../components/StreamPlayer';
import { useListenLive } from '../contexts/ListenLiveContext';
import { listenLiveService } from '../services/ListenLiveServices';
import { color } from '../utils/colorUtils';
import ScreenHeader from '../components/ScreenHeader';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';
import { PodcastStackParamList } from '../navigation/PodcastStack';
import { fetchHPMPodcasts, Podcast } from '../services/podcastApi';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import PodcastCard from '../components/PodcastCard';
import AudioFooter from '../components/AudioFooter';
type PodcastScreenNavigationProp = StackNavigationProp<PodcastStackParamList, 'PodcastList'>;


function ListenScreen(): JSX.Element {
	const { isPlayerReady, tracks, error, isLoading, refreshListenLiveData } = useListenLive();
	const navigation = useNavigation<PodcastScreenNavigationProp>();
	const [podcasts, setPodcasts] = useState<Podcast[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	
	// Note: No need to manually pause audio here - the universal service handles conflicts automatically
	// Pause Listen Live audio when Shows screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			// Pause any Listen Live audio that might be playing
			listenLiveService.pauseTrack();
		}, [])
	);

	useEffect(() => {
		fetchHPMPodcasts()
			.then(setPodcasts)
			.finally(() => setLoading(false));
	}, []);

	if (isLoading && loading) {
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
					onPress={refreshListenLiveData}
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
					onPress={refreshListenLiveData}
				>
					<MaterialIcons name="refresh" size={20} color="#fff" />
					<Text style={styles.retryButtonText}>Reload</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<>
			<BreakingBanner />
			<TalkshowBanner />
			<ScreenHeader 
				title="Listen"
				description="Live radio streams and podcasts at your fingertips"
			/>
			<ScrollView style={styles.container}>
				<Text style={styles.header}>Live Streams</Text>
				{
					tracks.map((track, index) => <StreamPlayer key={index} track={track} /> )
				}
				<Text style={styles.header}>Podcasts</Text>
				{
					podcasts.map((podcast, index) => <PodcastCard 
						podcast={podcast} key={index}
						onPress={() => navigation.navigate('PodcastDetails', { podcast: podcast })}
					/> )
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
})


export default ListenScreen;