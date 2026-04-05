import { Timestamp } from 'firebase/firestore';

export interface SessionConfig {
  intervalMinutes: number;
  totalIntervals: number;
  accessCode: string;
  maxPlayers: number;
}

export interface Session {
  sessionCode: string;
  adminId: string;
  name: string;
  status: 'waiting' | 'active' | 'ended';
  createdAt: Timestamp;
  config: SessionConfig;
}
