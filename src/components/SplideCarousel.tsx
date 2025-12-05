import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';

interface SlideData {
  imageUrl: string;
  alt: string;
  caption: string;
  fullSizeUrl?: string;
}

interface SplideCarouselProps {
  slides: SlideData[];
  width: number;
}

const SplideCarousel: React.FC<SplideCarouselProps> = ({ slides, width }) => {
  const aspectRatio = 3 / 4;
  const imageHeight = width * aspectRatio;
  const progress = useSharedValue(0);
  const carouselRef = React.useRef<any>(null);

  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const renderItem = ({ item }: { item: SlideData }) => (
    <View style={styles.slide}>
      <TouchableOpacity activeOpacity={0.9} style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.image, { height: imageHeight, width: '100%' }]}
          resizeMode="cover"
          accessibilityLabel={item.alt}
        />
        {item.caption ? (
          <View style={styles.captionContainer}>
            <Text style={styles.caption} numberOfLines={3}>
              {item.caption}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { width, marginVertical: 0, marginBottom: 0, padding: 0 }]}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={width}
        height={imageHeight}
        autoPlay={false}
        data={slides}
        onProgressChange={(offsetProgress: number, absoluteProgress: number) => {
          progress.value = absoluteProgress;
        }}
        scrollAnimationDuration={1000}
        renderItem={renderItem}
      />
      {slides.length > 1 && (
        <Pagination.Basic
          progress={progress}
          data={slides}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          containerStyle={[styles.paginationContainer]}
          onPress={onPressPagination}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    marginTop: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
  slide: {
    flex: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  caption: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  paginationContainer: {
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginHorizontal: 4,
  },
});

export default SplideCarousel;