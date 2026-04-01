import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPriorityNews, fetchTalkshow } from '../services/newsApi';
import NewsCard from '../components/NewsCard';
import { color } from '../utils/colorUtils';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/HomeStack';
import RadioSection from '../components/RadioSection';
import TalkshowBanner from '../components/TalkshowBanner';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowCard from '../components/TalkshowCard';
import { NewsArticle, TalkshowEntry } from '../type';
import AdBanner from '../components/AdBanner';
import { getSelectedCategories } from '../utils/categoryStorage';
import SectionTitle from '../components/SectionTitle';
import CategorySection from '../components/CategorySection';
import AudioFooter from '../components/AudioFooter';
import { useAds } from '../hooks/useAds';
import { listenLiveService } from '../services/ListenLiveServices';
import { podcastAudioService } from '../services/PodcastAudioService';
import { htmlAudioService } from '../services/HtmlAudioService';
import BrightcoveVideo from '../components/BrightcoveVideo';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
	navigation: HomeScreenNavigationProp;
};

type SectionItem =
	| { type: 'adBanner' }
	| { type: 'featured'; data: NewsArticle }
	| { type: 'borderNewsList'; data: NewsArticle[] }
	| { type: 'newsList'; data: NewsArticle[] }
	| { type: 'lastNewsList'; data: NewsArticle[] }
	| { type: 'talkshow'; data: { showSlug: string; talkshow: TalkshowEntry }[] }
	| { type: 'radio' }
	| { type: 'brightcove' }
	| { type: 'selected_category'; data:{id:string, name:string};}

export default function HomeScreen({ navigation }: Props) {
	const [articles, setArticles] = useState<NewsArticle[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [selectedCategories, setSelectedCategories] = useState<{ id: string; name: string }[]>([]);
	const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);

	const { showInterstitialAd, isInterstitialLoaded } = useAds();

	useFocusEffect(
		React.useCallback(() => {
			listenLiveService.pauseTrack();
			podcastAudioService.pauseCurrentEpisode();
			htmlAudioService.pauseCurrentAudio();
		}, [])
	);

	const featured = articles[0];
	const borderNewsList = articles.slice(1, 5);
	const newsList = articles.slice(5, 8);
	const lastNewsList = articles.slice(8);
	const categoryList = selectedCategories.map(category => ({ type: "selected_category", data: category } as const));

	const liveTalkshows = talkshowData
		.filter(talkshow => talkshow.live)
		.map(talkshow => ({
			showSlug: talkshow.showSlug,
			talkshow
		}));

	const sections: SectionItem[] = [
		{ type: 'adBanner' },
		featured && { type: 'featured', data: featured },
		{ type: 'borderNewsList', data: borderNewsList },
		{ type: 'newsList', data: newsList },
		...(liveTalkshows.length > 0
			? [{ type: 'talkshow' as const, data: liveTalkshows }]
			: [{ type: 'lastNewsList' as const, data: lastNewsList }]
		),
		{ type: 'radio' },
		{ type: 'brightcove' },
		...categoryList
	].filter(Boolean) as SectionItem[];

	const handleNewsNavigation = async (postId: number, title: string) => {
		try {
			if (isInterstitialLoaded && Math.random() < 0.3) {
				await showInterstitialAd();
			}
			navigation.navigate('NewsDetail', { postId, title });
		} catch {
			navigation.navigate('NewsDetail', { postId, title });
		}
	};

	const loadData = async () => {
		try {
			const [data, talkshow] = await Promise.all([
				fetchPriorityNews(),
				fetchTalkshow()
			]);
			setArticles(data);
			setTalkshowData(talkshow);
			const categories = await getSelectedCategories();
			setSelectedCategories(categories.map(cat => ({ id: cat.id, name: cat.name })));
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleRefresh = () => {
		setRefreshing(true);
		loadData();
	};

	const renderSection = ({ item }: { item: SectionItem }) => {
		switch (item.type) {
			case 'adBanner':
				return <View style={{ justifyContent: 'center', alignItems: 'center' }}><AdBanner /></View>;

			case 'featured':
				return (
					<View style={[styles.section, { paddingVertical: 0 }]}>
						<NewsCard
							onPress={() => handleNewsNavigation(item.data.id, item.data.title)}
							onTitlePress={() => navigation.navigate('CategoryList', {
								categoryId: item.data.primary_category.id,
								title: item.data.primary_category.name
							})}
							title={item.data.primary_category.name}
							summary={item.data.title}
							image={item.data.picture}
							summaryStyle={styles.featuredSummary}
							imageContainerStyle={styles.featuredImage}
							cardStyle={styles.featured}
							summaryLines={3}
						/>
					</View>
				);

			case 'borderNewsList':
				return (
					<View style={styles.section}>
						{item.data.map((article, idx) => (
							<NewsCard
								key={idx}
								onPress={() => handleNewsNavigation(article.id, article.title)}
								onTitlePress={() => navigation.navigate('CategoryList', {
									categoryId: article.primary_category.id,
									title: article.primary_category.name
								})}
								title={article.primary_category.name}
								summary={article.title}
								cardStyle={{
									borderColor: '#ececec',
									borderWidth: 1,
									padding: 8,
									marginBottom: 16
								}}
							/>
						))}
					</View>
				);

			case 'newsList':
				return (
					<View style={[styles.section, { paddingTop: 0, paddingBottom: 16 }]}>
						{item.data.map((article, idx) => (
							<NewsCard
								key={idx}
								onPress={() => handleNewsNavigation(article.id, article.title)}
								onTitlePress={() => navigation.navigate('CategoryList', {
									categoryId: article.primary_category.id,
									title: article.primary_category.name
								})}
								title={article.primary_category.name}
								summary={article.title}
								image={article.picture}
							/>
						))}
					</View>
				);

			case 'lastNewsList':
				return (
					<View style={styles.section}>
						{item.data.map((article, idx) => (
							<NewsCard
								key={idx}
								onPress={() => handleNewsNavigation(article.id, article.title)}
								onTitlePress={() => handleNewsNavigation(article.id, article.title)}
								title={article.title}
								image={article.picture}
								imageContainerStyle={{
									width: "50%",
									minHeight: 120,
									marginRight: 10
								}}
								titleLines={10}
								titleStyle={{
									fontWeight: 'bold',
									fontSize: 14,
									marginBottom: 4,
									color: color.secondary,
									textTransform: 'none'
								}}
								cardStyle={{
									borderColor: '#bdb9b9',
									borderWidth: 1,
									padding: 8,
									marginBottom: 16,
									backgroundColor: '#f9f6f6'
								}}
							/>
						))}
					</View>
				);

			case 'talkshow':
				return (
					<View style={styles.section}>
						{item.data.map((show, idx) => (
							<TalkshowCard
								key={idx}
								talkshow={show.talkshow}
								showSlug={show.showSlug}
								onPress={() => {
									// Add navigation if needed
								}}
							/>
						))}
					</View>
				);

			case 'radio':
				return (
					<View style={styles.section}>
						<RadioSection />
					</View>
				);

			case 'brightcove':
				return (
					<View style={styles.section}>
						<BrightcoveVideo />
					</View>
				);

			case 'selected_category':
				return (
					<View style={[styles.section, { paddingTop: 16 }]}>
						<SectionTitle title={item.data.name} line={true} />
						<CategorySection categoryId={item.data.id} categoryName={item.data.name} />
					</View>
				);

			default:
				return null;
		}
	};

	if (loading && articles.length === 0) {
		return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
	}

	return (
		<View style={styles.container}>
			<BreakingBanner />
			<TalkshowBanner />
			<FlatList
				data={sections}
				renderItem={renderSection}
				keyExtractor={(item, index) => `${item.type}-${index}`}
				contentContainerStyle={styles.mainContent}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
			/>
			{/* <SectionFooter /> */}
			<AudioFooter />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	mainContent: { paddingHorizontal: 16 },
	featured: { paddingVertical: 16, flexDirection: 'column', borderBottomWidth: 0 },
	featuredImage: { width: '100%', height: 180, marginBottom: 16 },
	featuredSummary: { fontWeight: 'bold', fontSize: 18, marginTop: 4 },
	section: { paddingVertical: 8 },
});
