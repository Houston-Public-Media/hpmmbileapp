import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PodcastScreen from '../screens/PodcastScreen';
import PodcastDetailsScreen from '../screens/PodcastDetailsScreen';
import { Podcast } from '../services/podcastApi';
import { color } from '../utils/colorUtils';
import NewsDetailScreen from '../screens/NewsDetailScreen';

const Stack = createStackNavigator();

export type PodcastStackParamList = {
  PodcastList: undefined;
  PodcastDetails: { podcast: Podcast };
  PodcastEpisode: { postId: number, title: string };
};

const PodcastStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: color.primary }, 
        headerTintColor: '#fff', 
        headerShown: true 
      }}
    >
      <Stack.Screen
        name="PodcastList"
        component={PodcastScreen}
        options={{ title: 'Shows', headerShown: false }}
      />
      <Stack.Screen
        name="PodcastDetails"
        component={PodcastDetailsScreen}
        options={({ route }) => ({ 
          title: (route.params as { podcast: Podcast }).podcast.name,
          headerBackTitle: '' 
        })}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{ title: 'Episode', headerBackTitle: '' }}
      />
    </Stack.Navigator>
  );
};

export default PodcastStack;