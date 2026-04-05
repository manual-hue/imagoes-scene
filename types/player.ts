import { Timestamp } from 'firebase/firestore';

export interface Player {
  uid: string;
  nickname: string;
  joinedAt: Timestamp;
  currentRoomId: string;
  visitedRooms: string[];
  photoIds: string[];
  photoMemos: Record<string, string>;
  accusation: string | null;
}
