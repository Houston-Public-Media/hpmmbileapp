# HPM Mobile App

A React Native mobile application for Houston Public Media with news, podcasts, music, and weather features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on device/simulator
npm run ios
npm run android
npm run web
```

## 📱 Features

- News & Articles
- Podcasts & Music Player
- Weather Information
- Push Notifications
- Responsive Design (iOS, Android, Web)

## 🛠 Tech Stack

- **React Native** with Expo SDK 53
- **TypeScript**
- **React Navigation**
- **Expo AV** for media playback
- **Firebase** for notifications
- **AsyncStorage** for local data

## 📋 Prerequisites

- Node.js (v18+)
- Expo CLI: `npm install -g @expo/cli`
- iOS: Xcode (for iOS development)
- Android: Android Studio (for Android development)

## 🔥 Firebase Setup

1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
3. Place files in project root
4. Enable Cloud Messaging for push notifications

## 🔄 Update Configurations for Different Accounts

### Firebase Project Configuration

**Current Project**: `hpm-expo-app` (Project ID: `36181167607`)

To use a different Firebase project:

1. **Update Firebase Files**:
   - Replace `google-services.json` with your project's Android config
   - Replace `GoogleService-Info.plist` with your project's iOS config
   - Update `project_id` in both files

2. **Update Bundle Identifiers** (if needed):
   ```json
   // app.json
   "ios": {
     "bundleIdentifier": "com.yourcompany.hpm"
   },
   "android": {
     "package": "com.yourcompany.hpm"
   }
   ```

### EAS Project Configuration

**Current Project ID**: `cf763f1a-eb2d-47d1-a581-bc42dc2e6b55`

To use a different EAS project:

1. **Update EAS Project ID**:
   ```json
   // app.json
   "extra": {
     "eas": {
       "projectId": "your-new-project-id"
     }
   }
   ```

2. **Switch EAS Account**:
   ```bash
   # Login with different account
   npx eas login
   
   # Or logout and login
   npx eas logout
   npx eas login
   ```

3. **Update EAS Configuration**:
   ```bash
   # Reconfigure EAS for new project
   npx eas build:configure
   ```

### EAS Credentials Management

**Generate/Update Credentials**:
```bash
# Configure credentials for both platforms
npx eas credentials

# Configure Android credentials only
npx eas credentials --platform android

# Configure iOS credentials only
npx eas credentials --platform ios
```

**Upload Firebase Service Key**:
```bash
# Upload Firebase service account JSON to EAS
npx eas secret:create --scope project --name FIREBASE_SERVICE_ACCOUNT --type file --value ./firebase-service-account.json
```

### 🚀 EAS Branching & Workflow

#### Creating an EAS Update Branch

```bash
# Create a new EAS Update branch (not a git branch)
npx eas branch:create <branch-name> 
# npx eas branch:create preview-branch

npx eas update --branch <branch-name> --message <branch-message> 
# npx eas update --branch preview-branch --message "Release preview build"
```
- Use descriptive branch names (e.g., `feature-login`, `bugfix-audio`).
- List all EAS branches:
  ```bash
  npx eas branch:list
  ```

#### EAS JSON Configuration

Your `eas.json` defines build profiles for development, preview, and production. Example:

```json
{
  "build": {
    "development": { /* ... */ },
    "preview": { /* ... */ },
    "production": { /* ... */ }
  },
  "submit": {
    "production": { /* ... */ }
  }
}
```
- **development**: Internal builds for testing.
- **preview**: Internal builds for QA/review.
- **production**: Store builds for release.

See the actual `eas.json` in the repo for full details.

### Google AdSense Configuration

**Current Ad IDs** (Test IDs):
- **Android**: `ca-app-pub-3940256099942544~3347511713`
- **iOS**: `ca-app-pub-3940256099942544~1458002511`

**Update for Production**:
```json
// app.json - Update these values
"react-native-google-mobile-ads": {
  "androidAppId": "ca-app-pub-YOUR_ANDROID_APP_ID",
  "iosAppId": "ca-app-pub-YOUR_IOS_APP_ID"
}
```

**Note**: Current configuration uses Google's test ad IDs. Replace with your production ad unit IDs for live deployment.

### Required Configuration Updates

**Files to Update**:
- `app.json` - Bundle identifiers, EAS project ID
- `google-services.json` - Android Firebase config
- `GoogleService-Info.plist` - iOS Firebase config
- `eas.json` - Build profiles (if needed)

**Key Identifiers**:
- **Bundle ID**: `com.houstonpublicmedia.hpm`
- **Firebase Project**: `hpm-expo-app`
- **EAS Project**: `cf763f1a-eb2d-47d1-a581-bc42dc2e6b55`
- **Owner**: `smitapatel`

## 🏗 Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation config
├── services/       # API services
├── utils/          # Utility functions
└── type.ts         # TypeScript types
```

## 📦 Key Scripts

```bash
npm start          # Start dev server
npm run ios        # Run on iOS
npm run android    # Run on Android
npm run web        # Run on web
npm run android-release  # Build Android APK
```

## 🔒 Security

- Never commit `firebase-service-account.json` to version control
- Add keystore files to `.gitignore`
- Store sensitive credentials securely

## 🐛 Common Issues

```bash
# Clear cache
npx expo start --clear

# iOS issues
cd ios && pod install && cd ..

# Android issues
npx expo run:android --clear
```

## 📚 Documentation

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)

## 🤝 Support

For issues and questions, contact the development team.

---

**Note**: This is a production application. Test thoroughly before deployment. 