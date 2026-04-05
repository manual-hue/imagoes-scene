'use client';

import { useEffect, useRef, useState } from 'react';
import { onValue } from 'firebase/database';
import { timerRef } from '@/lib/firebase/realtime';
import { playSiren, stopSiren } from '@/lib/audio';
import type { TimerState } from '@/types/timer';

interface UseTimerResult {
  elapsed: number;
  progress: number;
  timerState: TimerState | null;
  isLocked: boolean;
}

const DEMO_INTERVAL_MINUTES = Number(process.env.NEXT_PUBLIC_CHECKPOINT_INTERVAL_MIN ?? 20);
const DEMO_TOTAL_INTERVALS = 5;

function getDemoStorageKey(sessionId: string) {
  return `demo-timer:${sessionId}`;
}

function getDemoBaseState(sessionId: string): TimerState {
  const now = Date.now();

  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(getDemoStorageKey(sessionId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Pick<TimerState, 'timerStartedAt' | 'intervalMinutes' | 'totalIntervals'>;
        if (
          typeof parsed.timerStartedAt === 'number' &&
          typeof parsed.intervalMinutes === 'number' &&
          typeof parsed.totalIntervals === 'number'
        ) {
          return {
            status: 'running',
            timerStartedAt: parsed.timerStartedAt,
            elapsedBeforePause: 0,
            intervalMinutes: parsed.intervalMinutes,
            currentInterval: 1,
            totalIntervals: parsed.totalIntervals,
            sirenActive: false,
            globalLock: false,
            checkpointMessage: null,
          };
        }
      } catch {
        window.localStorage.removeItem(getDemoStorageKey(sessionId));
      }
    }
  }

  const state: TimerState = {
    status: 'running',
    timerStartedAt: now,
    elapsedBeforePause: 0,
    intervalMinutes: DEMO_INTERVAL_MINUTES,
    currentInterval: 1,
    totalIntervals: DEMO_TOTAL_INTERVALS,
    sirenActive: false,
    globalLock: false,
    checkpointMessage: null,
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      getDemoStorageKey(sessionId),
      JSON.stringify({
        timerStartedAt: state.timerStartedAt,
        intervalMinutes: state.intervalMinutes,
        totalIntervals: state.totalIntervals,
      }),
    );
  }

  return state;
}

export function useTimer(sessionId: string): UseTimerResult {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const prevLock = useRef(false);
  const rafRef = useRef<number | null>(null);
  const demoModeRef = useRef(false);

  useEffect(() => {
    const timerDbRef = timerRef(sessionId);
    if (!timerDbRef) {
      demoModeRef.current = true;
      const demoState = getDemoBaseState(sessionId);
      setTimerState(demoState);
      setElapsed(0);
      return () => undefined;
    }
    demoModeRef.current = false;

    const unsubscribe = onValue(timerDbRef, (snapshot) => {
      const state = snapshot.val() as TimerState | null;
      setTimerState(state);

      if (!state) {
        setElapsed(0);
        if (prevLock.current) {
          stopSiren();
          document.documentElement.classList.remove('siren-active');
        }
        prevLock.current = false;
        return;
      }

      const baseElapsed =
        state.status === 'running'
          ? state.elapsedBeforePause + Math.max(0, Date.now() - state.timerStartedAt)
          : state.elapsedBeforePause;

      setElapsed(baseElapsed);

      if (state.globalLock && !prevLock.current) {
        playSiren();
        document.documentElement.classList.add('siren-active');
      } else if (!state.globalLock && prevLock.current) {
        stopSiren();
        document.documentElement.classList.remove('siren-active');
      }

      prevLock.current = state.globalLock;
    });

    return () => {
      unsubscribe();
      stopSiren();
      document.documentElement.classList.remove('siren-active');
    };
  }, [sessionId]);

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!timerState || timerState.status !== 'running') {
      return;
    }

    const tick = () => {
      const now = Date.now();
      const current = timerState.elapsedBeforePause + Math.max(0, now - timerState.timerStartedAt);

      if (demoModeRef.current) {
        const intervalMs = timerState.intervalMinutes * 60 * 1000;
        const totalDuration = intervalMs * timerState.totalIntervals;
        const loopedElapsed = totalDuration > 0 ? current % totalDuration : current;
        const currentInterval =
          intervalMs > 0 ? Math.min(timerState.totalIntervals, Math.floor(loopedElapsed / intervalMs) + 1) : 1;

        setElapsed(loopedElapsed);
        setTimerState((prev) => (
          prev
            ? {
                ...prev,
                currentInterval,
                globalLock: false,
                sirenActive: false,
                status: 'running',
              }
            : prev
        ));
      } else {
        setElapsed(current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [timerState]);

  const intervalMs = (timerState?.intervalMinutes ?? 20) * 60 * 1000;
  const intervalElapsed = intervalMs > 0 ? elapsed % intervalMs : 0;
  const progress = intervalMs > 0 ? intervalElapsed / intervalMs : 0;

  return {
    elapsed,
    progress,
    timerState,
    isLocked: timerState?.globalLock ?? false,
  };
}
