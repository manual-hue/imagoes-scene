import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';
import { firestore } from './index';
import type { Session } from '@/types/session';
import type { Room, Clue } from '@/types/room';
import type { Player } from '@/types/player';
import type { Checkpoint } from '@/types/checkpoint';

function typedCollection<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(firestore, path) as CollectionReference<T>;
}

function typedDoc<T extends DocumentData>(path: string): DocumentReference<T> {
  return doc(firestore, path) as DocumentReference<T>;
}

// ── Sessions ──

export function sessionsRef(): CollectionReference<Session> {
  return typedCollection<Session>('sessions');
}

export function sessionDoc(sessionId: string): DocumentReference<Session> {
  return typedDoc<Session>(`sessions/${sessionId}`);
}

// ── Rooms ──

export function roomsRef(sessionId: string): CollectionReference<Room> {
  return typedCollection<Room>(`sessions/${sessionId}/rooms`);
}

export function roomDoc(sessionId: string, roomId: string): DocumentReference<Room> {
  return typedDoc<Room>(`sessions/${sessionId}/rooms/${roomId}`);
}

// ── Clues ──

export function cluesRef(sessionId: string, roomId: string): CollectionReference<Clue> {
  return typedCollection<Clue>(`sessions/${sessionId}/rooms/${roomId}/clues`);
}

export function clueDoc(sessionId: string, roomId: string, clueId: string): DocumentReference<Clue> {
  return typedDoc<Clue>(`sessions/${sessionId}/rooms/${roomId}/clues/${clueId}`);
}

// ── Players ──

export function playersRef(sessionId: string): CollectionReference<Player> {
  return typedCollection<Player>(`sessions/${sessionId}/players`);
}

export function playerDoc(sessionId: string, playerId: string): DocumentReference<Player> {
  return typedDoc<Player>(`sessions/${sessionId}/players/${playerId}`);
}

// ── Checkpoints ──

export function checkpointsRef(sessionId: string): CollectionReference<Checkpoint> {
  return typedCollection<Checkpoint>(`sessions/${sessionId}/checkpoints`);
}

export function checkpointDoc(sessionId: string, checkpointId: string): DocumentReference<Checkpoint> {
  return typedDoc<Checkpoint>(`sessions/${sessionId}/checkpoints/${checkpointId}`);
}
