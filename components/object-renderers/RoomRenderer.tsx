'use client';

import { useState } from 'react';
import Image from 'next/image';
import { RoomBackground } from '@/components/room/RoomBackground';
import { RoomHeader } from '@/components/room/RoomHeader';
import type { RoomContent } from '@/types/scene-object';
import type { Room, RoomSceneClue, RoomSceneHotspot } from '@/types/room';

interface RoomRendererProps {
  objectId: string;
  content: RoomContent;
  name: string;
  shortCode: string;
  order: number;
}

export function RoomRenderer({ objectId, content, name, shortCode, order }: RoomRendererProps) {
  const scene = content.scene;
  const [selectedClue, setSelectedClue] = useState<RoomSceneClue | null>(null);

  // Build a Room-shaped object for existing RoomBackground/RoomHeader
  const roomShim: Room = {
    id: objectId,
    name,
    shortCode,
    description: content.description,
    backgroundImage: content.backgroundImage,
    clues: content.clues,
    order,
  };

  return (
    <RoomBackground room={roomShim}>
      <div className="flex h-full flex-col">
        <RoomHeader room={roomShim} />

        <div className="relative flex-1 px-4 py-4">
          {scene ? (
            <RoomSceneViewport
              hotspots={scene.hotspots}
              onSelect={(clueId) => {
                const clue = scene.clues.find((item) => item.id === clueId) ?? null;
                setSelectedClue(clue);
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <p className="max-w-sm font-mono text-xs tracking-[0.24em] text-white/42">
                NO INTERACTIVE SCENE IS CONFIGURED FOR THIS ROOM YET.
              </p>
            </div>
          )}
        </div>
      </div>

      <ClueModal clue={selectedClue} onClose={() => setSelectedClue(null)} />
    </RoomBackground>
  );
}

function RoomSceneViewport({
  hotspots,
  onSelect,
}: {
  hotspots: RoomSceneHotspot[];
  onSelect: (clueId: string) => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-black/10 backdrop-blur-[1px]">
      <div className="absolute inset-0">
        {hotspots.map((hotspot) => (
          <button
            key={hotspot.id}
            type="button"
            aria-label={hotspot.label}
            onClick={() => onSelect(hotspot.clueId)}
            className="group absolute rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.1)] backdrop-blur-[1px] transition-all duration-200 hover:scale-[1.03] hover:border-cyan-200/60 hover:bg-cyan-300/18 active:scale-[0.98]"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              width: `${hotspot.width}%`,
              height: `${hotspot.height}%`,
            }}
          >
            <span className="absolute inset-0 animate-pulse rounded-2xl border border-cyan-200/20" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-cyan-200/30 bg-slate-950/85 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-cyan-100 transition-colors group-hover:text-white">
              {hotspot.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ClueModal({ clue, onClose }: { clue: RoomSceneClue | null; onClose: () => void }) {
  if (!clue) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <button className="absolute inset-0" aria-label="Close clue modal" onClick={onClose} />
      <div
        className="relative z-10 flex w-full max-w-[380px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#111317] shadow-2xl"
        style={{
          height: 'calc(var(--vh, 1vh) * 70)',
          maxHeight: '70dvh',
          paddingTop: 'var(--safe-top)',
          paddingBottom: 'var(--safe-bottom)',
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.24em] text-white/35">SCENE DETAIL</p>
            <h3 className="mt-1 font-body text-base font-bold text-white">{clue.title}</h3>
          </div>
          <button
            className="min-h-[44px] min-w-[44px] font-mono text-sm text-white/55 transition-colors hover:text-white"
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>

        <div className="scroll-container flex-1">
          {clue.thumbnailUrl && (
            <div className="relative aspect-[4/3] w-full bg-black">
              <Image
                src={clue.thumbnailUrl}
                alt={`${clue.title} evidence image`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 430px"
              />
            </div>
          )}

          <div className="border-t border-white/10 px-4 py-4">
            {clue.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {clue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-white/10 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.16em] text-white/45"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="font-mono text-[10px] tracking-[0.22em] text-white/35">CONTENT</p>
            <p className="mt-2 font-body text-sm leading-relaxed text-white/80">{clue.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
