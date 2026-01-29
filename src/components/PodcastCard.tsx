import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { color } from '../utils/colorUtils';
import { Podcast } from '../services/podcastApi';
import { cleanText } from '../utils/htmlUtils';

interface PodcastCardProps {
  podcast: Podcast;
  onPress: () => void;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: podcast.image.medium.url }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {cleanText(podcast.name)}
        </Text>
        
        {/* <View style={styles.episodeInfo}>
          <Text style={styles.latestEpisode} numberOfLines={1}>
            Latest: {podcast.latest_episode.title}
          </Text>
        </View> */}
      </View>
      
      {/* <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            onPress();
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="play-arrow" size={28} color="#fff" />
        </TouchableOpacity>
      </View> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1.5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 14,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  episodeInfo: {
    marginTop: 4,
  },
  latestEpisode: {
    fontSize: 13,
    color: color.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  actionSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: color.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default PodcastCard;
