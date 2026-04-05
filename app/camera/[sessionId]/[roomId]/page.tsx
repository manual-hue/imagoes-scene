'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CameraCapture } from '@/components/evidence/CameraCapture';
import { useRoom } from '@/hooks/useRoom';

export default function CameraPage() {
  const params = useParams<{ sessionId: string; roomId: string }>();
  const { room, loading, error } = useRoom(params.sessionId, params.roomId);

  if (loading) {
    return (
      <main className="full-screen flex items-center justify-center bg-bg-primary">
        <p className="font-mono text-sm tracking-[0.22em] text-text-mono terminal-glow">
          INITIALIZING CAMERA...
        </p>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="full-screen flex flex-col items-center justify-center gap-4 bg-bg-primary px-6 text-center">
        <p className="font-mono text-sm tracking-[0.22em] text-accent-red">CAMERA ERROR</p>
        <p className="max-w-sm font-body text-sm text-white/70">
          {error ?? 'Room data could not be loaded.'}
        </p>
      </main>
    );
  }

  return (
    <main className="full-screen bg-bg-primary">
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4">
        <Link href={`/room/${params.sessionId}/${params.roomId}`} className="font-mono text-xs tracking-[0.2em] text-white/64">
          BACK
        </Link>
        <Link href={`/evidence/${params.sessionId}`} className="font-mono text-xs tracking-[0.2em] text-white/64">
          LOCKER
        </Link>
      </div>

      <CameraCapture
        sessionId={params.sessionId}
        roomId={params.roomId}
        roomName={room.name}
        onCaptured={() => {
          // Stay on camera for continuous shooting
        }}
      />
    </main>
  );
}
