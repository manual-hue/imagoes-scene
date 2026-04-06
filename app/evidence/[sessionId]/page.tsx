'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PhotoGallery } from '@/components/evidence/PhotoGallery';
import { CameraCapture } from '@/components/evidence/CameraCapture';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { useEvidencePhotos } from '@/hooks/useEvidencePhotos';
import { getLastVisited, getLastVisitedRoom } from '@/lib/visited';

export default function EvidencePage() {
  const params = useParams<{ sessionId: string }>();
  const { photos, loading, error, updateMemo, removePhoto, refresh } = useEvidencePhotos(
    params.sessionId,
  );
  const [mode, setMode] = useState<'gallery' | 'camera'>('gallery');
  const [captureTarget, setCaptureTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const lastObject = getLastVisited(params.sessionId);
    if (lastObject) {
      setCaptureTarget({ id: lastObject.objectId, name: lastObject.objectName });
      return;
    }
    const legacy = getLastVisitedRoom(params.sessionId);
    if (legacy) {
      setCaptureTarget({ id: legacy.roomId, name: legacy.roomName });
    }
  }, [params.sessionId]);

  return (
    <main className="full-screen flex flex-col bg-bg-primary">
      {mode === 'camera' && captureTarget ? (
        /* ── 카메라 모드 ── */
        <div className="relative flex-1">
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4">
            <button
              type="button"
              onClick={() => setMode('gallery')}
              className="font-mono text-xs tracking-[0.2em] text-white/64"
            >
              BACK
            </button>
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
              {captureTarget.name}
            </span>
          </div>

          <CameraCapture
            sessionId={params.sessionId}
            roomId={captureTarget.id}
            roomName={captureTarget.name}
            onCaptured={() => {
              setMode('gallery');
              void refresh();
            }}
          />
        </div>
      ) : (
        /* ── 갤러리 모드 ── */
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 md:px-8">
          <div className="mx-auto max-w-6xl">
            <header className="mb-6">
              <p className="font-mono text-xs tracking-[0.28em] text-text-mono terminal-glow">
                사건 수첩
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-[var(--text-dim)]">
                FORENSIC ARCHIVE
              </p>
            </header>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-sm border border-white/10 bg-black/20">
                <p className="font-mono text-sm tracking-[0.2em] text-text-mono terminal-glow">
                  증거 수집 중...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-sm border border-accent-red/25 bg-black/25 px-5 py-4">
                <p className="font-mono text-sm tracking-[0.2em] text-accent-red">수집 중 오류가 발생하였습니다.</p>
                <p className="mt-2 font-body text-sm text-white/70">{error}</p>
              </div>
            ) : (
              <PhotoGallery
                photos={photos}
                onUpdateMemo={updateMemo}
                onDeletePhoto={removePhoto}
              />
            )}
          </div>

          {/* 카메라 FAB */}
          {captureTarget && (
            <button
              type="button"
              onClick={() => setMode('camera')}
              className="fixed bottom-24 right-4 z-[35] flex h-14 w-14 items-center justify-center rounded-full bg-accent-teal shadow-[0_0_24px_rgba(45,196,176,0.3)] transition-transform active:scale-90"
              aria-label="Open camera"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          )}
        </div>
      )}

      {mode === 'gallery' && (
        <BottomTabBar sessionId={params.sessionId} />
      )}
    </main>
  );
}
