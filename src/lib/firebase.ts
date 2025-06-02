
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!apiKey) {
  // This error will be thrown if the API key is not set in the environment variables.
  // It will be caught by Next.js and displayed, hopefully making the issue clearer.
  throw new Error(
    "Firebase API Key is missing. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env file and that you have restarted your development server."
  );
}

const firebaseConfig = {
  apiKey: apiKey, // Use the checked apiKey
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

// If you want to use Firebase emulators during development, uncomment the lines below
// Make sure you have the Firebase Emulator Suite running (firebase emulators:start)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Check if emulators are already connected to avoid re-connecting on hot reloads
  // @ts-ignore
  if (!auth.emulatorConfig) {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      console.log("Auth emulator connected");
    } catch (e) {
      console.warn("Could not connect Auth emulator", e);
    }
  }
  // @ts-ignore
  if (!db.emulatorConfig) {
     try {
      connectFirestoreEmulator(db, "localhost", 8080);
      console.log("Firestore emulator connected");
    } catch(e) {
      console.warn("Could not connect Firestore emulator", e);
    }
  }
}


export { app, auth, db };
