'use client';

import Image from 'next/image';
import type { EvidencePhotoView } from '@/hooks/useEvidencePhotos';

interface PhotoCardProps {
  photo: EvidencePhotoView;
  onEditMemo: (photo: EvidencePhotoView) => void;
  onDelete: (photo: EvidencePhotoView) => void;
}

function formatCapturedAt(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

function syncLabel(photo: EvidencePhotoView) {
  switch (photo.syncStatus) {
    case 'syncing':
      return 'SYNCING';
    case 'synced':
      return 'SYNCED';
    case 'error':
      return 'RETRY WAIT';
    default:
      return 'LOCAL';
  }
}

function syncTone(photo: EvidencePhotoView) {
  switch (photo.syncStatus) {
    case 'syncing':
      return 'text-accent-amber';
    case 'synced':
      return 'text-accent-teal';
    case 'error':
      return 'text-accent-red';
    default:
      return 'text-white/45';
  }
}

export function PhotoCard({ photo, onEditMemo, onDelete }: PhotoCardProps) {
  return (
    <article className="rotate-[-1deg] bg-[#f1ead7] p-3 text-[#231d17] shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-transform hover:rotate-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#d7d0bf]">
        {photo.imageUrl ? (
          <Image
            src={photo.imageUrl}
            alt={photo.memo || photo.roomName}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#b8b09f] font-mono text-xs tracking-[0.2em] text-[#4a4437]">
            NO IMAGE
          </div>
        )}

        <div className="absolute left-3 top-3 border border-black/15 bg-black/70 px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-white">
          {photo.roomName}
        </div>
      </div>

      <div className="border-b border-[#d0c6ae] px-1 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#6f6655]">
            {formatCapturedAt(photo.capturedAt)}
          </p>
          <span className={`font-mono text-[10px] tracking-[0.2em] ${syncTone(photo)}`}>
            {syncLabel(photo)}
          </span>
        </div>

        <p className="min-h-[3.75rem] whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-[#2b251d]">
          {photo.memo || 'No memo recorded.'}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 px-1 pt-3">
        <button
          type="button"
          onClick={() => onEditMemo(photo)}
          className="font-mono text-[11px] tracking-[0.18em] text-[#554d40]"
        >
          EDIT MEMO
        </button>
        <button
          type="button"
          onClick={() => onDelete(photo)}
          className="font-mono text-[11px] tracking-[0.18em] text-[#8a3029]"
        >
          DELETE
        </button>
      </div>
    </article>
  );
}
