import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	ImageBackground,
	Image,
} from 'react-native';
import { TalkshowEntry } from '../type';
import YoutubePlayerNew from 'react-native-youtube-iframe';

interface TalkshowCardProps {
	talkshow: TalkshowEntry;
	showSlug: string;
	onPress?: () => void;
}

const TalkshowCard: React.FC<TalkshowCardProps> = ({ talkshow, showSlug, onPress }) => {
	const { live, id, title } = talkshow;
	const displayName = (talkshow.showName || '').toString();
	const isHelloHouston = showSlug.includes('hello-houston');

	const playerHeight = 200;
	const liveBadgeText = 'LIVE';
	const watchLiveLabel = 'WATCH LIVE';

	const screenWidth = Dimensions.get('window').width;
	const cardPadding = 24;
	const containerMargin = 32;
	const videoWidth = screenWidth - cardPadding - containerMargin;

	const HeaderContent = () => (
		<View style={styles.header}>
			<Text style={styles.watchLiveLabel}>{watchLiveLabel}</Text>
			<Text style={styles.showNameLink}>{displayName}</Text>
			{title && <Text style={styles.episodeTitle}>{title}</Text>}
			{live && (
				<View style={styles.liveBadge}>
					<Text style={styles.liveText}>{liveBadgeText}</Text>
				</View>
			)}
		</View>
	);

	const VideoPlayer = () =>
		id ? (
			<View style={styles.videoContainer}>
				<YoutubePlayerNew
					width={videoWidth}
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
		) : null;

	return (
		<View style={[styles.container, isHelloHouston ? styles.helloBg : styles.hmBg]}>
			<Image
				source={{
					uri: isHelloHouston
						? 'https://cdn.houstonpublicmedia.org/assets/images/icons/hello-houston-logo.webp'
						: 'https://cdn.houstonpublicmedia.org/assets/images/icons/houston-matters-logo.webp',
				}}
				style={styles.cornerLogo}
			/>

			{/* HEADER ONLY IS CLICKABLE (safe for Samsung) */}
			<TouchableOpacity onPress={onPress} activeOpacity={0.8}>
				<HeaderContent />
			</TouchableOpacity>

			{isHelloHouston ? (
				<ImageBackground
					source={{
						uri: 'https://cdn.houstonpublicmedia.org/assets/images/Hello-Houston_Dot-Pattern-v3.png.webp',
					}}
					imageStyle={styles.bgImage}
					style={styles.innerPad}
				>
					<VideoPlayer />
				</ImageBackground>
			) : (
				<View style={styles.innerPad}>
					<VideoPlayer />
				</View>
			)}
		</View>
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
		color: '#fff',
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
		color: '#fff',
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
		borderRadius: 8,
		overflow: 'hidden',
		width: '100%',
		alignItems: 'center',
	},
});

export default TalkshowCard;