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

export async function fetchBrightcoveVideos({playlist = false, limit, offset = 0, screen = false }: {playlist?: boolean; limit?: number; offset?: number; screen?: boolean;}): Promise<BrightcoveVideo[]> {
  try {
    const params = new URLSearchParams();
    params.append('playlist', String(playlist));
    params.append('offset', String(offset));
    if (limit !== undefined) {
      params.append('limit', String(limit));
    }
    const url = `https://www.houstonpublicmedia.org/wp-json/hpm-video/v1/list/?${params.toString()}`;
    const res = await fetch(url);
    const json = await res.json();
    return json?.data?.videos ?? [];
  } catch (error) {
    console.log("Error fetching videos:", error);
    return [];
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