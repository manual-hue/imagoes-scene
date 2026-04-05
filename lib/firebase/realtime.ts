import { ref, onValue, type DatabaseReference } from 'firebase/database';
import { hasFirebaseClientConfig, realtimeDb } from './index';
import type { TimerState } from '@/types/timer';

export function timerRef(sessionId: string): DatabaseReference | null {
  if (!hasFirebaseClientConfig()) {
    return null;
  }

  return ref(realtimeDb, `sessions/${sessionId}/timer`);
}

export function subscribeTimer(
  sessionId: string,
  callback: (state: TimerState | null) => void,
) {
  const timerPath = timerRef(sessionId);
  if (!timerPath) {
    callback(null);
    return () => undefined;
  }

  return onValue(timerPath, (snapshot) => {
    callback(snapshot.val() as TimerState | null);
  });
}
