import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SessionDashboard } from '@/components/admin/SessionDashboard';
import { requireAdminSession } from '@/lib/admin-auth';
import { getAdminSessionDetail } from '@/lib/admin-data';

interface AdminSessionDetailPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default async function AdminSessionDetailPage({ params }: AdminSessionDetailPageProps) {
  await requireAdminSession();
  const { sessionId } = await params;
  const detail = await getAdminSessionDetail(sessionId);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8">
      {/* Session Header */}
      <section className="border border-black/12 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tracking-[0.2em] text-black/40">
                {detail.session.sessionCode}
              </span>
              <span className="font-mono text-[10px] text-black/25">
                CODE: {detail.session.config.accessCode}
              </span>
            </div>
            <h1 className="mt-2 font-mono text-xl font-bold text-black">
              {detail.session.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-black/30">
              {formatDate(detail.session.createdAt)}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/admin/session/${sessionId}/qr`}
              className="inline-flex min-h-[36px] items-center border border-black/30 px-4 font-mono text-[11px] tracking-wider text-black/70 transition hover:bg-black hover:text-white"
            >
              QR PRINT
            </Link>
            <Link
              href="/admin"
              className="inline-flex min-h-[36px] items-center border border-black/12 px-4 font-mono text-[11px] tracking-wider text-black/35 transition hover:border-black/30 hover:text-black/70"
            >
              BACK
            </Link>
          </div>
        </div>
      </section>

      <SessionDashboard sessionId={sessionId} initialDetail={detail} />
    </main>
  );
}
