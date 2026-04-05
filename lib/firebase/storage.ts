import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type StorageReference,
} from 'firebase/storage';
import { storage } from './index';

function storageRef(path: string): StorageReference {
  return ref(storage, path);
}

// ── Player photos ──

export function playerPhotoRef(
  sessionId: string,
  uid: string,
  photoId: string,
): StorageReference {
  return storageRef(`sessions/${sessionId}/players/${uid}/photos/${photoId}.jpg`);
}

export async function uploadPlayerPhoto(
  sessionId: string,
  uid: string,
  photoId: string,
  blob: Blob,
): Promise<{ url: string; path: string }> {
  const photoRef = playerPhotoRef(sessionId, uid, photoId);
  await uploadBytes(photoRef, blob, { contentType: 'image/jpeg' });
  const url = await getDownloadURL(photoRef);
  return { url, path: photoRef.fullPath };
}

export async function deletePlayerPhoto(
  sessionId: string,
  uid: string,
  photoId: string,
): Promise<void> {
  const photoRef = playerPhotoRef(sessionId, uid, photoId);
  await deleteObject(photoRef);
}

// ── Room background ──

export function roomBackgroundRef(
  sessionId: string,
  roomId: string,
): StorageReference {
  return storageRef(`sessions/${sessionId}/rooms/${roomId}/background.webp`);
}

export async function getRoomBackgroundUrl(
  sessionId: string,
  roomId: string,
): Promise<string> {
  return getDownloadURL(roomBackgroundRef(sessionId, roomId));
}

// ── Clue assets ──

export function clueAssetRef(
  sessionId: string,
  clueId: string,
  filename: string,
): StorageReference {
  return storageRef(`sessions/${sessionId}/clues/${clueId}/${filename}`);
}
