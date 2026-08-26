import React, { useEffect, useState } from 'react'
import { Linking, StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import { fetchWeather } from '../services/newsApi';
import { Weather } from '../type';

// Function to decode HTML entities
import { cleanText } from '../utils/htmlUtils';

const { width: screenWidth } = Dimensions.get('window');

const logoWidth = Math.min(220, screenWidth - 145);

export const Header: React.FC = () => {
	const navigation = useNavigation<DrawerNavigationProp<any>>();
	const [weather, setWeather] = useState<Weather>({
		icon: '',
		description: '',
		temperature: '',
	});

	// Format date as "May 25, 2025"
	const currentDate = new Date().toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	useEffect(() => {
		fetchWeather()
			.then(data => {
				setWeather(data);
			});
	}, []);

	// Decode temperature string
	const decodedTemperature = weather.temperature ? cleanText(weather.temperature) : '';

	const handleLogoPress = () => {
		// Open the drawer
		navigation.openDrawer();
	};

	return (
		<View style={styles.header}>
			<TouchableOpacity onPress={handleLogoPress}>
				<Image source={{uri: `https://cdn.houstonpublicmedia.org/assets/images/houston-public-media-logo.png`}} style={styles.logo} />
			</TouchableOpacity>
			<TouchableOpacity style={styles.donateButton}
			                  onPress={() => Linking.openURL('https://www.houstonpublicmedia.org/donate')}
			>
				<Text style={styles.donateButtonText}>Donate</Text>
			</TouchableOpacity>
			<View style={styles.textContainer}>
				<Text style={styles.dateText}>{currentDate}</Text>
				<View style={styles.weatherContainer}>
					{weather.icon && (
						<Image
							source={{ uri: weather.icon }}
							style={styles.weatherIcon}
							alt={weather.description}
						/>
					)}
					<Text style={styles.tempText}>{decodedTemperature}</Text>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		backgroundColor: '#222054',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 10,
		height: 85,
		flexDirection: 'row',
		flexWrap: 'wrap'
	},
	logo: {
	width: logoWidth,
	height: 32,
	marginRight: 8,
	resizeMode: 'contain',
},

	textContainer: {
		justifyContent: 'space-between',
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		paddingBlockStart: 5
	},
	dateText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: 'bold',
		/*marginBottom: 4,*/
	},
	weatherContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	weatherIcon: {
		width: 24,
		height: 24,
	},
	tempText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: 'bold',
	},
	donateButton: {
	paddingHorizontal: 8,
	paddingVertical: 7,
	borderRadius: 14,
	backgroundColor: '#C8102E',
},

	donateButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: 'bold',
	}
})