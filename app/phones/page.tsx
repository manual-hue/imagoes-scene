import Link from 'next/link';
import { mockPhones } from '@/lib/mock-phones';

export default function PhonesPage() {
  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#09111a_0%,_#04070b_100%)] px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-col gap-3">
          <p className="font-mono text-xs tracking-[0.28em] text-cyan-300">PHONE EVIDENCE</p>
          <h1 className="text-3xl font-semibold text-white">Select A Device</h1>
        </div>

        <div className="space-y-4">
          {mockPhones.map((phone) => (
            <Link
              key={phone.id}
              href={`/phones/${phone.id}`}
              className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-5 text-white transition hover:bg-white/8"
            >
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-cyan-300">{phone.device}</p>
                <p className="mt-1 text-xl font-semibold">{phone.name}</p>
              </div>
              <span className="font-mono text-[11px] tracking-[0.2em] text-white/45">OPEN</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
