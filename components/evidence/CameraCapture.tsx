'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { savePhoto } from '@/lib/evidence';
import type { EvidencePhoto } from '@/types/evidence';

interface CameraCaptureProps {
  sessionId: string;
  roomId: string;
  roomName: string;
  onCaptured: (photo: EvidencePhoto) => void;
}

const MEMO_MAX_LENGTH = 200;

export function CameraCapture({
  sessionId,
  roomId,
  roomName,
  onCaptured,
}: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [memo, setMemo] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoConstraints = useMemo(
    () => ({
      facingMode: { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 960 },
      aspectRatio: 4 / 3,
    }),
    [],
  );

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot({
      width: 1280,
      height: 960,
    });

    if (imageSrc) {
      setPreviewSrc(imageSrc);
    }
  };

  const confirmCapture = async () => {
    if (!previewSrc) {
      return;
    }

    setSaving(true);
    try {
      const photo = await savePhoto({
        sessionId,
        roomId,
        roomName,
        dataUrl: previewSrc,
        memo,
      });

      onCaptured(photo);
      setPreviewSrc(null);
      setMemo('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-bg-primary">
      {!previewSrc ? (
        <>
          <div className="relative flex-1 overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.85}
              videoConstraints={videoConstraints}
              onUserMediaError={() => setCameraError('Camera access was denied or unavailable.')}
              className="h-full w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-6 border border-white/15 md:inset-10" />
              <div className="absolute left-6 top-6 h-5 w-5 border-l border-t border-white/65 md:left-10 md:top-10" />
              <div className="absolute right-6 top-6 h-5 w-5 border-r border-t border-white/65 md:right-10 md:top-10" />
              <div className="absolute bottom-6 left-6 h-5 w-5 border-b border-l border-white/65 md:bottom-10 md:left-10" />
              <div className="absolute bottom-6 right-6 h-5 w-5 border-b border-r border-white/65 md:bottom-10 md:right-10" />
            </div>

            <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 py-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.24em] text-text-mono terminal-glow">
                  EVIDENCE CAPTURE
                </p>
                <p className="mt-1 font-body text-sm text-white/72">{roomName}</p>
              </div>
              <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-white/45">
                REAR CAM
              </div>
            </div>

            {cameraError && (
              <div className="absolute inset-x-4 bottom-4 rounded-sm border border-accent-red/35 bg-black/80 p-3 text-sm text-white/75">
                {cameraError}
              </div>
            )}
          </div>

          <div className="safe-bottom border-t border-white/10 bg-bg-secondary px-6 py-6">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="font-mono text-[10px] tracking-[0.28em] text-white/35">
                READY TO DOCUMENT
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={capture}
                className="flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white bg-white/10 transition-transform active:scale-95"
                aria-label="Capture evidence photo"
              >
                <span className="h-14 w-14 rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.18)]" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative flex-1 overflow-hidden bg-black">
            <Image
              src={previewSrc}
              alt="Captured evidence preview"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/85 to-transparent px-4 py-4">
              <p className="font-mono text-[11px] tracking-[0.24em] text-accent-amber">
                PREVIEW BEFORE SAVE
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 bg-bg-secondary p-4">
            <label className="mb-2 block font-mono text-[11px] tracking-[0.22em] text-white/52">
              메모 {memo.length}/{MEMO_MAX_LENGTH}
            </label>
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value.slice(0, MEMO_MAX_LENGTH))}
              rows={4}
              maxLength={MEMO_MAX_LENGTH}
              placeholder="증거에 대한 메모를 기록합니다."
              className="w-full resize-none rounded-sm border border-white/10 bg-bg-elevated px-3 py-3 font-body text-sm leading-relaxed text-text-primary outline-none transition-colors placeholder:text-white/22 focus:border-accent-teal"
            />
          </div>

          <div className="safe-bottom flex gap-3 border-t border-white/10 bg-bg-secondary px-4 py-4">
            <button
              type="button"
              onClick={() => setPreviewSrc(null)}
              className="flex-1 border border-white/20 px-4 py-3 font-mono text-sm tracking-[0.2em] text-white/68"
            >
              다시 찍기
            </button>
            <button
              type="button"
              onClick={confirmCapture}
              disabled={saving}
              className="flex-1 bg-accent-teal px-4 py-3 font-mono text-sm font-bold tracking-[0.2em] text-black disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
