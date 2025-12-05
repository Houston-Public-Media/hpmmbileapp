import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchNewsByCategoryId } from '../services/newsApi';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import HtmlRenderer from './HtmlRenderer';
import { Podcast } from '../services/podcastApi';
import { RootStackParamList } from '../navigation/HomeStack';
import { decodeHtmlEntities } from '../utils/htmlUtils';

interface RadioPost {
  description1: string;
  description2: string;
  pId1: number;
  pId2: number;
}

const RadioCard = ({
  id,
  title,
  json_feed,
  image,
  podcast,
  onPress,
}: {
  id: number;
  title: string;
  image: any;
  json_feed: string;
  podcast: Podcast;
  onPress?: () => void;
}) => {
  const [post, setPost] = useState<RadioPost | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchRadioData = async () => {
      try {
        const posts = await fetchNewsByCategoryId(id, 2);

        if (!posts) {
          throw new Error('No data received from API');
        }

        const post1 = posts[0];
        const post2 = posts[1];

        const formattedData = {
          description1: post1.title?.rendered || '',
          description2: post2.title?.rendered || '',
          pId1: post1.id,
          pId2: post2.id,
        };
        setPost(formattedData);
      } catch (error) {
        //console.error('Error fetching radio data:', error);
      }
    };

    fetchRadioData();
  }, [id]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.radioItem}>
        <Text style={styles.radioTitle}>{title}</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.navigate('PodcastDetails', { podcast: podcast })}>
            <Image source={{ uri: image }} style={styles.radioImage} resizeMode="cover" />
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text onPress={() => navigation.navigate('NewsDetail', { postId: post?.pId1 || 0, title: post?.description1 })}>{decodeHtmlEntities(post?.description1|| '')}
              {/* <HtmlRenderer
                htmlContent={post?.description1.trim() || ''}
                numberOfLines={4}
                baseStyle={{}}
              /> */}
            </Text>
            <View
              style={{ height: 1, backgroundColor: '#ccc', marginVertical: 5 }}
            />
            <Text onPress={() => navigation.navigate('NewsDetail', { postId: post?.pId2 || 0, title: post?.description2 })}>{decodeHtmlEntities(post?.description2|| '')}
              {/* <HtmlRenderer
                htmlContent={post?.description2.trim() || ''}
                numberOfLines={4}
                baseStyle={{}}
              /> */}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioItem: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  radioTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioImage: {
    width: 140,
    height: 100,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    marginBottom: "auto",
  },
});

export default RadioCard;