import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { color } from '../utils/colorUtils';
import { decodeHtmlEntities } from '../utils/htmlUtils';

interface NewsCardProps {
  image?: string;
  title: string;
  summary?: string;
  time?: string;
  onPress?: () => void;
  onTitlePress?: () => void;
  cardStyle?: StyleProp<ViewStyle>;
  imageContainerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  summaryStyle?: StyleProp<TextStyle>;
  timeStyle?: StyleProp<TextStyle>;
  textContainerStyle?: StyleProp<ViewStyle>;
  titleLines?: number;
  summaryLines?: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ image, title, summary, time, onTitlePress, onPress, cardStyle, imageContainerStyle, imageStyle, titleStyle, summaryStyle, timeStyle, textContainerStyle, titleLines, summaryLines }) => (
  <TouchableOpacity style={[styles.card, cardStyle]} onPress={onPress}>
    {image && (
      <TouchableOpacity style={[styles.imageContainer, imageContainerStyle]} onPress={onPress}>
        <Image source={{ uri: image }} style={[styles.image, imageStyle]}/>
      </TouchableOpacity>
    )}
    <View style={[styles.textContainer, textContainerStyle]}>
        <Text style={[styles.title, titleStyle]} numberOfLines={titleLines || 6} onPress={onTitlePress}>{decodeHtmlEntities(title)}</Text>
      {summary ? (
        <Text style={[styles.summary, summaryStyle]} numberOfLines={summaryLines || 6} onPress={onPress}>{decodeHtmlEntities(summary)}</Text>
      ) : null}
      {time ? (
        <Text style={[styles.time, timeStyle]}>{decodeHtmlEntities(time)}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 2,
    borderBottomWidth:1,
    borderColor:'#ececec'
  },
  imageContainer:{
    width: 100,
    height: 80,
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: color.primary,
    textTransform:'uppercase'
  },
  summary: {
    color: color.secondary,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  time: {
    color: color.secondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default NewsCard;