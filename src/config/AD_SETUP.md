# AdMob Setup Guide for HPM Mobile App

This guide explains how to configure real ads in your Expo project using Google AdMob.

## 🎯 Current Status

✅ **AdMob SDK Integrated**: The project now uses `react-native-google-mobile-ads`
✅ **Real Ads Configured**: Production ad unit IDs are now active
✅ **Ad Components Ready**: Banner, Interstitial, and Rewarded ads are implemented
✅ **Ad Services**: Complete ad management services are in place

## 📱 Current Configuration

### Real Ad Unit IDs (Currently Active)
- **Banner Ads**: `/9147267/HPM_News_Mobile` (Android & iOS)
- **Interstitial Ads**: `/9147267/HPM_News_Mobile` (Android & iOS)
- **Rewarded Ads**: `/9147267/HPM_News_Mobile` (Android & iOS)

### Real App IDs
- **Android**: `ca-app-pub-2797448917961410~9781974870`
- **iOS**: `ca-app-pub-2797448917961410~9781974870`

## 🚀 How to Set Up Real Ads

### Step 1: Create AdMob Account

1. Go to [AdMob Console](https://admob.google.com/)
2. Sign in with your Google account
3. Click "Create Account" if you don't have one
4. Accept the terms and conditions

### Step 2: Create AdMob App

1. In AdMob Console, click "Apps" → "Add App"
2. Choose your platform (iOS/Android)
3. Enter your app details:
   - **App Name**: HPM Mobile
   - **Platform**: iOS/Android
   - **Bundle ID**: `com.houstonpublicmedia.hpm`
4. Click "Add App"

### Step 3: Create Ad Units

#### Banner Ad Unit
1. Go to "Ad Units" → "Create Ad Unit"
2. Select "Banner"
3. Name it "HPM Banner Ads"
4. Copy the Ad Unit ID

#### Interstitial Ad Unit
1. Go to "Ad Units" → "Create Ad Unit"
2. Select "Interstitial"
3. Name it "HPM Interstitial Ads"
4. Copy the Ad Unit ID

#### Rewarded Ad Unit
1. Go to "Ad Units" → "Create Ad Unit"
2. Select "Rewarded"
3. Name it "HPM Rewarded Ads"
4. Copy the Ad Unit ID

### Step 4: Update Configuration

Replace the test IDs in `src/config/adConfig.ts`:

```typescript
export const AD_CONFIG = {
  // Replace with your real app IDs
  ANDROID_APP_ID: 'ca-app-pub-YOUR_ANDROID_APP_ID',
  IOS_APP_ID: 'ca-app-pub-YOUR_IOS_APP_ID',
  
  // Replace with your real ad unit IDs
  BANNER_AD_UNIT_ID: {
    android: 'ca-app-pub-YOUR_BANNER_AD_UNIT_ID',
    ios: 'ca-app-pub-YOUR_BANNER_AD_UNIT_ID',
  },
  
  INTERSTITIAL_AD_UNIT_ID: {
    android: 'ca-app-pub-YOUR_INTERSTITIAL_AD_UNIT_ID',
    ios: 'ca-app-pub-YOUR_INTERSTITIAL_AD_UNIT_ID',
  },
  
  REWARDED_AD_UNIT_ID: {
    android: 'ca-app-pub-YOUR_REWARDED_AD_UNIT_ID',
    ios: 'ca-app-pub-YOUR_REWARDED_AD_UNIT_ID',
  },
  
  // Set to false for production
  SHOW_TEST_ADS: false,
};
```

### Step 5: Update App Configuration

Update `app.json` with your real app IDs:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-YOUR_ANDROID_APP_ID",
          "iosAppId": "ca-app-pub-YOUR_IOS_APP_ID",
          "userTrackingDescription": "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ]
  }
}
```

### Step 6: Test Device Setup

Add your test device IDs to avoid policy violations:

1. Run the app on your device
2. Check console logs for device ID
3. Add to `AD_CONFIG.TEST_DEVICE_IDS`:

```typescript
TEST_DEVICE_IDS: [
  'EMULATOR',
  'SIMULATOR',
  'YOUR_DEVICE_ID_HERE', // Add your device ID
],
```

## 📊 Ad Implementation Details

### Banner Ads
- **Location**: Home screen, between content sections
- **Frequency**: Always visible
- **Size**: Responsive banner (320x50)

### Interstitial Ads
- **Location**: Before navigating to news details
- **Frequency**: 30% chance to avoid overwhelming users
- **Trigger**: News article navigation

### Rewarded Ads
- **Location**: Available for premium content
- **Frequency**: User-initiated
- **Reward**: Unlock premium features

## 🔧 Ad Services

### InterstitialAdService
- Manages full-screen interstitial ads
- Handles loading, showing, and error states
- Auto-reloads after showing

### RewardedAdService
- Manages rewarded video ads
- Handles reward callbacks
- Auto-reloads after showing

### useAds Hook
- React hook for ad management
- Provides easy-to-use ad functions
- Handles state management

## 🎯 Ad Placement Strategy

### Current Implementation
1. **Banner Ads**: Home screen, between news sections
2. **Interstitial Ads**: Before news detail navigation (30% frequency)
3. **Rewarded Ads**: Ready for premium content features

### Recommended Strategy
1. **Banner Ads**: Keep current placement
2. **Interstitial Ads**: 
   - After 3-5 article reads
   - Before major navigation changes
   - Maximum 1 per session
3. **Rewarded Ads**:
   - Unlock premium articles
   - Remove ads for 1 hour
   - Access to exclusive content

## ⚠️ Important Notes

### Policy Compliance
- Test ads are currently active
- Switch to real ads only after AdMob approval
- Follow AdMob policies strictly
- Don't show too many ads

### Performance
- Ads are preloaded for better UX
- Error handling prevents app crashes
- Fallback to placeholders if ads fail

### Testing
- Use test device IDs during development
- Test on real devices, not simulators
- Verify ad loading and display

## 🚀 Production Checklist

- [x] Replace test app IDs with real ones
- [x] Replace test ad unit IDs with real ones
- [x] Set `SHOW_TEST_ADS: false`
- [ ] Add test device IDs
- [ ] Test on real devices
- [ ] Verify ad loading and display
- [ ] Check AdMob console for impressions
- [ ] Monitor ad performance metrics

## 📈 Revenue Optimization

### Best Practices
1. **Ad Placement**: Strategic placement without overwhelming users
2. **Ad Frequency**: Balance between revenue and user experience
3. **Ad Quality**: High-quality ad units perform better
4. **User Experience**: Smooth ad loading and transitions

### Analytics
- Monitor AdMob console for performance
- Track user engagement metrics
- Optimize based on data insights

## 🆘 Troubleshooting

### Common Issues
1. **Ads not loading**: Check internet connection and ad unit IDs
2. **Test ads showing**: Verify `SHOW_TEST_ADS` setting
3. **App crashes**: Check ad service error handling
4. **No impressions**: Verify AdMob account setup

### Debug Commands
```bash
# Check ad configuration
console.log('Ad Config:', AD_CONFIG);

# Test ad loading
await interstitialService.loadInterstitialAd();

# Check device ID
console.log('Device ID:', await mobileAds().getRequestConfiguration());
```

## 📞 Support

For AdMob-specific issues:
- [AdMob Help Center](https://support.google.com/admob/)
- [AdMob Policy Center](https://support.google.com/admob/answer/6129563)

For technical issues:
- Check console logs for error messages
- Verify configuration in `adConfig.ts`
- Test with different ad unit IDs 