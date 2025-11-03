# Firebase Setup Guide for Wisk App

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `wisk-ai-recipe`
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

## 2. Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Enable "Google" sign-in method
5. For Google sign-in, you'll need to configure OAuth consent screen

## 3. Set up Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules)
4. Select a location (choose closest to your users)

## 4. Get Firebase Configuration
1. Go to Project Settings (⚙️ icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Copy the configuration object

## 5. Update Environment Variables
Create a `.env` file in your project root:
```env
FIREBASE_API_KEY=your_actual_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Google APIs (get these from Google Cloud Console)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_VISION_API_KEY=your_vision_api_key
```

## 6. Set up Firestore Security Rules
Go to Firestore → Rules tab and paste:
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

## 7. Google Sign-In Setup (Advanced)
For production Google Sign-In:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" → "Credentials"
4. Create OAuth 2.0 Client IDs for:
   - Android app (use your app's package name)
   - iOS app (use your app's bundle ID)
5. Update the client IDs in your app configuration

## 8. Test Everything
1. Run your app locally
2. Test email/password signup
3. Test Google sign-in (if configured)
4. Test recipe saving and cloud sync