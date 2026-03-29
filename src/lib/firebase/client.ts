import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

function readPublicConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !databaseURL || !projectId) {
    return null;
  }

  return {
    apiKey,
    authDomain: authDomain ?? `${projectId}.firebaseapp.com`,
    databaseURL,
    projectId,
    storageBucket: storageBucket ?? `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId ?? "",
    appId: appId ?? "",
  };
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Database | null = null;

export function isFirebaseClientConfigured(): boolean {
  return readPublicConfig() !== null;
}

export function getFirebaseApp(): FirebaseApp {
  const config = readPublicConfig();
  if (!config) {
    throw new Error(
      "Firebase client is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  }
  if (!cachedApp) {
    cachedApp = getApps().length ? getApps()[0]! : initializeApp(config);
  }
  return cachedApp;
}

export function getFirebaseDatabase(): Database {
  if (!cachedDb) {
    cachedDb = getDatabase(getFirebaseApp());
  }
  return cachedDb;
}
