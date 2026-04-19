import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from './index';
import { getUid, signInAnonymous } from './auth';

export interface BoardCard {
  id: string;
  photoId: string;
  imageUrl: string;
  memo: string;
  roomName: string;
  submittedBy: string;
  submittedAt: number;
  playerUid: string;
}

function boardCol(sessionId: string) {
  return collection(firestore, `sessions/${sessionId}/board`);
}

export async function submitBoardCard(
  sessionId: string,
  photoId: string,
  blob: Blob,
  meta: { memo: string; roomName: string; submittedBy: string },
): Promise<BoardCard> {
  let uid = getUid();
  if (!uid) {
    const user = await signInAnonymous();
    uid = user.uid;
  }

  const cardId = `${photoId}_${meta.submittedBy.replace(/\s+/g, '_')}`;
  const imageRef = ref(storage, `sessions/${sessionId}/board/${cardId}.jpg`);
  await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });
  const imageUrl = await getDownloadURL(imageRef);

  const card: BoardCard = {
    id: cardId,
    photoId,
    imageUrl,
    memo: meta.memo,
    roomName: meta.roomName,
    submittedBy: meta.submittedBy,
    submittedAt: Date.now(),
    playerUid: uid,
  };

  await setDoc(doc(boardCol(sessionId), cardId), card);
  return card;
}

export async function deleteBoardCard(sessionId: string, cardId: string): Promise<void> {
  await deleteDoc(doc(boardCol(sessionId), cardId));
  const imageRef = ref(storage, `sessions/${sessionId}/board/${cardId}.jpg`);
  await deleteObject(imageRef).catch(() => undefined);
}

export async function clearBoardCards(sessionId: string): Promise<void> {
  const snap = await getDocs(boardCol(sessionId));
  const batch = writeBatch(firestore);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export function subscribeBoardCards(
  sessionId: string,
  callback: (cards: BoardCard[]) => void,
): Unsubscribe {
  return onSnapshot(boardCol(sessionId), (snap) => {
    const cards = snap.docs
      .map((d) => d.data() as BoardCard)
      .sort((a, b) => b.submittedAt - a.submittedAt);
    callback(cards);
  });
}
