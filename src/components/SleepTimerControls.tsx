import React, {useEffect, useRef, useState} from 'react';
import {Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useHPMAudio} from '../contexts/HPMAudioContext';
import {MaterialIcons} from '@expo/vector-icons';
import {color} from '../utils/colorUtils';
import RBSheet from 'react-native-raw-bottom-sheet';
import {Picker} from '@react-native-picker/picker';
import {SleepState} from "../services/HPMAudioService";
const {height: SCREEN_HEIGHT} = Dimensions.get("window");

const SleepTimerControls = () => {
	// Use universal audio context
	const {
		getSleep,
		setSleep,
		cancelSleep
	} = useHPMAudio();
	// @ts-ignore
	const refRBSheet = useRef();
	const [selectedHour, setSelectedHour] = useState(0);
	const [selectedMinute, setSelectedMinute] = useState(0);
	const [selectedTimer, setSelectedTimer] = useState('Not Set');

	const opacityAnimation = useRef(new Animated.Value(1)).current;

	const sleepTimer = async () => {
		const sleep = await getSleep();
		if (sleep.state === SleepState.None) {
			setSelectedTimer("Not Set");
			return "Not Set";
		} else {
			const endTime = new Date(sleep.timer);
			const timeFormatted = endTime.toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			});
			setSelectedTimer(timeFormatted);
			return timeFormatted;
		}
	};
	const setSleepTimer = async () => {
		const ahead = ( ( selectedHour * 60 * 60 ) + ( selectedMinute * 60 ) ) * 1000;
		const now = new Date();
		const endTime = new Date( now.getTime() + ahead );
		const timeFormatted = endTime.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
		setSelectedTimer(timeFormatted);
		await setSleep(ahead);
	}
	const cancelSleepTimer = async () => {
		await cancelSleep();
		setSelectedTimer('Not Set');
		setSelectedHour(0);
		setSelectedMinute(0);
	}
	sleepTimer();
	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(opacityAnimation, {
					toValue: 0,
					duration: 2000,
					useNativeDriver: true,
					easing: Easing.ease
				}),
				Animated.timing(opacityAnimation, {
					toValue: 1,
					duration: 2000,
					useNativeDriver: true,
					easing: Easing.ease
				})
			])
		).start();
	}, []);

	return (
		<>
			<View style={styles.controlsSection}>
				<TouchableOpacity
					style={[
						styles.timerButtonContainer,
						selectedTimer !== 'Not Set' && styles.enabledButton
					]}
					// @ts-ignore
					onPress={() => refRBSheet.current.open()}
				>
					<Animated.View style={[ styles.timerButton, { opacity: opacityAnimation } ]}>
						{(selectedTimer !== 'Not Set') ? (
						<MaterialIcons
							name="snooze"
							size={32}
							color={color.primary}
						/>
						) : ''}
					</Animated.View>
					{(selectedTimer === 'Not Set') ? (
					<View style={styles.timerButton}>
						<MaterialIcons
							name="snooze"
							size={32}
							color='#808080'
						/>
					</View>
					) : ''}
				</TouchableOpacity>
			</View>
			<RBSheet
				// @ts-ignore
				ref={refRBSheet}
				useNativeDriver={false}
				customStyles={{
					wrapper: {
						backgroundColor: 'rgba(0,0,0,0.35)',
					},
					draggableIcon: {
						backgroundColor: '#000',
					},
				}}
				customModalProps={{
					animationType: 'slide',
					statusBarTranslucent: true,
				}}
				draggable={true}
				dragOnContent={false}
				customAvoidingViewProps={{
					enabled: false,
				}}
				height={SCREEN_HEIGHT / 2}
				closeOnPressBack={true}
			>
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end',
					paddingHorizontal: 12,
					paddingVertical: 8,
					gap: 24,
					width: '100%',
					position: 'relative'
				}}>
					<TouchableOpacity
						style={{
							width: 32,
							height: 32,
							borderRadius: 16,
							justifyContent: 'center',
							alignItems: 'center',
							elevation: 5,
							position: 'absolute',
							top: -16,
							right: 8
						}}
						// @ts-ignore
						onPress={() => refRBSheet.current.close()}
					>
						<View style={{
							width: 32,
							height: 32,
							alignItems: 'center',
							justifyContent: 'center'
						}}>
							<MaterialIcons
								name="close"
								size={32}
								color={'#808080'}
							/>
						</View>
					</TouchableOpacity>
				</View>
				<View style={{
					backgroundColor: '#fff',
					paddingHorizontal: 12,
					paddingTop: 10,
					elevation: 4,
					paddingBottom: 100}}>
					<View style={{display: 'flex', flexDirection: 'row', gap: 8}}>
						<Text style={{fontWeight: "bold", fontSize: 16, flex: 1}}>Sleep Timer:</Text>
						<Text style={{fontSize: 16, flex: 2}}>{selectedTimer}</Text>
					</View>
					<View style={styles.topRow}>
						<View style={{width: '50%'}}>
							<Picker
								selectedValue={selectedHour}
								onValueChange={(itemValue, itemIndex) =>
									setSelectedHour(itemValue)
								}>
								<Picker.Item label="0 Hours" value="0" />
								<Picker.Item label="1 Hour" value="1" />
								<Picker.Item label="2 Hours" value="2" />
								<Picker.Item label="3 Hours" value="3" />
								<Picker.Item label="4 Hours" value="4" />
								<Picker.Item label="5 Hours" value="5" />
								<Picker.Item label="6 Hours" value="6" />
								<Picker.Item label="7 Hours" value="7" />
								<Picker.Item label="8 Hours" value="8" />
								<Picker.Item label="9 Hours" value="9" />
								<Picker.Item label="10 Hours" value="10" />
								<Picker.Item label="11 Hours" value="11" />
								<Picker.Item label="12 Hours" value="12" />
							</Picker>
						</View>
						<View style={{width: '50%'}}>
							<Picker
								selectedValue={selectedMinute}
								onValueChange={(itemValue, itemIndex) =>
									setSelectedMinute(itemValue)
								}>
								<Picker.Item label="0 Minutes" value="0" />
								<Picker.Item label="1 Minutes" value="1" />
								<Picker.Item label="2 Minutes" value="2" />
								<Picker.Item label="3 Minutes" value="3" />
								<Picker.Item label="4 Minutes" value="4" />
								<Picker.Item label="5 Minutes" value="5" />
								<Picker.Item label="6 Minutes" value="6" />
								<Picker.Item label="7 Minutes" value="7" />
								<Picker.Item label="8 Minutes" value="8" />
								<Picker.Item label="9 Minutes" value="9" />
								<Picker.Item label="10 Minutes" value="10" />
								<Picker.Item label="11 Minutes" value="11" />
								<Picker.Item label="12 Minutes" value="12" />
								<Picker.Item label="13 Minutes" value="13" />
								<Picker.Item label="14 Minutes" value="14" />
								<Picker.Item label="15 Minutes" value="15" />
								<Picker.Item label="16 Minutes" value="16" />
								<Picker.Item label="17 Minutes" value="17" />
								<Picker.Item label="18 Minutes" value="18" />
								<Picker.Item label="19 Minutes" value="19" />
								<Picker.Item label="20 Minutes" value="20" />
								<Picker.Item label="21 Minutes" value="21" />
								<Picker.Item label="22 Minutes" value="22" />
								<Picker.Item label="23 Minutes" value="23" />
								<Picker.Item label="24 Minutes" value="24" />
								<Picker.Item label="25 Minutes" value="25" />
								<Picker.Item label="26 Minutes" value="26" />
								<Picker.Item label="27 Minutes" value="27" />
								<Picker.Item label="28 Minutes" value="28" />
								<Picker.Item label="29 Minutes" value="29" />
								<Picker.Item label="30 Minutes" value="30" />
								<Picker.Item label="31 Minutes" value="31" />
								<Picker.Item label="32 Minutes" value="32" />
								<Picker.Item label="33 Minutes" value="33" />
								<Picker.Item label="34 Minutes" value="34" />
								<Picker.Item label="35 Minutes" value="35" />
								<Picker.Item label="36 Minutes" value="36" />
								<Picker.Item label="37 Minutes" value="37" />
								<Picker.Item label="38 Minutes" value="38" />
								<Picker.Item label="39 Minutes" value="39" />
								<Picker.Item label="40 Minutes" value="40" />
								<Picker.Item label="41 Minutes" value="41" />
								<Picker.Item label="42 Minutes" value="42" />
								<Picker.Item label="43 Minutes" value="43" />
								<Picker.Item label="44 Minutes" value="44" />
								<Picker.Item label="45 Minutes" value="45" />
								<Picker.Item label="46 Minutes" value="46" />
								<Picker.Item label="47 Minutes" value="47" />
								<Picker.Item label="48 Minutes" value="48" />
								<Picker.Item label="49 Minutes" value="49" />
								<Picker.Item label="50 Minutes" value="50" />
								<Picker.Item label="51 Minutes" value="51" />
								<Picker.Item label="52 Minutes" value="52" />
								<Picker.Item label="53 Minutes" value="53" />
								<Picker.Item label="54 Minutes" value="54" />
								<Picker.Item label="55 Minutes" value="55" />
								<Picker.Item label="56 Minutes" value="56" />
								<Picker.Item label="57 Minutes" value="57" />
								<Picker.Item label="58 Minutes" value="58" />
								<Picker.Item label="59 Minutes" value="59" />
							</Picker>
						</View>
					</View>
					<View style={styles.bottomRow}>
						<TouchableOpacity
							style={[
								styles.bottomRowButton,
								{ backgroundColor: color.primary }
							]}
							onPress={() => setSleepTimer()}
						>
							<Text style={{fontSize: 14, fontWeight: 'bold', color: '#fff'}}>Set Timer</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.bottomRowButton,
								{ backgroundColor: "#C8102E" }
							]}
							onPress={() => cancelSleepTimer()}
						>
							<Text style={{fontSize: 14, fontWeight: 'bold', color: '#fff'}}>Cancel Timer</Text>
						</TouchableOpacity>
					</View>
				</View>
			</RBSheet>
		</>
	);
};
const styles = StyleSheet.create({
	topRow: {
		flexDirection: 'row',
		paddingBottom: 8,
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	controlsSection: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		paddingHorizontal: 8,
		paddingVertical: 8,
		gap: 24,
		width: '100%',
		height: 100
	},
	bottomRow: {
		flexDirection: 'row',
		paddingBottom: 8,
		justifyContent: 'flex-end',
		alignItems: 'center',
		gap: 24
	},
	timeText: {
		color: "#000",
		fontSize: 12,
		fontWeight: "700",
		textAlign: "center",
		width: 44,
	},
	timerButtonContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: color.primary,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 5,
	},
	timerButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	enabledButton: {
		backgroundColor: '#f0f0f0'
	},
	bottomRowButton: {
		width: 'auto',
		height: 36,
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: color.primary,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 5,
	}
});
export default SleepTimerControls;