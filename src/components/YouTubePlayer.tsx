import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface YouTubePlayerProps {
  src: string;
  width?: number;
  height?: number;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  src, 
  width = Dimensions.get('window').width - 30, 
  height = 200 
}) => {
  // Extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/embed\/([^"&?\/\s]{11})/,
      /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  const videoId = getYouTubeVideoId(src);

  if (!videoId) {
    console.log("IF");
    // If it's not a YouTube URL, render as a general WebView
    return (
      <View style={[styles.container, { width, height }]}>
        <WebView
          source={{ uri: src }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          mixedContentMode="always"
          onShouldStartLoadWithRequest={() => true}
          referrerpolicy={"*"}
        />
      </View>
    );
  }
console.log("Else");
  // Create YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&rel=0&modestbranding=1`;

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        mixedContentMode="always"
        onShouldStartLoadWithRequest={() => true}
        originWhitelist={['*']}
        referrerpolicy={"*"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default YouTubePlayer;
