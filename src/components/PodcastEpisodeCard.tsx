import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Linking, Alert, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color } from '../utils/colorUtils';
import { PodcastEpisode } from '../services/podcastApi';
import { useUniversalAudio } from '../contexts/UniversalAudioContext';
import { decodeHtmlEntities } from '../utils/htmlUtils';

interface PodcastEpisodeCardProps {
  episode: PodcastEpisode;
  podName: string,
  onPress?: () => void;
}

const PodcastEpisodeCard: React.FC<PodcastEpisodeCardProps> = ({ episode, podName, onPress }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Use universal audio context
  const {
    currentTrack,
    isPlaying,
    isLoading,
    playPodcast,
    pause,
    isCurrentTrack,
  } = useUniversalAudio();

  // Check if this is the current episode
  const podcastId = `podcast_${episode.id}`;
  const isCurrentEpisode = isCurrentTrack(podcastId);
  const isPlayingNow = isCurrentEpisode && isPlaying;
  const isLoadingAudio = isCurrentEpisode && isLoading;

  // Optimized rotation animation for loading spinner
  useEffect(() => {
    if (isLoadingAudio) {
      rotateAnim.setValue(0);
      const animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200, // Slightly slower for better UX
          useNativeDriver: true,
        })
      );
      animation.start();
      
      return () => animation.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoadingAudio, rotateAnim]);


  const formatDuration = (seconds: string) => {
    const totalSeconds = parseInt(seconds);
    if (isNaN(totalSeconds)) return seconds;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };


  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isCurrentEpisode && isPlaying && styles.activeCard
      ]}
      onPress={onPress ? onPress : () => Linking.openURL(episode.permalink)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: episode.thumbnail }} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={5}>
          {decodeHtmlEntities(episode.title)}
        </Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.date}>
            {formatDate(episode.date)} @ {formatTime(episode.date)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.playButton,
          isPlayingNow && styles.playingButton,
          isLoadingAudio && styles.loadingButton,
        ]}
        onPress={async (e) => {
          e.stopPropagation();
          if (isLoadingAudio) return;
          
          try {
            if (episode.attachments?.url) {
              if (isCurrentEpisode && isPlaying) {
                // Pause if currently playing
                await pause();
              } else {
                // Play the podcast episode
                // Add podcast title as album to this function
                await playPodcast(
                  episode.id.toString(),
                  episode.attachments.url,
                  decodeHtmlEntities(episode.title),
                  'Houston Public Media',
                  podName,
                  episode.thumbnail,
                  episode.attachments?.duration_in_seconds ? parseInt(episode.attachments.duration_in_seconds) : undefined
                );
              }
            } else {
              Alert.alert('Error', 'No audio file available for this episode.');
            }
          } catch (error) {
            console.error('Error playing episode:', error);
            Alert.alert('Error', 'Unable to play this episode. Please try again.');
          }
        }}
        activeOpacity={isLoadingAudio ? 1 : 0.8}
        disabled={isLoadingAudio}
      >
        {isLoadingAudio ? (
          <Animated.View
            style={{
              transform: [{
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              }],
            }}
          >
            <MaterialIcons 
              name="sync" 
              size={20} 
              color="#fff" 
            />
          </Animated.View>
        ) : (
          <MaterialIcons 
            name={isPlayingNow ? "pause" : "play-arrow"} 
            size={24} 
            color="#fff" 
          />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
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
    borderWidth: 1,
    borderColor: '#ececec'
  },
  activeCard: {
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    shadowColor: color.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderColor: color.primary
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  duration: {
    fontSize: 13,
    color: color.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  playingButton: {
    backgroundColor: color.primary,
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingButton: {
    backgroundColor: '#bbb',
  },
  loadedButton: {
    backgroundColor: '#1976D2',
    shadowOpacity: 0.25,
  },
});

export default PodcastEpisodeCard;
