'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { sha256 } from '@/lib/crypto';
import { CodeInput } from '@/components/gate/CodeInput';
import { LockTimer } from '@/components/gate/LockTimer';

const CODE_LENGTH = (process.env.NEXT_PUBLIC_ACCESS_CODE ?? '').length || 7;
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 30_000;

const LS_KEY_ATTEMPTS = 'csz_gate_attempts';
const LS_KEY_LOCKED = 'csz_gate_locked_until';

interface GateState {
  attempts: number;
  lockedUntil: number;
}

function loadLockState(): GateState {
  if (typeof window === 'undefined') return { attempts: 0, lockedUntil: 0 };
  const attempts = parseInt(localStorage.getItem(LS_KEY_ATTEMPTS) ?? '0', 10);
  const lockedUntil = parseInt(localStorage.getItem(LS_KEY_LOCKED) ?? '0', 10);
  if (lockedUntil > 0 && Date.now() >= lockedUntil) {
    localStorage.setItem(LS_KEY_ATTEMPTS, '0');
    localStorage.setItem(LS_KEY_LOCKED, '0');
    return { attempts: 0, lockedUntil: 0 };
  }
  return { attempts, lockedUntil };
}

function saveLockState(state: GateState) {
  localStorage.setItem(LS_KEY_ATTEMPTS, String(state.attempts));
  localStorage.setItem(LS_KEY_LOCKED, String(state.lockedUntil));
}

function GateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') ?? '/';

  const [code, setCode] = useState('');
  const [gateState, setGateState] = useState<GateState>({
    attempts: 0,
    lockedUntil: 0,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setGateState(loadLockState());
    setMounted(true);
  }, []);

  const isLocked = gateState.lockedUntil > 0 && Date.now() < gateState.lockedUntil;

  const handleUnlock = useCallback(() => {
    const next: GateState = { attempts: 0, lockedUntil: 0 };
    setGateState(next);
    saveLockState(next);
    setError('');
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting || code.length === 0) return;
    if (isLocked) return;

    setIsSubmitting(true);
    setError('');

    try {
      const codeHash = await sha256(code);

      const res = await fetch('/api/auth/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeHash }),
      });

      const data = await res.json();

      if (data.ok) {
        localStorage.removeItem(LS_KEY_ATTEMPTS);
        localStorage.removeItem(LS_KEY_LOCKED);

        // Firebase Anonymous Auth — will be wired in Firebase sprint
        // await signInAnonymously(auth);

        router.replace(redirectPath);
        return;
      }

      const newAttempts = gateState.attempts + 1;
      let newLockedUntil = 0;

      if (newAttempts >= MAX_ATTEMPTS) {
        newLockedUntil = Date.now() + LOCK_DURATION_MS;
        setError('접근 차단됨. 30초 후 재시도하세요.');
      } else {
        setError(
          `잘못된 코드입니다. (${newAttempts}/${MAX_ATTEMPTS})`,
        );
      }

      const next: GateState = {
        attempts: newAttempts >= MAX_ATTEMPTS ? 0 : newAttempts,
        lockedUntil: newLockedUntil,
      };
      setGateState(next);
      saveLockState(next);
      setCode('');
    } catch {
      setError('서버 연결 실패. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="full-screen flex flex-col items-center justify-center px-6 bg-[var(--bg-primary)]">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="font-mono text-lg tracking-[0.25em] text-[var(--text-mono)] terminal-glow mb-2">
          ◈ CRIME SCENE ZERO ◈
        </h1>
        <p className="font-body text-sm text-[var(--text-secondary)]">
          신원 확인
        </p>
      </motion.div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Code input box */}
        <div className="border border-[var(--border-mid)] bg-[var(--bg-secondary)] rounded-sm p-4">
          <p className="font-mono text-xs text-[var(--text-dim)] tracking-widest mb-3 text-center">
            ENTER ACCESS CODE
          </p>
          <CodeInput
            value={code}
            maxLength={CODE_LENGTH}
            disabled={isLocked || isSubmitting}
            onChange={setCode}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Submit button */}
        <div className="relative">
          <button
            onClick={handleSubmit}
            disabled={isLocked || isSubmitting || code.length === 0}
            className="
              w-full py-3 min-h-[44px]
              font-mono text-sm tracking-[0.2em]
              border border-[var(--border-mid)]
              text-[var(--text-primary)] bg-[var(--bg-elevated)]
              hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
              active:scale-[0.98] transition-all duration-150
              disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--border-mid)]
              disabled:hover:text-[var(--text-primary)]
              overflow-hidden
            "
          >
            {isSubmitting ? 'VERIFYING...' : 'AUTHENTICATE'}
          </button>
          {isSubmitting && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--bg-elevated)] overflow-hidden">
              <motion.div
                className="h-full bg-[var(--accent-teal)]"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: '40%' }}
              />
            </div>
          )}
        </div>

        {/* Error message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="font-mono text-xs text-[var(--accent-red)] text-center tracking-wider"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Lock timer */}
        <AnimatePresence>
          {isLocked && (
            <motion.div
              key="lock"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <LockTimer
                lockedUntil={gateState.lockedUntil}
                onUnlock={handleUnlock}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function GatePage() {
  return (
    <Suspense>
      <GateContent />
    </Suspense>
  );
}
