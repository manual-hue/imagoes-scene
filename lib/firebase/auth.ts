import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './index';

export async function signInAnonymous(): Promise<User> {
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export function getUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
