import 'server-only';

import type { DataSnapshot } from 'firebase-admin/database';
import { adminDb, adminFirestore } from '@/lib/firebase-admin';
import { getLocalSession, isLocalSessionId } from '@/lib/mock-data';
import type { Session } from '@/types/session';
import type { TimerState } from '@/types/timer';
import type {
  AdminCheckpointSummary,
  AdminSessionDetail,
  AdminSessionSummary,
} from '@/types/admin';

function serializeFirestoreValue(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return null;
}

function mapTimerSnapshot(snapshot: DataSnapshot): TimerState | null {
  const value = snapshot.val();
  return value ? (value as TimerState) : null;
}

export async function listAdminSessions(): Promise<AdminSessionSummary[]> {
  const localSession = getLocalSession();

  const fallbackSessions: AdminSessionSummary[] = localSession
    ? [
        {
          id: localSession.id,
          name: localSession.name,
          sessionCode: localSession.sessionCode,
          status: 'active',
          createdAt: null,
          playerCount: 0,
        },
      ]
    : [];

  try {
    const sessionsSnapshot = await adminFirestore.collection('sessions').orderBy('createdAt', 'desc').get();
    const summaries = await Promise.all(
      sessionsSnapshot.docs.map(async (doc) => {
        const data = doc.data() as Session;
        const playersSnap = await doc.ref.collection('players').count().get();

        return {
          id: doc.id,
          name: data.name,
          sessionCode: data.sessionCode,
          status: data.status,
          createdAt: serializeFirestoreValue(data.createdAt),
          playerCount: playersSnap.data().count,
        } satisfies AdminSessionSummary;
      }),
    );

    return [...summaries, ...fallbackSessions.filter((item) => !summaries.some((session) => session.id === item.id))];
  } catch {
    return fallbackSessions;
  }
}

export async function getAdminSessionDetail(sessionId: string): Promise<AdminSessionDetail | null> {
  if (isLocalSessionId(sessionId)) {
    const localSession = getLocalSession();
    if (!localSession) {
      return null;
    }

    return {
      session: {
        id: localSession.id,
        name: localSession.name,
        sessionCode: localSession.sessionCode,
        status: 'active',
        createdAt: null,
        playerCount: 0,
        config: {
          intervalMinutes: Number(process.env.NEXT_PUBLIC_CHECKPOINT_INTERVAL_MIN ?? 20),
          totalIntervals: 5,
          accessCode: process.env.NEXT_PUBLIC_ACCESS_CODE ?? '',
          maxPlayers: 20,
        },
      },
      checkpoints: [],
      timerState: null,
    };
  }

  try {
    const sessionRef = adminFirestore.collection('sessions').doc(sessionId);
    const [sessionSnap, checkpointsSnap, playersCountSnap, timerSnap] = await Promise.all([
      sessionRef.get(),
      sessionRef.collection('checkpoints').orderBy('triggeredAt', 'desc').limit(10).get(),
      sessionRef.collection('players').count().get(),
      adminDb.ref(`sessions/${sessionId}/timer`).get(),
    ]);

    if (!sessionSnap.exists) {
      return null;
    }

    const session = sessionSnap.data() as Session;

    return {
      session: {
        id: sessionSnap.id,
        name: session.name,
        sessionCode: session.sessionCode,
        status: session.status,
        createdAt: serializeFirestoreValue(session.createdAt),
        playerCount: playersCountSnap.data().count,
        config: session.config,
      },
      checkpoints: checkpointsSnap.docs.map((doc) => {
        const data = doc.data() as {
          interval?: number;
          triggeredAt?: unknown;
          resumedAt?: unknown;
        };

        return {
          id: doc.id,
          interval: data.interval ?? 0,
          triggeredAt: serializeFirestoreValue(data.triggeredAt),
          resumedAt: serializeFirestoreValue(data.resumedAt),
        } satisfies AdminCheckpointSummary;
      }),
      timerState: mapTimerSnapshot(timerSnap),
    };
  } catch {
    return null;
  }
}
