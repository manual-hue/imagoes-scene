import Link from 'next/link';
import { getAdminSession, clearAdminSession } from '@/lib/admin-auth';
import { AdminRouteGate } from '@/components/admin/AdminRouteGate';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  async function logoutAction() {
    'use server';

    await clearAdminSession();
  }

  return (
    <AdminRouteGate authenticated={Boolean(session)}>
      <div className="fixed inset-0 z-[10010] bg-white text-black overflow-y-auto">

          {session ? (
            <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur-sm">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
                <Link
                  href="/admin"
                  className="font-mono text-xs tracking-[0.3em] text-black/40 uppercase hover:text-black transition"
                >
                  CSZ // ADMIN
                </Link>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-black/30 hidden sm:inline">
                    {session.email}
                  </span>
                  <Link
                    href="/admin/browse"
                    className="font-mono text-xs text-black/40 tracking-wider transition hover:text-black"
                  >
                    BROWSE
                  </Link>
                  <Link
                    href="/admin/session/new"
                    className="border border-black/30 px-3 py-1.5 font-mono text-xs tracking-wider text-black/70 transition hover:bg-black hover:text-white"
                  >
                    + NEW
                  </Link>

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="font-mono text-xs text-black/30 tracking-wider transition hover:text-black"
                    >
                      LOGOUT
                    </button>
                  </form>
                </div>
              </div>
            </header>
          ) : null}

          {children}
      </div>
    </AdminRouteGate>
  );
}
