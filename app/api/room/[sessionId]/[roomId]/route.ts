import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdminRequest } from '@/lib/admin-auth';
import { getLocalRoom } from '@/lib/mock-data';

interface RoomRouteContext {
  params: {
    sessionId: string;
    roomId: string;
  };
}

function serializeValue(value: unknown): unknown {
  if (value && typeof value === 'object') {
    if (
      'toDate' in value &&
      typeof (value as { toDate: () => Date }).toDate === 'function'
    ) {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }

    if (Array.isArray(value)) {
      return value.map(serializeValue);
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        serializeValue(nestedValue),
      ]),
    );
  }

  return value;
}

function serializeObject(value: Record<string, unknown>): Record<string, unknown> {
  return serializeValue(value) as Record<string, unknown>;
}

export async function GET(_req: Request, { params }: RoomRouteContext) {
  const { sessionId, roomId } = params;
  const localRoom = getLocalRoom(sessionId, roomId);

  if (localRoom) {
    return NextResponse.json({
      ok: true,
      sessionId,
      roomId,
      room: serializeObject(localRoom.room as unknown as Record<string, unknown>),
    });
  }

  try {
    const { adminFirestore } = await import('@/lib/firebase-admin');
    const roomRef = adminFirestore.doc(`sessions/${sessionId}/rooms/${roomId}`);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    }

    const room = {
      id: roomSnap.id,
      ...serializeObject(roomSnap.data() ?? {}),
    };

    return NextResponse.json({
      ok: true,
      sessionId,
      roomId,
      room,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load room',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RoomRouteContext) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, roomId } = params;
  const body = (await req.json()) as {
    isAccessible?: boolean;
  };

  if (typeof body.isAccessible !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'isAccessible must be a boolean' }, { status: 400 });
  }

  try {
    const { adminFirestore } = await import('@/lib/firebase-admin');
    await adminFirestore.doc(`sessions/${sessionId}/rooms/${roomId}`).set(
      {
        isAccessible: body.isAccessible,
      },
      { merge: true },
    );

    return NextResponse.json({
      ok: true,
      roomId,
      isAccessible: body.isAccessible,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update room',
      },
      { status: 500 },
    );
  }
}
