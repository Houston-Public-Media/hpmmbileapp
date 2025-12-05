import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, ImageBackground, Image } from 'react-native';
import YouTubePlayer from './YouTubePlayer';
import { color } from '../utils/colorUtils';
import { TalkshowEntry } from '../type';
import YoutubePlayerNew from 'react-native-youtube-iframe';

interface TalkshowCardProps {
  talkshow: TalkshowEntry;
  showSlug: string;
  onPress?: () => void;
}

const TalkshowCard: React.FC<TalkshowCardProps> = ({ 
  talkshow, 
  showSlug, 
  onPress 
}) => {
  const { live, id, title, description } = talkshow;
  const displayName = (talkshow.showName || '').toString();
  const isHelloHouston = showSlug.includes('hello-houston');
  const numberOfLines = 10;
  const playerHeight = 200;
  const liveBadgeText = 'LIVE';
  const watchLiveLabel = 'WATCH LIVE';
  
  const screenWidth = Dimensions.get('window').width;
  const cardPadding = 24;
  const containerMargin = 32;
  const videoWidth = screenWidth - cardPadding - containerMargin;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {isHelloHouston ? (
        <ImageBackground
          source={{ uri: 'https://cdn.houstonpublicmedia.org/assets/images/Hello-Houston_Dot-Pattern-v3.png.webp' }}
          imageStyle={styles.bgImage}
          style={[styles.container, styles.helloBg]}
        >
          <Image
            source={{ uri: 'https://cdn.houstonpublicmedia.org/assets/images/icons/hello-houston-logo.webp' }}
            style={styles.cornerLogo}
          />
          <View style={styles.innerPad}>
            <View style={styles.header}>
              <Text style={styles.watchLiveLabel}>{watchLiveLabel}</Text>
              <Text style={styles.showNameLink}>{displayName}</Text>
              {title && (
                <Text style={styles.episodeTitle}>{title}</Text>
              )}
              {live && (
                <View style={styles.liveBadge}><Text style={styles.liveText}>{liveBadgeText}</Text></View>
              )}
            </View>

            {id && (
              // <View style={styles.videoContainer}>
              //   <YouTubePlayer
              //     src={`https://www.youtube.com/embed/${id}`}
              //     width={videoWidth}
              //     height={playerHeight}
              //   />
              // </View>
              
      <YoutubePlayerNew
    width={"100%"}
    height={playerHeight}
    play={false}   
    videoId={id}
    webViewProps={{
      allowsInlineMediaPlayback: true,
      javaScriptEnabled: true,
      domStorageEnabled: true,
    }}
  />
    
            )}

            
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.container, styles.hmBg]}>
          <Image
            source={{ uri: 'https://cdn.houstonpublicmedia.org/assets/images/icons/houston-matters-logo.webp' }}
            style={styles.cornerLogo}
          />
          <View style={styles.header}>
            <Text style={styles.watchLiveLabel}>{watchLiveLabel}</Text>
            <Text style={styles.showNameLink}>{displayName}</Text>
            {title && (
              <Text style={styles.episodeTitle}>{title}</Text>
            )}
            {live && (
              <View style={styles.liveBadge}><Text style={styles.liveText}>{liveBadgeText}</Text></View>
            )}
          </View>

          {id && (
            <View style={styles.videoContainer}>
              {/* <YouTubePlayer
                src={`https://www.youtube.com/watch?v=${id}`}
                width={videoWidth}
                height={playerHeight}
              /> */}
             
              <YoutubePlayerNew
    width={"100%"}
    height={playerHeight}
    play={false}   
    videoId={id}
    webViewProps={{
      allowsInlineMediaPlayback: true,
      javaScriptEnabled: true,
      domStorageEnabled: true,
    }}
  />
            </View>
          )}

          
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  innerPad: {
    padding: 12,
  },
  hmBg: {
    backgroundColor: '#4ee9c6',
    borderColor: '#20a68b',
    borderWidth: 1,
  },
  helloBg: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cfcfe8',
    backgroundColor: 'rgb(119, 135, 247)',
  },
  bgImage: {
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cornerLogo: {
    position: 'absolute',
    top: -24,
    right: -8,
    width: 100,
    height: 100,
    opacity: 0.25,
    resizeMode: 'contain',
  },
  header: {
    marginBottom: 12,
  },
  watchLiveLabel: {
    alignSelf: 'flex-start',
    backgroundColor: '#18316f',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    fontWeight: '700',
  },
  showNameLink: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  liveBadge: {
    backgroundColor: '#ff0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
  },
  videoContainer: {
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 13,
    color: '#000',
    lineHeight: 10,
  },
});

export default TalkshowCard;