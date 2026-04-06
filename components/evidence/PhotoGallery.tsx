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

  const summary = useMemo(() => {
    const syncedCount = photos.filter((photo) => photo.synced).length;
    return `${photos.length} collected / ${syncedCount} synced`;
  }, [photos]);

  const handleDelete = async (photo: EvidencePhotoView) => {
    const confirmed = window.confirm('Delete this evidence photo permanently?');
    if (!confirmed) {
      return;
    }

    await onDeletePhoto(photo.id);
  };

  const handleSaveMemo = async (memo: string) => {
    if (!editingPhoto) {
      return;
    }

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
          <div>
            <p className="mt-1 font-body text-sm text-white/66">{summary}</p>
          </div>
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
              <button
                key={photo.id}
                type="button"
                onClick={() => setEditingPhoto(photo)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  void handleDelete(photo);
                }}
                className="relative aspect-square overflow-hidden border border-white/10 bg-black/40"
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
                <span className="absolute left-1 top-1 bg-black/70 px-1 py-0.5 font-mono text-[8px] tracking-[0.1em] text-white/85">
                  {photo.roomName}
                </span>
              </button>
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
    </>
  );
}
