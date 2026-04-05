import { Timestamp } from 'firebase/firestore';

export interface Checkpoint {
  interval: number;
  triggeredAt: Timestamp;
  resumedAt: Timestamp | null;
}
