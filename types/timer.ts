export interface TimerState {
  status: 'idle' | 'running' | 'paused' | 'ended';
  timerStartedAt: number;
  elapsedBeforePause: number;
  intervalMinutes: number;
  currentInterval: number;
  totalIntervals: number;
  sirenActive: boolean;
  globalLock: boolean;
  checkpointMessage?: string | null;
}
