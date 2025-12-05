// src/services/podcastApi.ts

export interface PodcastImage {
  full: { url: string; width: number; height: number };
  medium: { url: string; width: number; height: number };
  thumbnail: { url: string; width: number; height: number };
}

export interface PodcastExternalLinks {
  itunes?: string;
  npr?: string;
  youtube?: string;
  spotify?: string;
  pcast?: string;
  overcast?: string;
  amazon?: string;
  tunein?: string;
  pandora?: string;
  iheart?: string;
}

export interface PodcastLatestEpisode {
  audio: string;
  title: string;
  link: string;
}

export interface Podcast {
  id: number;
  name: string;
  description: string;
  image: PodcastImage;
  latest_episode: PodcastLatestEpisode;
  feed: string;
  archive: string;
  slug: string;
  external_links: PodcastExternalLinks;
  feed_json: string;
}

export interface PodcastEpisode {
  id: number;
  title: string;
  content_text: string;
  content_html: string;
  excerpt: string;
  permalink: string;
  date: string;
  date_gmt: string;
  author: string;
  thumbnail: string;
  attachments: {
    url: string;
    mime_type: string;
    filesize: number;
    duration_in_seconds: string;
  };
  season: string;
  episode: string;
  episodeType: string;
}

export interface PodcastFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  icon: string;
  favicon: string;
  categories: string[];
  keywords: string[];
  id: number;
  author: {
    name: string;
    email: string;
  };
  items: PodcastEpisode[];
  external_links?: PodcastExternalLinks;
}

export interface PodcastDetails {
  code: string;
  message: string;
  data: {
    feed: PodcastFeed;
  };
  status: number;
}

// Fetches the list of podcasts
export async function fetchHPMPodcasts(): Promise<Podcast[]> {
  try {
    const response = await fetch('https://www.houstonpublicmedia.org/wp-json/hpm-podcast/v1/list');
    const json = await response.json();
    return json?.data?.list || [];
  } catch (error) {
    //console.error('Error fetching podcasts list:', error);
    return [];
  }
}

// Fetches details of a specific podcast based on the provided feed_json URL
export async function fetchHPMPodcastDetails(feedJsonUrl: string): Promise<PodcastDetails | null> {
  try {
    const response = await fetch(feedJsonUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch podcast details');
    }
    const json: PodcastDetails = await response.json();

    // Check if the response has the expected structure
    if (json && json.data && json.data.feed) {
      return json;
    } else {
      //console.error('Invalid podcast data structure:', json);
      return null;
    }
  } catch (error) {
    //console.error('Error fetching podcast details:', error);
    return null;
  }
}
