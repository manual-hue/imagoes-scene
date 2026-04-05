import { QRCodeSVG } from 'qrcode.react';
import type { QRPrintableRoom } from '@/lib/firebase/rooms';
import styles from '@/app/admin/session/[sessionId]/qr/page.module.css';

interface QRGeneratorProps {
  baseUrl: string;
  sessionCode: string;
  rooms: QRPrintableRoom[];
}

function buildRoomUrl(baseUrl: string, sessionCode: string, roomCode: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/r/${sessionCode}/${roomCode}`;
}

export function QRGenerator({ baseUrl, sessionCode, rooms }: QRGeneratorProps) {
  return (
    <div className={styles.sheet}>
      {rooms.map((room) => {
        const url = buildRoomUrl(baseUrl, sessionCode, room.shortCode);

        return (
          <article key={room.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardCode}>{room.shortCode}</p>
              <h2 className={styles.cardName}>{room.name}</h2>
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
                title={`${room.name} QR code`}
              />
            </div>

            <p className={styles.cardUrl}>{url}</p>
          </article>
        );
      })}
    </div>
  );
}
