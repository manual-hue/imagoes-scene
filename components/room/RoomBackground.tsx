'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import type { Room } from '@/types/room';

interface RoomBackgroundProps {
  room: Room;
  children: React.ReactNode;
}

export function RoomBackground({ room, children }: RoomBackgroundProps) {
  const [descOpen, setDescOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const openDescription = useCallback(() => {
    setDescOpen(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDescOpen(false), 7000);
  }, []);

  const closeDescription = useCallback(() => {
    setDescOpen(false);
    clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src={room.backgroundImage.url}
        alt={room.backgroundImage.alt}
        fill
        priority
        quality={85}
        className="object-cover object-center"
        placeholder={room.backgroundImage.blur ? 'blur' : 'empty'}
        blurDataURL={room.backgroundImage.blur}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />

      <div className="absolute left-6 top-20 z-40">
        <button
          type="button"
          onClick={openDescription}
          className="min-h-[44px] rounded-full border border-white/20 bg-black/45 px-4 font-mono text-[11px] tracking-[0.24em] text-white/75 backdrop-blur-md transition-colors hover:bg-black/65"
        >
          INFO
        </button>
      </div>

      <AnimatePresence>
        {descOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-x-4 bottom-24 z-40"
            onClick={closeDescription}
          >
            <div
              className="rounded-sm p-4 font-body text-white"
              style={{
                border: '1.5px solid rgba(255,255,255,0.8)',
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow:
                  '0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.6)',
              }}
            >
              <p className="mb-1 font-mono text-xs uppercase tracking-widest text-white/50">
                ROOM &middot; {room.shortCode}
              </p>
              <h2 className="mb-2 font-body text-lg font-bold leading-tight text-white">
                {room.name}
              </h2>
              <div className="mb-3 h-px w-8 bg-white/40" />
              <p className="font-body text-sm leading-relaxed text-white/85">
                {room.description}
              </p>
              <p className="mt-3 text-right font-mono text-xs tracking-widest text-white/30">
                [ TAP TO CLOSE ]
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-30 h-full">
        {children}
      </div>
    </div>
  );
}
