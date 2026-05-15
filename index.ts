import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './src/services/HPMAudioService';
// eslint-disable-next-line import/no-named-as-default
import PushNotificationService from "./src/services/PushNotificationService";
import { setBackgroundMessageHandler } from "@react-native-firebase/messaging";
import App from './App';

setBackgroundMessageHandler( PushNotificationService.getMessaging(), async (remoteMessage) => {
	console.log("Message handled in background", remoteMessage);
});
// Register the playback service for background audio and remote controls
TrackPlayer.registerPlaybackService(() => PlaybackService);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
