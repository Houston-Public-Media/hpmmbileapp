// src\screens\ListenLiveScreen.tsx

import React, { JSX } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ListenLivePlayer from '../components/ListenLivePlayer';
import { useListenLive } from '../contexts/ListenLiveContext';
import { color } from '../utils/colorUtils';
import ScreenHeader from '../components/ScreenHeader';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';

function ListenLiveScreen(): JSX.Element {
  const { isPlayerReady, tracks, error, isLoading, refreshListenLiveData } = useListenLive();
  
  // Note: No need to manually pause audio here - the universal service handles conflicts automatically

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
        title="Listen Live"
        description="Stream Houston Public Media's live radio channels including News 88.7, Classical, and more"
      />
      <ListenLivePlayer tracks={tracks} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
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
})


export default ListenLiveScreen;