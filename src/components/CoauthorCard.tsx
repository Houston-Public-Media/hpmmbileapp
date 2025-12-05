import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Coauthor } from '../type';
import { FontAwesome, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface CoauthorCardProps {
  author: Coauthor;
}

const CoauthorCard: React.FC<CoauthorCardProps> = ({ author }) => {
  // Dummy data for now

  const avatar = author.extra?.image || '';
  const name = author.display_name || '';
  const user_nicename = author.user_nicename || '';
  const role = author.extra?.metadata?.title || '';
  const bio = author.extra?.biography || '';
  const plainTextBio = bio.replace(/<[^>]+>/g, ''); // strip HTML
  const displayBio = plainTextBio.slice(0, 250) + '...';
  const email = author.extra?.metadata?.email || '';
  const facebook = author.extra?.metadata?.facebook || '';
  const twitter = author.extra?.metadata?.twitter || '';
  const fediverse = author.extra?.metadata?.fediverse || '';
  const phone = author.extra?.metadata?.phone || '';
  const bluesky = author.extra?.metadata?.bluesky || '';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/staff/:${user_nicename}`)} style={styles.iconButton}>
          <Text style={styles.name}>
            {name}
            {!!role && <Text style={styles.role}>, {role}</Text>}
          </Text>
        </TouchableOpacity>
      </View>


      <View style={styles.contentRow}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.initials}>{name?.charAt(0)?.toUpperCase()}</Text>
            </View>
          )}
        </View>


        <View style={styles.bioAndIconsRow}>
          <View style={styles.bioContainer}>
            {!!bio && <Text style={styles.bioText} numberOfLines={100}>
              {displayBio}
            </Text>}
          </View>
          <View style={styles.socialIcons}>
            {email && (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)} style={styles.iconButton}>
                <Feather name="mail" size={20} color="#1877F2" />
              </TouchableOpacity>
            )}
            {twitter && (
              <TouchableOpacity onPress={() => Linking.openURL(twitter)} style={styles.iconButton}>
                <FontAwesome name="twitter-square" size={20} color="#1877F2" />
              </TouchableOpacity>
            )}
            {facebook && (
              <TouchableOpacity onPress={() => Linking.openURL(facebook)} style={styles.iconButton}>
                <FontAwesome name="facebook-square" size={20} color="#1877F2" />
              </TouchableOpacity>
            )}
            {fediverse && (
              <TouchableOpacity onPress={() => Linking.openURL(fediverse)} style={styles.iconButton}>
                <MaterialCommunityIcons name="mastodon" size={20} color="#6364FF" />
              </TouchableOpacity>
            )}
            {bluesky && (
              <TouchableOpacity onPress={() => Linking.openURL(bluesky)} style={styles.iconButton}>
                <MaterialCommunityIcons name="cloud-outline" size={20} color="#4A90E2" />
              </TouchableOpacity>
            )}
            {phone && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)} style={styles.iconButton}>
                <Feather name="phone" size={16} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  role: {
    color: '#4A90E2', // or '#999999' for a neutral gray
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '400',
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatarContainer: {
    marginRight: 12,
  },

  avatar: {
    width: 60,
    height: 75,
    borderRadius: 2,
    backgroundColor: '#3E3E3E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: '#4A90E2',
  },

  initials: {
    color: '#4A90E2',
    fontSize: 20,
    fontWeight: 'bold',
  },

  bioContainer: {
    flex: 1,
  },

  bioText: {
    fontSize: 12,
    color: '#B0B0B0',
    lineHeight: 16,
  },

  socialRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 10,
  },
  bioAndIconsRow: {
    //flexDirection: 'row',
    alignItems: 'flex-end',  // align icons and bio bottom-aligned
    marginTop: 8,
    flex: 1,
    justifyContent: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    alignItems: 'center', // <-- This vertically centers children
    marginLeft: 'auto',
    gap: 4,
    marginTop: 4,

  },
  iconButton: {
    marginLeft: 8,
    justifyContent: 'center',
  },
});

export default CoauthorCard;
