import React, { useEffect, useState } from "react";
import { View, FlatList, Dimensions, ActivityIndicator, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";
import SectionTitle from './SectionTitle';
import { fetchBCVideos } from "../services/newsApi";
import { BrightcoveVideo as VideoType } from "../type";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.5;
const CARD_HEIGHT = (CARD_WIDTH * 16) / 9;
const ITEM_MARGIN = 16;

export default function BrightcoveVideo() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await fetchBCVideos();
      setVideos(data);
    } catch (error) {
      console.log("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: VideoType }) => {
    return (
      <View style={[styles.card, { marginRight: ITEM_MARGIN }]}>
        <WebView
          source={{ uri: item.playerUrl }}
          style={{ width: "100%", height: "100%" }}
          javaScriptEnabled
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={false}
        />
        {/* <View style={styles.overlay}>
          <Text style={styles.title}>{item.name}</Text>
        </View> */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionTitle title="HPM" subtitle="Shorts" line={true} containerStyle={{ marginBottom: 16 }} titleStyle={{ color: 'black' }} subtitleStyle={{ color: '#c8102e' }} />
    <FlatList
      data={videos}
      horizontal
      pagingEnabled
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: ITEM_MARGIN / 2, paddingVertical: 20 }}
      onMomentumScrollEnd={(event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + ITEM_MARGIN));
        setCurrentIndex(index);
      }}
      renderItem={renderItem}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  overlay: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "rgba(0,0,0,0.4)", padding: 8 },
  title: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});