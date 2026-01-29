import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native';
import {
  fetchHPMPodcastDetails,
  fetchHPMPodcasts,
  PodcastDetails,
  Podcast
} from '../services/podcastApi';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import PodcastEpisodeCard from '../components/PodcastEpisodeCard';
import { PodcastStackParamList } from '../navigation/PodcastStack';
import { cleanText } from '../utils/htmlUtils';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';
import AudioFooter from '../components/AudioFooter';

type PodcastDetailsRouteProp = RouteProp<PodcastStackParamList, 'PodcastDetails'>;

const PodcastDetailsScreen: React.FC = () => {
  const route = useRoute<PodcastDetailsRouteProp>();
  const navigation = useNavigation();
  const { podcast } = route.params;
  const [podcastDetail, setPodcastDetail] = useState<PodcastDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [externalLinks, setExternalLinks] = useState<Podcast['external_links'] | null>(null);
  
  // Get universal audio context
  // Note: No need to manually pause here - the universal service handles conflicts automatically

  const handleEpisodePress = (episodeId: number, episodeTitle: string) => {
    // Navigate to NewsDetailScreen in HomeStack
    // Using the episodeId as postId since they likely share the same WordPress ID system
    (navigation as any).navigate('NewsDetail', {
      postId: episodeId,
      title: cleanText(episodeTitle)
    });
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch podcast details
        if (podcast.feed_json) {
          const details = await fetchHPMPodcastDetails(podcast.feed_json);
          setPodcastDetail(details);
        }

        // Fetch external links from main podcasts API
        const podcasts = await fetchHPMPodcasts();
        const matchingPodcast = podcasts.find(p => p.id === podcast.id);
        if (matchingPodcast) {
          setExternalLinks(matchingPodcast.external_links);
        }
      } catch (error) {
        console.error('Error loading podcast data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [podcast]);



  if (loading) {
    return (
      <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />
    );
  }

  const renderPlatformIcon = (platform: string, url: string) => {
    if (!url) return null;
    let imgSource;

    switch (platform) {
      case 'spotify':
        imgSource = { uri: 'https://cdn.houstonpublicmedia.org/assets/images/podcasts/spotify.png.webp' };
        break;
      case 'npr':
        imgSource = { uri: 'https://cdn.houstonpublicmedia.org/assets/images/podcasts/npr.png.webp' };
        break;
      case 'pcast':
        imgSource = { uri: 'https://cdn.houstonpublicmedia.org/assets/images/podcasts/pocketcasts.png.webp' };
        break;
      case 'amazon':
        imgSource = { uri: 'https://cdn.houstonpublicmedia.org/assets/images/podcasts/amazon.png.webp' };
        break;
      case 'itunes':
        imgSource = { uri: 'https://cdn.houstonpublicmedia.org/assets/images/podcasts/apple.png.webp' };
        break;
      default:
        imgSource = { uri: 'https://cdn.houstonpublicmedia.org/assets/images/podcasts/rss.png.webp' };
    }
    return (
      <TouchableOpacity
        key={platform}
        style={styles.platformButton}
        onPress={() => Linking.openURL(url)}
      >
        <Image source={imgSource} style={styles.icon} />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <BreakingBanner />
      <TalkshowBanner />
      <ScrollView style={styles.container}>
        
        {/* Podcast Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {podcastDetail?.data?.feed?.title || podcast.name}
          </Text>
          <Image 
            source={{ uri: podcastDetail?.data?.feed?.icon || podcast.image.medium.url }} 
            style={styles.podcastImage} 
          />
          
          <Text style={styles.description}>
            {(podcastDetail?.data?.feed?.description || podcast.description).replace(/<[^>]+>/g, '')}
          </Text>
          
          {/* Platform Icons */}
          <View style={styles.platformsContainer}>
            {renderPlatformIcon('itunes', externalLinks?.itunes || podcast.external_links.itunes || '')}
            {renderPlatformIcon('spotify', externalLinks?.spotify || podcast.external_links.spotify || '')}
            {renderPlatformIcon('npr', externalLinks?.npr || podcast.external_links.npr || '')}
            {renderPlatformIcon('pcast', externalLinks?.pcast || podcast.external_links.pcast || '')}
            {renderPlatformIcon('amazon', externalLinks?.amazon || podcast.external_links.amazon || '')}
          </View>


        </View>

        {/* Episodes List */}
        <View style={styles.episodesSection}>        
          {podcastDetail?.data?.feed?.items && podcastDetail.data.feed.items.length > 0 ? (
            <FlatList
              data={podcastDetail.data.feed.items}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <PodcastEpisodeCard 
                  episode={item}
                  podName={podcast.name}
                  onPress={() => handleEpisodePress(item.id, item.title)}
                />
              )}
            />
          ) : (
            <View style={styles.noEpisodesContainer}>
              <Text style={styles.noEpisodesText}>No episodes available</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <AudioFooter />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  podcastImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#343434',
    textAlign: 'justify',
    lineHeight: 20,
    marginBottom: 20,
  },
  platformsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  platformButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  episodesSection: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
  },
  noEpisodesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noEpisodesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  icon: {
    width: 50,
    height: 50
  }
});

export default PodcastDetailsScreen;