'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface QRScannerProps {
  onClose: () => void;
}

export function QRScanner({ onClose }: QRScannerProps) {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(
    (decodedText: string) => {
      try {
        const url = new URL(decodedText);
        // Match /o/{sessionCode}/{objectCode}
        const match = url.pathname.match(/^\/o\/([^/]+)\/([^/]+)$/);
        if (match) {
          // Stop scanner before navigating
          const scanner = html5QrRef.current as { stop?: () => Promise<void> } | null;
          scanner?.stop?.();
          router.push(url.pathname);
          onClose();
          return;
        }
        // Also match legacy /r/{sessionCode}/{roomCode}
        const legacyMatch = url.pathname.match(/^\/r\/([^/]+)\/([^/]+)$/);
        if (legacyMatch) {
          const scanner = html5QrRef.current as { stop?: () => Promise<void> } | null;
          scanner?.stop?.();
          router.push(`/o/${legacyMatch[1]}/${legacyMatch[2]}`);
          onClose();
          return;
        }
      } catch {
        // Not a valid URL — ignore
      }
    },
    [router, onClose],
  );

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!mounted || !scannerRef.current) return;

      const scannerId = 'qr-scanner-region';
      scannerRef.current.id = scannerId;

      const scanner = new Html5Qrcode(scannerId);
      html5QrRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScan,
          () => {},
        );
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Camera access denied');
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;
      const scanner = html5QrRef.current as { stop?: () => Promise<void> } | null;
      scanner?.stop?.().catch(() => {});
    };
  }, [handleScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-mono text-xs tracking-[0.2em] text-white/60">QR SCANNER</p>
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] font-mono text-sm text-white/60 transition-colors hover:text-white"
        >
          CLOSE
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        {error ? (
          <div className="text-center">
            <p className="font-mono text-sm text-accent-red">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 rounded border border-white/20 px-4 py-2 font-mono text-xs text-white/60"
            >
              BACK
            </button>
          </div>
        ) : (
          <div ref={scannerRef} className="w-full max-w-[320px]" />
        )}
      </div>
    </div>
  );
}
