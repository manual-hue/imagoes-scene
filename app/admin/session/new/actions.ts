'use server';

import { Timestamp } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin-auth';
import { adminDb, adminFirestore } from '@/lib/firebase-admin';

function normalizeSessionCode(input: string) {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function generateSessionCode() {
  return Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6).padEnd(6, '0');
}

export async function createSessionAction(formData: FormData) {
  const adminSession = await requireAdminSession();

  const name = String(formData.get('name') ?? '').trim();
  const providedSessionCode = String(formData.get('sessionCode') ?? '');
  const intervalMinutes = Number(formData.get('intervalMinutes') ?? 20);
  const totalIntervals = Number(formData.get('totalIntervals') ?? 5);
  const maxPlayers = Number(formData.get('maxPlayers') ?? 20);
  const accessCode = String(formData.get('accessCode') ?? process.env.NEXT_PUBLIC_ACCESS_CODE ?? '').trim();

  if (!name) {
    throw new Error('세션 이름을 입력해주세요');
  }

  const sessionCode = normalizeSessionCode(providedSessionCode) || generateSessionCode();
  const existingSession = await adminFirestore
    .collection('sessions')
    .where('sessionCode', '==', sessionCode)
    .limit(1)
    .get();

  if (!existingSession.empty) {
    throw new Error('이미 사용 중인 세션 코드입니다');
  }

  const sessionRef = adminFirestore.collection('sessions').doc();

  await sessionRef.set({
    sessionCode,
    adminId: adminSession.email,
    name,
    status: 'waiting',
    createdAt: Timestamp.now(),
    config: {
      intervalMinutes,
      totalIntervals,
      accessCode,
      maxPlayers,
    },
  });

  await adminDb.ref(`sessions/${sessionRef.id}/timer`).set({
    status: 'idle',
    timerStartedAt: 0,
    elapsedBeforePause: 0,
    intervalMinutes,
    currentInterval: 1,
    totalIntervals,
    sirenActive: false,
    globalLock: false,
    checkpointMessage: null,
  });

  redirect(`/admin/session/${sessionRef.id}`);
}
