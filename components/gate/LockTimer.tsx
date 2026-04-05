'use client';

import { useState, useEffect } from 'react';

interface LockTimerProps {
  lockedUntil: number; // Unix ms
  onUnlock: () => void;
}

export function LockTimer({ lockedUntil, onUnlock }: LockTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (remaining <= 0) {
      onUnlock();
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) {
        clearInterval(interval);
        onUnlock();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil, remaining, onUnlock]);

  // Progress bar: 30s total lockout
  const total = 30;
  const elapsed = total - remaining;
  const pct = Math.min(100, (elapsed / total) * 100);

  return (
    <div className="w-full space-y-2">
      {/* Progress bar */}
      <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-sm overflow-hidden">
        <div
          className="h-full bg-[var(--accent-red)] transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Text */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[var(--accent-red)] tracking-widest">
          LOCKED
        </span>
        <span className="font-mono text-xs text-[var(--text-secondary)] tracking-widest tabular-nums">
          {remaining}s
        </span>
      </div>
    </div>
  );
}
