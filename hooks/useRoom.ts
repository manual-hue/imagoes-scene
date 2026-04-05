'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/types/room';

interface UseRoomResult {
  room: Room | null;
  loading: boolean;
  error: string | null;
}

export function useRoom(sessionId: string, roomId: string): UseRoomResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRoom() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/room/${sessionId}/${roomId}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        const payload = (await response.json()) as {
          ok: boolean;
          error?: string;
          room?: Room;
        };

        if (!response.ok || !payload.ok || !payload.room) {
          throw new Error(payload.error ?? 'Room not found');
        }

        setRoom(payload.room);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setRoom(null);
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadRoom();

    return () => controller.abort();
  }, [sessionId, roomId]);

  return { room, loading, error };
}
