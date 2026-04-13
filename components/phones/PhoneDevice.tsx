'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { MockPhone, PhoneApp, PhoneCall, PhoneCalendarDay, PhoneContact, PhoneMail, PhoneMapSearch, PhoneNote, PhonePhoto, PhonePlantAccessLog, PhonePlantVideo, PhoneProtectedAlbum, PhoneSafariSearch, PhoneThread } from '@/types/phone';

interface PhoneDeviceProps {
  phone: MockPhone;
}

const APP_ICON_TEXT: Record<string, string> = {
  folder: 'F',
  bubble: 'M',
  photos: 'G',
  mail: '@',
  calendar: '31',
  notes: 'N',
  wave: 'V',
  gear: 'S',
  phone: 'P',
  safari: 'W',
  camera: 'C',
  map: 'M',
  default: 'A',
};

const APP_ICON_ASSETS: Record<string, string> = {
  files: '/icons/phone-files.svg',
  messages: '/icons/phone-messages.svg',
  gallery: '/icons/phone-gallery.svg',
  gmail: '/icons/phone-gmail.svg',
  calendar: '/icons/phone-calendar.svg',
  notes: '/icons/phone-notes.svg',
  'voice-memos': '/icons/phone-voice-memos.svg',
  settings: '/icons/phone-settings.svg',
  phone: '/icons/phone-phone.svg',
  safari: '/icons/phone-safari.svg',
  camera: '/icons/phone-camera.svg',
  maps: '/icons/phone-maps.svg',
  contacts: '/icons/phone-contacts.svg',
};

const THEME_STYLES: Record<string, { background: string; color: string }> = {
  amber: { background: 'linear-gradient(135deg, #f7d76a 0%, #f4a61f 100%)', color: '#281400' },
  green: { background: 'linear-gradient(135deg, #7df5b0 0%, #1ebf68 100%)', color: '#062b16' },
  pink: { background: 'linear-gradient(135deg, #ffd5ef 0%, #ff7ab8 100%)', color: '#3b1025' },
  red: { background: 'linear-gradient(135deg, #ffd0d0 0%, #ff5f5f 100%)', color: '#3f0909' },
  white: { background: 'linear-gradient(135deg, #ffffff 0%, #eaeaea 100%)', color: '#141414' },
  yellow: { background: 'linear-gradient(135deg, #fff5ae 0%, #ffd74e 100%)', color: '#3d2b00' },
  black: { background: 'linear-gradient(135deg, #2a2a2a 0%, #070707 100%)', color: '#f4f4f4' },
  gray: { background: 'linear-gradient(135deg, #dfe5ec 0%, #838b96 100%)', color: '#111827' },
  blue: { background: 'linear-gradient(135deg, #b2dbff 0%, #2d86ff 100%)', color: '#071b45' },
  plant: { background: 'linear-gradient(135deg, #d4f5d4 0%, #4caf76 100%)', color: '#0d3320' },
};

export function PhoneDevice({ phone }: PhoneDeviceProps) {
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const appMap = new Map(phone.apps.map((app) => [app.id, app]));
  const activeApp = openAppId ? appMap.get(openAppId) ?? null : null;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#020409]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.12),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.08),_transparent_22%)]" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] items-center justify-center p-0 md:px-4 md:py-6">
        <div className="relative h-[100dvh] w-full overflow-hidden bg-[#050608] shadow-[0_40px_120px_rgba(0,0,0,0.55)] md:h-[min(920px,96dvh)] md:rounded-[2.9rem] md:border md:border-white/10 md:p-2">
          <div className="relative h-full overflow-hidden bg-black md:rounded-[2.45rem]">
            <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-7 w-36 -translate-x-1/2 rounded-full bg-black/92" />

            <div className={`relative h-full ${getWallpaperClass(phone.screen.wallpaper)}`}>
              <StatusBar phone={phone} />

              <div className="absolute inset-0 overflow-hidden">
                <div className="h-full overflow-y-auto px-5 pb-32 pt-16">
                  <HomeWidgets phone={phone} />

                  <div className="mt-5 grid grid-cols-4 gap-x-3 gap-y-5">
                    {phone.screen.homeApps.map((appId) => {
                      const app = appMap.get(appId);
                      if (!app) {
                        return null;
                      }

                      return <AppIconButton key={app.id} app={app} onClick={() => setOpenAppId(app.id)} />;
                    })}
                  </div>
                </div>

                <Dock
                  apps={phone.screen.dockApps.map((appId) => appMap.get(appId)).filter(Boolean) as PhoneApp[]}
                  onOpen={setOpenAppId}
                />

                {activeApp && <AppWindow app={activeApp} phone={phone} onClose={() => setOpenAppId(null)} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBar({ phone }: { phone: MockPhone }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-8 pt-4 text-white">
      <span className="font-mono text-sm tracking-[0.1em]">{phone.screen.time}</span>
      <div className="flex items-center gap-2 font-mono text-[11px] text-white/75">
        <span>{phone.screen.carrier}</span>
        <Battery battery={phone.screen.battery} />
      </div>
    </div>
  );
}

function Battery({ battery }: { battery: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-3.5 w-7 rounded-[0.35rem] border border-white/60 p-[1px]">
        <div
          className={`h-full rounded-[0.22rem] ${battery <= 20 ? 'bg-red-400' : 'bg-white'}`}
          style={{ width: `${Math.max(12, battery)}%` }}
        />
      </div>
      <span>{battery}%</span>
    </div>
  );
}

function HomeWidgets({ phone }: { phone: MockPhone }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/14 bg-black/20 p-4 backdrop-blur-xl">
        <p className="font-mono text-[11px] tracking-[0.24em] text-white/45">{phone.screen.date}</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold text-white">{phone.screen.time}</p>
            <p className="mt-1 text-sm text-white/70">{phone.owner} Home</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 text-right">
            <p className="font-mono text-[10px] tracking-[0.22em] text-white/45">STATE</p>
            <p className="mt-1 text-sm font-medium text-white">{phone.screen.lockState === 'unlocked' ? 'Unlocked' : 'Locked'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {phone.screen.notifications.map((notification) => (
          <div
            key={`${notification.sender}-${notification.time}`}
            className="rounded-[1.6rem] border border-white/12 bg-white/10 p-3 backdrop-blur-xl"
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-white/45">{notification.app}</p>
            <p className="mt-2 text-sm font-medium leading-snug text-white">{notification.preview}</p>
            <p className="mt-2 text-xs text-white/55">{notification.sender}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dock({ apps, onOpen }: { apps: PhoneApp[]; onOpen: (appId: string) => void }) {
  return (
    <div className="absolute inset-x-5 bottom-4 rounded-[2rem] border border-white/12 bg-white/12 px-4 py-3 backdrop-blur-2xl">
      <div className="grid grid-cols-4 gap-3">
        {apps.map((app) => (
          <AppIconButton key={app.id} app={app} compact onClick={() => onOpen(app.id)} />
        ))}
      </div>
    </div>
  );
}

function AppIconButton({
  app,
  onClick,
  compact = false,
}: {
  app: PhoneApp;
  onClick: () => void;
  compact?: boolean;
}) {
  const theme = THEME_STYLES[app.theme] ?? THEME_STYLES.gray;
  const iconText = APP_ICON_TEXT[app.icon] ?? APP_ICON_TEXT.default;

  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 text-center">
      <span
        className={`${compact ? 'h-14 w-14' : 'h-16 w-16'} flex items-center justify-center rounded-[1.45rem] text-sm font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition-transform hover:scale-[1.04] active:scale-[0.97]`}
        style={{ background: theme.background, color: theme.color }}
      >
        {APP_ICON_ASSETS[app.id] ? (
          <Image
            src={APP_ICON_ASSETS[app.id]}
            alt={app.label}
            width={compact ? 56 : 64}
            height={compact ? 56 : 64}
            className={`${compact ? 'h-14 w-14' : 'h-16 w-16'} rounded-[1.45rem]`}
          />
        ) : app.icon === 'plant' ? (
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="18" cy="28" rx="7" ry="4" fill="#8B5C2A" fillOpacity="0.55" />
            <rect x="14" y="22" width="8" height="6" rx="2" fill="#A0693A" />
            <path d="M18 22 C18 16, 12 14, 10 9 C13 10, 16 13, 18 17 C18 11, 23 7, 26 5 C24 10, 20 14, 18 18" fill="#3da85a" />
            <circle cx="18" cy="8" r="3.5" fill="#5ecb7a" />
            <circle cx="12" cy="13" r="3" fill="#4bbf6b" />
            <circle cx="24" cy="11" r="3" fill="#4bbf6b" />
          </svg>
        ) : (
          iconText
        )}
      </span>
      {!compact && <span className="text-[11px] font-medium leading-tight text-white/90">{app.label}</span>}
    </button>
  );
}

function AppWindow({ app, phone, onClose }: { app: PhoneApp; phone: MockPhone; onClose: () => void }) {
  const isGallery = app.id === 'gallery';

  return (
    <div className={`absolute inset-0 z-40 ${isGallery ? 'bg-black text-white' : 'bg-[#f6f7fb] text-slate-950'}`}>
      <div className="flex h-full flex-col">
        <div
          className={`flex items-center justify-between px-5 pb-3 pt-12 ${
            isGallery ? 'border-b border-white/10 bg-black text-white' : 'border-b border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full px-3 py-1.5 font-mono text-[11px] tracking-[0.18em] ${
              isGallery ? 'border border-white/20 text-white/80' : 'border border-slate-300 text-slate-600'
            }`}
          >
            HOME
          </button>
          <div className="text-center">
            <p className="text-base font-semibold">{app.label}</p>
          </div>
          <span className="w-[52px]" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <AppContent app={app} phone={phone} />
        </div>
      </div>
    </div>
  );
}

function AppContent({ app, phone }: { app: PhoneApp; phone: MockPhone }) {
  if (app.id === 'files') {
    return <FilesView app={app} />;
  }

  if (app.id === 'messages') {
    return <MessagesView threads={app.content.threads ?? []} />;
  }

  if (app.id === 'gallery') {
    return <GalleryView photos={app.content.photos ?? []} deletedPhotos={app.content.deletedPhotos ?? []} protectedAlbums={app.content.protectedAlbums ?? []} phoneId={phone.id} />;
  }

  if (app.id === 'gmail') {
    return <GmailView mails={app.content.mails ?? []} />;
  }

  if (app.id === 'safari') {
    return <SafariView recentSearches={app.content.recentSearches ?? []} />;
  }

  if (app.id === 'voice-memos') {
    return <VoiceMemosView app={app} />;
  }

  if (app.id === 'calendar') {
    return <CalendarView days={app.content.calendarDays ?? []} />;
  }

  if (app.id === 'maps') {
    return <MapsView searches={app.content.mapSearches ?? []} />;
  }

  if (app.id === 'notes') {
    return <NotesView notes={app.content.notes ?? []} fallback={app.content.note} />;
  }

  if (app.id === 'phone') {
    return <PhoneCallView calls={app.content.calls ?? []} contacts={app.content.contacts ?? []} />;
  }

  if (app.id === 'contacts') {
    return <ContactsView contacts={app.content.contacts ?? []} />;
  }

  if (app.id === 'plant-diary') {
    return (
      <PlantDiaryView
        password={app.content.password ?? ''}
        video={app.content.plantVideo ?? null}
        accessLogs={app.content.plantAccessLogs ?? []}
      />
    );
  }

  return (
    <div className="p-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400">APP</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{app.content.note ?? `${app.label} screen`}</p>
      </div>
    </div>
  );
}

function FilesView({ app }: { app: PhoneApp }) {
  const [openFile, setOpenFile] = useState<{ name: string; content: string } | null>(null);

  const sections = app.content.fileSections ?? app.content.sections ?? [];

  if (openFile) {
    return (
      <div className="flex min-h-full flex-col bg-slate-50">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 pb-3 pt-5">
          <button onClick={() => setOpenFile(null)} className="text-blue-500 text-sm">‹ 내 파일</button>
          <span className="flex-1 text-center text-sm font-medium text-slate-700 truncate pr-6">{openFile.name}</span>
        </div>
        <div className="flex-1 p-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-slate-800">{openFile.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {sections.map((section) => {
        const title = typeof section === 'string' ? section : section.title;
        const items = typeof section === 'string' ? [] : section.items;
        return (
          <section key={title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400">{title}</p>
            <div className="mt-3 space-y-2">
              {items.map((item) => {
                const name = typeof item === 'string' ? item : item.name;
                const content = typeof item === 'string' ? null : (item.content ?? null);
                return (
                  <div
                    key={name}
                    onClick={() => content && setOpenFile({ name, content })}
                    className={`flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 ${content ? 'cursor-pointer active:bg-slate-100' : ''}`}
                  >
                    <span className="text-sm text-slate-800">{name}</span>
                    <span className="font-mono text-[10px] tracking-[0.16em] text-slate-400">{content ? 'OPEN' : ''}</span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MessagesView({ threads }: { threads: PhoneThread[] }) {
  const [selectedThreadIndex, setSelectedThreadIndex] = useState<number | null>(null);
  const selectedThread = selectedThreadIndex === null ? null : threads[selectedThreadIndex] ?? null;

  if (selectedThread) {
    const messages = selectedThread.messages ?? [];

    return (
      <div className="flex h-full min-h-0 flex-col bg-[#f5f5f7]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={() => setSelectedThreadIndex(null)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
          >
            Back
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">{selectedThread.name}</p>
            <p className="text-[11px] text-slate-400">
              {selectedThread.platform === 'kakao' ? 'KakaoTalk' : selectedThread.platform === 'sms' ? 'SMS' : 'iMessage'}
            </p>
          </div>
          <span className="w-[52px] text-right font-mono text-[11px] text-slate-400">{selectedThread.time}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-3">
            {messages.map((message, idx) => {
              const prevMessage = idx > 0 ? messages[idx - 1] : null;
              const showDateSeparator = message.date && message.date !== prevMessage?.date;
              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="my-5 flex items-center gap-2">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[11px] text-slate-400">{message.date}</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                  )}
                  <div className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[78%] rounded-[1.35rem] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        message.sender === 'me'
                          ? 'rounded-br-md bg-[#0a84ff] text-white'
                          : 'rounded-bl-md bg-white text-slate-900'
                      }`}
                    >
                      <p>{message.text}</p>
                      {message.time && (
                        <p className={`mt-1 text-[10px] ${message.sender === 'me' ? 'text-white/70' : 'text-slate-400'}`}>
                          {message.time}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-3 pb-5 pt-3">
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-400">
              {selectedThread.platform === 'kakao' ? 'KakaoTalk' : selectedThread.platform === 'sms' ? 'SMS' : 'iMessage'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {threads.map((thread, index) => (
        <button
          key={`${thread.name}-${thread.time}`}
          type="button"
          onClick={() => setSelectedThreadIndex(index)}
          className="block w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">{thread.name}</p>
                {thread.unread && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{thread.preview}</p>
            </div>
            <span className="font-mono text-[11px] text-slate-400">{thread.time}</span>
          </div>
        </button>
      ))}
    </div>
  );
}


function GalleryView({ photos, deletedPhotos, protectedAlbums, phoneId }: { photos: PhonePhoto[]; deletedPhotos: PhonePhoto[]; protectedAlbums: PhoneProtectedAlbum[]; phoneId: string }) {
  const [selectedAlbum, setSelectedAlbum] = useState<'default' | 'deleted' | number | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [protectedInput, setProtectedInput] = useState('');
  const [protectedError, setProtectedError] = useState(false);
  const [unlockedAlbums, setUnlockedAlbums] = useState<Set<number>>(new Set());
  const [pendingProtectedIdx, setPendingProtectedIdx] = useState<number | null>(null);

  const galleryPhotos = photos.map((p, index) => ({
    title: p.title,
    stamp: p.stamp,
    src: `https://picsum.photos/seed/${phoneId}-gallery-${index + 1}/1200/1200`,
  }));

  const deletedPhotoList = deletedPhotos.map((p, index) => ({
    title: p.title,
    stamp: p.stamp,
    src: `https://picsum.photos/seed/${phoneId}-deleted-${index + 1}/1200/1200`,
  }));

  const visibleProtectedAlbums = protectedAlbums.filter((a) => a.photos.length > 0);

  const activePhotos =
    selectedAlbum === 'deleted'
      ? deletedPhotoList
      : typeof selectedAlbum === 'number'
        ? protectedAlbums[selectedAlbum].photos.map((p, index) => ({
            title: p.title,
            stamp: p.stamp,
            src: `https://picsum.photos/seed/${phoneId}-protected-${selectedAlbum}-${index + 1}/1200/1200`,
          }))
        : galleryPhotos;

  const albumTitle =
    selectedAlbum === 'deleted'
      ? '삭제된 사진'
      : typeof selectedAlbum === 'number'
        ? protectedAlbums[selectedAlbum].title
        : '기본 앨범';

  const selectedPhoto = selectedPhotoIndex === null ? null : activePhotos[selectedPhotoIndex];

  const BottomNav = (
    <div className="grid grid-cols-4 border-t border-white/10 bg-black/95 px-2 pb-7 pt-2 text-center">
      {['Library', 'For You', 'Albums', 'Search'].map((item, index) => (
        <div key={item} className={index === 2 ? 'text-[#0a84ff]' : 'text-white/42'}>
          <p className="text-[11px] font-medium">{item}</p>
        </div>
      ))}
    </div>
  );

  function handleProtectedAlbumClick(idx: number) {
    if (unlockedAlbums.has(idx)) {
      setSelectedAlbum(idx);
    } else {
      setPendingProtectedIdx(idx);
      setProtectedInput('');
      setProtectedError(false);
    }
  }

  function handlePasswordSubmit() {
    if (pendingProtectedIdx === null) return;
    if (protectedInput === protectedAlbums[pendingProtectedIdx].password) {
      setUnlockedAlbums((prev) => new Set(prev).add(pendingProtectedIdx));
      setSelectedAlbum(pendingProtectedIdx);
      setPendingProtectedIdx(null);
    } else {
      setProtectedError(true);
      setProtectedInput('');
    }
  }

  if (pendingProtectedIdx !== null) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-black">
        <div className="border-b border-white/8 px-4 pb-3 pt-4 relative">
          <button
            type="button"
            onClick={() => setPendingProtectedIdx(null)}
            className="absolute left-4 text-[#0a84ff] text-sm top-1/2 -translate-y-1/2"
          >
            ‹ 앨범
          </button>
          <p className="text-center text-[15px] font-semibold tracking-[-0.01em] text-white">보호된 앨범</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/70">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-white">{protectedAlbums[pendingProtectedIdx].title}</p>
          <p className="text-[13px] text-white/50 text-center">이 앨범은 비밀번호로 보호되어 있습니다</p>

          <div className="w-full">
            <input
              type="password"
              value={protectedInput}
              onChange={(e) => { setProtectedInput(e.target.value); setProtectedError(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="비밀번호 입력"
              className="w-full rounded-xl bg-neutral-800 px-4 py-3 text-center text-[15px] text-white placeholder-white/30 outline-none border border-white/10 focus:border-[#0a84ff]/60"
              maxLength={20}
            />
            {protectedError && (
              <p className="mt-2 text-center text-[13px] text-red-400">비밀번호가 올바르지 않습니다</p>
            )}
          </div>

          <button
            type="button"
            onClick={handlePasswordSubmit}
            className="w-full rounded-xl bg-[#0a84ff] py-3 text-[15px] font-semibold text-white"
          >
            확인
          </button>
        </div>

        {BottomNav}
      </div>
    );
  }

  if (selectedAlbum === null) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-black">
        <div className="border-b border-white/8 px-4 pb-3 pt-4">
          <p className="text-center text-[15px] font-semibold tracking-[-0.01em] text-white">앨범</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">내 앨범</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'default' as const, label: '기본 앨범', count: galleryPhotos.length, seed: `${phoneId}-gallery-1` },
              { id: 'deleted' as const, label: '삭제된 사진', count: deletedPhotoList.length, seed: `${phoneId}-deleted-1` },
            ].map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelectedAlbum(album.id)}
                className="text-left"
              >
                {album.count === 0 ? (
                  <div className="aspect-square w-full rounded-xl bg-neutral-800 flex flex-col gap-2 p-3">
                    <div className="h-2 w-3/4 rounded bg-neutral-700" />
                    <div className="flex-1 grid grid-cols-2 gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded bg-neutral-700/60" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="aspect-square w-full rounded-xl bg-neutral-800"
                    style={{ backgroundImage: `url(https://picsum.photos/seed/${album.seed}/400/400)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                )}
                <p className="mt-1.5 text-[13px] font-medium text-white">{album.label}</p>
                <p className="text-[12px] text-white/40">{album.count}</p>
              </button>
            ))}
          </div>

          {visibleProtectedAlbums.length > 0 && (
            <>
              <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-widest text-white/40">보호된 앨범</p>
              <div className="grid grid-cols-2 gap-3">
                {visibleProtectedAlbums.map((album, i) => {
                  const originalIdx = protectedAlbums.indexOf(album);
                  return (
                    <button
                      key={album.title}
                      type="button"
                      onClick={() => handleProtectedAlbumClick(originalIdx)}
                      className="text-left"
                    >
                      <div className="relative aspect-square w-full rounded-xl bg-neutral-800 overflow-hidden flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/50">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <p className="mt-1.5 text-[13px] font-medium text-white">{album.title}</p>
                      <p className="text-[12px] text-white/40">{album.photos.length}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {BottomNav}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-black">
      <div className="border-b border-white/8 px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => { setSelectedAlbum(null); setSelectedPhotoIndex(null); }}
          className="absolute left-4 text-[#0a84ff] text-sm"
        >
          ‹ 앨범
        </button>
        <p className="text-center text-[15px] font-semibold tracking-[-0.01em] text-white">{albumTitle}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-0 pb-0 pt-0">
        <div className="grid grid-cols-3 gap-0">
          {activePhotos.map((photo, index) => (
            <button
              key={`${photo.title}-${photo.stamp}-${index}`}
              type="button"
              onClick={() => setSelectedPhotoIndex(index)}
              className="relative aspect-square overflow-hidden bg-neutral-900"
              style={getPhotoTileStyle(index, photo.src)}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_28%,transparent_72%,rgba(0,0,0,0.22)_100%)]" />
              <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{ background: getPhotoTexture(index) }} />
            </button>
          ))}
        </div>
      </div>

      {BottomNav}

      {selectedPhoto && (
        <div className="absolute inset-0 z-20 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 pb-3 pt-12">
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="rounded-full border border-white/16 px-3 py-1.5 text-sm text-white/88"
            >
              뒤로
            </button>
            <p className="text-sm font-medium text-white/88">{selectedPhoto.stamp}</p>
            <span className="w-[52px]" />
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-0 pb-0">
            <img src={selectedPhoto.src} alt={selectedPhoto.title} className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function GmailView({ mails }: { mails: PhoneMail[] }) {
  const [selectedMailIndex, setSelectedMailIndex] = useState<number | null>(null);
  const selectedMail = selectedMailIndex === null ? null : mails[selectedMailIndex] ?? null;

  if (selectedMail) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={() => setSelectedMailIndex(null)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
          >
            뒤로
          </button>
          <p className="text-sm font-medium text-slate-500">{selectedMail.time}</p>
          <span className="w-[52px]" />
        </div>

        <article className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5">
          <p className="text-[22px] font-semibold leading-tight text-slate-950">{selectedMail.subject}</p>
          <div className="mt-4 rounded-3xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-900">{selectedMail.from}</p>
            <p className="mt-1 text-xs tracking-[0.08em] text-slate-500">to me</p>
          </div>

          <div className="mt-6 space-y-4 text-[15px] leading-7 text-slate-700">
            {(selectedMail.body ?? [selectedMail.snippet]).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {mails.map((mail, index) => (
        <button
          key={`${mail.from}-${mail.time}`}
          type="button"
          onClick={() => setSelectedMailIndex(index)}
          className="block w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">{mail.from}</p>
                {mail.unread && <span className="rounded-full bg-red-100 px-2 py-0.5 font-mono text-[10px] text-red-600">NEW</span>}
              </div>
              <p className="mt-2 text-sm font-medium text-slate-800">{mail.subject}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{mail.snippet}</p>
            </div>
            <span className="font-mono text-[11px] text-slate-400">{mail.time}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function VoiceMemosView({ app }: { app: PhoneApp }) {
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const memos = app.content.voiceMemos ?? [];
  const selectedMemo = memos.find((memo) => memo.id === selectedMemoId) ?? null;

  if (selectedMemo) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#121212] text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={() => setSelectedMemoId(null)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/86"
          >
            뒤로
          </button>
          <p className="text-sm font-medium text-white/56">{selectedMemo.recordedAt}</p>
          <span className="w-[52px]" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.24),_rgba(255,149,0,0.78)_55%,_rgba(145,77,0,0.96)_100%)] shadow-[0_22px_60px_rgba(255,149,0,0.25)]">
            <span className="font-mono text-sm tracking-[0.18em] text-white/92">REC</span>
          </div>

          <p className="mt-8 text-2xl font-semibold text-white">{selectedMemo.title}</p>
          <p className="mt-2 font-mono text-sm tracking-[0.14em] text-white/48">{selectedMemo.duration}</p>

          <div className="mt-8 w-full max-w-[320px] rounded-[2rem] border border-white/8 bg-white/[0.04] p-4">
            <audio controls preload="none" className="w-full">
              <source src={selectedMemo.src} type="audio/mpeg" />
            </audio>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#121212] px-4 pb-6 pt-4 text-white">
      <div className="mb-4">
        <p className="text-[28px] font-semibold tracking-[-0.02em] text-white">음성 메모</p>
        <p className="mt-1 text-sm text-white/46">{memos.length} recordings</p>
      </div>

      <div className="space-y-2">
        {memos.map((memo) => (
          <button
            key={memo.id}
            type="button"
            onClick={() => setSelectedMemoId(memo.id)}
            className="flex w-full items-center justify-between rounded-[1.6rem] border border-white/8 bg-white/[0.04] px-4 py-4 text-left"
          >
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-white">{memo.title}</p>
              <p className="mt-1 text-xs text-white/42">{memo.recordedAt}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm text-white/66">{memo.duration}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SafariView({ recentSearches }: { recentSearches: PhoneSafariSearch[] }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="min-h-full bg-[#f5f7f8]">
      <div className="border-b border-[#e6ebef] bg-white px-4 pb-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#00c73c]">NAVER</p>
            <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#111827]">네이버</p>
          </div>
          <div className="rounded-full bg-[#f2f4f6] px-3 py-1.5 text-xs font-medium text-slate-500">Guest</div>
        </div>

        <button
          type="button"
          onClick={() => setIsSearchFocused(true)}
          className="mt-4 flex w-full items-center gap-3 rounded-full border-[2px] border-[#03c75a] bg-white px-4 py-3 text-left shadow-[0_10px_30px_rgba(3,199,90,0.08)]"
        >
          <span className="text-lg font-black text-[#03c75a]">N</span>
          <span className="text-sm text-slate-400">검색어를 입력하세요.</span>
        </button>
      </div>

      <div className="space-y-3 px-4 py-4">
        <section className="rounded-[1.8rem] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">추천 콘텐츠</p>
            <span className="text-xs text-slate-400">광고 포함</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { title: '실시간 뉴스', subtitle: '오늘의 주요 이슈 정리', tone: 'from-[#d8fbe8] to-[#effff4]' },
              { title: '동네 맛집', subtitle: '가까운 인기 장소 보기', tone: 'from-[#eef5ff] to-[#f9fbff]' },
              { title: '증시 요약', subtitle: '국내외 시장 한눈에', tone: 'from-[#fff1d6] to-[#fffaf0]' },
              { title: '웹툰 추천', subtitle: '지금 많이 보는 작품', tone: 'from-[#f5ebff] to-[#fcf7ff]' },
            ].map((item) => (
              <article key={item.title} className={`rounded-[1.4rem] bg-gradient-to-br ${item.tone} p-4`}>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[1.8rem] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">급상승</p>
            <span className="text-xs text-slate-400">오전 10:30 기준</span>
          </div>
          <div className="mt-3 space-y-3">
            {['사건 현장', '서울 날씨', '중고 거래', '야구 경기', '택시 호출'].map((keyword, index) => (
              <div key={keyword} className="flex items-center gap-3">
                <span className="w-4 text-sm font-bold text-[#03c75a]">{index + 1}</span>
                <span className="text-sm text-slate-700">{keyword}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {isSearchFocused && (
        <div className="absolute inset-0 z-20 flex flex-col bg-white">
          <div className="border-b border-[#e6ebef] px-4 pb-4 pt-12">
            <div className="flex items-center gap-3 rounded-full border-[2px] border-[#03c75a] bg-white px-4 py-3">
              <span className="text-lg font-black text-[#03c75a]">N</span>
              <input
                autoFocus
                readOnly
                value=""
                placeholder="최근 검색어"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button type="button" onClick={() => setIsSearchFocused(false)} className="text-sm text-slate-500">
                취소
              </button>
            </div>
          </div>

          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">최근 검색어</p>
              <button type="button" className="text-xs text-slate-400">
                전체삭제
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {recentSearches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl bg-[#f6f8fa] px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">↻</span>
                    <span className="text-sm text-slate-800">{item.term}</span>
                  </div>
                  <span className="text-xs text-slate-400">{item.timestamp}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ days }: { days: PhoneCalendarDay[] }) {
  const TODAY = new Date(2026, 3, 13); // 2026-04-13
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth()); // 0-indexed

  const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const DOW_NAMES = ['일','월','화','수','목','금','토'];

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Build flat array of cells: leading blanks + day numbers
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  // Days that have events in the current view month (keyed by day number)
  const daysWithEvents = new Set(
    days
      .map(d => new Date(d.date))
      .filter(dt => dt.getFullYear() === viewYear && dt.getMonth() === viewMonth)
      .map(dt => dt.getDate())
  );

  // Only show schedule list entries that belong to the current view month
  const visibleDays = days.filter(d => {
    const dt = new Date(d.date);
    return dt.getFullYear() === viewYear && dt.getMonth() === viewMonth;
  });

  const isToday = (d: number | null) =>
    d !== null &&
    viewYear === TODAY.getFullYear() &&
    viewMonth === TODAY.getMonth() &&
    d === TODAY.getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="min-h-full bg-white">
      {/* Month header */}
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <div>
          <p className="text-[26px] font-bold tracking-[-0.02em] text-slate-950">{MONTH_NAMES[viewMonth]}</p>
          <p className="text-sm text-slate-500">{viewYear}</p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#007aff] hover:bg-slate-100 active:bg-slate-200"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#007aff] hover:bg-slate-100 active:bg-slate-200"
          >
            ›
          </button>
        </div>
      </div>

      {/* Mini calendar */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-7 gap-0">
          {DOW_NAMES.map((d, i) => (
            <div key={d} className={`flex h-9 items-center justify-center text-[13px] font-medium ${i === 0 ? 'text-red-400' : 'text-slate-400'}`}>{d}</div>
          ))}
          {rows.map((row, ri) =>
            row.map((day, ci) => {
              const hasEvent = day !== null && daysWithEvents.has(day);
              return (
                <div
                  key={`${ri}-${ci}`}
                  className={`relative flex flex-col h-10 items-center justify-start pt-1 text-[13px] ${ci === 0 && day ? 'text-red-400' : ''}`}
                >
                  {isToday(day) ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#007aff] text-[13px] font-semibold text-white">
                      {day}
                    </span>
                  ) : (
                    <span className={day ? 'text-slate-700' : ''}>{day ?? ''}</span>
                  )}
                  {hasEvent && (
                    <span className={`mt-0.5 h-1 w-1 rounded-full ${isToday(day) ? 'bg-[#007aff]' : ci === 0 ? 'bg-red-400' : 'bg-slate-400'}`} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="h-px bg-slate-200" />

      {/* Day schedule list */}
      <div className="px-4 pb-8 pt-3">
        {visibleDays.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-6">일정 없음</p>
        )}
        {visibleDays.map((dayData) => {
          const dt = new Date(dayData.date);
          const label = `${dt.getMonth() + 1}월 ${dt.getDate()}일`;
          return (
          <div key={dayData.date} className="mb-5">
            <div className="mb-3 flex items-baseline gap-2">
              <p className="text-[15px] font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-400">({dayData.dayOfWeek})</p>
            </div>

            <div className="space-y-2">
              {dayData.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{event.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {event.time}
                      {event.endTime ? ` – ${event.endTime}` : ''}
                    </p>
                    {event.location && (
                      <p className="mt-1 text-xs text-slate-400">{event.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function MapsView({ searches }: { searches: PhoneMapSearch[] }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="relative min-h-full bg-[#f0ede6]">
      {/* Search bar */}
      <div className="px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => setIsSearchFocused(true)}
          className="flex w-full items-center gap-3 rounded-full bg-white px-4 py-3 text-left shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
        >
          <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm text-slate-400">Google 지도에서 검색</span>
        </button>
      </div>

      {/* Fake map area */}
      <div className="relative mx-4 h-[380px] overflow-hidden rounded-2xl bg-[#e8e4dd] shadow-inner">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute h-px w-full bg-slate-400/30" style={{ top: `${(i + 1) * 8}%` }} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-slate-400/30" style={{ left: `${(i + 1) * 12}%` }} />
          ))}
        </div>

        {/* Road-like lines */}
        <div className="absolute left-[20%] top-0 h-full w-[3px] bg-white/70" />
        <div className="absolute left-[55%] top-0 h-full w-[3px] bg-white/70" />
        <div className="absolute left-0 top-[35%] h-[3px] w-full bg-white/70" />
        <div className="absolute left-0 top-[68%] h-[3px] w-full bg-white/70" />
        <div className="absolute left-[36%] top-[20%] h-[60%] w-[2px] rotate-[25deg] bg-white/50" />

        {/* Blocks */}
        <div className="absolute left-[22%] top-[37%] h-[29%] w-[31%] rounded-sm bg-[#d8d4cc]" />
        <div className="absolute left-[57%] top-[5%] h-[28%] w-[35%] rounded-sm bg-[#d8d4cc]" />
        <div className="absolute left-[5%] top-[5%] h-[28%] w-[13%] rounded-sm bg-[#c8e6c9]" />
        <div className="absolute left-[57%] top-[70%] h-[24%] w-[38%] rounded-sm bg-[#d8d4cc]" />

        {/* Pin marker */}
        <div className="absolute left-[48%] top-[42%] flex flex-col items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-lg">
            <div className="h-2.5 w-2.5 rounded-full bg-white" />
          </div>
          <div className="h-2 w-2 -translate-y-0.5 rotate-45 bg-red-500" />
        </div>

        {/* Blue dot (current location) */}
        <div className="absolute left-[30%] top-[58%]">
          <div className="h-4 w-4 rounded-full border-[3px] border-white bg-[#4285f4] shadow-[0_0_8px_rgba(66,133,244,0.5)]" />
        </div>

        {/* Labels */}
        <div className="absolute left-[58%] top-[38%] rounded bg-white/80 px-1.5 py-0.5">
          <p className="text-[9px] font-medium text-slate-700">성수동</p>
        </div>
        <div className="absolute left-[6%] top-[72%] rounded bg-white/80 px-1.5 py-0.5">
          <p className="text-[9px] font-medium text-slate-700">강남구</p>
        </div>
      </div>

      {/* Bottom info */}
      <div className="px-4 pb-6 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400">최근 방문</p>
          {searches.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-semibold text-slate-900">{searches[0].name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{searches[0].address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Search overlay */}
      {isSearchFocused && (
        <div className="absolute inset-0 z-20 flex flex-col bg-white">
          <div className="border-b border-slate-200 px-4 pb-4 pt-12">
            <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-[#4285f4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                readOnly
                value=""
                placeholder="장소, 주소 검색"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button type="button" onClick={() => setIsSearchFocused(false)} className="shrink-0 text-sm font-medium text-[#4285f4]">
                취소
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">최근 검색</p>
              <button type="button" className="text-xs text-[#4285f4]">모두 지우기</button>
            </div>

            <div className="mt-3 space-y-1">
              {searches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{item.address}</p>
                  </div>
                  <span className="mt-1 shrink-0 text-[11px] text-slate-400">{item.timestamp}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotesView({ notes, fallback }: { notes: PhoneNote[]; fallback?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = notes.find((n) => n.id === selectedId) ?? null;

  if (notes.length === 0) {
    return (
      <div className="p-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400">NOTES</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{fallback ?? '메모 없음'}</p>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="flex h-full flex-col bg-[#faf9f5]">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-[#faf9f5] px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
          >
            메모
          </button>
          <p className="flex-1 truncate text-center text-sm font-semibold text-slate-900">{selected.title}</p>
          <span className="w-16" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-slate-400">{selected.updatedAt}</p>
          <h2 className="mb-3 text-xl font-bold text-slate-900">{selected.title}</h2>
          {Array.isArray(selected.body)
            ? selected.body.map((para, i) => (
                <p key={i} className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{para}</p>
              ))
            : <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{selected.body}</p>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f5] p-4">
      <p className="mb-3 px-1 font-mono text-[11px] tracking-[0.2em] text-slate-400">메모</p>
      <div className="space-y-2">
        {notes.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => setSelectedId(note.id)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-900">{note.title}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-400">{note.updatedAt}</span>
              <span className="truncate text-[11px] text-slate-500">{(() => { const t = Array.isArray(note.body) ? note.body[0] ?? '' : note.body; return t.slice(0, 40) + (t.length > 40 ? '…' : ''); })()}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ContactsView({ contacts }: { contacts: PhoneContact[] }) {
  const [selected, setSelected] = useState<PhoneContact | null>(null);

  if (selected) {
    return (
      <div className="bg-white min-h-full">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1 px-5 pt-5 pb-3 text-blue-500 text-sm"
        >
          ‹ 연락처
        </button>
        <div className="flex flex-col items-center gap-2 py-6 border-b border-slate-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200">
            <span className="text-3xl text-slate-400">👤</span>
          </div>
          <p className="text-xl font-semibold text-slate-900">{selected.name}</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-white">
              <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">{selected.label ?? '전화'}</p>
              <p className="mt-0.5 text-sm text-blue-500">{selected.number}</p>
            </div>
          </div>
          {selected.memo && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-white">
                <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">메모</p>
                <p className="mt-0.5 text-sm text-slate-900">{selected.memo}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full">
      <p className="px-5 pb-2 pt-5 font-mono text-[11px] tracking-[0.2em] text-slate-400">연락처</p>
      {contacts.length === 0 ? (
        <p className="px-5 text-sm text-slate-400">연락처 없음</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              className="flex w-full items-center gap-4 px-5 py-3.5 text-left"
              onClick={() => setSelected(contact)}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <span className="text-[15px] text-slate-500">👤</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-400">{contact.number}</p>
              </div>
              <span className="text-slate-300 text-sm">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhoneCallView({ calls, contacts }: { calls: PhoneCall[]; contacts: PhoneContact[] }) {
  return (
    <div className="bg-white">
      {calls.length > 0 && (
        <>
          <p className="px-5 pb-2 pt-5 font-mono text-[11px] tracking-[0.2em] text-slate-400">최근 통화</p>
          <div className="divide-y divide-slate-100">
            {calls.map((call) => (
              <div key={call.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-[15px] text-slate-500">👤</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${call.type === 'missed' ? 'text-red-500' : 'text-slate-900'}`}>
                    {call.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                    {call.type === 'missed' ? '부재중' : call.type === 'incoming' ? '수신' : '발신'}
                    {call.date ? ` · ${call.date}` : ''}
                    {call.duration ? ` · ${call.duration}` : ''}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-slate-400">{call.time}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {contacts.length > 0 && (
        <>
          <p className="px-5 pb-2 pt-5 font-mono text-[11px] tracking-[0.2em] text-slate-400">연락처</p>
          <div className="divide-y divide-slate-100">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-[15px] text-slate-500">👤</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                    {contact.number}{contact.label ? ` · ${contact.label}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {calls.length === 0 && contacts.length === 0 && (
        <div className="p-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-[11px] tracking-[0.18em] text-slate-400">최근 통화</p>
            <p className="mt-3 text-sm text-slate-400">통화 기록 없음</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getWallpaperClass(wallpaper: string) {
  if (wallpaper === 'deep-blue-noise') {
    return 'bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.24),_transparent_36%),linear-gradient(180deg,_#0f172a_0%,_#172554_44%,_#111827_100%)]';
  }

  return 'bg-[radial-gradient(circle_at_top,_rgba(255,230,185,0.28),_transparent_34%),linear-gradient(180deg,_#53453f_0%,_#8a7667_34%,_#171717_100%)]';
}

function PlantDiaryView({ password, video, accessLogs }: { password: string; video: PhonePlantVideo | null; accessLogs: PhonePlantAccessLog[] }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  function handleKey(key: string) {
    if (key === '←') {
      setInput((prev) => prev.slice(0, -1));
      setError(false);
      return;
    }
    const next = input + key;
    if (next.length > 4) return;
    setInput(next);
    if (next.length === 4) {
      if (next === password) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => { setInput(''); setError(false); }, 600);
      }
    }
  }

  if (unlocked) {
    return (
      <div className="min-h-full bg-[#f4faf5] p-5 space-y-5">
        <div className="rounded-2xl bg-white border border-green-100 shadow-sm overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
            <span className="text-base">🎬</span>
            <p className="text-[12px] font-semibold tracking-widest text-green-700 uppercase">영상</p>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-green-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4caf76" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" fill="#4caf76" stroke="none" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-slate-800 truncate">{video?.title ?? ''}</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{video?.duration ?? ''}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-green-100 shadow-sm overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
            <span className="text-base">🔐</span>
            <p className="text-[12px] font-semibold tracking-widest text-green-700 uppercase">최근 접속 기록</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {accessLogs.map((log, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center bg-green-100">
                    {log.device === 'YN-Macbook' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4caf76" strokeWidth="2.2">
                        <rect x="2" y="4" width="20" height="14" rx="2" />
                        <path d="M2 20h20" />
                      </svg>
                    ) : (
                      <svg width="12" height="14" viewBox="0 0 24 28" fill="none" stroke="#4caf76" strokeWidth="2.2">
                        <rect x="4" y="1" width="16" height="22" rx="3" />
                        <circle cx="12" cy="19" r="1.5" fill="#4caf76" stroke="none" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-slate-700">{log.device}</p>
                </div>
                <p className="text-[11px] text-slate-400 text-right flex-shrink-0">{log.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-between bg-[#f4faf5] pb-8 pt-10">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-md shadow-green-200/60 border border-green-100">
          <svg width="44" height="44" viewBox="0 0 36 36" fill="none">
            <ellipse cx="18" cy="29" rx="7" ry="3.5" fill="#A0693A" fillOpacity="0.5" />
            <rect x="14" y="23" width="8" height="6" rx="2" fill="#A0693A" />
            <path d="M18 23 C18 17, 12 15, 10 10 C13 11, 16 14, 18 18 C18 12, 23 8, 26 6 C24 11, 20 15, 18 19" fill="#3da85a" />
            <circle cx="18" cy="9" r="3.5" fill="#5ecb7a" />
            <circle cx="12" cy="14" r="3" fill="#4bbf6b" />
            <circle cx="24" cy="12" r="3" fill="#4bbf6b" />
          </svg>
        </div>
        <p className="text-[18px] font-bold text-green-900">식물 기록</p>
        <p className="text-[13px] text-green-600/70">비밀번호를 입력해 주세요</p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full px-8">
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-150 ${
                error
                  ? 'border-red-400 bg-red-400'
                  : input.length > i
                    ? 'border-green-500 bg-green-500'
                    : 'border-green-300 bg-transparent'
              }`}
            />
          ))}
        </div>
        {error && <p className="text-[12px] text-red-400 -mt-4">비밀번호가 틀렸어요</p>}

        <div className="grid grid-cols-3 gap-3 w-full">
          {['1','2','3','4','5','6','7','8','9','','0','←'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => key !== '' && handleKey(key)}
              disabled={key === ''}
              className={`h-14 rounded-2xl text-[20px] font-semibold transition-all active:scale-95 ${
                key === '' ? 'invisible' :
                key === '←'
                  ? 'bg-green-100 text-green-700 text-base'
                  : 'bg-white text-green-900 shadow-sm shadow-green-100 border border-green-100 hover:bg-green-50'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getPhotoTileStyle(index: number, src: string) {
  return {
    backgroundImage: `url("${src}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    filter: index % 4 === 0 ? 'saturate(0.92) contrast(1.02)' : 'none',
  };
}

function getPhotoTexture(index: number) {
  const textures = [
    'radial-gradient(circle at 22% 18%, rgba(255,255,255,0.26), transparent 20%), radial-gradient(circle at 78% 72%, rgba(0,0,0,0.28), transparent 28%)',
    'radial-gradient(circle at 72% 24%, rgba(255,255,255,0.2), transparent 18%), linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.28) 100%)',
    'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.16), transparent 22%), radial-gradient(circle at 78% 26%, rgba(0,0,0,0.24), transparent 24%)',
    'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 36%, rgba(0,0,0,0.18) 100%)',
  ];

  return textures[index % textures.length];
}


