import React from 'react';
import { Image, TouchableOpacity, Linking } from 'react-native';

type Props = {
  content: string;
};

export default function PromoBanner({ content }: Props) {
  // Extract image src, href, and alt from the HTML string
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/);
  const linkMatch = content.match(/<a[^>]+href="([^"]+)"/);

  if (!imgMatch || !linkMatch) return null;

  const imageUrl = imgMatch[1];
  const altText = imgMatch[2];
  const linkUrl = linkMatch[1];

  return (
    <TouchableOpacity onPress={() => Linking.openURL(linkUrl)} style={{ marginVertical: 8, alignItems: 'center',  width: 100, height: 90, }}>
      <Image source={{ uri: imageUrl }} style={{ width: "100%", height: "100%", resizeMode: 'cover' }} alt={altText} />
    </TouchableOpacity>
  );
}