import { randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin-auth';
import { adminDb, adminFirestore } from '@/lib/firebase-admin';
import { NewSessionForm } from '@/components/admin/NewSessionForm';

interface ParsedRoomInput {
  shortCode: string;
  name: string;
  description: string;
  order: number;
}

function normalizeSessionCode(input: string) {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function generateSessionCode() {
  return Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6).padEnd(6, '0');
}

function parseRooms(raw: string): ParsedRoomInput[] {
  // Try JSON first (from NewSessionForm)
  try {
    const parsed = JSON.parse(raw) as ParsedRoomInput[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, index) => ({
        shortCode: String(item.shortCode ?? '').toUpperCase(),
        name: String(item.name ?? ''),
        description: String(item.description ?? ''),
        order: typeof item.order === 'number' ? item.order : index + 1,
      }));
    }
  } catch {
    // Fall through to pipe format
  }

  // Fallback: pipe-delimited format
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [shortCode, name, ...descriptionParts] = line.split('|').map((part) => part.trim());
      if (!shortCode || !name) {
        throw new Error('각 방은 코드|이름|설명 형식이어야 합니다');
      }

      return {
        shortCode: shortCode.toUpperCase(),
        name,
        description: descriptionParts.join(' | '),
        order: index + 1,
      };
    });
}

export default async function NewAdminSessionPage() {
  const adminSession = await requireAdminSession();

  async function createSessionAction(formData: FormData) {
    'use server';

    await requireAdminSession();

    const name = String(formData.get('name') ?? '').trim();
    const providedSessionCode = String(formData.get('sessionCode') ?? '');
    const intervalMinutes = Number(formData.get('intervalMinutes') ?? 20);
    const totalIntervals = Number(formData.get('totalIntervals') ?? 5);
    const maxPlayers = Number(formData.get('maxPlayers') ?? 20);
    const accessCode = String(formData.get('accessCode') ?? process.env.NEXT_PUBLIC_ACCESS_CODE ?? '').trim();
    const roomsInput = String(formData.get('rooms') ?? '');

    if (!name) {
      throw new Error('세션 이름을 입력해주세요');
    }

    const rooms = parseRooms(roomsInput);
    if (rooms.length === 0) {
      throw new Error('최소 1개의 방을 추가해주세요');
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
    const batch = adminFirestore.batch();

    batch.set(sessionRef, {
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

    for (const room of rooms) {
      const roomRef = sessionRef.collection('rooms').doc(randomUUID());
      batch.set(roomRef, {
        id: roomRef.id,
        sessionId: sessionRef.id,
        name: room.name,
        shortCode: room.shortCode,
        description: room.description,
        backgroundImage: {
          url: '',
          alt: room.name,
        },
        clues: [],
        order: room.order,
        isAccessible: true,
        visitCount: 0,
        createdAt: Timestamp.now(),
      });
    }

    await batch.commit();
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

  return (
    <NewSessionForm
      adminEmail={adminSession.email}
      defaultAccessCode={process.env.NEXT_PUBLIC_ACCESS_CODE ?? ''}
      createAction={createSessionAction}
    />
  );
}
