import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import YoutubePlayerNew from 'react-native-youtube-iframe';

interface YouTubePlayerProps {
  src: string;
  width?: number;
  height?: number;
}

const YoutubePlayer: React.FC<YouTubePlayerProps> = ({
  src,
  width = Dimensions.get('window').width - 30,
  height,
}) => {
  const [videoId, setVideoId] = useState<string | null>(null);

  // Extract YouTube ID from various URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/embed\/([^"&?\/\s]{11})/,
      /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  useEffect(() => {
    const id = getYouTubeVideoId(src);
    setVideoId(id);
  }, [src]);

  if (!videoId) {
    return (
      <View style={[styles.loader, { width, height: height || (width * 9) / 16 }]}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height: height || (width * 9) / 16 }]}>
      <YoutubePlayerNew
        height={height || (width * 9) / 16}
        width={width}
        videoId={videoId}
        play={false}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          javaScriptEnabled: true,
          domStorageEnabled: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
  },
});

export default YoutubePlayer;
