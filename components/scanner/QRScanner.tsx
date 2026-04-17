'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loadCase } from '@/lib/case-loader';
import { getObjectByCode } from '@/lib/case-cache';

interface QRScannerProps {
  onClose: () => void;
}

type Html5QrcodeScanner = { stop?: () => Promise<void> };

function safeStop(scanner: Html5QrcodeScanner | null): Promise<void> {
  // html5-qrcode throws synchronously (not a rejected Promise) when already stopped.
  // Wrap in try/catch so cleanup never propagates an error into React.
  try {
    return scanner?.stop?.() ?? Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

export function QRScanner({ onClose }: QRScannerProps) {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<Html5QrcodeScanner | null>(null);
  const navigatingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(
    (decodedText: string) => {
      // Prevent firing multiple times for the same scan
      if (navigatingRef.current) return;

      try {
        const url = new URL(decodedText);
        const match =
          url.pathname.match(/^\/o\/([^/]+)\/([^/]+)$/) ??
          url.pathname.match(/^\/r\/([^/]+)\/([^/]+)$/);

        if (!match) return;

        navigatingRef.current = true;
        const objectCode = match[2];

        // Null out ref before stopping so cleanup is a no-op
        const scanner = html5QrRef.current;
        html5QrRef.current = null;

        safeStop(scanner)
          .finally(async () => {
            try {
              const caseData = await loadCase('case-zero');
              const obj = getObjectByCode('case-zero', objectCode);
              if (obj) {
                onClose();
                router.push(`/object/${caseData.sessionId}/${obj.id}`);
              } else {
                window.location.href = url.pathname;
              }
            } catch {
              window.location.href = url.pathname;
            }
          });
      } catch {
        navigatingRef.current = false;
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
      // safeStop is a no-op if ref was already nulled out in handleScan
      safeStop(html5QrRef.current);
      html5QrRef.current = null;
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
