import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin-auth';
import mockCase from '@/data/mock-case.json';
import phoneData from '@/data/mock-phones.json';

export default async function AdminBrowsePage() {
  await requireAdminSession();

  const session = mockCase.session;
  const rooms = [...mockCase.rooms].sort((a, b) => a.order - b.order);
  const phones = phoneData as Array<{ id: string; name: string; owner: string; device: string; apps?: unknown[] }>;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.4em] text-black/35 uppercase">
          Browse All
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold text-black">
          Rooms &amp; Phones
        </h1>
        <p className="mt-1 text-xs text-black/40">
          모든 방과 핸드폰을 확인하고 클릭하여 진입합니다.
        </p>
      </div>

      {/* ── ROOMS ── */}
      <section>
        <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-4">
          <h2 className="font-mono text-xs tracking-[0.2em] text-black/50 uppercase">
            Rooms
            <span className="ml-2 text-black/25">{rooms.length}</span>
          </h2>
          <span className="font-mono text-[10px] text-black/25">
            SESSION: {session.sessionCode}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${session.id}/${room.id}`}
              className="group border border-black/10 p-4 transition hover:border-black/30 hover:bg-black/[0.02]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.2em] text-black/30">
                  {room.shortCode}
                </span>
                <span className="font-mono text-[10px] tracking-wider text-black/20 group-hover:text-black/50 transition">
                  ENTER &rarr;
                </span>
              </div>

              <h3 className="mt-2 text-sm font-medium text-black">
                {room.name}
              </h3>

              <p className="mt-1.5 text-xs text-black/40 line-clamp-2 leading-relaxed">
                {room.description}
              </p>

              <div className="mt-3 flex gap-3 font-mono text-[10px] text-black/25">
                <span>CLUES {room.clues?.length ?? 0}</span>
                <span>{room.isAccessible ? 'OPEN' : 'LOCKED'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PHONES ── */}
      <section>
        <div className="border-b border-black/10 pb-3 mb-4">
          <h2 className="font-mono text-xs tracking-[0.2em] text-black/50 uppercase">
            Phones
            <span className="ml-2 text-black/25">{phones.length}</span>
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {phones.map((phone) => (
            <Link
              key={phone.id}
              href={`/phones/${phone.id}`}
              className="group border border-black/10 p-4 transition hover:border-black/30 hover:bg-black/[0.02]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.2em] text-black/30">
                  {phone.device}
                </span>
                <span className="font-mono text-[10px] tracking-wider text-black/20 group-hover:text-black/50 transition">
                  OPEN &rarr;
                </span>
              </div>

              <h3 className="mt-2 text-sm font-medium text-black">
                {phone.name}
              </h3>

              <div className="mt-2 flex gap-3 font-mono text-[10px] text-black/25">
                <span>OWNER {phone.owner}</span>
                <span>APPS {phone.apps?.length ?? 0}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
