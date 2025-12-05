import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { fetchTalkshow } from '../services/newsApi';
import type { TalkshowResponse, TalkshowEntry } from '../type';

const TalkshowBanner: React.FC = () => {
  const [talkshows, setTalkshows] = useState<TalkshowResponse['talkshow'] | null>(null);

  useEffect(() => {
    fetchTalkshow().then(setTalkshows);
  }, []);

  // Find the live talkshow entry
  const liveTalkshow = useMemo(() => {
    if (!talkshows) return null;
    return talkshows.find(show => show.live);
  }, [talkshows]);

  if (!liveTalkshow) return null; // Hide banner if nothing live

  const { showSlug, id, showName, phone, backgroundColor, accentColor, textColor } = liveTalkshow;

  const youtubeUrl = `https://www.youtube.com/watch?v=${id}`;
  const description = `${showName} is on air now!`;

  return (
    <View style={[styles.banner, { backgroundColor: backgroundColor || '#ccc' }]}>
      <Text style={[styles.bannerText, { color: textColor || '#000' }]}>
        <Text style={styles.link} onPress={() => Linking.openURL(youtubeUrl)}>
          {description}
        </Text>{' | '}
        <Text style={styles.link} onPress={() => Linking.openURL(`tel:${phone}`)}>
          Call
        </Text>{' / '}
        <Text style={styles.link} onPress={() => Linking.openURL(`sms:${phone}`)}>
          Text
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 8,
  },
  bannerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  link: {
    textDecorationLine: 'underline',
  },
});

export default TalkshowBanner;
