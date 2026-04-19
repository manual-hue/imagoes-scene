'use client';

import { useRef, useState } from 'react';
import { savePhoto } from '@/lib/evidence';

interface ScreenshotFabProps {
  sessionId: string;
  objectId: string;
  objectName: string;
  /** bottom offset (Tailwind class). Defaults to 'bottom-24' for pages with tab bar. */
  bottomClass?: string;
}

export function ScreenshotFab({
  sessionId,
  objectId,
  objectName,
  bottomClass = 'bottom-24',
}: ScreenshotFabProps) {
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [saved, setSaved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);

    // 버튼을 숨기고 플래시 트리거
    if (buttonRef.current) buttonRef.current.style.visibility = 'hidden';
    setFlash(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.documentElement, {
        useCORS: true,
        allowTaint: true,
        scale: Math.min(window.devicePixelRatio, 2),
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      await savePhoto({
        sessionId,
        roomId: objectId,
        roomName: objectName,
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
        <div className="fixed left-1/2 top-6 z-[9998] -translate-x-1/2 rounded-sm border border-accent-teal/40 bg-black/90 px-4 py-2 font-mono text-[11px] tracking-[0.22em] text-accent-teal">
          증거를 저장하였습니다.
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={handleCapture}
        disabled={capturing}
        className={`fixed right-4 z-[35] flex h-14 w-14 items-center justify-center rounded-full border border-accent-amber/40 bg-black/70 shadow-[0_0_20px_rgba(245,158,11,0.15)] backdrop-blur-sm transition-transform active:scale-90 disabled:opacity-40 ${bottomClass}`}
        aria-label="스크린샷을 증거로 저장"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent-amber"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="12" cy="12" r="4" />
          <path d="M3 9h2M3 15h2M19 9h2M19 15h2M9 3v2M15 3v2M9 19v2M15 19v2" strokeWidth="1.4" />
        </svg>
      </button>
    </>
  );
}
