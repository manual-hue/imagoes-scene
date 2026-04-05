import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin-auth';
import { listAdminSessions } from '@/lib/admin-data';

const STATUS_MAP: Record<string, { label: string; indicator: string }> = {
  waiting: { label: 'IDLE', indicator: 'bg-black/25' },
  active: { label: 'LIVE', indicator: 'bg-black' },
  ended: { label: 'END', indicator: 'bg-black/10' },
};

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default async function AdminSessionsPage() {
  await requireAdminSession();
  const sessions = await listAdminSessions();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8">
      {/* Header */}
      <section className="flex flex-col gap-4 border border-black/12 p-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.4em] text-black/35 uppercase">
            Session Manager
          </p>
          <h1 className="mt-2 font-mono text-xl font-bold text-black">
            게임 세션
          </h1>
          <p className="mt-1 text-xs text-black/40">
            타이머, 방 접근, QR, 중간점검 관리
          </p>
        </div>

        <Link
          href="/admin/session/new"
          className="inline-flex min-h-[44px] items-center justify-center border border-black bg-black px-5 font-mono text-xs font-bold tracking-[0.15em] text-white transition hover:bg-black/85"
        >
          + NEW SESSION
        </Link>
      </section>

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="border border-black/8 p-8 text-center">
          <p className="font-mono text-xs text-black/30 tracking-wider">
            NO SESSIONS — 새 세션을 생성하세요
          </p>
        </div>
      ) : (
        <section className="border border-black/12 divide-y divide-black/8">
          {sessions.map((session) => {
            const status = STATUS_MAP[session.status] ?? STATUS_MAP.waiting;
            return (
              <article
                key={session.id}
                className="p-5"
              >
                {/* Header: code + status */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs tracking-[0.2em] text-black/40">
                    {session.sessionCode}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${status.indicator}`} />
                    <span className="font-mono text-[10px] tracking-[0.15em] text-black/35">
                      {status.label}
                    </span>
                  </span>
                </div>

                {/* Session name */}
                <h2 className="mt-2 text-base font-medium text-black">
                  {session.name}
                </h2>

                {/* Stats: vertical on mobile, horizontal on md+ */}
                <div className="mt-4 flex flex-col gap-1.5 font-mono text-xs sm:flex-row sm:gap-6">
                  <div className="flex justify-between sm:block">
                    <span className="text-black/30">ROOMS</span>
                    <span className="text-black sm:ml-2">{session.roomCount}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-black/30">PLAYERS</span>
                    <span className="text-black sm:ml-2">{session.playerCount}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-black/30">CREATED</span>
                    <span className="text-black/50 sm:ml-2">{formatDate(session.createdAt)}</span>
                  </div>
                </div>

                {/* Actions: full width on mobile */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/admin/session/${session.id}`}
                    className="inline-flex min-h-[44px] items-center justify-center border border-black/30 px-4 font-mono text-[11px] tracking-wider text-black/70 transition hover:bg-black hover:text-white sm:min-h-[36px] sm:justify-start"
                  >
                    DASHBOARD
                  </Link>
                  <Link
                    href={`/admin/session/${session.id}/qr`}
                    className="inline-flex min-h-[44px] items-center justify-center border border-black/12 px-4 font-mono text-[11px] tracking-wider text-black/35 transition hover:border-black/30 hover:text-black/70 sm:min-h-[36px] sm:justify-start"
                  >
                    QR PRINT
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
