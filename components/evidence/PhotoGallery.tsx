'use client';

import { useMemo, useState } from 'react';
import { MemoEditor } from '@/components/evidence/MemoEditor';
import { PhotoCard } from '@/components/evidence/PhotoCard';
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
            <p className="font-mono text-[11px] tracking-[0.26em] text-text-mono terminal-glow">
              EVIDENCE LOCKER
            </p>
            <p className="mt-1 font-body text-sm text-white/66">{summary}</p>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center border border-dashed border-white/10 bg-black/20 px-6 text-center">
            <p className="max-w-sm font-body text-sm leading-relaxed text-white/58">
              No evidence photos yet. Capture one from a room camera page to start your locker.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={index % 3 === 1 ? 'translate-y-3' : index % 3 === 2 ? '-translate-y-2' : ''}
              >
                <PhotoCard
                  photo={photo}
                  onEditMemo={setEditingPhoto}
                  onDelete={handleDelete}
                />
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
    </>
  );
}
