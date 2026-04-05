'use client';

import type { Clue } from '@/types/room';

interface ClueCardProps {
  clue: Clue;
  index: number;
  onClick?: (clue: Clue) => void;
}

const TYPE_LABELS: Record<Clue['type'], string> = {
  text: '텍스트',
  image: '이미지',
  document: '문서',
  audio: '음성',
};

export function ClueCard({ clue, index, onClick }: ClueCardProps) {
  return (
    <button
      onClick={() => onClick?.(clue)}
      className="
        w-full text-left p-4
        border border-white/[0.12]
        bg-black/50 backdrop-blur-sm
        rounded-sm
        transition-all duration-150
        hover:border-accent-teal hover:-translate-y-px
        active:scale-[0.98]
        min-h-[44px]
      "
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-text-mono tracking-widest">
          CLUE #{String(index + 1).padStart(3, '0')}
        </span>
        <span className="font-mono text-xs text-white/40 tracking-wider uppercase">
          [{TYPE_LABELS[clue.type]}]
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/[0.08] mb-2" />

      {/* Title */}
      <h3 className="font-body font-bold text-sm text-text-primary leading-snug">
        {clue.title}
      </h3>

      {/* Tags */}
      {clue.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {clue.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-white/40 border border-white/10 rounded-sm px-1.5 py-0.5 tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <p className="font-mono text-xs text-white/30 mt-3 tracking-widest">
        [ 상세 보기 &rarr; ]
      </p>
    </button>
  );
}
