import { redirect } from 'next/navigation';
import { createAdminSession, getAdminSession, isAdminAuthConfigured } from '@/lib/admin-auth';

interface AdminLoginPageProps {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
}

function getErrorMessage(error: string | undefined) {
  switch (error) {
    case 'invalid-email':
      return 'ACCESS DENIED — 허가되지 않은 이메일입니다.';
    case 'missing-email':
      return 'ERROR — 이메일 주소를 입력해주세요.';
    default:
      return null;
  }
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getAdminSession();
  if (session) {
    redirect('/admin');
  }

  const params = searchParams ? await searchParams : undefined;
  const errorMessage = getErrorMessage(params?.error);
  const next = params?.next && params.next.startsWith('/admin') ? params.next : '/admin';

  async function loginAction(formData: FormData) {
    'use server';

    const email = String(formData.get('email') ?? '').trim();
    const redirectTarget = String(formData.get('next') ?? '/admin');

    if (!email) {
      redirect(`/admin/login?error=missing-email&next=${encodeURIComponent(redirectTarget)}`);
    }

    const ok = await createAdminSession(email);
    if (!ok) {
      redirect(`/admin/login?error=invalid-email&next=${encodeURIComponent(redirectTarget)}`);
    }

    redirect(redirectTarget.startsWith('/admin') ? redirectTarget : '/admin');
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="border border-black/15 p-6">
          <p className="font-mono text-[10px] tracking-[0.4em] text-black/35 uppercase">
            Crime Scene Zero
          </p>
          <div className="my-3 h-px bg-black/8" />
          <h1 className="font-mono text-lg font-bold text-black tracking-wide">
            ADMIN LOGIN
          </h1>
          <p className="mt-2 text-xs text-black/40 leading-relaxed">
            관리자 이메일 인증
          </p>
        </div>

        {/* Warning */}
        {!isAdminAuthConfigured() ? (
          <div className="border-x border-black/15 px-6 py-3 bg-black/[0.03]">
            <p className="font-mono text-[10px] text-black/40 leading-relaxed">
              !! ADMIN_EMAIL / ADMIN_SECRET 미설정 — 로컬 테스트 모드
            </p>
          </div>
        ) : null}

        {/* Form */}
        <form action={loginAction} className="border border-t-0 border-black/15 p-6">
          <input type="hidden" name="next" value={next} />

          <label className="block">
            <span className="font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase block mb-2">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoFocus
              placeholder="admin@example.com"
              className="min-h-[44px] w-full border border-black/15 bg-transparent px-3 font-mono text-sm text-black outline-none transition placeholder:text-black/20 focus:border-black/40"
            />
          </label>

          {errorMessage ? (
            <p className="mt-4 border border-black/15 px-3 py-2 font-mono text-xs text-black/60">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 min-h-[44px] w-full border border-black bg-black px-4 font-mono text-xs font-bold tracking-[0.2em] text-white transition hover:bg-black/85 active:bg-black/75"
          >
            AUTHENTICATE
          </button>
        </form>
      </div>
    </main>
  );
}
