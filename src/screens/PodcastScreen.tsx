import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchHPMPodcasts, Podcast } from '../services/podcastApi';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PodcastStackParamList } from '../navigation/PodcastStack';
import PodcastCard from '../components/PodcastCard';
import ScreenHeader from '../components/ScreenHeader';
import { listenLiveService } from '../services/ListenLiveServices';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';
import { fetchPriorityData } from '../services/newsApi';
import { NewsArticle, TalkshowEntry } from '../type';

type PodcastScreenNavigationProp = StackNavigationProp<PodcastStackParamList, 'PodcastList'>;

const PodcastScreen = () => {
  const navigation = useNavigation<PodcastScreenNavigationProp>();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);
  const [breakingData, setBreakingData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);


  // Pause Listen Live audio when Shows screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Pause any Listen Live audio that might be playing
      listenLiveService.pauseTrack();
    }, [])
  );

  const loadData = async () => {
  try {
    const podcastData = await fetchHPMPodcasts();
    setPodcasts(podcastData);
    const priorityData = await fetchPriorityData();
    setBreakingData(priorityData?.breaking || null);
    setTalkshowData(Array.isArray(priorityData?.talkshow) ? priorityData.talkshow : []);
  } catch (err) {
    console.log(err);
  }
};
  useEffect(() => {
  loadData().finally(() => setLoading(false));
  }, []);
  
const onRefresh = async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
};


  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <>
    <FlatList
        data={[]} // no actual list items
        keyExtractor={(_, i) => i.toString()}
        renderItem={null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        />
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
      
    </>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
});

export default PodcastScreen;