'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getVisited } from '@/lib/visited';
import { getLocalRooms, getLocalPhones, getLocalSession } from '@/lib/mock-data';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';

export default function HubPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const session = getLocalSession();

  const allRooms = getLocalRooms(sessionId);
  const allPhones = getLocalPhones(sessionId);

  const [visitedRooms, setVisitedRooms] = useState<string[]>([]);
  const [visitedPhones, setVisitedPhones] = useState<string[]>([]);

  useEffect(() => {
    const visited = getVisited(sessionId);
    setVisitedRooms(visited.rooms);
    setVisitedPhones(visited.phones);
  }, [sessionId]);

  const rooms = allRooms.filter((r) => visitedRooms.includes(r.id));
  const phones = allPhones.filter((p) => visitedPhones.includes(p.id));
  const isEmpty = rooms.length === 0 && phones.length === 0;

  return (
    <div className="room-layout">
      <div className="room-shell flex flex-col">
        {/* Header */}
        <header className="shrink-0 border-b border-[var(--border-dim)] px-5 pb-4 pt-6">
          <p className="font-mono text-xs tracking-[0.3em] text-[var(--text-mono)] terminal-glow">
            CRIME SCENE ZERO
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-[var(--text-dim)]">
            SESSION · {session.sessionCode}
          </p>
        </header>

        {/* Content */}
        <div className="scroll-container min-h-0 flex-1 px-5 py-5">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
              <div className="h-px w-12 bg-[var(--border-mid)]" />
              <p className="font-body text-sm leading-relaxed text-[var(--text-secondary)]">
                QR 코드를 스캔하여
                <br />
                수사를 시작하세요
              </p>
              <p className="font-mono text-[10px] tracking-[0.24em] text-[var(--text-dim)]">
                SCAN QR TO BEGIN INVESTIGATION
              </p>
              <div className="h-px w-12 bg-[var(--border-mid)]" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Rooms Section */}
              {rooms.length > 0 && (
                <section>
                  <p className="mb-3 font-mono text-[10px] tracking-[0.28em] text-[var(--text-dim)]">
                    ROOMS · {rooms.length}
                  </p>
                  <div className="flex flex-col gap-2">
                    {rooms.map((room) => (
                      <Link
                        key={room.id}
                        href={`/room/${sessionId}/${room.id}`}
                        className="flex min-h-[52px] items-center justify-between gap-3 rounded-sm border border-[var(--border-dim)] bg-[var(--bg-secondary)] px-4 py-3 transition-colors active:border-[var(--accent-teal)]/40 hover:border-[var(--border-mid)]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[var(--accent-teal)]/10 font-mono text-xs text-[var(--accent-teal)]">
                            {room.shortCode}
                          </span>
                          <span className="truncate font-body text-sm font-medium text-[var(--text-primary)]">
                            {room.name}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-[var(--text-dim)]">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Phones Section */}
              {phones.length > 0 && (
                <section>
                  <p className="mb-3 font-mono text-[10px] tracking-[0.28em] text-[var(--text-dim)]">
                    PHONES · {phones.length}
                  </p>
                  <div className="flex flex-col gap-2">
                    {phones.map((phone) => (
                      <Link
                        key={phone.id}
                        href={`/phones/${phone.id}`}
                        className="flex min-h-[52px] items-center justify-between gap-3 rounded-sm border border-[var(--border-dim)] bg-[var(--bg-secondary)] px-4 py-3 transition-colors active:border-[var(--accent-amber)]/40 hover:border-[var(--border-mid)]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[var(--accent-amber)]/10 font-mono text-xs text-[var(--accent-amber)]">
                            PH
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate font-body text-sm font-medium text-[var(--text-primary)]">
                              {phone.owner}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--text-dim)]">
                              {phone.device}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-[var(--text-dim)]">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Bottom Tab Bar */}
        <BottomTabBar sessionId={sessionId} />
      </div>
    </div>
  );
}
