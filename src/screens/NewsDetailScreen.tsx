import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, useWindowDimensions, RefreshControl, } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { fetchNewsArticleById } from '../services/newsApi';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/HomeStack';
import { NewsDetail, Coauthor } from '../type';
import HtmlRenderer from '../components/HtmlRenderer';
import CoauthorCard from '../components/CoauthorCard';
import TalkshowBanner from '../components/TalkshowBanner';
import BreakingBanner from '../components/BreakingBanner';
import { decodeHtmlEntities } from '../utils/htmlUtils';
import { fetchPriorityData } from '../services/newsApi';
import { TalkshowEntry } from '../type';

// Define the params expected for this screen
type NewsDetailParams = {
  NewsDetail: { postId: number; title?: string };
};

const NewsDetailScreen = () => {
  const { width } = useWindowDimensions();
  const route = useRoute<RouteProp<NewsDetailParams, 'NewsDetail'>>();
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'NewsDetail'>>();
  const { postId, title } = route.params;
  const [post, setPost] = useState<NewsDetail | null>(null);
  const [coauthors, setCoauthors] = useState<Coauthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [talkshowData, setTalkshowData] = useState<TalkshowEntry[]>([]);
  const [breakingData, setBreakingData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPost = async () => {
    try {
      const data = await fetchNewsArticleById(postId);
      const bannerData = await fetchPriorityData();       
      setPost(data);
      if (data?.coauthors && Array.isArray(data.coauthors)) {
        setCoauthors(data.coauthors);
       } else {
        setCoauthors([]);
      }
      setTalkshowData(Array.isArray(bannerData?.talkshow) ? bannerData.talkshow : []);
        setBreakingData(bannerData?.breaking || null);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    navigation.setOptions({
      title: decodeHtmlEntities(title || ''),
    });
    const init = async () => {
      setLoading(true);
      await loadPost();
      setLoading(false);
    };
    init();
  }, [postId, title, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPost();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading post. Please try again later.</Text>
      </View>
    );
  }

  const authorName = coauthors.map((author, index) => (
    author.display_name + (index < coauthors.length - 1 ? ', ' : '')
  ));

  return (
    <ScrollView
  style={styles.container}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
    <View style={styles.safeArea}>
      <BreakingBanner data={breakingData} />      
      <TalkshowBanner data={talkshowData} />
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <HtmlRenderer
            htmlContent={post.title.rendered}
            numberOfLines={4}
            baseStyle={styles.title}
          />
          <Text style={styles.date}>

            {authorName
              ? authorName
              : ''} | {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
          </Text>
        </View>
        <HtmlRenderer
          htmlContent={post.content.rendered}
          baseStyle={styles.htmlContent}
          renderTextOnly={false}
        />
        <View style={styles.content}>
          {coauthors.length > 0 && (
            <View style={styles.coauthorsSection}>
              {coauthors.map((author, index) => (
                <View style={styles.coauthorsItem} key={index}>
                  <CoauthorCard author={author} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingVertical: 15,
    paddingBottom: 0,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    marginHorizontal: 15,
  },
  date: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  content: {
    padding: 15,
    paddingTop: 5,
    fontSize: 16,
  },
  htmlContent: {
    lineHeight: 24,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 15,
  },
  coauthorsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  coauthorsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  coauthorsItem: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default NewsDetailScreen;
