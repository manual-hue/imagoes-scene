'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { subscribeTimer } from '@/lib/firebase/realtime';
import { firestore, hasFirebaseClientConfig } from '@/lib/firebase';
import type { AdminCheckpointSummary, AdminRoomSummary, AdminSessionDetail } from '@/types/admin';
import type { TimerState } from '@/types/timer';

interface SessionDashboardProps {
  sessionId: string;
  initialDetail: AdminSessionDetail;
}

const TIMER_STATUS_LABELS: Record<string, string> = {
  idle: 'IDLE',
  running: 'RUNNING',
  paused: 'PAUSED',
  ended: 'ENDED',
};

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

async function parseJsonResponse(response: Response) {
  const payload = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? '요청에 실패했습니다');
  }
}

export function SessionDashboard({ sessionId, initialDetail }: SessionDashboardProps) {
  const [timerState, setTimerState] = useState<TimerState | null>(initialDetail.timerState);
  const [playerCount, setPlayerCount] = useState(initialDetail.session.playerCount);
  const [rooms, setRooms] = useState(initialDetail.rooms);
  const [checkpoints, setCheckpoints] = useState<AdminCheckpointSummary[]>(initialDetail.checkpoints);
  const [resumeMessage, setResumeMessage] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => subscribeTimer(sessionId, setTimerState), [sessionId]);

  useEffect(() => {
    if (!hasFirebaseClientConfig()) {
      return () => undefined;
    }

    const playersQuery = collection(firestore, `sessions/${sessionId}/players`);
    const roomsQuery = query(collection(firestore, `sessions/${sessionId}/rooms`), orderBy('order', 'asc'));

    const unsubscribePlayers = onSnapshot(playersQuery, (snapshot) => {
      setPlayerCount(snapshot.size);
    });

    const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
      setRooms(
        snapshot.docs.map((doc, index) => {
          const data = doc.data() as Partial<AdminRoomSummary>;

          return {
            id: doc.id,
            name: data.name ?? doc.id,
            shortCode: data.shortCode ?? '',
            order: typeof data.order === 'number' ? data.order : index + 1,
            description: data.description ?? '',
            isAccessible: data.isAccessible ?? true,
            visitCount: typeof data.visitCount === 'number' ? data.visitCount : 0,
          };
        }),
      );
    });

    return () => {
      unsubscribePlayers();
      unsubscribeRooms();
    };
  }, [sessionId]);

  const timerStatus = timerState?.status ?? 'idle';
  const isCheckpointLocked = timerState?.globalLock ?? false;
  const timerSummary = useMemo(() => ({
    intervalMinutes: timerState?.intervalMinutes ?? initialDetail.session.config.intervalMinutes,
    currentInterval: timerState?.currentInterval ?? 1,
    totalIntervals: timerState?.totalIntervals ?? initialDetail.session.config.totalIntervals,
  }), [initialDetail.session.config.intervalMinutes, initialDetail.session.config.totalIntervals, timerState?.currentInterval, timerState?.intervalMinutes, timerState?.totalIntervals]);

  function runTimerAction(action: 'start' | 'pause' | 'resume') {
    const actionLabels: Record<string, string> = {
      start: '시작',
      pause: '일시정지',
      resume: '재개',
    };
    startTransition(async () => {
      try {
        setFeedback(null);
        const response = await fetch(`/api/timer/${action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
          }),
        });

        await parseJsonResponse(response);
        setFeedback(`타이머 ${actionLabels[action]} 완료`);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : '타이머 업데이트 실패');
      }
    });
  }

  function resumeCheckpoint() {
    startTransition(async () => {
      try {
        setFeedback(null);
        const response = await fetch('/api/checkpoint/resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            message: resumeMessage.trim() || null,
          }),
        });

        await parseJsonResponse(response);
        setCheckpoints((current) =>
          current.map((checkpoint, index) =>
            index === 0 && checkpoint.resumedAt === null
              ? {
                  ...checkpoint,
                  resumedAt: new Date().toISOString(),
                }
              : checkpoint,
          ),
        );
        setFeedback('중간점검 재개 완료');
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : '중간점검 재개 실패');
      }
    });
  }

  function toggleRoomAccess(roomId: string, isAccessible: boolean) {
    startTransition(async () => {
      try {
        setFeedback(null);
        const response = await fetch(`/api/room/${sessionId}/${roomId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isAccessible: !isAccessible,
          }),
        });

        await parseJsonResponse(response);
        setRooms((current) =>
          current.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  isAccessible: !isAccessible,
                }
              : room,
          ),
        );
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : '방 상태 변경 실패');
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      {/* LEFT COLUMN */}
      <div className="space-y-6">

        {/* Status Strip */}
        <div className="grid grid-cols-3 border border-black/12 divide-x divide-black/8">
          <div className="p-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-black/35 uppercase">Players</p>
            <p className="mt-1 font-mono text-2xl font-bold text-black">{playerCount}</p>
          </div>
          <div className="p-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-black/35 uppercase">Timer</p>
            <p className="mt-1 font-mono text-2xl font-bold text-black">
              {TIMER_STATUS_LABELS[timerStatus] ?? timerStatus}
            </p>
          </div>
          <div className="p-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-black/35 uppercase">Interval</p>
            <p className="mt-1 font-mono text-2xl font-bold text-black">
              {timerSummary.currentInterval}
              <span className="text-black/25">/{timerSummary.totalIntervals}</span>
            </p>
          </div>
        </div>

        {/* Timer Control */}
        <section className="border border-black/12">
          <div className="border-b border-black/8 px-5 py-3 flex items-center justify-between">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
              Timer Control
            </h2>
            <span className="font-mono text-[10px] text-black/25">
              {timerSummary.intervalMinutes}min interval
            </span>
          </div>

          <div className="p-5">
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => runTimerAction('start')}
                disabled={isPending || timerStatus === 'running'}
                className="min-h-[44px] border border-black bg-black font-mono text-xs font-bold tracking-[0.15em] text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-transparent disabled:text-black/20"
              >
                START
              </button>
              <button
                type="button"
                onClick={() => runTimerAction('pause')}
                disabled={isPending || timerStatus !== 'running'}
                className="min-h-[44px] border border-black/30 font-mono text-xs tracking-[0.15em] text-black/70 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/20"
              >
                PAUSE
              </button>
              <button
                type="button"
                onClick={() => runTimerAction('resume')}
                disabled={isPending || !['paused', 'idle'].includes(timerStatus)}
                className="min-h-[44px] border border-black/30 font-mono text-xs tracking-[0.15em] text-black/70 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/20"
              >
                RESUME
              </button>
            </div>

            {/* Checkpoint Resume */}
            <div className="mt-5 border-t border-black/8 pt-5">
              <p className="font-mono text-[10px] tracking-[0.2em] text-black/30 uppercase mb-3">
                Checkpoint Resume
              </p>
              <input
                type="text"
                value={resumeMessage}
                onChange={(event) => setResumeMessage(event.target.value)}
                placeholder="플레이어에게 표시될 메시지 (선택)"
                className="min-h-[40px] w-full border border-black/12 bg-transparent px-3 font-mono text-sm text-black outline-none transition placeholder:text-black/20 focus:border-black/30"
              />
              <button
                type="button"
                onClick={resumeCheckpoint}
                disabled={isPending || !isCheckpointLocked}
                className="mt-3 min-h-[40px] w-full border border-black/25 font-mono text-xs tracking-[0.15em] text-black/50 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/8 disabled:text-black/15"
              >
                RESUME CHECKPOINT
              </button>
            </div>

            {/* Feedback */}
            {feedback ? (
              <p className="mt-4 border-t border-black/8 pt-3 font-mono text-xs text-black/50">
                &gt; {feedback}
              </p>
            ) : null}
          </div>
        </section>

        {/* Room Access */}
        <section className="border border-black/12">
          <div className="border-b border-black/8 px-5 py-3">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
              Room Access
            </h2>
          </div>

          <div className="divide-y divide-black/[0.06]">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] tracking-wider text-black/35">
                      {room.shortCode}
                    </span>
                    <span className="text-sm text-black">{room.name}</span>
                  </div>
                  {room.description ? (
                    <p className="mt-0.5 text-xs text-black/30 truncate">{room.description}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        room.isAccessible ? 'bg-black' : 'bg-black/15'
                      }`}
                    />
                    <span className="font-mono text-[10px] tracking-wider text-black/35">
                      {room.isAccessible ? 'OPEN' : 'LOCKED'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleRoomAccess(room.id, room.isAccessible)}
                    disabled={isPending}
                    className="min-h-[32px] border border-black/15 px-3 font-mono text-[10px] tracking-wider text-black/50 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {room.isAccessible ? 'LOCK' : 'OPEN'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN */}
      <aside className="space-y-6">
        {/* Checkpoint History */}
        <section className="border border-black/12">
          <div className="border-b border-black/8 px-5 py-3">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
              Checkpoints
            </h2>
          </div>

          <div className="divide-y divide-black/[0.06]">
            {checkpoints.length > 0 ? (
              checkpoints.map((checkpoint) => (
                <div key={checkpoint.id} className="px-5 py-3">
                  <p className="font-mono text-xs text-black/60">
                    INT {String(checkpoint.interval).padStart(2, '0')}
                  </p>
                  <div className="mt-1.5 space-y-0.5 font-mono text-[10px] text-black/30">
                    <p>TRIGGERED {formatDate(checkpoint.triggeredAt)}</p>
                    <p>
                      RESUMED{' '}
                      {checkpoint.resumedAt ? (
                        <span className="text-black/50">{formatDate(checkpoint.resumedAt)}</span>
                      ) : (
                        <span className="text-black/20">PENDING</span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-5 py-4 font-mono text-[10px] text-black/20 tracking-wider">
                NO CHECKPOINTS YET
              </p>
            )}
          </div>
        </section>

        {/* Timer Detail */}
        <section className="border border-black/12">
          <div className="border-b border-black/8 px-5 py-3">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
              Timer Detail
            </h2>
          </div>

          <div className="px-5 py-3 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-black/30">CURRENT</span>
              <span className="text-black/60">{timerSummary.currentInterval}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/30">TOTAL</span>
              <span className="text-black/60">{timerSummary.totalIntervals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/30">LOCK</span>
              <span className={isCheckpointLocked ? 'text-black' : 'text-black/25'}>
                {isCheckpointLocked ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-black/30 shrink-0">MSG</span>
              <span className="text-black/45 text-right truncate">
                {timerState?.checkpointMessage || '—'}
              </span>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
