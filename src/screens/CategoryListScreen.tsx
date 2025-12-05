import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/HomeStack';
import type { RouteProp } from '@react-navigation/native';
import { fetchNewsByCategoryId } from '../services/newsApi';
import { NewsDetail } from '../type';
import HtmlRenderer from '../components/HtmlRenderer';
import { decodeHtmlEntities } from '../utils/htmlUtils';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';


const stripHtml = (html: string) =>
  decodeHtmlEntities(html.replace(/<[^>]*>?/gm, ''));

type CategoryListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryList'>;
type CategoryListScreenRouteProp = RouteProp<RootStackParamList, 'CategoryList'>;

const CategoryListScreen = () => {
  const navigation = useNavigation<CategoryListScreenNavigationProp>();
  const route = useRoute<CategoryListScreenRouteProp>();
  const [articles, setArticles] = useState<NewsDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const categoryId = route.params?.categoryId || 0;

  // Number of lines to show in the list view
  const numberOfLines = 3;
  const title = route.params?.title || "";

  useEffect(() => {
    // Set the header title to the category name
    navigation.setOptions({
      title: `${title}`,
    });

    // Fetch articles by category
    const loadArticles = async () => {
      try {
        setLoading(true);
        const categoryArticles = await fetchNewsByCategoryId(categoryId);
        setArticles(categoryArticles);
      } catch (error) {
        //console.error('Error loading category articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [categoryId, title, navigation]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (articles.length === 0) {
    return (
      <View style={styles.noArticlesContainer}>
        <Text>No articles found in this category.</Text>
      </View>
    );
  }

  return (
    <>
    <BreakingBanner />
    <TalkshowBanner />
    <FlatList
      data={articles}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('NewsDetail', { postId: item.id, title: item.title.rendered })}>
          <View style={styles.articleCard}>
            <Image
              source={{ uri: item.featured_media_url }}
              style={styles.articleImage}
              resizeMode="cover"
            />
            <View style={styles.articleDetails}>
              <HtmlRenderer
                htmlContent={item.title.rendered}
                numberOfLines={2}
                baseStyle={styles.articleTitle}
              />
              <View style={styles.htmlContainer}>
                <Text numberOfLines={5} style={styles.articleContent}>
                  {stripHtml(item.excerpt.rendered)}
                </Text>
              </View>
              <Text style={styles.articleDate}>
                {new Date(item.date).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
    </>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noArticlesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleCard: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 180,
  },
  articleDetails: {
    padding: 10,
  },
  articleTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  htmlContainer: {
    marginBottom: 6,
    overflow: 'hidden',
  },
  articleContent: {
    color: '#555',
    fontSize: 14,
    lineHeight: 18,
    padding: 0,
    margin: 0,
    // Ensure proper text rendering on both platforms
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  // Removed iframe related styles
  articleDate: {
    color: '#888',
    fontSize: 10,
  },
});

export default CategoryListScreen;