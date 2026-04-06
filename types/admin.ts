import type { Session } from './session';
import type { TimerState } from './timer';

export interface AdminSessionSummary {
  id: string;
  name: string;
  sessionCode: string;
  status: Session['status'];
  createdAt: string | null;
  playerCount: number;
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
  checkpoints: AdminCheckpointSummary[];
  timerState: TimerState | null;
}
