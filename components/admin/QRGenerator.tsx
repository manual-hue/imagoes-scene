import { QRCodeSVG } from 'qrcode.react';
import type { QRPrintableObject } from '@/lib/firebase/rooms';
import styles from '@/app/admin/session/[sessionId]/qr/page.module.css';

type QRObject = QRPrintableObject & { url: string; directUrl: string };

interface QRGeneratorProps {
  objects: QRObject[];
}

const TYPE_COLORS: Record<string, string> = {
  room: '#22d3ee',
  phone: '#f59e0b',
  laptop: '#a78bfa',
  document: '#f87171',
};

export function QRGenerator({ objects }: QRGeneratorProps) {
  return (
    <div className={styles.sheet}>
      {objects.map((item) => {
        const { url } = item;
        const accentColor = TYPE_COLORS[item.type ?? 'room'] ?? '#22d3ee';

        return (
          <article key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardCode} style={{ color: accentColor }}>
                {item.shortCode}
              </p>
              <h2 className={styles.cardName}>{item.name}</h2>
            </div>

            <div className={styles.cardQr}>
              <QRCodeSVG
                value={url}
                level="M"
                size={180}
                marginSize={2}
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#111111"
                title={`${item.name} QR code`}
              />
            </div>

            <p className={styles.cardUrl}>{url}</p>
            <p className={styles.cardUrlDirect}>{item.directUrl}</p>
          </article>
        );
      })}
    </div>
  );
}
