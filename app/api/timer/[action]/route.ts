import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminFirestore } from '@/lib/firebase-admin';
import { isAuthorizedAdminRequest } from '@/lib/admin-auth';
import type { TimerState } from '@/types/timer';

type TimerAction = 'start' | 'pause' | 'resume' | 'reset';

interface TimerRequestBody {
  sessionId?: string;
  message?: string | null;
  intervalMinutes?: number;
  totalIntervals?: number;
}

const DEFAULT_INTERVAL_MINUTES = Number(process.env.NEXT_PUBLIC_CHECKPOINT_INTERVAL_MIN ?? 20);
const DEFAULT_TOTAL_INTERVALS = 5;

function unauthorizedResponse() {
  return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
}

function getBaseTimerState(state: TimerState | null): TimerState {
  return {
    status: state?.status ?? 'idle',
    timerStartedAt: state?.timerStartedAt ?? 0,
    elapsedBeforePause: state?.elapsedBeforePause ?? 0,
    intervalMinutes: state?.intervalMinutes ?? DEFAULT_INTERVAL_MINUTES,
    currentInterval: state?.currentInterval ?? 1,
    totalIntervals: state?.totalIntervals ?? DEFAULT_TOTAL_INTERVALS,
    sirenActive: state?.sirenActive ?? false,
    globalLock: state?.globalLock ?? false,
    checkpointMessage: state?.checkpointMessage ?? null,
  };
}

async function getLatestPendingCheckpoint(sessionId: string) {
  const snapshot = await adminFirestore
    .collection(`sessions/${sessionId}/checkpoints`)
    .where('resumedAt', '==', null)
    .orderBy('triggeredAt', 'desc')
    .limit(1)
    .get();

  return snapshot.docs[0] ?? null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } },
) {
  if (!isAuthorizedAdminRequest(req)) {
    return unauthorizedResponse();
  }

  const action = params.action as TimerAction;
  const body = (await req.json()) as TimerRequestBody;
  const sessionId = body.sessionId?.trim();

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'sessionId is required' }, { status: 400 });
  }

  if (!['start', 'pause', 'resume', 'reset'].includes(action)) {
    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  }

  const timerDbRef = adminDb.ref(`sessions/${sessionId}/timer`);
  const snapshot = await timerDbRef.get();
  const currentState = getBaseTimerState(snapshot.val() as TimerState | null);
  const now = Date.now();
  const intervalMinutes = body.intervalMinutes ?? currentState.intervalMinutes ?? DEFAULT_INTERVAL_MINUTES;
  const totalIntervals = body.totalIntervals ?? currentState.totalIntervals ?? DEFAULT_TOTAL_INTERVALS;
  const intervalMs = intervalMinutes * 60 * 1000;

  switch (action) {
    case 'start': {
      await timerDbRef.set({
        status: 'running',
        timerStartedAt: now,
        elapsedBeforePause: 0,
        intervalMinutes,
        currentInterval: 1,
        totalIntervals,
        sirenActive: false,
        globalLock: false,
        checkpointMessage: null,
      } satisfies TimerState);
      await adminFirestore.doc(`sessions/${sessionId}`).set({ status: 'active' }, { merge: true });
      break;
    }

    case 'pause': {
      const elapsedWhileRunning =
        currentState.status === 'running'
          ? currentState.elapsedBeforePause + Math.max(0, now - currentState.timerStartedAt)
          : currentState.elapsedBeforePause;
      const message = body.message ?? currentState.checkpointMessage ?? null;
      const shouldCreateCheckpoint = !currentState.globalLock;

      await timerDbRef.update({
        status: 'paused',
        elapsedBeforePause: elapsedWhileRunning,
        sirenActive: true,
        globalLock: true,
        checkpointMessage: message,
      } satisfies Partial<TimerState>);

      if (shouldCreateCheckpoint) {
        await adminFirestore.collection(`sessions/${sessionId}/checkpoints`).add({
          interval: currentState.currentInterval,
          triggeredAt: Timestamp.fromMillis(now),
          resumedAt: null,
        });
      }

      break;
    }

    case 'resume': {
      const resumeFromCheckpoint = currentState.sirenActive || currentState.globalLock;
      const finalCheckpointReached =
        resumeFromCheckpoint && currentState.currentInterval >= totalIntervals;
      const nextElapsed = resumeFromCheckpoint
        ? currentState.currentInterval * intervalMs
        : currentState.elapsedBeforePause;
      const nextInterval = resumeFromCheckpoint
        ? Math.min(currentState.currentInterval + 1, totalIntervals)
        : currentState.currentInterval;

      await timerDbRef.update({
        status: finalCheckpointReached ? 'ended' : 'running',
        timerStartedAt: now,
        elapsedBeforePause: nextElapsed,
        intervalMinutes,
        currentInterval: nextInterval,
        totalIntervals,
        sirenActive: false,
        globalLock: false,
        checkpointMessage: body.message ?? null,
      } satisfies Partial<TimerState>);

      if (resumeFromCheckpoint) {
        const latestCheckpoint = await getLatestPendingCheckpoint(sessionId);
        if (latestCheckpoint) {
          await latestCheckpoint.ref.update({
            resumedAt: Timestamp.fromMillis(now),
          });
        }
      }

      await adminFirestore.doc(`sessions/${sessionId}`).set(
        {
          status: finalCheckpointReached ? 'ended' : 'active',
        },
        { merge: true },
      );

      break;
    }

    case 'reset': {
      await timerDbRef.set({
        status: 'idle',
        timerStartedAt: 0,
        elapsedBeforePause: 0,
        intervalMinutes,
        currentInterval: 1,
        totalIntervals,
        sirenActive: false,
        globalLock: false,
        checkpointMessage: null,
      } satisfies TimerState);
      await adminFirestore.doc(`sessions/${sessionId}`).set({ status: 'waiting' }, { merge: true });
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
