import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin-auth';
import caseZero from '@/data/cases/case-zero.json';

interface CaseObject {
  id: string;
  type: string;
  shortCode: string;
  name?: string;
  description?: string;
  owner?: string;
}

interface CaseJson {
  sessionId: string;
  sessionCode: string;
  objects: CaseObject[];
}

const TYPE_LABEL: Record<string, string> = {
  room: 'ROOM',
  phone: 'PHONE',
};

export default async function AdminBrowsePage() {
  await requireAdminSession();

  const data = caseZero as CaseJson;
  const objects = [...data.objects].sort((a, b) =>
    a.shortCode.localeCompare(b.shortCode),
  );

  const grouped = objects.reduce<Record<string, CaseObject[]>>((acc, obj) => {
    (acc[obj.type] ??= []).push(obj);
    return acc;
  }, {});

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.4em] text-black/35 uppercase">
          Browse All
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold text-black">Objects</h1>
        <p className="mt-1 text-xs text-black/40">
          모든 사건 오브젝트(방·핸드폰 등)를 한 곳에서 확인하고 진입합니다.
        </p>
        <p className="mt-2 font-mono text-[10px] text-black/25">
          SESSION: {data.sessionCode} · TOTAL {objects.length}
        </p>
      </div>

      {Object.entries(grouped).map(([type, items]) => (
        <section key={type}>
          <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-4">
            <h2 className="font-mono text-xs tracking-[0.2em] text-black/50 uppercase">
              {TYPE_LABEL[type] ?? type.toUpperCase()}
              <span className="ml-2 text-black/25">{items.length}</span>
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((obj) => (
              <Link
                key={obj.id}
                href={`/object/${data.sessionId}/${obj.id}`}
                className="group border border-black/10 p-4 transition hover:border-black/30 hover:bg-black/[0.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-black/30">
                    {obj.shortCode}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-black/20 group-hover:text-black/50 transition">
                    ENTER &rarr;
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-medium text-black">
                  {obj.name ?? obj.id}
                </h3>

                {obj.description && (
                  <p className="mt-1.5 text-xs text-black/40 line-clamp-2 leading-relaxed">
                    {obj.description}
                  </p>
                )}

                <div className="mt-3 flex gap-3 font-mono text-[10px] text-black/25">
                  <span>{TYPE_LABEL[obj.type] ?? obj.type.toUpperCase()}</span>
                  {obj.owner && <span>OWNER {obj.owner}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
