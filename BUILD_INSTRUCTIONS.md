# Build Instructions for Wisk App

## Quick Start (Development)

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Set up your environment variables
cp .env.example .env
# Edit .env with your actual API keys

# 3. Start development server
npx expo start

# 4. Test on your device
# - Download Expo Go app
# - Scan QR code from terminal
# - Or use iOS Simulator/Android Emulator
```

## Production Build for Android

### Prerequisites
- Set up Firebase (see FIREBASE_SETUP.md)
- Have Android Studio installed
- Create an Expo account

### Build Steps

```bash
# 1. Install EAS CLI (Expo Application Services)
npm install -g @expo/eas-cli

# 2. Login to Expo
eas login

# 3. Configure your project for EAS Build
eas build:configure

# 4. Build for Android (Production)
eas build --platform android --profile production

# 5. Submit to Google Play Store (optional)
eas submit --platform android
```

### Android Configuration

Update `app.json` with your details:
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.wisk",
      "versionCode": 120,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon-foreground.png",
        "backgroundColor": "#FFBFAE"
      }
    }
  }
}
```

## Production Build for iOS

### Prerequisites
- Apple Developer Account ($99/year)
- macOS with Xcode
- Set up Firebase (see FIREBASE_SETUP.md)

### Build Steps

```bash
# 1. Configure iOS build
eas build:configure

# 2. Build for iOS (Production)
eas build --platform ios --profile production

# 3. Submit to App Store (optional)
eas submit --platform ios
```

### iOS Configuration

Update `app.json` with your details:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.wisk",
      "buildNumber": "1.2.0",
      "supportsTablet": true
    }
  }
}
```

## Web Build

```bash
# Build for web
npx expo build:web

# Serve locally
npx serve web-build
```

## Testing Checklist

Before building for production, test these features:

### Authentication
- [ ] Email signup works
- [ ] Email login works
- [ ] Password validation works
- [ ] Google sign-in works (if configured)
- [ ] Logout works correctly

### Recipe Features
- [ ] Recipe generation from text
- [ ] Camera ingredient detection
- [ ] Recipe saving to cloud
- [ ] Recipe sync between devices
- [ ] Offline recipe access

### UI/UX
- [ ] Welcome screen only shows once
- [ ] Keyboard doesn't cover text input
- [ ] Text is visible when typing
- [ ] App works on tablets
- [ ] Dark/light theme works

### Performance
- [ ] App launches quickly
- [ ] No memory leaks
- [ ] Camera works smoothly
- [ ] Recipe generation shows loading states

## Google Play Store Submission

### Store Listing Assets Needed:
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (Phone: 320-3840px, Tablet: 600-7680px)
- App description
- Privacy policy URL

### Store Information:
- App name: "Wisk - AI Recipe Generator"
- Category: "Food & Drink"
- Content rating: "Everyone"
- Tags: "recipe, cooking, AI, food, kitchen"

## Troubleshooting

### Common Issues:

**Build fails with Firebase errors:**
- Check your .env file has correct Firebase config
- Ensure Firebase project is set up properly
- Verify you're using the correct package name/bundle ID

**Expo Go app crashes:**
- Try clearing Expo Go cache
- Check for syntax errors in your code
- Ensure all dependencies are installed

**Camera permission denied:**
- Check app.json includes camera permissions
- Ensure you're requesting permissions properly

**Google sign-in doesn't work:**
- Verify OAuth client IDs are configured correctly
- Check SHA-1 fingerprint is added to Firebase
- Ensure app package name matches Firebase config

## Support Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Paper](https://reactnativepaper.com/)
- [Expo Build Troubleshooting](https://docs.expo.dev/build/introduction/)