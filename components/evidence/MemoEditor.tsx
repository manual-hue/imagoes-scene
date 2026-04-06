'use client';

import { useEffect, useState } from 'react';
import type { EvidencePhotoView } from '@/hooks/useEvidencePhotos';

interface MemoEditorProps {
  photo: EvidencePhotoView | null;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (memo: string) => Promise<void>;
}

const MEMO_MAX_LENGTH = 200;

export function MemoEditor({
  photo,
  open,
  saving,
  onClose,
  onSave,
}: MemoEditorProps) {
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (open && photo) {
      setMemo(photo.memo);
    }
  }, [open, photo]);

  if (!open || !photo) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-sm border border-white/15 bg-bg-secondary shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 라이트박스: 사진 */}
        <div className="relative aspect-square w-full bg-black">
          {photo.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.imageUrl}
              alt={photo.memo || photo.roomName}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs tracking-[0.2em] text-white/40">
              NO IMAGE
            </div>
          )}
          <span className="absolute left-3 top-3 border border-white/15 bg-black/70 px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-white">
            {photo.roomName}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-white/15 bg-black/70 font-mono text-sm text-white/80"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <label className="mb-2 block font-mono text-[11px] tracking-[0.2em] text-white/52">
            MEMO {memo.length}/{MEMO_MAX_LENGTH}
          </label>
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value.slice(0, MEMO_MAX_LENGTH))}
            rows={4}
            maxLength={MEMO_MAX_LENGTH}
            className="w-full resize-none rounded-sm border border-white/10 bg-bg-elevated px-3 py-3 font-body text-sm leading-relaxed text-text-primary outline-none transition-colors focus:border-accent-teal"
          />
        </div>

        <div className="flex gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-white/20 px-4 py-3 font-mono text-sm tracking-[0.18em] text-white/66"
          >
            닫기
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSave(memo)}
            className="flex-1 bg-accent-teal px-4 py-3 font-mono text-sm font-bold tracking-[0.18em] text-black disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
