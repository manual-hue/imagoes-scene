import { QRCodeSVG } from 'qrcode.react';
import type { QRPrintableRoom } from '@/lib/firebase/rooms';
import styles from '@/app/admin/session/[sessionId]/qr/page.module.css';

export interface QRPrintableObject {
  id: string;
  name: string;
  shortCode: string;
  order: number;
  type?: string;
}

interface QRGeneratorProps {
  baseUrl: string;
  sessionCode: string;
  rooms: QRPrintableRoom[];
  objects?: QRPrintableObject[];
}

const TYPE_COLORS: Record<string, string> = {
  room: '#22d3ee',
  phone: '#f59e0b',
  laptop: '#a78bfa',
  document: '#f87171',
};

function buildObjectUrl(baseUrl: string, sessionCode: string, objectCode: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/o/${sessionCode}/${objectCode}`;
}

export function QRGenerator({ baseUrl, sessionCode, rooms, objects }: QRGeneratorProps) {
  // Use objects if provided, otherwise fall back to rooms for backwards compat
  const items: QRPrintableObject[] = objects ?? rooms.map((r) => ({ ...r, type: 'room' }));

  return (
    <div className={styles.sheet}>
      {items.map((item) => {
        const url = buildObjectUrl(baseUrl, sessionCode, item.shortCode);
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
          </article>
        );
      })}
    </div>
  );
}
