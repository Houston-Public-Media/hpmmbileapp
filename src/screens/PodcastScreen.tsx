import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchHPMPodcasts, Podcast } from '../services/podcastApi';
import { StackNavigationProp } from '@react-navigation/stack';
import { PodcastStackParamList } from '../navigation/PodcastStack';
import PodcastCard from '../components/PodcastCard';
import ScreenHeader from '../components/ScreenHeader';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';
import { fetchPriorityData } from '../services/newsApi';
import { TalkshowEntry } from '../type';
import AudioFooter from "../components/AudioFooter";

type PodcastScreenNavigationProp = StackNavigationProp<PodcastStackParamList, 'PodcastList'>;

const PodcastScreen = () => {
	const navigation = useNavigation<PodcastScreenNavigationProp>();
	const [podcasts, setPodcasts] = useState<Podcast[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);
	const [breakingData, setBreakingData] = useState<any>(null);

	useEffect(() => {
		fetchHPMPodcasts()
			.then(setPodcasts)
			.finally(() => setLoading(false));

		fetchPriorityData()
			.then(data => {
				setBreakingData(data?.breaking || null);
				setTalkshowData(Array.isArray(data?.talkshow) ? data.talkshow : []);
			})
			.catch(err => console.log(err));

	}, []);

	if (loading) {
		return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
	}

	return (
		<>
			<BreakingBanner data={breakingData} />
			<TalkshowBanner data={talkshowData} />
			<ScreenHeader
				title="Podcasts"
				description="All of Houston Public Media's podcasting information, including links, content, and more"
			/>

			<FlatList
				data={podcasts}
				keyExtractor={item => item.id.toString()}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.listContainer}
				renderItem={({ item }) => (
					<PodcastCard
						podcast={item}
						onPress={() => navigation.navigate('PodcastDetails', { podcast: item })}
					/>
				)}
			/>
			<AudioFooter />
		</>
	);
};

const styles = StyleSheet.create({
	listContainer: {
		paddingBottom: 20,
	},
});

export default PodcastScreen;