# Wisk

Wisk is a cross-platform mobile app that generates personalized recipes from your ingredients and photos. Powered by AI and modern Material 3 design, Wisk makes cooking fun, easy, and beautiful.

## Features
- Generate recipes using Google Gemini AI
- Detect ingredients from photos with Google Vision API
- Beautiful Material 3 UI with pink, peach, and yellow accents
- Camera capture and image carousel
- Persistent cookbook storage (local, with Firestore planned)
- Markdown recipe display
- Haptic feedback and blur effects for delightful UX
- Custom fonts and branded background

## Technologies Used
- React Native (TypeScript)
- Expo (Camera, Video, Blur, Haptics, Font)
- React Native Paper (Material 3 UI)
- React Navigation
- Google Gemini API
- Google Vision API
- AsyncStorage
- Firebase Firestore (planned)
- React Native Markdown Display
- Git/GitHub

## Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/atharvalohote/wisk.git
   cd wisk
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Set up API keys:**
   - Add your Google Gemini and Vision API keys in `app.json` under `extra`.
4. **Run the app:**
   ```sh
   npx expo start
   ```
   Scan the QR code with Expo Go or run on an emulator.

## Screenshots
_Add screenshots here if available._

## Credits
- Developed by Atharva Lohote
- Powered by Google Gemini and Vision APIs

## License
[MIT](LICENSE) 