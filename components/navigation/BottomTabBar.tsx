'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomTabBarProps {
  sessionId: string;
  roomId?: string;
}

interface Tab {
  label: string;
  icon: string;
  href: (sessionId: string, roomId?: string) => string;
  match: (pathname: string) => boolean;
}

const tabs: Tab[] = [
  {
    label: 'Hub',
    icon: 'H',
    href: (sid) => `/hub/${sid}`,
    match: (p) => p.startsWith('/hub/'),
  },
  {
    label: 'Evidence',
    icon: 'E',
    href: (sid) => `/evidence/${sid}`,
    match: (p) => p.startsWith('/evidence/'),
  },
  {
    label: 'Suspect',
    icon: 'S',
    href: (sid) => `/accusation/${sid}`,
    match: (p) => p.startsWith('/accusation/'),
  },
];

export function BottomTabBar({ sessionId, roomId }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex min-h-[56px] items-center justify-around border-t border-white/[0.08] px-4 backdrop-blur-md safe-bottom"
      style={{ background: 'rgba(12,12,15,0.8)' }}
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.label}
            href={tab.href(sessionId, roomId)}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              active
                ? 'text-[var(--accent-teal)]'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="font-mono text-[10px] tracking-wider">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
