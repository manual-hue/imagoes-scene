'use client';

import { QRCodeSVG } from 'qrcode.react';

interface InlineQRProps {
  url: string;
  label: string;
}

export function InlineQR({ url, label }: InlineQRProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <QRCodeSVG
        value={url}
        level="M"
        size={96}
        marginSize={1}
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#111111"
        title={`${label} QR code`}
      />
      <p className="font-mono text-[9px] text-black/25 text-center max-w-[120px] truncate">
        {url}
      </p>
    </div>
  );
}
