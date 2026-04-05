import type { Session } from './session';
import type { TimerState } from './timer';

export interface AdminSessionSummary {
  id: string;
  name: string;
  sessionCode: string;
  status: Session['status'];
  createdAt: string | null;
  roomCount: number;
  playerCount: number;
}

export interface AdminRoomSummary {
  id: string;
  name: string;
  shortCode: string;
  order: number;
  description: string;
  isAccessible: boolean;
  visitCount: number;
}

export interface AdminCheckpointSummary {
  id: string;
  interval: number;
  triggeredAt: string | null;
  resumedAt: string | null;
}

export interface AdminSessionDetail {
  session: AdminSessionSummary & {
    config: Session['config'];
  };
  rooms: AdminRoomSummary[];
  checkpoints: AdminCheckpointSummary[];
  timerState: TimerState | null;
}
