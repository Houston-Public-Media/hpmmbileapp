import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchHPMPodcasts, Podcast } from '../services/podcastApi';
import { StackNavigationProp } from '@react-navigation/stack';
import { PodcastStackParamList } from '../navigation/PodcastStack';
import PodcastCard from '../components/PodcastCard';
import ScreenHeader from '../components/ScreenHeader';
import { listenLiveService } from '../services/ListenLiveServices';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';

type PodcastScreenNavigationProp = StackNavigationProp<PodcastStackParamList, 'PodcastList'>;

const PodcastScreen = () => {
  const navigation = useNavigation<PodcastScreenNavigationProp>();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <>
      <BreakingBanner />
      <TalkshowBanner />
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