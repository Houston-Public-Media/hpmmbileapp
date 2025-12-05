import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const SectionFooter = () => {
  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={() => Linking.openURL(`https://www.facebook.com/houstonpublicmedia`)}>
        <FontAwesome name="facebook-square" size={30} color="#3b5998" style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL(`https://twitter.com/houstonpubmedia`)}>
        <FontAwesome name="twitter-square" size={30} color="#00acee" style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/houstonpubmedia`)}>
        <FontAwesome name="instagram" size={30} color="#C13584" style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL(`https://www.youtube.com/user/houstonpublicmedia`)}>
        <FontAwesome5 name="youtube-square" size={30} color="#ea3223" style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL(`https://www.threads.net/@houstonpubmedia`)}>
        <Image source={require('../assets/icons/threads-new.png')} style={styles.icon} />      
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL(`https://linkedin.com/company/houstonpublicmedia`)}>
        <FontAwesome name="linkedin-square" size={30} color="#0077B5" style={styles.icon} />
      </TouchableOpacity>
     
      <TouchableOpacity onPress={() => Linking.openURL(`https://mastodon.social/@houstonpublicmedia`)}>
        <MaterialCommunityIcons name="mastodon" size={30} color="#6364FF" style={styles.icon} />
      </TouchableOpacity>     
    </View>
  );
};
const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: '#f9f6f6',
    borderWidth: 1,
    borderColor: '#e7e7e7',
  },
  icon: {
    marginHorizontal: 10,
  }, 
});
export default SectionFooter;