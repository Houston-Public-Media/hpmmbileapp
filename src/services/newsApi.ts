// src/services/newsApi.ts

import { Weather, NewsArticle, NewsDetail, BrightcoveVideo } from '../type';

export async function fetchWeather(): Promise<Weather> {
  const response = await fetch('https://www.houstonpublicmedia.org/wp-json/hpm-priority/v1/list');
  const json = await response.json();
  return json?.data?.weather || {};
}

export async function fetchPriorityData() {
  try {
    const response = await fetch('https://www.houstonpublicmedia.org/wp-json/hpm-priority/v1/list');
    const json = await response.json();
    return json?.data || {};
  } catch (error) {
    console.log('Priority API error:', error);
    return {};
  }
}

export async function fetchBCVideos(): Promise<BrightcoveVideo[]> {
  try {
    const res = await fetch(`https://www.houstonpublicmedia.org/wp-json/hpm-video/v1/list/?playlist=false&limit=12`);
    const json = await res.json();
    const videosList = json?.data?.videos ?? [];
    return videosList;
  } catch (error) {
    console.log("Error fetching videos:", error);
    return [];
  }
}

export async function fetchBCVideoGrid(offset = 0): Promise<BrightcoveVideo[]> {
  try {
    const res = await fetch(`https://www.houstonpublicmedia.org/wp-json/hpm-video/v1/list/?playlist=false&offset=${offset}`);
    const json = await res.json();
    const videosList = json?.data?.videos ?? [];
    return videosList;
  } catch (error) {
    console.log("Error fetching videos:", error);
    return [];
  }
}

export async function fetchNewsArticle(id: number): Promise<NewsArticle | null> {
  try {
    const response = await fetch(`https://www.houstonpublicmedia.org/wp-json/hpm-priority/v1/article/${id}`);
    const json = await response.json();
    return json?.data?.article || null;
  } catch (error) {
    return null;
  }
}

export async function fetchNewsArticleById(id: number): Promise<NewsDetail | null> {
  try {
    const response = await fetch(`https://www.houstonpublicmedia.org/wp-json/wp/v2/posts/${id}`); //${id}524447
    const json = await response.json();
    return json || null;
  } catch (error) {
    return null;
  }
}

export async function fetchNewsByCategoryId(
  categoryIds: number,
  perPage: number = 10
): Promise<NewsDetail[]> {
  try {
    const ids = categoryIds;
    const url = `https://www.houstonpublicmedia.org/wp-json/wp/v2/posts/?categories=${ids}&per_page=${perPage}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).response = response;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      //console.error('Error fetching news by categories:', error.message);
    }
    throw error;
  }
}