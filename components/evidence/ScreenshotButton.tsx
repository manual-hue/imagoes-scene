'use client';

import { useRef, useState } from 'react';
import { savePhoto } from '@/lib/evidence';

interface ScreenshotButtonProps {
  sessionId: string;
  objectId: string;
}

export function ScreenshotButton({ sessionId, objectId }: ScreenshotButtonProps) {
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [saved, setSaved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);

    if (buttonRef.current) buttonRef.current.style.visibility = 'hidden';
    setFlash(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: window.devicePixelRatio,
        width: vw,
        height: vh,
        windowWidth: vw,
        windowHeight: vh,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      await savePhoto({
        sessionId,
        roomId: objectId,
        roomName: objectId,
        dataUrl,
        memo: '',
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setFlash(false);
      if (buttonRef.current) buttonRef.current.style.visibility = '';
      setCapturing(false);
    }
  };

  return (
    <>
      {flash && (
        <div
          className="pointer-events-none fixed inset-0 z-[9999] bg-white"
          style={{ animation: 'screenshot-flash 0.25s ease-out forwards' }}
        />
      )}

      {saved && (
        <div className="fixed left-1/2 top-16 z-[9998] -translate-x-1/2 rounded-sm border border-accent-teal/40 bg-black/90 px-4 py-2 font-mono text-[11px] tracking-[0.22em] text-accent-teal">
          증거를 저장하였습니다.
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={handleCapture}
        disabled={capturing}
        className="flex min-h-[36px] items-center gap-2 overflow-hidden rounded-2xl border border-white/15 bg-black/72 px-2.5 py-1.5 shadow-lg backdrop-blur-md transition-opacity disabled:opacity-40"
        aria-label="스크린샷을 증거로 저장"
        title="스크린샷 저장"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent-amber"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="12" cy="12" r="4" />
          <line x1="3" y1="9" x2="5" y2="9" />
          <line x1="3" y1="15" x2="5" y2="15" />
          <line x1="19" y1="9" x2="21" y2="9" />
          <line x1="19" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="5" />
          <line x1="15" y1="3" x2="15" y2="5" />
          <line x1="9" y1="19" x2="9" y2="21" />
          <line x1="15" y1="19" x2="15" y2="21" />
        </svg>
      </button>
    </>
  );
}
