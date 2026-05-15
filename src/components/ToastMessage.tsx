import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {FadeInUp, FadeOutUp} from 'react-native-reanimated';
import {FontAwesome5} from '@expo/vector-icons';
import {RemoteMessage} from "@react-native-firebase/messaging";

export type ToastMessageRef = {
	show: () => void;
	hide: () => void;
};

type ToastMessageProps = {
	message?: RemoteMessage,
	onPress?: () => void
};

// eslint-disable-next-line react/display-name
const ToastMessage = forwardRef<ToastMessageRef, ToastMessageProps>(({message, onPress}, ref) => {

		const [isVisible, setIsVisible] = useState(false);

		const showToast = () => {
			setIsVisible(true);
			const timer = setTimeout(() => {
				setIsVisible(false);
				clearTimeout(timer);
			}, 7500);
		};
		const hideToast = () => {
			setIsVisible(false);
		};

		useImperativeHandle(ref, () => ({
			show: showToast,
			hide: hideToast
		}));

		return (
			<>
				{isVisible && (
					<Animated.View
						style={styles.animatedView}
						entering={FadeInUp.delay(200)}
						exiting={FadeOutUp}
					>
						<TouchableOpacity onPress={onPress} style={styles.tapZone}>
							<FontAwesome5 name={'info-circle'} size={40} color="#2ecc71" />
							<View style={{marginLeft: 12}}>
								<Text style={{fontSize: 16, fontWeight: '600', color: '#000'}}>{message?.notification?.title}</Text>
								<Text style={{fontSize: 14, fontWeight: '400', color: '#000'}}>{message?.notification?.body}</Text>
							</View>
						</TouchableOpacity>
					</Animated.View>
				)}
			</>
		);
	}
);

const styles = StyleSheet.create({
	animatedView: {
		position: 'absolute',
		top: 75,
		width: '100%',
		height: 124,
		flexDirection: 'row',
		alignItems: 'center',
		elevation: 100
	},
	notifImage: {
		width: 40,
		height: 40
	},
	tapZone: {
		flexDirection: 'row',
		alignItems: 'center',
		width: "90%",
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		borderRadius: 10,
		borderColor: '#2ecc71',
		borderWidth: 1,
		padding: 16,
		marginHorizontal: "5%"
	}
});

export default ToastMessage;
