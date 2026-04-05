import 'server-only';

import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getLocalSessionQRPayload, resolveLocalRoomByCode } from '@/lib/mock-data';
import type { Room } from '@/types/room';
import type { Session } from '@/types/session';

export interface ResolvedRoomCode {
  sessionId: string;
  roomId: string;
  sessionCode: string;
  roomCode: string;
}

export interface QRPrintableRoom {
  id: string;
  name: string;
  shortCode: string;
  order: number;
}

export interface SessionQRPayload {
  sessionId: string;
  sessionName: string;
  sessionCode: string;
  rooms: QRPrintableRoom[];
}

function normalizeSessionCode(sessionCode: string): string {
  return sessionCode.trim().toUpperCase();
}

function normalizeRoomCode(roomCode: string): string {
  return roomCode.trim().toUpperCase();
}

function mapRoom(snapshot: QueryDocumentSnapshot): QRPrintableRoom {
  const data = snapshot.data() as Partial<Room>;

  return {
    id: snapshot.id,
    name: data.name ?? snapshot.id,
    shortCode: data.shortCode ?? '',
    order: typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER,
  };
}

export async function resolveRoomByCode(
  sessionCode: string,
  roomCode: string,
): Promise<ResolvedRoomCode | null> {
  const normalizedSessionCode = normalizeSessionCode(sessionCode);
  const normalizedRoomCode = normalizeRoomCode(roomCode);
  const localResolved = resolveLocalRoomByCode(normalizedSessionCode, normalizedRoomCode);

  if (localResolved) {
    return localResolved;
  }

  if (!/^[A-Z0-9]{6}$/.test(normalizedSessionCode)) {
    return null;
  }

  if (!/^R\d{2}$/.test(normalizedRoomCode)) {
    return null;
  }

  const { adminFirestore } = await import('@/lib/firebase-admin');
  const sessionSnapshot = await adminFirestore
    .collection('sessions')
    .where('sessionCode', '==', normalizedSessionCode)
    .limit(1)
    .get();

  if (sessionSnapshot.empty) {
    return null;
  }

  const sessionDoc = sessionSnapshot.docs[0]!;
  const roomSnapshot = await sessionDoc.ref
    .collection('rooms')
    .where('shortCode', '==', normalizedRoomCode)
    .limit(1)
    .get();

  if (roomSnapshot.empty) {
    return null;
  }

  return {
    sessionId: sessionDoc.id,
    roomId: roomSnapshot.docs[0]!.id,
    sessionCode: normalizedSessionCode,
    roomCode: normalizedRoomCode,
  };
}

export async function getSessionQRPayload(sessionId: string): Promise<SessionQRPayload | null> {
  const localPayload = getLocalSessionQRPayload(sessionId);
  if (localPayload) {
    return localPayload;
  }

  const { adminFirestore } = await import('@/lib/firebase-admin');
  const sessionDoc = await adminFirestore.collection('sessions').doc(sessionId).get();

  if (!sessionDoc.exists) {
    return null;
  }

  const session = sessionDoc.data() as Session;
  const roomsSnapshot = await sessionDoc.ref.collection('rooms').orderBy('order', 'asc').get();

  return {
    sessionId: sessionDoc.id,
    sessionName: session.name,
    sessionCode: session.sessionCode,
    rooms: roomsSnapshot.docs.map(mapRoom),
  };
}
