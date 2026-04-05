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
    return null;
  }

  return { projectId, clientEmail, privateKey };
}

function getAdminApp(): App | null {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;

  if (getApps().length > 0) return getApps()[0]!;

  return initializeApp({
    credential: cert(serviceAccount),
    ...(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim()
      ? { databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL.trim() }
      : {}),
    ...(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
      ? { storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.trim() }
      : {}),
  });
}

let _app: App | null | undefined;
function app() {
  if (_app === undefined) _app = getAdminApp();
  return _app;
}

export const adminApp = new Proxy({} as App, {
  get: (_, prop) => { const a = app(); if (!a) throw new Error('Firebase Admin not configured'); return (a as unknown as Record<string | symbol, unknown>)[prop]; },
});
export const adminAuth = new Proxy({} as Auth, {
  get: (_, prop) => { const a = app(); if (!a) throw new Error('Firebase Admin not configured'); return (getAuth(a) as unknown as Record<string | symbol, unknown>)[prop]; },
});
export const adminFirestore = new Proxy({} as Firestore, {
  get: (_, prop) => { const a = app(); if (!a) throw new Error('Firebase Admin not configured'); return (getFirestore(a) as unknown as Record<string | symbol, unknown>)[prop]; },
});
export const adminDb = new Proxy({} as Database, {
  get: (_, prop) => { const a = app(); if (!a) throw new Error('Firebase Admin not configured'); return (getDatabase(a) as unknown as Record<string | symbol, unknown>)[prop]; },
});
export const adminStorage = new Proxy({} as Storage, {
  get: (_, prop) => { const a = app(); if (!a) throw new Error('Firebase Admin not configured'); return (getStorage(a) as unknown as Record<string | symbol, unknown>)[prop]; },
});
