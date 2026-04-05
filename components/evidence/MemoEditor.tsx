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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/80 p-4 md:items-center">
      <div className="w-full max-w-lg rounded-sm border border-white/15 bg-bg-secondary shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="font-mono text-[11px] tracking-[0.22em] text-text-mono terminal-glow">
            EDIT EVIDENCE MEMO
          </p>
          <p className="mt-1 font-body text-sm text-white/70">{photo.roomName}</p>
        </div>

        <div className="p-5">
          <label className="mb-2 block font-mono text-[11px] tracking-[0.2em] text-white/52">
            MEMO {memo.length}/{MEMO_MAX_LENGTH}
          </label>
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value.slice(0, MEMO_MAX_LENGTH))}
            rows={6}
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
            CANCEL
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSave(memo)}
            className="flex-1 bg-accent-teal px-4 py-3 font-mono text-sm font-bold tracking-[0.18em] text-black disabled:opacity-50"
          >
            {saving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
}
