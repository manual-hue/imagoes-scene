'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation';

interface AdminRouteGateProps {
  authenticated: boolean;
  children: React.ReactNode;
}

export function AdminRouteGate({ authenticated, children }: AdminRouteGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();
  const isLoginRoute = segment === 'login';

  useEffect(() => {
    if (!authenticated && !isLoginRoute) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authenticated, isLoginRoute, pathname, router]);

  if (!authenticated && !isLoginRoute) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-6 text-sm text-slate-400">
        관리자 세션 확인 중...
      </div>
    );
  }

  return <>{children}</>;
}
