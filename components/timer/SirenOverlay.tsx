'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTimer } from '@/hooks/useTimer';

interface SirenOverlayProps {
  sessionId: string;
}

export function SirenOverlay({ sessionId }: SirenOverlayProps) {
  const { isLocked, timerState } = useTimer(sessionId);

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden px-8 text-center"
          style={{ background: 'rgba(8, 4, 4, 0.94)' }}
        >
          <SirenLight />

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.2 }}
            className="relative z-10 mt-8"
          >
            <p className="mb-3 font-mono text-xs tracking-[0.34em] text-[var(--accent-red)]">
              CHECKPOINT ACTIVATED
            </p>
            <h2 className="font-body text-3xl font-bold text-white">
              Checkpoint Pause
            </h2>
            <p className="mt-2 font-mono text-sm tracking-[0.24em] text-white/45">
              INTERVAL {String(timerState?.currentInterval ?? 1).padStart(2, '0')}
            </p>
          </motion.div>

          {timerState?.checkpointMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.14, duration: 0.2 }}
              className="relative z-10 mt-6 w-full max-w-sm rounded-sm border border-white/20 bg-white/5 p-4"
            >
              <p className="font-body text-sm leading-relaxed text-white/76">
                {timerState.checkpointMessage}
              </p>
            </motion.div>
          )}

          <div className="relative z-10 mt-10 flex gap-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="h-2.5 w-2.5 rounded-full bg-[var(--accent-red)]"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.92, 1.12, 0.92] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.18 }}
              />
            ))}
          </div>

          <p className="relative z-10 mt-6 font-mono text-xs tracking-[0.24em] text-white/22">
            AWAITING ADMIN RESUME
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SirenLight() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,46,46,0.5) 0%, rgba(255,46,46,0.18) 28%, rgba(255,46,46,0.04) 56%, transparent 72%)',
        }}
        animate={{ opacity: [0.22, 0.9, 0.22], scale: [0.94, 1.08, 0.94] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-y-0 left-1/2 w-[140vw] -translate-x-1/2"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,30,30,0.08) 40%, rgba(255,50,50,0.28) 50%, rgba(255,30,30,0.08) 60%, transparent 100%)',
          transformOrigin: '50% 50%',
        }}
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
