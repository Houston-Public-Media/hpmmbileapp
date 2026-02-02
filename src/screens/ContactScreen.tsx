// src\screens\ContactScreen.tsx

import React, { JSX } from 'react';
import {
	View,
	StyleSheet,
	Linking,
	Text,
	TouchableOpacity,
	ScrollView,
	Image
} from 'react-native';
import { color } from '../utils/colorUtils';
import ScreenHeader from '../components/ScreenHeader';
import BreakingBanner from '../components/BreakingBanner';
import TalkshowBanner from '../components/TalkshowBanner';
import AudioFooter from '../components/AudioFooter';
import { FontAwesome6 } from '@expo/vector-icons';


function ContactScreen(): JSX.Element {
	return (
		<>
			<BreakingBanner />
			<TalkshowBanner />
			<ScreenHeader 
				title="Contact Us"
				description="We're social, and we'd love to hear from you!"
			/>
			<ScrollView style={styles.container}>
				<Text style={styles.header}>Get in Touch</Text>
				{/* Call HPM */}
				<View style={styles.trackItem}>
					<TouchableOpacity onPress={() => Linking.openURL(`tel://1-713-748-8888`)}>
						<View style={styles.cardLayout}>
							<View style={styles.rightSection}>
								<View style={styles.trackInfo}>
									<FontAwesome6 name="phone" color="#C8102E" style={styles.icon} />
									<Text style={styles.title}>Call Houston Public Media</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				</View>
				{/* Call HPM Member Services */}
				<View style={styles.trackItem}>
					<TouchableOpacity onPress={() => Linking.openURL(`tel://1-713-743-8483`)}>
						<View style={styles.cardLayout}>
							<View style={styles.rightSection}>
								<View style={styles.trackInfo}>
									<FontAwesome6 name="phone" color="#C8102E" style={styles.icon} />
									<Text style={styles.title}>Call Member Services</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				</View>
				{/* Email */}
				<View style={styles.trackItem}>
					<TouchableOpacity onPress={() => Linking.openURL(`mailto:membership@houstonpublicmedia.org?subject=HPM%20Member%20Services%20Query`)}>
						<View style={styles.cardLayout}>
							<View style={styles.rightSection}>
								<View style={styles.trackInfo}>
									<FontAwesome6 name="envelope" color="#C8102E" style={styles.icon} />
									<Text style={styles.title}>Email Member Services</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				</View>
				{/* Options */}
				<View style={styles.trackItem}>
					<TouchableOpacity onPress={() => Linking.openURL(`https://www.houstonpublicmedia.org/contact-us/`)}>
						<View style={styles.cardLayout}>
							<View style={styles.rightSection}>
								<View style={styles.trackInfo}>
									<FontAwesome6 name="link" color="#C8102E" style={styles.iconLink} />
									<Text style={styles.title}>More Ways to Get in Touch</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				</View>

				<Text style={styles.header}>Social Media</Text>
				<View style={styles.socialcontainer}>
					{/* YouTube */}
					<View style={styles.socialItem}>
						<TouchableOpacity onPress={() => Linking.openURL(`https://www.youtube.com/user/houstonpublicmedia`)}>
							<View style={styles.socialWrap}>
								<FontAwesome6 name="square-youtube" color="#ea3223" style={styles.socialIcon} />
								<Text style={styles.socialName}>YouTube</Text>
							</View>
						</TouchableOpacity>
					</View>
					{/* Instagram */}
					<View style={styles.socialItem}>
						<TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/houstonpubmedia`)}>
							<View style={styles.socialWrap}>
								<FontAwesome6 name="instagram" color="#C13584" style={styles.socialIcon} />
								<Text style={styles.socialName}>Instagram</Text>
							</View>
						</TouchableOpacity>
					</View>
					{/* Facebook */}
					<View style={styles.socialItem}>
						<TouchableOpacity onPress={() => Linking.openURL(`https://www.facebook.com/houstonpublicmedia`)}>
							<FontAwesome6 name="square-facebook" color="#3b5998" style={styles.socialIcon} />
							<Text style={styles.socialName}>Facebook</Text>
						</TouchableOpacity>
					</View>
					{/* Threads */}
					<View style={styles.socialItem}>
						<TouchableOpacity onPress={() => Linking.openURL(`https://www.threads.net/@houstonpubmedia`)}>
							<View style={styles.socialWrap}>
								<FontAwesome6 name="square-threads" color="#000000" style={styles.socialIcon} />
								<Text style={styles.socialName}>Threads</Text>
							</View>
						</TouchableOpacity>
					</View>
					{/* X */}
					<View style={styles.socialItem}>
						<TouchableOpacity onPress={() => Linking.openURL(`https://twitter.com/houstonpubmedia`)}>
							<View style={styles.socialWrap}>
								<FontAwesome6 name="square-x-twitter" color="#000000" style={styles.socialIcon} />
								<Text style={styles.socialName}>X</Text>
							</View>
						</TouchableOpacity>
					</View>
					{/* LinkedIn */}
					<View style={styles.socialItem}>
						<TouchableOpacity onPress={() => Linking.openURL(`https://linkedin.com/company/houstonpublicmedia`)}>
							<View style={styles.socialWrap}>
								<FontAwesome6 name="linkedin" color="#0077B5" style={styles.socialIcon} />
								<Text style={styles.socialName}>LinkedIn</Text>
							</View>
						</TouchableOpacity>
					</View>
					{/* Mastodon */}
					<View style={styles.socialItem}>
						<TouchableOpacity onPress={() => Linking.openURL(`https://mastodon.social/@houstonpublicmedia`)}>
							<View style={styles.socialWrap}>
								<FontAwesome6 name="mastodon" color="#6364FF" style={styles.socialIcon} />
								<Text style={styles.socialName}>Mastodon</Text>
							</View>
						</TouchableOpacity>
					</View>
					{/* Bluesky */}
					<View style={styles.socialItem}>
						<TouchableOpacity onPress={() => Linking.openURL(`https://bsky.app/profile/houstonpublicmedia.bsky.social`)}>
							<View style={styles.socialWrap}>
								<FontAwesome6 name="bluesky" color="#006aff" style={styles.socialIconBluesky} />
								<Text style={styles.socialName}>Bluesky</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>
				<Text style={styles.header}>Talk Shows</Text>
				{/* Houston Matters */}
				<View style={styles.trackItem}>
					<View style={styles.cardLayout}>
						<View style={styles.artworkContainer}>
							<Image 
								source={{ uri: 'https://cdn.houstonpublicmedia.org/wp-content/uploads/2024/09/05094519/HouM_Primary-Cover-1-450x450.jpg.webp' }} 
								style={styles.image}
								resizeMode="cover"
							/>
						</View>
						<View style={styles.rightSection}>
							<View style={styles.trackInfo}>
								<Text style={styles.title}>Houston Matters</Text>
								<TouchableOpacity onPress={() => Linking.openURL(`tel://1-713-440-8870`)}>
									<FontAwesome6 name="phone" color="#C8102E" style={styles.icon} />
								</TouchableOpacity>
								<TouchableOpacity onPress={() => Linking.openURL(`sms://1-713-440-8870`)}>
									<FontAwesome6 name="message" color="#C8102E" style={styles.icon} />
								</TouchableOpacity>
								<TouchableOpacity onPress={() => Linking.openURL(`mailto:talk@hellohouston.org`)}>
									<FontAwesome6 name="envelope" color="#C8102E" style={styles.icon} />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>

				{/* Hello Houston */}
				<View style={styles.trackItem}>
					<View style={styles.cardLayout}>
						<View style={styles.artworkContainer}>
							<Image 
								source={{ uri: 'https://cdn.houstonpublicmedia.org/wp-content/uploads/2025/03/31085137/HH_Podcast-Cover-450x450.jpg.webp' }} 
								style={styles.image}
								resizeMode="cover"
							/>
						</View>
						<View style={styles.rightSection}>
							<View style={styles.trackInfo}>
								<Text style={styles.title}>Hello Houston</Text>
								<TouchableOpacity onPress={() => Linking.openURL(`tel://1-713-440-8870`)}>
									<FontAwesome6 name="phone" color="#C8102E" style={styles.icon} />
								</TouchableOpacity>
								<TouchableOpacity onPress={() => Linking.openURL(`sms://1-713-440-8870`)}>
									<FontAwesome6 name="message" color="#C8102E" style={styles.icon} />
								</TouchableOpacity>
								<TouchableOpacity onPress={() => Linking.openURL(`mailto:hello@hellohouston.org`)}>
									<FontAwesome6 name="envelope" color="#C8102E" style={styles.icon} />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
				
			</ScrollView>
			<AudioFooter />
		</>
	);
}

const styles = StyleSheet.create({
	icon: {
		width: 28,
		fontSize: 28,
		textAlign: 'center',
		alignSelf: 'center'
	},
	iconLink: {
		width: 32,
		fontSize: 24,
		textAlign: 'center',
		alignSelf: 'center'
	},
	trackItem: {
		margin: 8,
		backgroundColor: '#fff',
		borderRadius: 14,
		padding: 12,
		borderWidth: 2,
		borderColor: 'transparent',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 4,
	},
	socialcontainer: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	socialItem: {
		marginVertical: 8,
		backgroundColor: '#fff',
		borderRadius: 14,
		padding: 12,
		borderWidth: 2,
		borderColor: 'transparent',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 4,
		marginHorizontal: '1%',
		width: '31%'
	},
	socialWrap: {
		flex: 1,
		alignContent: 'center',
		justifyContent: 'center',
		alignItems: 'center'
	},
	socialIcon: {
		width: 64,
		fontSize: 64,
		marginHorizontal: 'auto',
		textAlign: 'center'
	},
	socialIconBluesky: {
		width: 74,
		fontSize: 62,
		marginHorizontal: 'auto',
		textAlign: 'center'
	},
	socialName: {
		color: '#666666',
		fontSize: 13,
		fontWeight: '500',
		lineHeight: 16,
		paddingBlockStart: 4,
		textAlign: 'center'
	},
	cardLayout: {
		flexDirection: 'row',
		alignItems: 'stretch',
		flexWrap: 'nowrap'
	},
	artworkContainer: {
		position: 'relative',
		width: 42,
		height: 42,
		borderRadius: 12,
		overflow: 'hidden',
		marginRight: 12,
		alignItems: 'center'
	},
	image: {
		width: '100%',
		height: '100%'
	},
	rightSection: {
		flex: 1,
		justifyContent: 'space-between',
		paddingVertical: 4,
	},
	trackInfo: {
		flex: 2,
		justifyContent: 'space-between',
		paddingRight: 8,
		flexDirection: 'row',
		flexWrap: 'nowrap',
		alignContent: 'center',
		gap: 12
	},
	title: {
		color: '#1a1a1a',
		fontSize: 16,
		fontWeight: '700',
		lineHeight: 20,
		alignSelf: 'center',
		flex: 1
	},
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 10,
	},
	listContainer: {
		flex: 1,
		paddingBottom: 20,
	},
	header: {
		padding: 8,
		marginBottom: 5,
		color: '#222054',
		fontWeight: 'bold',
		fontSize: 16
	}
})


export default ContactScreen;