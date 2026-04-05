import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { QRGenerator } from '@/components/admin/QRGenerator';
import { getSessionQRPayload } from '@/lib/firebase/rooms';
import styles from './page.module.css';

interface QRPrintPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

function resolveBaseUrl(hostHeader: string | null, protoHeader: string | null): string {
  const explicitBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (explicitBaseUrl) {
    return explicitBaseUrl.startsWith('http')
      ? explicitBaseUrl
      : `https://${explicitBaseUrl}`;
  }

  const host = hostHeader ?? 'localhost:3000';
  const proto = protoHeader ?? (host.includes('localhost') ? 'http' : 'https');

  return `${proto}://${host}`;
}

export default async function QRPrintPage({ params }: QRPrintPageProps) {
  const { sessionId } = await params;
  const payload = await getSessionQRPayload(sessionId);

  if (!payload) {
    notFound();
  }

  const headerStore = await headers();
  const baseUrl = resolveBaseUrl(
    headerStore.get('x-forwarded-host') ?? headerStore.get('host'),
    headerStore.get('x-forwarded-proto'),
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>QR 출력</p>
          <h1 className={styles.title}>{payload.sessionName}</h1>
        </div>
        <div className={styles.meta}>
          <p>세션 코드 {payload.sessionCode}</p>
          <p>{payload.rooms.length}개 방 카드</p>
        </div>
      </header>

      <QRGenerator
        baseUrl={baseUrl}
        sessionCode={payload.sessionCode}
        rooms={payload.rooms}
      />
    </main>
  );
}
