'use client';

import { useState } from 'react';
import { useTimer } from '@/hooks/useTimer';

interface TimerWidgetProps {
  sessionId: string;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function TimerWidget({ sessionId }: TimerWidgetProps) {
  const { elapsed, progress, timerState, isLocked } = useTimer(sessionId);
  const [expanded, setExpanded] = useState(false);
  const intervalMs = (timerState?.intervalMinutes ?? 20) * 60 * 1000;
  const normalizedElapsed = intervalMs > 0 ? elapsed % intervalMs : 0;
  const remaining =
    timerState?.status === 'running'
      ? intervalMs - normalizedElapsed
      : Math.max(0, intervalMs - normalizedElapsed);
  const displayedProgress = timerState?.status === 'ended' ? 1 : progress;
  const displayTime =
    remaining === intervalMs && timerState?.status !== 'running'
      ? formatRemaining(0)
      : formatRemaining(remaining);

  return (
    <aside className="pointer-events-auto absolute right-3 top-3 z-40" aria-live="polite">
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/72 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex min-h-[36px] items-center gap-2 px-2.5 py-1.5 text-left"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className={`h-2 w-2 rounded-full ${
                isLocked ? 'bg-accent-red' : 'bg-accent-amber'
              }`}
            />
            <p className="font-body text-sm font-bold leading-none text-white">{displayTime}</p>
          </div>
          <span className="font-mono text-[11px] text-white/45">{expanded ? '−' : '+'}</span>
        </button>

        {expanded && (
          <div className="border-t border-white/10 px-3 pb-3 pt-2">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <p className="font-body text-2xl font-bold leading-none text-white">{displayTime}</p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-white/35">
                  INTERVAL {String(timerState?.currentInterval ?? 1).padStart(2, '0')}
                  {' / '}
                  {String(timerState?.totalIntervals ?? 5).padStart(2, '0')}
                </p>
              </div>

              <p className="font-mono text-xs tracking-[0.18em] text-white/60">
                {timerState?.status === 'ended' ? 'DONE' : `${Math.round(displayedProgress * 100)}%`}
              </p>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full transition-[width] duration-100 ${
                  isLocked ? 'bg-accent-red' : 'bg-accent-amber'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, displayedProgress * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
