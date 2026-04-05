import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

export function hasFirebaseClientConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
  );
}

const resolvedFirebaseConfig = hasFirebaseClientConfig()
  ? firebaseConfig
  : {
      apiKey: 'local-demo-key',
      authDomain: 'local-demo.firebaseapp.com',
      projectId: 'local-demo-project',
      storageBucket: 'local-demo.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:localdemo',
      databaseURL: 'https://local-demo-default-rtdb.firebaseio.com',
    };

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(resolvedFirebaseConfig);

const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const realtimeDb: Database = getDatabase(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, firestore, realtimeDb, storage };
