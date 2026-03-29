import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";

function getServiceAccount(): Record<string, unknown> | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

let adminApp: App | null = null;

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_DATABASE_URL && getServiceAccount());
}

export function getFirebaseAdminApp(): App {
  if (adminApp) return adminApp;
  const account = getServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (!account || !databaseURL) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_DATABASE_URL and FIREBASE_SERVICE_ACCOUNT_JSON.",
    );
  }
  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert(account as ServiceAccount),
      databaseURL,
    });
  } else {
    adminApp = getApps()[0]!;
  }
  return adminApp;
}

export function getFirebaseAdminDatabase(): Database {
  return getDatabase(getFirebaseAdminApp());
}
