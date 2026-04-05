import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdminRequest } from '@/lib/admin-auth';
import { adminDb, adminFirestore } from '@/lib/firebase-admin';
import type { TimerState } from '@/types/timer';

interface ResumeCheckpointBody {
  sessionId?: string;
  message?: string | null;
}

function baseTimerState(state: TimerState | null): TimerState {
  return {
    status: state?.status ?? 'idle',
    timerStartedAt: state?.timerStartedAt ?? 0,
    elapsedBeforePause: state?.elapsedBeforePause ?? 0,
    intervalMinutes: state?.intervalMinutes ?? Number(process.env.NEXT_PUBLIC_CHECKPOINT_INTERVAL_MIN ?? 20),
    currentInterval: state?.currentInterval ?? 1,
    totalIntervals: state?.totalIntervals ?? 5,
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

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as ResumeCheckpointBody;
  const sessionId = body.sessionId?.trim();

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'sessionId is required' }, { status: 400 });
  }

  const timerRef = adminDb.ref(`sessions/${sessionId}/timer`);
  const snapshot = await timerRef.get();
  const timerState = baseTimerState(snapshot.val() as TimerState | null);

  if (!timerState.globalLock && !timerState.sirenActive) {
    return NextResponse.json(
      { ok: false, error: 'No checkpoint is currently blocking the session' },
      { status: 409 },
    );
  }

  const now = Date.now();
  const intervalMs = timerState.intervalMinutes * 60 * 1000;
  const finalCheckpointReached = timerState.currentInterval >= timerState.totalIntervals;

  await timerRef.update({
    status: finalCheckpointReached ? 'ended' : 'running',
    timerStartedAt: now,
    elapsedBeforePause: timerState.currentInterval * intervalMs,
    currentInterval: Math.min(timerState.currentInterval + 1, timerState.totalIntervals),
    sirenActive: false,
    globalLock: false,
    checkpointMessage: body.message ?? null,
  } satisfies Partial<TimerState>);

  const latestCheckpoint = await getLatestPendingCheckpoint(sessionId);
  if (latestCheckpoint) {
    await latestCheckpoint.ref.update({
      resumedAt: Timestamp.fromMillis(now),
    });
  }

  await adminFirestore.doc(`sessions/${sessionId}`).set(
    {
      status: finalCheckpointReached ? 'ended' : 'active',
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true });
}
