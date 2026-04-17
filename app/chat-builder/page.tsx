/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState, useEffect } from 'react';

const STORAGE_KEY = 'chat-builder-messages';
const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_FULL_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

type ChatTheme = 'imessage' | 'kakao';

interface Participant {
  id: string;
  name: string;
  photo?: string;
}

interface Message {
  id: string;
  text: string;
  role: 'sender' | 'receiver';  // iMessage
  senderId: string;              // KakaoTalk: 'me' | participant.id
  timestamp: string;
  readers: string[];             // KakaoTalk: participant IDs who have read this
  type?: 'chat' | 'system' | 'notification';
}

// ── Formatters ────────────────────────────────────────────────────────────────

function formatAppleTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_KO[d.getDay()]}) ${ampm} ${hour}:${m}`;
}

function formatKakaoTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${hour}:${m}`;
}

function formatKakaoDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAY_FULL_KO[d.getDay()]}`;
}

function toDateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── Shared phone chrome ───────────────────────────────────────────────────────

function BatteryIcon({ dark, level }: { dark: boolean; level: number }) {
  const clampedLevel = Math.max(0, Math.min(100, Math.round(level)));
  const stroke = dark ? '#ffffff' : '#000000';
  const fill = dark ? '#ffffff' : '#000000';
  const fillText = dark ? '#000000' : '#ffffff';
  const emptyText = dark ? '#ffffff' : '#000000';
  const interiorWidth = 19;
  const fillWidth = clampedLevel === 0 ? 0 : Math.max(2.4, (interiorWidth * clampedLevel) / 100);
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
      <defs>
        <clipPath id="battery-body-clip">
          <rect x="1.5" y="1.5" width="21" height="10" rx="2.5" />
        </clipPath>
        <clipPath id="battery-fill-clip">
          <rect x="2" y="2" width={fillWidth} height="9" rx="2" />
        </clipPath>
      </defs>
      <rect x="0.5" y="0.5" width="23" height="12" rx="3" stroke={stroke} strokeOpacity="0.56" />
      <g clipPath="url(#battery-body-clip)">
        <rect x="2" y="2" width={fillWidth} height="9" rx="2" fill={fill} />
      </g>
      <text
        x="11.5"
        y="6.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
        fontSize="7"
        fontWeight="700"
        fill={emptyText}
      >
        {clampedLevel}
      </text>
      <g clipPath="url(#battery-fill-clip)">
        <text
          x="11.5"
          y="6.5"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
          fontSize="7"
          fontWeight="700"
          fill={fillText}
        >
          {clampedLevel}
        </text>
      </g>
      <path d="M24 4.15C24 3.95 24.16 3.8 24.36 3.8H24.95C25.89 3.8 26.65 4.56 26.65 5.5V7.5C26.65 8.44 25.89 9.2 24.95 9.2H24.36C24.16 9.2 24 9.05 24 8.85V4.15Z" fill={stroke} fillOpacity="0.4" />
    </svg>
  );
}

function SignalBars({ dark }: { dark: boolean }) {
  return (
    <div className="flex items-end gap-[2px]">
      {[4, 6, 8, 10].map((h, i) => (
        <div key={i} className={`w-[3px] rounded-[1px] ${dark ? 'bg-white' : 'bg-black'}`} style={{ height: h }} />
      ))}
    </div>
  );
}

// ── Avatar helper ─────────────────────────────────────────────────────────────

function Avatar({ participant, size = 32, showPhoto = true }: { participant: Participant; size?: number; showPhoto?: boolean }) {
  if (showPhoto && participant.photo) {
    return <img src={participant.photo} alt={participant.name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-[#aaa] font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {participant.name[0] ?? '?'}
    </div>
  );
}

// ── iMessage chat ─────────────────────────────────────────────────────────────

interface IMessageChatProps {
  messages: Message[];
  isDark: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  profileImage?: string;
  contactName: string;
}

function IMessageChat({ messages, isDark, scrollRef }: IMessageChatProps) {
  const chatBg = isDark ? '#000' : '#f2f2f7';
  const timeColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const receiverBubble = isDark ? '#3a3a3c' : '#e5e5ea';

  function shouldShowTime(i: number) {
    if (i === 0) return true;
    return formatAppleTime(messages[i - 1].timestamp) !== formatAppleTime(messages[i].timestamp);
  }

  return (
    <div ref={scrollRef} className="chat-builder-scroll absolute inset-0 overflow-y-auto pb-[68px] pt-[98px]" style={{ background: chatBg }}>
      {messages.length === 0 && (
        <p className="mt-24 text-center text-[12px]" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontFamily: '-apple-system,sans-serif' }}>
          메시지를 입력하세요
        </p>
      )}
      <div className="flex flex-col gap-[2px] px-3 pt-1">
        {messages.map((msg, i) => {
          const isSender = msg.role === 'sender';
          const showTime = shouldShowTime(i);
          const nextShowTime = i < messages.length - 1 ? shouldShowTime(i + 1) : false;
          const isFirst = showTime || (i > 0 ? messages[i - 1].role !== msg.role : true);
          const isLast  = nextShowTime || (i < messages.length - 1 ? messages[i + 1].role !== msg.role : true);
          const tl = isSender ? 16 : (isFirst ? 16 : 4);
          const tr = isSender ? (isFirst ? 16 : 4) : 16;
          const br = isSender ? (isLast  ? 4  : 16) : 16;
          const bl = isSender ? 16 : (isLast  ? 4  : 16);
          return (
            <div key={msg.id}>
              {showTime && (
                <p className="my-3 text-center text-[10px]" style={{ color: timeColor, fontFamily: '-apple-system,sans-serif' }}>
                  {formatAppleTime(msg.timestamp)}
                </p>
              )}
              <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} ${isFirst && !showTime ? 'mt-2' : ''}`}>
                <div
                  className="max-w-[75%] px-[12px] py-[7px] text-[14px] leading-[1.4]"
                  style={{ borderRadius: `${tl}px ${tr}px ${br}px ${bl}px`, fontFamily: '-apple-system,sans-serif', wordBreak: 'break-word', background: isSender ? '#2b7fff' : receiverBubble, color: isSender ? '#fff' : (isDark ? '#fff' : '#000') }}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        .chat-builder-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }

        .chat-builder-scroll::-webkit-scrollbar {
          width: 2px;
          height: 2px;
          background: transparent;
        }

        .chat-builder-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-builder-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 999px;
        }

        .chat-builder-scroll.is-scrolling {
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 120, 128, 0.34) transparent;
        }

        .chat-builder-scroll.is-scrolling::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 128, 0.34);
        }
      `}</style>
    </div>
  );
}

// ── KakaoTalk chat ────────────────────────────────────────────────────────────

interface KakaoChatProps {
  messages: Message[];
  isDark: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  participants: Participant[];
  noticeText: string;
}

function KakaoChat({ messages, isDark, scrollRef, participants, noticeText }: KakaoChatProps) {
  const chatBg         = isDark ? '#1a1a1a' : '#BACEE0';
  const sentBubble     = '#fee500';
  const receivedBubble = isDark ? '#2c2c2c' : '#fff';
  const receivedText   = isDark ? '#fff' : '#000';
  const timeColor      = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const datePill       = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.18)';
  const nameColor      = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const unreadColor    = '#f7c300';
  const systemBg       = isDark ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.16)';
  const systemText     = 'rgba(255,255,255,0.96)';

  const participantMap = new Map(participants.map((p) => [p.id, p]));
  const showParticipantName = participants.length > 1;

  function shouldShowDate(i: number) {
    if (i === 0) return true;
    return toDateKey(messages[i - 1].timestamp) !== toDateKey(messages[i].timestamp);
  }
  function isFirstInGroup(i: number) {
    if (shouldShowDate(i)) return true;
    if (i === 0) return true;
    if (messages[i].type === 'system' || messages[i].type === 'notification' || messages[i - 1].type === 'system' || messages[i - 1].type === 'notification') return true;
    return messages[i - 1].senderId !== messages[i].senderId;
  }
  function isLastInGroup(i: number) {
    if (i === messages.length - 1) return true;
    if (shouldShowDate(i + 1)) return true;
    if (messages[i].type === 'system' || messages[i].type === 'notification' || messages[i + 1].type === 'system' || messages[i + 1].type === 'notification') return true;
    return messages[i].senderId !== messages[i + 1].senderId;
  }

  return (
    <div ref={scrollRef} className="chat-builder-scroll absolute bottom-0 left-0 right-0 overflow-y-auto pb-[60px]" style={{ top: noticeText ? 129 : 97, background: chatBg }}>
      {messages.length === 0 && (
        <p className="mt-24 text-center text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>메시지를 입력하세요!</p>
      )}
      <div className="flex flex-col gap-[1px] px-3 pt-2">
        {messages.map((msg, i) => {
          const isNotification = msg.type === 'system' || msg.type === 'notification';
          const isMe = msg.senderId === 'me';
          const participant = isMe ? null : participantMap.get(msg.senderId);
          const showDate    = shouldShowDate(i);
          const firstGroup  = isFirstInGroup(i);
          const lastGroup   = isLastInGroup(i);
          const showTime    = lastGroup;
          const allChatIds  = ['me', ...participants.map((p) => p.id)];
          const potentialReaders = allChatIds.filter((id) => id !== msg.senderId && id !== 'me');
          const unreadCount = potentialReaders.filter((id) => !(msg.readers ?? []).includes(id)).length;
          const showUnread  = unreadCount > 0;
          const showSideInfo = showTime || showUnread;

          const sideInfo = (
            <div className="flex shrink-0 flex-col items-end justify-end pb-[2px]" style={{ gap: 1 }}>
              {showUnread && <span className="text-[10px] font-semibold leading-none" style={{ color: unreadColor }}>{unreadCount}</span>}
              {showTime && <span className="text-[9px] leading-none" style={{ color: timeColor, fontFamily: 'sans-serif' }}>{formatKakaoTime(msg.timestamp)}</span>}
            </div>
          );

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full px-3 py-1 text-[10px] text-white" style={{ background: datePill, fontFamily: 'sans-serif' }}>
                    {formatKakaoDate(msg.timestamp)}
                  </span>
                </div>
              )}

              {isNotification ? (
                <div className={`${showDate ? 'mt-0' : 'mt-2'} flex justify-center`}>
                  <span
                    className="max-w-[84%] rounded-[14px] px-3 py-[5px] text-center text-[11px] font-medium leading-[1.45]"
                    style={{ background: systemBg, color: systemText, wordBreak: 'break-word', fontFamily: 'sans-serif' }}
                  >
                    {msg.text}
                  </span>
                </div>
              ) : isMe ? (
                /* ── Sent by me ── */
                <div className={`flex items-end justify-end gap-1 ${firstGroup && !showDate ? 'mt-2' : 'mt-[2px]'}`}>
                  {showSideInfo && sideInfo}
                  <div
                    className="max-w-[78%] rounded-[12px] px-[10px] py-[7px] text-[13px] leading-[1.45]"
                    style={{ background: sentBubble, color: '#000', wordBreak: 'break-word', fontFamily: 'sans-serif' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ) : (
                /* ── Received ── */
                <div className={`flex items-start gap-1.5 ${firstGroup && !showDate ? 'mt-2' : 'mt-[2px]'}`}>
                  {/* Avatar column */}
                  <div className="w-[34px] shrink-0 pt-[1px]">
                    {firstGroup && participant && <Avatar participant={participant} size={34} />}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    {firstGroup && participant && showParticipantName && (
                      <span className="mb-0.5 text-[11px] font-semibold" style={{ color: nameColor, fontFamily: 'sans-serif' }}>
                        {participant.name}
                      </span>
                    )}
                    <div className="flex items-end gap-1">
                      <div
                        className="max-w-[78%] rounded-[12px] px-[10px] py-[7px] text-[13px] leading-[1.45]"
                        style={{ background: receivedBubble, color: receivedText, wordBreak: 'break-word', fontFamily: 'sans-serif' }}
                      >
                        {msg.text}
                      </div>
                      {showSideInfo && (
                        <div className="flex shrink-0 flex-col items-start justify-end pb-[2px]" style={{ gap: 1 }}>
                          {showUnread && <span className="text-[10px] font-semibold leading-none" style={{ color: unreadColor }}>{unreadCount}</span>}
                          {showTime && <span className="text-[9px] leading-none" style={{ color: timeColor, fontFamily: 'sans-serif' }}>{formatKakaoTime(msg.timestamp)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Participant editor ────────────────────────────────────────────────────────

function ParticipantRow({
  p, isDark, onNameChange, onPhotoChange, onRemove, canRemove,
}: {
  p: Participant; isDark: boolean;
  onNameChange: (name: string) => void;
  onPhotoChange: (photo: string | undefined) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const label = isDark ? 'text-white/40' : 'text-black/40';
  const inputCls = `rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-[#2b7fff]/50 ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-black/10 bg-white text-black'}`;
  return (
    <div className={`flex items-center gap-2 rounded-xl border ${isDark ? 'border-white/8 bg-white/3' : 'border-black/8 bg-black/3'}`}>
      <button type="button" onClick={() => fileRef.current?.click()} className="shrink-0">
        {p.photo
          ? <img src={p.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
          : <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isDark ? 'bg-white/15 text-white/60' : 'bg-black/10 text-black/50'}`}>{p.name[0] ?? '?'}</div>
        }
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0]; if (!f) return;
        const r = new FileReader(); r.onload = (ev) => onPhotoChange(ev.target?.result as string); r.readAsDataURL(f);
      }} />
      <input type="text" value={p.name} onChange={(e) => onNameChange(e.target.value)} className={`flex-1 ${inputCls}`} placeholder="이름" />
      {canRemove && (
        <button type="button" onClick={onRemove} className={`text-xs ${label} hover:text-red-400`}>✕</button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChatBuilderPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [timestamp, setTimestamp] = useState(() => toDatetimeLocal(new Date().toISOString()));
  const [isDark, setIsDark] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [chatTheme, setChatTheme] = useState<ChatTheme>('imessage');
  const [kakaoInputType, setKakaoInputType] = useState<'chat' | 'system'>('chat');

  // iMessage contact
  const [contactName, setContactName] = useState('상대방');
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [role, setRole] = useState<'sender' | 'receiver'>('sender');
  const iProfileRef = useRef<HTMLInputElement>(null);

  // KakaoTalk
  const [participants, setParticipants] = useState<Participant[]>([{ id: 'p1', name: '상대방' }]);
  const [selectedSenderId, setSelectedSenderId] = useState<string>('me');
  const [pendingReaders, setPendingReaders] = useState<Set<string>>(new Set());
  const [kakaoNotice, setKakaoNotice] = useState('');
  const [kakaoNoticeInput, setKakaoNoticeInput] = useState('');

  const phoneRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setMessages(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    setTimeout(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, 50);
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      el.classList.add('is-scrolling');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('is-scrolling'), 520);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (timer) clearTimeout(timer);
      el.classList.remove('is-scrolling');
    };
  }, [chatTheme, kakaoNotice]);

  function handleSend() {
    const text = input.trim(); if (!text) return;
    const iso = new Date(timestamp).toISOString();
    const isKakao = chatTheme === 'kakao';

    if (isKakao) {
      setMessages((prev) => [...prev, {
        id: `${Date.now()}`,
        text,
        role: kakaoInputType === 'system' ? 'receiver' : (selectedSenderId === 'me' ? 'sender' : 'receiver'),
        senderId: kakaoInputType === 'system' ? 'system' : selectedSenderId,
        timestamp: iso,
        readers: kakaoInputType === 'system' ? [] : Array.from(pendingReaders),
        type: kakaoInputType,
      }]);
    } else {
      setMessages((prev) => [...prev, { id: `${Date.now()}`, text, role, senderId: role === 'sender' ? 'me' : 'other', timestamp: iso, readers: [], type: 'chat' }]);
    }
    setInput('');
  }

  function handleClear() {
    setMessages([]);
    setKakaoNotice('');
    setKakaoNoticeInput('');
  }

  async function handleSavePng() {
    if (!phoneRef.current) return;
    const { toPng } = await import('html-to-image');
    const scale = Math.max(window.devicePixelRatio || 1, 4);
    const dataUrl = await toPng(phoneRef.current, { cacheBust: true, pixelRatio: scale });
    const src = await new Promise<HTMLImageElement>((res) => { const img = new Image(); img.onload = () => res(img); img.src = dataUrl; });
    const { offsetWidth: w, offsetHeight: h } = phoneRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale; canvas.height = h * scale;
    const ctx = canvas.getContext('2d')!;
    const r = 48 * scale, cw = canvas.width, ch = canvas.height;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(cw - r, 0); ctx.quadraticCurveTo(cw, 0, cw, r);
    ctx.lineTo(cw, ch - r); ctx.quadraticCurveTo(cw, ch, cw - r, ch);
    ctx.lineTo(r, ch); ctx.quadraticCurveTo(0, ch, 0, ch - r);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath(); ctx.clip(); ctx.drawImage(src, 0, 0, cw, ch);
    const link = document.createElement('a'); link.download = `chat-${Date.now()}.png`; link.href = canvas.toDataURL('image/png'); link.click();
  }

  function addParticipant() {
    if (participants.length >= 4) return;
    const id = `p${Date.now()}`;
    setParticipants((prev) => [...prev, { id, name: `참여자${prev.length + 1}` }]);
  }

  function updateParticipant(id: string, patch: Partial<Participant>) {
    setParticipants((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  }

  function removeParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    if (selectedSenderId === id) setSelectedSenderId('me');
  }

  const isKakao = chatTheme === 'kakao';
  const phoneHeaderBg     = isKakao ? (isDark ? 'rgba(30,30,30,0.95)' : 'rgba(247,247,247,0.95)') : (isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)');
  const phoneHeaderBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const statusColor       = isDark ? 'text-white' : 'text-black';

  const ctrl = {
    pageBg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#f0f0f5]',
    cardBg: isDark ? 'bg-white/5' : 'bg-black/5',
    cardBorder: isDark ? 'border-white/10' : 'border-black/10',
    label: isDark ? 'text-white/40' : 'text-black/40',
    inputBg: isDark ? 'bg-white/5' : 'bg-white',
    inputBorder: isDark ? 'border-white/10' : 'border-black/10',
    inputText: isDark ? 'text-white' : 'text-black',
    btnMuted: isDark ? 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80' : 'border-black/10 bg-black/5 text-black/40 hover:border-black/20 hover:text-black/70',
    activeRadio: 'border-[#2b7fff] bg-[#2b7fff]/15 text-[#2b7fff]',
    inactiveRadio: isDark ? 'border-white/10 bg-white/5 text-white/50 hover:border-white/20' : 'border-black/10 bg-black/5 text-black/40 hover:border-black/20',
    colorScheme: isDark ? '[color-scheme:dark]' : '[color-scheme:light]',
    checkBg: isDark ? 'bg-white/5 border-white/15' : 'bg-white border-black/15',
  };

  // Potential readers for current sender (KakaoTalk)
  const allIds = ['me', ...participants.map((p) => p.id)];
  const potentialReaders = allIds.filter((id) => id !== selectedSenderId && id !== 'me');

  return (
    <div className={`fixed inset-0 z-[9999] overflow-auto transition-colors duration-200 ${ctrl.pageBg}`}>
      <div className="mx-auto flex min-h-full w-full flex-col items-center justify-center gap-8 px-4 py-10 md:min-w-max md:flex-row md:items-center md:justify-center">
        {/* ── iPhone mockup ── */}
        <div
          ref={phoneRef}
          className={`relative h-[780px] w-[360px] shrink-0 overflow-hidden rounded-[1rem] border ${isDark ? 'border-white/10' : 'border-black/10'}`}
          style={{ background: isKakao ? (isDark ? '#1a1a1a' : '#BACEE0') : (isDark ? '#000' : '#f2f2f7') }}
        >
          {/* mockup용 camera area
          <div className="pointer-events-none absolute left-1/2 top-[14px] z-30 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-black" /> */}

          {/* Status bar */}
          <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[50px] items-center justify-between px-7 pt-[16px] ${statusColor}`}>
            <span className="text-[13px] font-semibold" style={{ fontFamily: '-apple-system,sans-serif' }}>9:41</span>
            <div className="flex items-center gap-[5px]">
              <SignalBars dark={isDark} />
              <span className="text-[11px] font-semibold" style={{ fontFamily: '-apple-system,sans-serif' }}>LTE</span>
              <BatteryIcon dark={isDark} level={batteryLevel} />
            </div>
          </div>

          {/* Nav header */}
          {isKakao ? (
            <div className="absolute inset-x-0 top-[50px] z-10 flex items-center justify-between px-4 py-2.5 backdrop-blur-xl" style={{ background: phoneHeaderBg, borderBottom: `0.5px solid ${phoneHeaderBorder}` }}>
              <button type="button" className={`flex w-[60px] items-center gap-1 ${isDark ? 'text-white' : 'text-black'}`}>
                <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M7.5 1L1 7L7.5 13" stroke={isDark ? 'white' : 'black'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="text-[13px]" style={{ fontFamily: 'sans-serif' }}>{participants.length + 1}</span>
              </button>
              <div className="flex flex-col items-center">
                <span className="mt-0.5 text-[13px] font-bold" style={{ fontFamily: 'sans-serif', color: isDark ? '#fff' : '#000' }}>
                  {participants.length === 1 ? participants[0].name : `그룹채팅 ${participants.length + 1}`}
                </span>
              </div>
              <div className="flex w-[60px] items-center justify-end gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke={isDark ? 'white' : '#333'} strokeWidth="1.5" /><path d="M10.5 10.5L14 14" stroke={isDark ? 'white' : '#333'} strokeWidth="1.5" strokeLinecap="round" /></svg>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke={isDark ? 'white' : '#333'} strokeWidth="1.5" strokeLinecap="round" /></svg>
              </div>
            </div>
          ) : (
            <div className="absolute inset-x-0 top-[50px] z-10 flex items-center justify-between px-4 pb-2.5 pt-1.5 backdrop-blur-xl" style={{ background: phoneHeaderBg, borderBottom: `0.5px solid ${phoneHeaderBorder}` }}>
              <button type="button" className="flex w-[90px] items-center text-[#2b7fff]">
                <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M7.5 1L1 7L7.5 13" stroke="#2b7fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="ml-1 text-[14px]" style={{ fontFamily: '-apple-system,sans-serif' }}>Messages</span>
              </button>
              <div className="flex flex-col items-center">
                {profileImage
                  ? <img src={profileImage} alt="" className="h-[30px] w-[30px] rounded-full object-cover" />
                  : <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#636366] text-[12px] font-semibold text-white">{contactName[0] ?? '?'}</div>
                }
                <span className={`mt-0.5 text-[10px] ${isDark ? 'text-white/60' : 'text-black/50'}`} style={{ fontFamily: '-apple-system,sans-serif' }}>{contactName}</span>
              </div>
              <button type="button" className="flex w-[90px] justify-end">
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M1 2.5C1 1.67 1.67 1 2.5 1H13.5C14.33 1 15 1.67 15 2.5V13.5C15 14.33 14.33 15 13.5 15H2.5C1.67 15 1 14.33 1 13.5V2.5Z" stroke="#2b7fff" strokeWidth="1.3" /><path d="M15 5.8L20.5 3V13L15 10.2V5.8Z" stroke="#2b7fff" strokeWidth="1.3" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}

          {isKakao && kakaoNotice && (
            <div
              className="absolute left-1/2 top-[97px] z-[9] flex w-[96%] -translate-x-1/2 items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: isDark ? '#242424' : '#f7f7f7', borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
                <path d="M2.2 5.6C2.2 5.2 2.52 4.88 2.92 4.88H4.15L8.9 2.45C9.38 2.2 9.95 2.55 9.95 3.09V10.91C9.95 11.45 9.38 11.8 8.9 11.55L4.15 9.12H2.92C2.52 9.12 2.2 8.8 2.2 8.4V5.6Z" fill={isDark ? "#ffcf33" : "#2b7fff"} />
                <path d="M10.9 4.3C11.82 4.95 12.35 5.98 12.35 7C12.35 8.02 11.82 9.05 10.9 9.7" stroke={isDark ? "#ffcf33" : "#2b7fff"} strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              <span className="min-w-0 flex-1 overflow-hidden text-[11px] font-medium leading-[1.35] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]" style={{ color: isDark ? 'rgba(255,255,255,0.92)' : '#1f1f1f', fontFamily: 'sans-serif' }}>
                {kakaoNotice}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
                <path d="M4 2.5L7.5 6L4 9.5" stroke={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {isKakao
            ? <KakaoChat messages={messages} isDark={isDark} scrollRef={scrollRef} participants={participants} noticeText={kakaoNotice} />
            : <IMessageChat messages={messages} isDark={isDark} scrollRef={scrollRef} profileImage={profileImage} contactName={contactName} />
          }

          {/* Bottom bar */}
          {isKakao ? (
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 px-3 py-2 backdrop-blur-xl" style={{ background: phoneHeaderBg, borderTop: `0.5px solid ${phoneHeaderBorder}` }}>
              <div className={`flex h-[32px] w-[32px] items-center justify-center rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke={isDark ? 'white' : '#333'} strokeWidth="1.8" strokeLinecap="round" /></svg>
              </div>
              <div className={`flex flex-1 items-center rounded-full px-3 py-1.5 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                <span className="text-[13px]" style={{ fontFamily: 'sans-serif', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>메시지 보내기</span>
              </div>
              <div className={`flex h-[32px] w-[32px] items-center justify-center rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} strokeWidth="1.2" /><circle cx="5.5" cy="8" r="1" fill={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} /><circle cx="8" cy="8" r="1" fill={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} /><circle cx="10.5" cy="8" r="1" fill={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} /></svg>
              </div>
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 px-3 py-2.5 backdrop-blur-xl" style={{ background: phoneHeaderBg, borderTop: `0.5px solid ${phoneHeaderBorder}`, paddingBottom: 18 }}>
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#2b7fff]"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="#2b7fff" strokeWidth="1.8" strokeLinecap="round" /></svg></div>
              <div className="flex flex-1 items-center rounded-full px-3 py-1.5" style={{ border: `1px solid ${isDark ? '#3a3a3c' : '#d1d1d6'}`, background: isDark ? '#1c1c1e' : '#e5e5ea' }}>
                <span className="text-[14px]" style={{ fontFamily: '-apple-system,sans-serif', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}>iMessage</span>
              </div>
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full" style={{ border: `1px solid ${isDark ? '#3a3a3c' : '#d1d1d6'}`, background: isDark ? '#1c1c1e' : '#e5e5ea' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#636366" strokeWidth="1.1" /><path d="M7 4.5V9.5M4.5 7.5L7 10L9.5 7.5" stroke="#636366" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          )}
        </div>

        {/* ── Controls ── */}
        <div className="flex w-full max-w-xs flex-col gap-4">

          {/* App selector */}
          <div className="flex gap-2">
            {(['imessage', 'kakao'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setChatTheme(t)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition ${chatTheme === t ? ctrl.activeRadio : ctrl.inactiveRadio}`}>
                {t === 'imessage' ? '💬 iMessage' : '💛 KakaoTalk'}
              </button>
            ))}
          </div>

          {/* Mode */}
          <div className={`flex items-center justify-between rounded-2xl border p-3.5 ${ctrl.cardBorder} ${ctrl.cardBg}`}>
            <span className={`font-mono text-[11px] tracking-widest ${ctrl.label}`}>배터리 / 테마</span>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 rounded-xl border px-2 py-1.5 ${ctrl.inputBorder} ${ctrl.inputBg}`}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={batteryLevel}
                  onChange={(e) => setBatteryLevel(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  className={`w-11 bg-transparent text-right text-xs font-medium outline-none ${ctrl.inputText}`}
                />
                <span className={`text-[10px] ${ctrl.label}`}>%</span>
              </div>
              <button type="button" onClick={() => setIsDark((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${isDark ? 'border-white/20 bg-white/10 text-white' : 'border-black/15 bg-black/8 text-black/70'}`}>
                {isDark ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
          </div>

          {/* iMessage: contact */}
          {!isKakao && (
            <div className={`rounded-2xl border p-3.5 ${ctrl.cardBorder} ${ctrl.cardBg}`}>
              <p className={`mb-2.5 font-mono text-[11px] tracking-widest ${ctrl.label}`}>상대방</p>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-[#2b7fff]/50 ${ctrl.inputBorder} ${ctrl.inputBg} ${ctrl.inputText}`} placeholder="이름" />
              <div className="mt-2 flex items-center gap-2">
                <input ref={iProfileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const r = new FileReader(); r.onload = (ev) => setProfileImage(ev.target?.result as string); r.readAsDataURL(f);
                }} />
                <button type="button" onClick={() => iProfileRef.current?.click()} className={`flex-1 rounded-xl border py-2 text-xs font-medium transition ${ctrl.btnMuted}`}>
                  {profileImage ? '사진 변경' : '사진 추가'}
                </button>
                {profileImage && (
                  <>
                    <img src={profileImage} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <button type="button" onClick={() => { setProfileImage(undefined); if (iProfileRef.current) iProfileRef.current.value = ''; }}
                      className={`rounded-xl border px-2 py-2 text-xs transition ${ctrl.btnMuted}`}>✕</button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* KakaoTalk: participants */}
          {isKakao && (
            <div className={`rounded-2xl border p-3.5 ${ctrl.cardBorder} ${ctrl.cardBg}`}>
              <div className="mb-2.5 flex items-center justify-between">
                <p className={`font-mono text-[11px] tracking-widest ${ctrl.label}`}>참여자 ({participants.length}/4)</p>
                {participants.length < 4 && (
                  <button type="button" onClick={addParticipant}
                    className={`rounded-lg border px-2 py-1 text-[10px] font-medium transition ${ctrl.btnMuted}`}>+ 추가</button>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {participants.map((p) => (
                  <ParticipantRow key={p.id} p={p} isDark={isDark}
                    onNameChange={(name) => updateParticipant(p.id, { name })}
                    onPhotoChange={(photo) => updateParticipant(p.id, { photo })}
                    onRemove={() => removeParticipant(p.id)}
                    canRemove={participants.length > 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sender */}
          {(!isKakao || kakaoInputType === 'chat') && (
          <div className={`rounded-2xl border p-3.5 ${ctrl.cardBorder} ${ctrl.cardBg}`}>
            <p className={`mb-2.5 font-mono text-[11px] tracking-widest ${ctrl.label}`}>발신자</p>
            {isKakao ? (
              <div className="flex flex-wrap gap-1.5">
                {[{ id: 'me', name: '나' }, ...participants].map((p) => (
                  <button key={p.id} type="button" onClick={() => setSelectedSenderId(p.id)}
                    className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition ${selectedSenderId === p.id ? ctrl.activeRadio : ctrl.inactiveRadio}`}>
                    {p.id !== 'me' && <Avatar participant={participants.find((x) => x.id === p.id)!} size={14} />}
                    {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                {(['sender', 'receiver'] as const).map((r) => (
                  <label key={r} className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${role === r ? ctrl.activeRadio : ctrl.inactiveRadio}`}>
                    <input type="radio" className="sr-only" checked={role === r} onChange={() => setRole(r)} />
                    <span className={`h-2 w-2 rounded-full ${role === r ? 'bg-[#2b7fff]' : (isDark ? 'bg-white/20' : 'bg-black/20')}`} />
                    {r === 'sender' ? '나 (오른쪽)' : '상대방 (왼쪽)'}
                  </label>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Timestamp */}
          <div className={`rounded-2xl border p-3.5 ${ctrl.cardBorder} ${ctrl.cardBg}`}>
            <p className={`mb-2.5 font-mono text-[11px] tracking-widest ${ctrl.label}`}>시간</p>
            <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)}
                   className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-[#2b7fff]/50 ${ctrl.inputBorder} ${ctrl.inputBg} ${ctrl.inputText} ${ctrl.colorScheme}`} />
            <p className={`mt-1.5 text-[10px] ${isDark ? 'text-white/30' : 'text-black/30'}`}>
              {timestamp ? (isKakao ? `${formatKakaoDate(new Date(timestamp).toISOString())} ${formatKakaoTime(new Date(timestamp).toISOString())}` : formatAppleTime(new Date(timestamp).toISOString())) : '—'}
            </p>
          </div>

          {/* KakaoTalk: read status */}
          {isKakao && kakaoInputType === 'chat' && potentialReaders.length > 0 && (
            <div className={`rounded-2xl border p-3.5 ${ctrl.cardBorder} ${ctrl.cardBg}`}>
              <p className={`mb-2.5 font-mono text-[11px] tracking-widest ${ctrl.label}`}>읽음 여부</p>
              <div className="flex flex-col gap-1.5">
                {potentialReaders.map((id) => {
                  const label = id === 'me' ? '나' : (participants.find((p) => p.id === id)?.name ?? id);
                  const isRead = pendingReaders.has(id);
                  return (
                    <label key={id} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs transition ${isRead ? 'border-[#f7c300]/40 bg-[#f7c300]/10 text-[#f7c300]' : ctrl.inactiveRadio}`}>
                      <input type="checkbox" className="sr-only" checked={isRead} onChange={() => {
                        const next = new Set(pendingReaders);
                        if (isRead) { next.delete(id); } else { next.add(id); }
                        setPendingReaders(next);
                        // 기존 메시지 전체에도 반영
                        setMessages((prev) => prev.map((msg) => {
                          const allIds = ['me', ...participants.map((p) => p.id)];
                          const isPotential = allIds.filter((x) => x !== msg.senderId && x !== 'me').includes(id);
                          if (!isPotential) return msg;
                          const newReaders = isRead
                            ? (msg.readers ?? []).filter((r) => r !== id)
                            : Array.from(new Set([...(msg.readers ?? []), id]));
                          return { ...msg, readers: newReaders };
                        }));
                      }} />
                      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border text-[8px] ${isRead ? 'border-[#f7c300] bg-[#f7c300] text-black' : (isDark ? 'border-white/20' : 'border-black/20')}`}>
                        {isRead && '✓'}
                      </span>
                      {label} 읽음
                    </label>
                  );
                })}
              </div>
              <p className={`mt-2 text-[10px] ${ctrl.label}`}>
                미읽음 {potentialReaders.filter((id) => !pendingReaders.has(id)).length}명
              </p>
            </div>
          )}

          {isKakao && (
            <div className={`rounded-2xl border p-3.5 ${ctrl.cardBorder} ${ctrl.cardBg}`}>
              <div className="mb-2.5 flex items-center justify-between">
                <p className={`font-mono text-[11px] tracking-widest ${ctrl.label}`}>공지사항</p>
                  <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setKakaoNotice(kakaoNoticeInput.trim())}
                        className={`rounded-lg border px-2 py-1 text-[10px] font-medium transition ${ctrl.btnMuted}`}>
                      적용
                    </button>
                    <button type="button" onClick={() => { setKakaoNotice(''); setKakaoNoticeInput(''); }}
                      className={`rounded-lg border px-2 py-1 text-[10px] font-medium transition ${ctrl.btnMuted}`}>
                      삭제
                    </button>
                  </div>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={kakaoNoticeInput}
                  onChange={(e) => setKakaoNoticeInput(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-[#2b7fff]/50 ${ctrl.inputBorder} ${ctrl.inputBg} ${ctrl.inputText}`}
                  placeholder="헤더 아래 공지사항 문구 입력..."
                />
              </div>
            </div>
          )}

          {/* Text input */}
          <div className="flex flex-col gap-2">
            {isKakao && (
              <div className="flex gap-2">
                {(['chat', 'system'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setKakaoInputType(type)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-medium transition ${kakaoInputType === type ? ctrl.activeRadio : ctrl.inactiveRadio}`}
                  >
                    {type === 'chat' ? '채팅' : '시스템'}
                  </button>
                ))}
              </div>
            )}
            <textarea
              className={`w-full resize-none rounded-2xl border px-3 py-2.5 text-xs outline-none placeholder:opacity-30 focus:border-[#2b7fff]/50 focus:ring-1 focus:ring-[#2b7fff]/30 ${ctrl.inputBorder} ${ctrl.inputBg} ${ctrl.inputText}`}
              rows={3} placeholder={isKakao && kakaoInputType === 'system' ? '시스템 문구 입력...' : '메시지 입력...'} value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button type="button" onClick={handleSend} className="rounded-xl bg-[#2b7fff] py-2.5 text-xs font-semibold text-white transition hover:bg-[#1a6ef5] active:scale-[0.98]">
              추가
            </button>
          </div>

          {/* Util */}
          <div className="flex gap-2">
            <button type="button" onClick={handleClear} className={`flex-1 rounded-xl border py-2.5 text-xs font-medium transition ${ctrl.btnMuted}`}>초기화</button>
            <button type="button" onClick={handleSavePng} className={`flex-1 rounded-xl border py-2.5 text-xs font-medium transition ${ctrl.btnMuted}`}>PNG 저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}
