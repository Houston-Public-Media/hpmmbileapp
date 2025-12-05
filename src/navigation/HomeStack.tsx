// src\AppStack.tsx

import React, { JSX } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import { color } from '../utils/colorUtils';
import { Podcast } from '../services/podcastApi';
import PodcastDetailsScreen from '../screens/PodcastDetailsScreen';

const Stack = createStackNavigator();

export type RootStackParamList = {
  Home: undefined;
  NewsDetail: { postId: number, title?: string };
  CategoryList: { categoryId: number; categorySlug?:string, title?: string };
  PodcastDetails: { podcast: Podcast };
};

function HomeStack(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: color.primary }, headerTintColor: '#fff', headerShown: true }}>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="NewsDetail" component={NewsDetailScreen} options={{ title: 'News Details', headerBackTitle: '' }} />
    <Stack.Screen name="CategoryList" component={CategoryListScreen} options={{ title: 'Category List', headerBackTitle: '' }} />
    <Stack.Screen
        name="PodcastDetails"
        component={PodcastDetailsScreen}
        options={({ route }) => ({ 
          title: (route.params as { podcast: Podcast }).podcast.name,
          headerBackTitle: '' 
        })}
      />
    </Stack.Navigator>
  );
}

export default HomeStack;