// src/services/promoApi.ts

export interface Promo {
    type: string;
    location: string;
    content: string; // HTML string
  }
  
  export async function fetchPromos(): Promise<Promo[]> {
    const response = await fetch('https://www.houstonpublicmedia.org/wp-json/hpm-promos/v1/list');
    const json = await response.json();
    return json?.data?.promos || [];
  }