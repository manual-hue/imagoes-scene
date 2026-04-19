'use client';

import {
  arrayRemove,
  arrayUnion,
  deleteField,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  createStore,
  del,
  entries,
  get,
  set,
} from 'idb-keyval';
import { deletePlayerPhoto, uploadPlayerPhoto } from '@/lib/firebase/storage';
import { firestore } from '@/lib/firebase';
import { getUid, signInAnonymous } from '@/lib/firebase/auth';
import type { EvidencePhoto } from '@/types/evidence';

const evidenceStore = createStore('csz-evidence-db', 'photos');
const PHOTO_PREFIX = 'photo:';
const BLOB_PREFIX = 'blob:';
const EVIDENCE_EVENT = 'evidence:changed';

export interface SavePhotoInput {
  sessionId: string;
  roomId: string;
  roomName: string;
  dataUrl: string;
  memo: string;
}

function photoKey(photoId: string) {
  return `${PHOTO_PREFIX}${photoId}`;
}

function blobKey(photoId: string) {
  return `${BLOB_PREFIX}${photoId}`;
}

function emitEvidenceChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVIDENCE_EVENT));
  }
}

function trimMemo(memo: string) {
  return memo.trim().slice(0, 200);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

async function ensureSignedInUid(): Promise<string | null> {
  const currentUid = getUid();
  if (currentUid) {
    return currentUid;
  }

  try {
    const user = await signInAnonymous();
    return user.uid;
  } catch {
    return null;
  }
}

async function setPhotoMeta(photo: EvidencePhoto) {
  await set(photoKey(photo.id), photo, evidenceStore);
}

async function getPhotoMeta(photoId: string): Promise<EvidencePhoto | null> {
  return (await get<EvidencePhoto>(photoKey(photoId), evidenceStore)) ?? null;
}

async function getPhotoBlob(photoId: string): Promise<Blob | null> {
  return (await get<Blob>(blobKey(photoId), evidenceStore)) ?? null;
}

async function updatePlayerPhotoRecord(photo: EvidencePhoto, uid: string) {
  const playerRef = doc(firestore, `sessions/${photo.sessionId}/players/${uid}`);
  await setDoc(
    playerRef,
    {
      uid,
      nickname: 'Anonymous Detective',
      joinedAt: serverTimestamp(),
      currentRoomId: photo.roomId,
      visitedRooms: arrayUnion(photo.roomId),
      photoIds: arrayUnion(photo.id),
      photoMemos: {
        [photo.id]: photo.memo,
      },
      accusation: null,
    },
    { merge: true },
  );
}

async function syncPhoto(photoId: string): Promise<void> {
  const photo = await getPhotoMeta(photoId);
  const blob = await getPhotoBlob(photoId);

  if (!photo || !blob || photo.synced || photo.syncStatus === 'syncing') {
    return;
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  const syncingPhoto: EvidencePhoto = {
    ...photo,
    syncStatus: 'syncing',
    syncError: null,
  };
  await setPhotoMeta(syncingPhoto);
  emitEvidenceChange();

  const uid = await ensureSignedInUid();
  if (!uid) {
    await setPhotoMeta({
      ...photo,
      syncStatus: 'error',
      syncError: 'Anonymous sign-in failed',
    });
    emitEvidenceChange();
    return;
  }

  try {
    const uploaded = await uploadPlayerPhoto(photo.sessionId, uid, photo.id, blob);
    const syncedPhoto: EvidencePhoto = {
      ...photo,
      playerUid: uid,
      storageUrl: uploaded.url,
      storagePath: uploaded.path,
      synced: true,
      syncStatus: 'synced',
      syncError: null,
    };

    await setPhotoMeta(syncedPhoto);
    await updatePlayerPhotoRecord(syncedPhoto, uid);
    emitEvidenceChange();
  } catch (error) {
    await setPhotoMeta({
      ...photo,
      playerUid: uid,
      syncStatus: 'error',
      syncError: error instanceof Error ? error.message : 'Upload failed',
    });
    emitEvidenceChange();
  }
}

export async function listEvidencePhotos(sessionId: string): Promise<EvidencePhoto[]> {
  const allEntries = await entries<string, EvidencePhoto | Blob>(evidenceStore);

  return allEntries
    .filter(
      ([key, value]) =>
        key.startsWith(PHOTO_PREFIX) &&
        value !== null &&
        typeof value === 'object' &&
        'sessionId' in value &&
        (value as EvidencePhoto).sessionId === sessionId,
    )
    .map(([, value]) => value as EvidencePhoto)
    .sort((left, right) => right.capturedAt - left.capturedAt);
}

export async function getEvidencePhotoBlob(photoId: string): Promise<Blob | null> {
  return getPhotoBlob(photoId);
}

export async function savePhoto({
  sessionId,
  roomId,
  roomName,
  dataUrl,
  memo,
}: SavePhotoInput): Promise<EvidencePhoto> {
  const id = crypto.randomUUID();
  const normalizedMemo = trimMemo(memo);
  const blob = dataUrlToBlob(dataUrl);
  const photo: EvidencePhoto = {
    id,
    sessionId,
    roomId,
    roomName,
    capturedAt: Date.now(),
    memo: normalizedMemo,
    playerUid: getUid(),
    localThumbnail: dataUrl,
    synced: false,
    syncStatus: 'local',
    syncError: null,
  };

  await setPhotoMeta(photo);
  await set(blobKey(id), blob, evidenceStore);
  emitEvidenceChange();

  return photo;
}

export async function updatePhotoMemo(photoId: string, newMemo: string): Promise<void> {
  const photo = await getPhotoMeta(photoId);
  if (!photo) {
    return;
  }

  const nextMemo = trimMemo(newMemo);
  const nextPhoto: EvidencePhoto = {
    ...photo,
    memo: nextMemo,
    syncError: null,
  };

  await setPhotoMeta(nextPhoto);
  emitEvidenceChange();

  if (photo.synced && photo.playerUid) {
    const playerRef = doc(firestore, `sessions/${photo.sessionId}/players/${photo.playerUid}`);
    await updateDoc(playerRef, {
      [`photoMemos.${photoId}`]: nextMemo,
    });
  }
}

export async function deletePhoto(photoId: string): Promise<void> {
  const photo = await getPhotoMeta(photoId);
  if (!photo) {
    return;
  }

  await del(photoKey(photoId), evidenceStore);
  await del(blobKey(photoId), evidenceStore);
  emitEvidenceChange();

  if (photo.storagePath && photo.playerUid) {
    await deletePlayerPhoto(photo.sessionId, photo.playerUid, photo.id).catch(() => undefined);
    const playerRef = doc(firestore, `sessions/${photo.sessionId}/players/${photo.playerUid}`);
    await updateDoc(playerRef, {
      photoIds: arrayRemove(photo.id),
      [`photoMemos.${photo.id}`]: deleteField(),
    }).catch(() => undefined);
  }
}

export async function syncPendingPhotos(sessionId: string): Promise<void> {
  const photos = await listEvidencePhotos(sessionId);
  await Promise.all(
    photos
      .filter((photo) => !photo.synced)
      .map((photo) => syncPhoto(photo.id)),
  );
}

export { EVIDENCE_EVENT };
