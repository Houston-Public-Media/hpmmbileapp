import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

const SectionFooter = () => {
	return (
		<View style={styles.footerContainer}>
			<TouchableOpacity onPress={() => Linking.openURL(`https://www.facebook.com/houstonpublicmedia`)}>
				<FontAwesome6 name="square-facebook" size={30} color="#3b5998" style={styles.icon} />
			</TouchableOpacity>

			<TouchableOpacity onPress={() => Linking.openURL(`https://twitter.com/houstonpubmedia`)}>
				<FontAwesome6 name="square-x-twitter" size={30} color="#000000" style={styles.icon} />
			</TouchableOpacity>

			<TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/houstonpubmedia`)}>
				<FontAwesome6 name="instagram" size={30} color="#C13584" style={styles.icon} />
			</TouchableOpacity>

			<TouchableOpacity onPress={() => Linking.openURL(`https://www.youtube.com/user/houstonpublicmedia`)}>
				<FontAwesome6 name="square-youtube" size={30} color="#ea3223" style={styles.icon} />
			</TouchableOpacity>

			<TouchableOpacity onPress={() => Linking.openURL(`https://www.threads.net/@houstonpubmedia`)}>
				<FontAwesome6 name="square-threads" size={30} color="#000000" style={styles.icon} />
			</TouchableOpacity>

			<TouchableOpacity onPress={() => Linking.openURL(`https://linkedin.com/company/houstonpublicmedia`)}>
				<FontAwesome6 name="linkedin" size={30} color="#0077B5" style={styles.icon} />
			</TouchableOpacity>
		 
			<TouchableOpacity onPress={() => Linking.openURL(`https://mastodon.social/@houstonpublicmedia`)}>
				<FontAwesome6 name="mastodon" size={30} color="#6364FF" style={styles.icon} />
			</TouchableOpacity>
		</View>
	);
};
const styles = StyleSheet.create({
	footerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 5,
		paddingHorizontal: 25,
		backgroundColor: '#f9f6f6',
		borderWidth: 1,
		borderColor: '#e7e7e7',
	},
	icon: {
		// marginHorizontal: 10,
	}, 
});
export default SectionFooter;