import 'server-only';

import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getDatabase, type Database } from 'firebase-admin/database';
import { getStorage, type Storage } from 'firebase-admin/storage';

function getServiceAccount() {
  const base64 = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;

  if (base64) {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase admin credentials are missing. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 or FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.',
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

const adminApp: App =
  getApps().length > 0
    ? getApps()[0]!
    : initializeApp({
        credential: cert(getServiceAccount()),
        ...(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim()
          ? { databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL.trim() }
          : {}),
        ...(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
          ? { storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.trim() }
          : {}),
      });

const adminAuth: Auth = getAuth(adminApp);
const adminFirestore: Firestore = getFirestore(adminApp);
const adminDb: Database = getDatabase(adminApp);
const adminStorage: Storage = getStorage(adminApp);

export { adminApp, adminAuth, adminFirestore, adminDb, adminStorage };
