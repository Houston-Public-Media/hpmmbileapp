import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { TalkshowEntry } from '../type';

type Props = {
  data: TalkshowEntry[];
};

const TalkshowBanner: React.FC<Props> = ({ data }) => { 
  const liveTalkshow = useMemo(() => {
    return data?.find(show => show.live) || null;
  }, [data]);
  if (!liveTalkshow) return null;

const { id, showName, phone, backgroundColor, textColor, } = liveTalkshow;
  const youtubeUrl = `https://www.youtube.com/watch?v=${id}`;
  const description = `${showName} is on air now!`;

  return (
    <View style={[styles.banner, { backgroundColor: backgroundColor || '#ccc' }]}>
      <Text style={[styles.bannerText, { color: textColor || '#000' }]}>
        <Text
          style={styles.link}
          onPress={() => Linking.openURL(youtubeUrl)}
        >
          {description}
        </Text>

        {' | '}

        <Text
          style={styles.link}
          onPress={() => Linking.openURL(`tel:${phone}`)}
        >
          Call
        </Text>

        {' / '}

        <Text
          style={styles.link}
          onPress={() => Linking.openURL(`sms:${phone}`)}
        >
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