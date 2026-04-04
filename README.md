<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TRUEKIO - Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/089f2c3b-4302-47df-88dd-47971b6f8592

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Technical Details: Backend and Mobile Integration

This application has been upgraded to support full mobile deployment as an Android application via Capacitor and includes a fully functional Firebase backend implementation.

### 1. Capacitor Integration (Android Export)
The React web application is wrapped using Capacitor (`@capacitor/core`, `@capacitor/android`), converting the web build output (`dist`) into a functional native Android Application.
- Web assets sync directly into the Android platform via `npx cap sync android`.
- Built successfully using `gradlew assembleDebug` into `.apk` binaries.

### 2. Firebase Authentication Architecture
The Google Sign-In flow has been re-architected to support Capacitor WebViews.
- **Problem Avoided:** Default `signInWithPopup` methods cause "The requested action is invalid" errors because mobile WebViews block or corrupt standard popup mechanics for OAuth, interrupting the callback loop to `firebaseapp.com`.
- **Solution Implemented:** The application uses `signInWithRedirect` combined with `getRedirectResult()` to gracefully handle the OAuth handshake within the Capacitor mobile context without breaking the app state.
- **Important:** Ensure the domain (`http://localhost` for Capacitor) is added to the Authorized domains in your Firebase Console under Authentication > Settings.

### 3. Firestore Backend Integration
- Integrated to the live Firebase project `truekio-72021`.
- Configuration injected locally via the `firebase-applet-config.json` module.
- Firestore Security Rules and Indexes have been mapped and successfully deployed to secure data integrity directly from the user's Google account tier.