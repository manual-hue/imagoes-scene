'use client';

import { useRouter } from 'next/navigation';
import type { Room } from '@/types/room';

interface RoomHeaderProps {
  room: Room;
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="flex items-center justify-between px-4 min-h-[56px] backdrop-blur-md"
      style={{ background: 'rgba(12,12,15,0.7)' }}
    >
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 font-mono text-sm text-white/60 hover:text-white/90 transition-colors min-h-[44px] min-w-[44px]"
        aria-label="뒤로가기"
      >
        <span aria-hidden="true">&larr;</span>
        <span className="sr-only">뒤로</span>
      </button>

      {/* Room title */}
      <h1 className="font-body font-bold text-sm text-white truncate mx-4 flex-1 text-center">
        {room.shortCode}: {room.name}
      </h1>

      {/* Menu placeholder */}
      <button
        className="font-mono text-white/40 text-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="메뉴"
      >
        &#8942;
      </button>
    </header>
  );
}
