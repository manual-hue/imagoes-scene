'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EvidencePhoto } from '@/types/evidence';
import {
  EVIDENCE_EVENT,
  deletePhoto,
  getEvidencePhotoBlob,
  listEvidencePhotos,
  syncPendingPhotos,
  updatePhotoMemo,
} from '@/lib/evidence';

export interface EvidencePhotoView extends EvidencePhoto {
  imageUrl: string | null;
}

interface UseEvidencePhotosResult {
  photos: EvidencePhotoView[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateMemo: (photoId: string, memo: string) => Promise<void>;
  removePhoto: (photoId: string) => Promise<void>;
}

export function useEvidencePhotos(sessionId: string): UseEvidencePhotosResult {
  const [photos, setPhotos] = useState<EvidencePhotoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const revokeUrls = useCallback((items: EvidencePhotoView[]) => {
    items.forEach((item) => {
      if (item.imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(item.imageUrl);
      }
    });
  }, []);

  const loadPhotos = useCallback(async () => {
    try {
      const storedPhotos = await listEvidencePhotos(sessionId);
      const nextPhotos = await Promise.all(
        storedPhotos.map(async (photo) => {
          const blob = await getEvidencePhotoBlob(photo.id);
          const imageUrl = blob ? URL.createObjectURL(blob) : photo.storageUrl ?? null;

          return {
            ...photo,
            imageUrl,
          } satisfies EvidencePhotoView;
        }),
      );

      setPhotos((previous) => {
        revokeUrls(previous);
        return nextPhotos;
      });
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load evidence');
    } finally {
      setLoading(false);
    }
  }, [revokeUrls, sessionId]);

  useEffect(() => {
    void loadPhotos();
    void syncPendingPhotos(sessionId).then(loadPhotos);

    const handleChange = () => {
      void loadPhotos();
    };
    const handleOnline = () => {
      void syncPendingPhotos(sessionId).then(loadPhotos);
    };

    window.addEventListener(EVIDENCE_EVENT, handleChange as EventListener);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener(EVIDENCE_EVENT, handleChange as EventListener);
      window.removeEventListener('online', handleOnline);
      setPhotos((previous) => {
        revokeUrls(previous);
        return [];
      });
    };
  }, [loadPhotos, revokeUrls, sessionId]);

  const refresh = useCallback(async () => {
    await syncPendingPhotos(sessionId);
    await loadPhotos();
  }, [loadPhotos, sessionId]);

  const handleUpdateMemo = useCallback(
    async (photoId: string, memo: string) => {
      await updatePhotoMemo(photoId, memo);
      await loadPhotos();
    },
    [loadPhotos],
  );

  const handleRemovePhoto = useCallback(
    async (photoId: string) => {
      await deletePhoto(photoId);
      await loadPhotos();
    },
    [loadPhotos],
  );

  return useMemo(
    () => ({
      photos,
      loading,
      error,
      refresh,
      updateMemo: handleUpdateMemo,
      removePhoto: handleRemovePhoto,
    }),
    [error, handleRemovePhoto, handleUpdateMemo, loading, photos, refresh],
  );
}
