'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { hasFirebaseClientConfig } from '@/lib/firebase/index';
import { getLocalSession } from '@/lib/mock-data';

interface SessionItem {
  id: string;
  name: string;
  sessionCode: string;
  status: 'waiting' | 'active' | 'ended';
}

export default function HomePage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasFirebaseClientConfig()) {
      const local = getLocalSession();
      setSessions([
        {
          id: local.id,
          name: local.name,
          sessionCode: local.sessionCode,
          status: 'active',
        },
      ]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { sessionsRef } = await import('@/lib/firebase/firestore');
      const { query, where, orderBy, onSnapshot } = await import('firebase/firestore');

      const q = query(
        sessionsRef(),
        where('status', 'in', ['waiting', 'active']),
        orderBy('createdAt', 'desc'),
      );

      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const items: SessionItem[] = snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
            sessionCode: d.data().sessionCode,
            status: d.data().status,
          }));
          setSessions(items);
          setLoading(false);
        },
        (error) => {
          console.error('[HomePage] sessions query error:', error);
          setLoading(false);
        },
      );
    })();

    return () => unsubscribe?.();
  }, []);

  return (
    <div className="room-layout">
      <div className="room-shell flex flex-col">
        {/* Header */}
        <header className="shrink-0 border-b border-[var(--border-dim)] px-5 pb-4 pt-6">
          <p className="font-mono text-xs tracking-[0.3em] text-[var(--text-mono)] terminal-glow">
            IMAGOES SCENE ZERO
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-[var(--text-dim)]">
            SELECT SESSION
          </p>
        </header>

        {/* Content */}
        <div className="scroll-container min-h-0 flex-1 px-5 py-5">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="font-mono text-xs tracking-[0.2em] text-[var(--text-dim)] animate-pulse">
                LOADING...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
              <div className="h-px w-12 bg-[var(--border-mid)]" />
              <p className="font-body text-sm leading-relaxed text-[var(--text-secondary)]">
                활성 세션이 없습니다
              </p>
              <p className="font-mono text-[10px] tracking-[0.24em] text-[var(--text-dim)]">
                NO ACTIVE SESSIONS
              </p>
              <div className="h-px w-12 bg-[var(--border-mid)]" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="mb-1 font-mono text-[10px] tracking-[0.28em] text-[var(--text-dim)]">
                SESSIONS · {sessions.length}
              </p>
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/hub/${s.id}`}
                  className="flex min-h-[52px] items-center justify-between gap-3 rounded-sm border border-[var(--border-dim)] bg-[var(--bg-secondary)] px-4 py-3 transition-colors active:border-[var(--accent-teal)]/40 hover:border-[var(--border-mid)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[var(--accent-teal)]/10 font-mono text-[10px] text-[var(--accent-teal)]">
                      {s.sessionCode}
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate font-body text-sm font-medium text-[var(--text-primary)]">
                        {s.name}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--text-dim)]">
                        {s.status === 'active' ? 'ACTIVE' : 'WAITING'}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-[var(--text-dim)]">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
