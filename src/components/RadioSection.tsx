import React from 'react';
import { View, StyleSheet } from 'react-native';
import SectionTitle from './SectionTitle';
import RadioCard from './RadioCard';
import { Podcast } from '../services/podcastApi';

const radioList: Array<{
  id: number;
  title: string;
  image: any;
  json_feed: string;
  podcast: Podcast;
}> = [
  {
    title: 'HOUSTON MATTERS',
    id: 58,
    json_feed: 'https://www.houstonpublicmedia.org/wp-json/hpm-podcast/v1/list/houston-matters',
    image: 'https://cdn.houstonpublicmedia.org/assets/images/Houston-Matters-with-Craig-Cohen-Logo.png.webp',
    podcast: {
      id: 205856,
      name: 'HOUSTON MATTERS',
      description: 'Houston Matters is a weekday talk show produced by Houston Public Media that explores issues relevant to the greater Houston area.',
      image: {
        full: { url: '', width: 400, height: 400 },
        medium: { url: '', width: 200, height: 200 },
        thumbnail: { url: '', width: 100, height: 100 }
      },
      latest_episode: {
        audio: '',
        title: 'Latest Episode',
        link: ''
      },
      feed: '',
      archive: '',
      slug: 'houston-matters',
      external_links: {
        itunes: '',
        npr: '',
        spotify: '',
        pcast: '',
        amazon: ''
      },
      feed_json: 'https://www.houstonpublicmedia.org/wp-json/hpm-podcast/v1/list/houston-matters'
    }
  },   {
    title: 'HELLO HOUSTON',
    id: 64721,
    json_feed: 'https://www.houstonpublicmedia.org/wp-json/hpm-podcast/v1/list/hello-houston',
    image: 'https://cdn.houstonpublicmedia.org/assets/images/Talk-Show-Web-MainPg-Show-Cover.png.webp',
    podcast: {
      id: 517148,
      name: 'HELLO HOUSTON',
      description: 'Hello Houston is a weekday talk show that brings you the latest news and conversations about Houston.',
      image: {
        full: { url: '', width: 400, height: 400 },
        medium: { url: '', width: 200, height: 200 },
        thumbnail: { url: '', width: 100, height: 100 }
      },
      latest_episode: {
        audio: '',
        title: 'Latest Episode',
        link: ''
      },
      feed: '',
      archive: '',
      slug: 'hello-houston',
      external_links: {
        itunes: '',
        npr: '',
        spotify: '',
        pcast: '',
        amazon: ''
      },
      feed_json: 'https://www.houstonpublicmedia.org/wp-json/hpm-podcast/v1/list/hello-houston'
    }
  },   {
    title: 'PARTY POLITICS',
    id: 11524,
    json_feed: 'https://www.houstonpublicmedia.org/wp-json/hpm-podcast/v1/list/party-politics',
    image: 'https://cdn.houstonpublicmedia.org/assets/images/Party-Politics-Logo.png.webp',
    podcast: {
      id: 186313,
      name: 'PARTY POLITICS',
      description: 'Party Politics explores the political landscape and provides in-depth analysis of current political events.',
      image: {
        full: { url: '', width: 400, height: 400 },
        medium: { url: '', width: 200, height: 200 },
        thumbnail: { url: '', width: 100, height: 100 }
      },
      latest_episode: {
        audio: '',
        title: 'Latest Episode',
        link: ''
      },
      feed: '',
      archive: '',
      slug: 'party-politics',
      external_links: {
        itunes: '',
        npr: '',
        spotify: '',
        pcast: '',
        amazon: ''
      },
      feed_json: 'https://www.houstonpublicmedia.org/wp-json/hpm-podcast/v1/list/party-politics'
    }
  }
]

const RadioSection = () => {
  return (
    <View style={styles.container}>
      <SectionTitle
        title="THIS WEEK on"
        subtitle="TALK RADIO"
        line={true}
        containerStyle={{ marginBottom: 16 }}
        titleStyle={{ color: 'black' }}
        subtitleStyle={{ color: '#c8102e' }}
      />
      {radioList.map((item, idx) => (
        <RadioCard key={idx} id={item.id} title={item.title} image={item.image} json_feed={item.json_feed} podcast={item.podcast} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 140,
    height: 100,
    marginRight: 10,
  },
});

export default RadioSection;