
<p align="center">
  <img src="wisk github.png" alt="Wisk App Intro" />
</p>

# 🍳 Wisk - AI Recipe Generator

Wisk is a modern, cross-platform mobile app that generates personalized recipes from your ingredients and photos. Powered by AI, Firebase authentication, and designed with Material 3, Wisk makes cooking fun, easy, and secure.

---

## 📱 Get the App!

**Experience Wisk for yourself by downloading it today:**

<p align="center">
  <a href="https://youtube.com/shorts/NM-ulsPWtME?feature=share" target="_blank">
    <img src="https://img.shields.io/badge/Watch%20Demo-YouTube-red?style=for-the-badge&logo=youtube" alt="Watch Demo on YouTube" width="200"/>
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://play.google.com/store/apps/details?id=com.yourcompany.wisk" target="_blank">
    <img src="https://img.shields.io/badge/Get%20on%20Google%20Play-Play%20Store-success?style=for-the-badge&logo=google-play" alt="Get on Google Play" width="200"/>
  </a>
</p>

---

## ✨ Features

### 🆕 Version 1.2.0 - Production Ready
- 🔐 **Firebase Authentication** - Secure email/password and Google sign-in
- ☁️ **Cloud Sync** - Real-time recipe synchronization across devices
- 🎯 **Fixed Welcome Screen** - Only shows on first app launch
- ⌨️ **Enhanced Text Input** - Fixed keyboard issues and visibility
- 🛠️ **Production Ready** - Optimized for Google Play Store release

### Core Features
- 🤖 Generate recipes using **Google Gemini AI**
- 📸 Detect ingredients from photos with **Google Vision API**
- 🎨 Gorgeous Material 3 UI with custom pink, peach, and yellow accents
- 📷 Camera capture & intelligent ingredient detection
- 📚 Persistent cookbook with cloud backup
- 📝 Beautiful recipe display with Markdown support
- 🎉 Haptic feedback & stunning blur effects
- 🔤 Custom Rubik Bubbles font for unique branding
- 🌙 Dark/Light theme support
- 📱 Tablet and phone optimized

---

## 🛠️ Technologies Used

### Frontend & Framework
- **React Native** (TypeScript) - Cross-platform development
- **Expo SDK 53** - Development platform with managed workflow
- **React Native Paper 5.14** - Material 3 UI components
- **React Navigation 7** - Navigation and routing

### Backend & Services
- **Firebase Authentication** - User management & security
- **Cloud Firestore** - Real-time database & sync
- **Google Gemini API** - AI recipe generation
- **Google Vision API** - Ingredient detection from images
- **AsyncStorage** - Local data persistence

### UI/UX & Features
- **Expo Camera** - Camera access and image capture
- **Expo Haptics** - Touch feedback system
- **Expo Blur** - Beautiful glassmorphism effects
- **Expo Video** - Welcome screen animations
- **React Native Markdown** - Recipe text rendering

---

## 🚀 Production Deployment Guide

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project: "wisk-ai-recipe"
   - Enable Authentication (Email/Password + Google)
   - Enable Cloud Firestore
   - Set up security rules

2. **Configure Firebase**
   ```bash
   cp .env.example .env
   # Fill in your Firebase configuration values
   ```

3. **Update app.json**
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.wisk"
       },
       "ios": {
         "bundleIdentifier": "com.yourcompany.wisk"
       }
     }
   }
   ```

### Build for Production

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   eas login
   ```

2. **Configure Build**
   ```bash
   eas build:configure
   ```

3. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```

4. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

5. **Submit to Stores**
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

### Environment Variables

Create `.env` file with:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
GOOGLE_GEMINI_API_KEY=your_gemini_key
GOOGLE_VISION_API_KEY=your_vision_key
```

### Firebase Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /recipes/{recipeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /savedRecipes/{recipeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🔧 Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/wisk.git
   cd wisk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up API keys:**
   ```bash
   cp .env.example .env
   # Add your API keys to the .env file
   ```

4. **Start development server:**
   ```bash
   npx expo start
   ```

5. **Run on device:**
   - Download Expo Go app
   - Scan QR code from terminal
   - Or use simulator/emulator

---

## 📋 Testing Checklist

Before releasing to production, ensure:

### Authentication Testing
- [ ] User can sign up with email/password
- [ ] User can login with existing account
- [ ] Password validation works correctly
- [ ] Google Sign-In functions properly
- [ ] User logout works
- [ ] Unauthenticated users cannot access protected screens

### Recipe Features Testing
- [ ] Recipe generation from text input works
- [ ] Camera ingredient detection functions
- [ ] Recipe saving to cloud works
- [ ] Recipe synchronization between devices works
- [ ] Offline mode shows cached recipes
- [ ] Recipe sharing works correctly

### UI/UX Testing
- [ ] Welcome screen only shows on first launch
- [ ] Keyboard doesn't cover text inputs
- [ ] Text input is visible when typing
- [ ] App works on both phone and tablet
- [ ] Dark/light theme toggles correctly
- [ ] Haptic feedback works on supported devices

### Performance Testing
- [ ] App launches under 3 seconds
- [ ] No memory leaks detected
- [ ] Camera operations complete quickly
- [ ] Recipe generation shows proper loading states
- [ ] App works offline with cached data

---

## 🎯 Bug Fixes Implemented

### Welcome Screen Bug
- **Issue**: Welcome screen appeared every app launch
- **Solution**: Added AsyncStorage persistence with 'WELCOME_SHOWN' flag
- **Files Modified**: `App.tsx`

### Keyboard & Text Input Bug
- **Issue**: Keyboard covered text input, text not visible while typing
- **Solution**: Added KeyboardAvoidingView, improved text input styling, fixed scroll behavior
- **Files Modified**: `PromptScreen.tsx`

### Authentication System
- **Issue**: No user authentication or cloud sync
- **Solution**: Complete Firebase authentication with email/password and Google sign-in
- **Files Added**: `AuthScreen.tsx`, `AuthService.ts`, `AuthGuard.tsx`

### Backend Services
- **Issue**: FirestoreService had only placeholder functions
- **Solution**: Complete CRUD operations for recipes with user ownership validation
- **Files Modified**: `FirestoreService.ts`

---



## 👨‍💻 Credits

  - Developed by **Atharva Lohote**
  - Powered by **Google Gemini** and **Vision APIs**

-----
