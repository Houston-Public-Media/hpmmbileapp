export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  picture: string;
  permalink: string;
  date: string;
  date_gmt: string;
  primary_category: {
    name: string;
    slug: string;
    id: number;
  };
}

export interface BrightcoveVideo {
  id: string;
  name: string;
  poster?: string;
};

export interface BrightCoveVideo {
  id: string;  // string id for React keys
  name: string; // video title
  duration: number;
  poster: string; 
  sources: { src: string; type: string }[]; // HLS/mp4 sources
  onPress?: () => void;
}



export interface MediaDetails {
  source_url: string;
  // Add other media properties as needed
}

export interface Author {
  name: string;
  // Add other author properties as needed
}

export interface Embedded {
  'wp:featuredmedia'?: { source_url: string }[];
  author?: Author[];
  // Add other embedded resources as needed
}

export interface NewsDetail {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media?: number;
  _embedded?: Embedded;
  // Keep the legacy property for backward compatibility
  featured_media_url?: string;
  coauthors?: Coauthor[];
}

export interface Weather {
  icon: string;
  description: string;
  temperature: string;
}
export interface Breaking {
  id: number;
  title: string;
  type: string;
}

export interface HomepageApiResponse {
  code: string;
  message: string;
  data: {
    articles: NewsArticle[];
    breaking: Breaking;
    talkshow: string;
    weather: Weather;
    status: number;
  };
}

export interface WeatherApiResponse {
  code: string;
  message: string;
  data: {
    articles: NewsArticle[];
    breaking: Breaking;
    talkshow: string;
    weather: Weather;
    status: number;
  };
}

export interface Talkshow {
  type: string;
}

export interface TalkshowEntry {
  live: boolean;
  id: string;
  title: string;
  embed: string;
  description: string;
  showName: string;
  showSlug: string;
  email: string;
  phone: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface TalkshowResponse {
  talkshow: TalkshowEntry[];
}

export interface Coauthor {
  display_name: string;
  user_nicename: string;
  guest_author: boolean;
  extra?: {
    biography?: string;
    image?: string;
    metadata?: {
      title?: string;
      email?: string;
      twitter?: string;
      [key: string]: any;
    };
    title?: string;
    email?: string;
    twitter?: string;
  };
}