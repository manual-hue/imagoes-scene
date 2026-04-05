import 'server-only';

import type { DataSnapshot } from 'firebase-admin/database';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { adminDb, adminFirestore } from '@/lib/firebase-admin';
import { getLocalSession, getLocalSessionQRPayload, isLocalSessionId } from '@/lib/mock-data';
import type { Room } from '@/types/room';
import type { Session } from '@/types/session';
import type { TimerState } from '@/types/timer';
import type {
  AdminCheckpointSummary,
  AdminRoomSummary,
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

function mapRoomSummary(snapshot: QueryDocumentSnapshot): AdminRoomSummary {
  const data = snapshot.data() as Partial<Room>;

  return {
    id: snapshot.id,
    name: data.name ?? snapshot.id,
    shortCode: data.shortCode ?? '',
    order: typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER,
    description: data.description ?? '',
    isAccessible: data.isAccessible ?? true,
    visitCount: typeof data.visitCount === 'number' ? data.visitCount : 0,
  };
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
          roomCount: getLocalSessionQRPayload(localSession.id)?.rooms.length ?? 0,
          playerCount: 0,
        },
      ]
    : [];

  try {
    const sessionsSnapshot = await adminFirestore.collection('sessions').orderBy('createdAt', 'desc').get();
    const summaries = await Promise.all(
      sessionsSnapshot.docs.map(async (doc) => {
        const data = doc.data() as Session;
        const [roomsSnap, playersSnap] = await Promise.all([
          doc.ref.collection('rooms').count().get(),
          doc.ref.collection('players').count().get(),
        ]);

        return {
          id: doc.id,
          name: data.name,
          sessionCode: data.sessionCode,
          status: data.status,
          createdAt: serializeFirestoreValue(data.createdAt),
          roomCount: roomsSnap.data().count,
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
    const localPayload = getLocalSessionQRPayload(sessionId);
    if (!localSession || !localPayload) {
      return null;
    }

    return {
      session: {
        id: localSession.id,
        name: localSession.name,
        sessionCode: localSession.sessionCode,
        status: 'active',
        createdAt: null,
        roomCount: localPayload.rooms.length,
        playerCount: 0,
        config: {
          intervalMinutes: Number(process.env.NEXT_PUBLIC_CHECKPOINT_INTERVAL_MIN ?? 20),
          totalIntervals: 5,
          accessCode: process.env.NEXT_PUBLIC_ACCESS_CODE ?? '',
          maxPlayers: 20,
        },
      },
      rooms: localPayload.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        shortCode: room.shortCode,
        order: room.order,
        description: '',
        isAccessible: true,
        visitCount: 0,
      })),
      checkpoints: [],
      timerState: null,
    };
  }

  try {
    const sessionRef = adminFirestore.collection('sessions').doc(sessionId);
    const [sessionSnap, roomsSnap, checkpointsSnap, playersCountSnap, timerSnap] = await Promise.all([
      sessionRef.get(),
      sessionRef.collection('rooms').orderBy('order', 'asc').get(),
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
        roomCount: roomsSnap.size,
        playerCount: playersCountSnap.data().count,
        config: session.config,
      },
      rooms: roomsSnap.docs.map(mapRoomSummary),
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
