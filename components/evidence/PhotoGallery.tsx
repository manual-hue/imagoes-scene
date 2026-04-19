'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { MemoEditor } from '@/components/evidence/MemoEditor';
import type { EvidencePhotoView } from '@/hooks/useEvidencePhotos';

interface PhotoGalleryProps {
  photos: EvidencePhotoView[];
  onUpdateMemo: (photoId: string, memo: string) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
}

export function PhotoGallery({
  photos,
  onUpdateMemo,
  onDeletePhoto,
}: PhotoGalleryProps) {
  const [editingPhoto, setEditingPhoto] = useState<EvidencePhotoView | null>(null);
  const [savingMemo, setSavingMemo] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<EvidencePhotoView | null>(null);
  const [deleting, setDeleting] = useState(false);

  const summary = useMemo(() => {
    const syncedCount = photos.filter((photo) => photo.synced).length;
    return `${photos.length} collected / ${syncedCount} synced`;
  }, [photos]);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await onDeletePhoto(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveMemo = async (memo: string) => {
    if (!editingPhoto) return;
    setSavingMemo(true);
    try {
      await onUpdateMemo(editingPhoto.id, memo);
      setEditingPhoto(null);
    } finally {
      setSavingMemo(false);
    }
  };

  return (
    <>
      <section className="rounded-sm border border-white/10 bg-black/25 p-4">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
          <p className="mt-1 font-body text-sm text-white/66">{summary}</p>
        </div>

        {photos.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center border border-dashed border-white/10 bg-black/20 px-6 text-center">
            <p className="max-w-sm font-body text-sm leading-relaxed text-white/58">
              수집된 증거가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden border border-white/10 bg-black/40">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(photo)}
                  className="absolute inset-0"
                  aria-label="메모 편집"
                >
                  {photo.imageUrl ? (
                    <Image
                      src={photo.imageUrl}
                      alt={photo.memo || photo.roomName}
                      fill
                      unoptimized
                      sizes="33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-[9px] tracking-[0.2em] text-white/45">
                      NO IMG
                    </div>
                  )}
                </button>

                <span className="pointer-events-none absolute left-1 top-1 bg-black/70 px-1 py-0.5 font-mono text-[8px] tracking-[0.1em] text-white/85">
                  {photo.roomName}
                </span>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPendingDelete(photo); }}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white/70 transition-colors hover:bg-accent-red hover:text-white"
                  aria-label="증거 삭제"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <MemoEditor
        photo={editingPhoto}
        open={editingPhoto !== null}
        saving={savingMemo}
        onClose={() => setEditingPhoto(null)}
        onSave={handleSaveMemo}
      />

      {/* 삭제 확인 다이얼로그 */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[320px] rounded-sm border border-white/12 bg-[#111317] p-6 shadow-2xl">
            <p className="font-mono text-[10px] tracking-[0.28em] text-accent-red">DELETE EVIDENCE</p>
            <p className="mt-3 font-body text-base font-semibold leading-snug text-white">
              정말 삭제하시겠습니까?
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-white/55">
              해당 작업은 되돌릴 수 없습니다.
            </p>

            {pendingDelete.imageUrl && (
              <div className="relative mt-4 aspect-video w-full overflow-hidden border border-white/10 bg-black/40">
                <Image
                  src={pendingDelete.imageUrl}
                  alt="삭제할 증거"
                  fill
                  unoptimized
                  className="object-cover opacity-60"
                />
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="flex-1 border border-white/20 py-3 font-mono text-sm tracking-[0.18em] text-white/68 disabled:opacity-40"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 bg-accent-red py-3 font-mono text-sm font-bold tracking-[0.18em] text-white disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
