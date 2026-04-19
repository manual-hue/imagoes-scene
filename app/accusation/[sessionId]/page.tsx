'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { useEvidencePhotos, type EvidencePhotoView } from '@/hooks/useEvidencePhotos';
import { hasFirebaseClientConfig } from '@/lib/firebase/index';
import {
  submitBoardCard,
  deleteBoardCard,
  clearBoardCards,
  subscribeBoardCards,
  type BoardCard,
} from '@/lib/firebase/board';

interface LocalCard {
  id: string;
  photoId: string;
  imageUrl: string;
  memo: string;
  roomName: string;
  submittedBy: string;
  submittedAt: number;
}

const LS_NAME_KEY = 'csz_player_name';
const LS_SUSPECT_KEY = (sid: string) => `csz_suspect_${sid}`;
const LS_BOARD_KEY = (sid: string) => `csz_board_${sid}`;

function loadLocalBoard(sessionId: string): LocalCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_BOARD_KEY(sessionId));
    return raw ? (JSON.parse(raw) as LocalCard[]) : [];
  } catch {
    return [];
  }
}

function saveLocalBoard(sessionId: string, cards: LocalCard[]) {
  localStorage.setItem(LS_BOARD_KEY(sessionId), JSON.stringify(cards));
}

async function blobUrlToBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  return res.blob();
}

function boardCardToLocal(card: BoardCard): LocalCard {
  return {
    id: card.id,
    photoId: card.photoId,
    imageUrl: card.imageUrl,
    memo: card.memo,
    roomName: card.roomName,
    submittedBy: card.submittedBy,
    submittedAt: card.submittedAt,
  };
}

export default function AccusationPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const { photos, loading } = useEvidencePhotos(sessionId);
  const isOnline = hasFirebaseClientConfig();

  const [playerName, setPlayerName] = useState('');
  const [suspect, setSuspect] = useState('');
  const [board, setBoard] = useState<LocalCard[]>([]);
  const [picker, setPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lightbox, setLightbox] = useState<LocalCard | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    setPlayerName(localStorage.getItem(LS_NAME_KEY) ?? '');
    setSuspect(localStorage.getItem(LS_SUSPECT_KEY(sessionId)) ?? '');
  }, [sessionId]);

  // 보드 구독 — Firebase 있으면 실시간, 없으면 localStorage
  useEffect(() => {
    if (isOnline) {
      const unsub = subscribeBoardCards(sessionId, (cards) => {
        setBoard(cards.map(boardCardToLocal));
      });
      return unsub;
    } else {
      setBoard(loadLocalBoard(sessionId));
      const sync = () => setBoard(loadLocalBoard(sessionId));
      window.addEventListener('storage', sync);
      return () => window.removeEventListener('storage', sync);
    }
  }, [sessionId, isOnline]);

  const saveSuspect = (value: string) => {
    setSuspect(value);
    localStorage.setItem(LS_SUSPECT_KEY(sessionId), value);
  };

  const submittedPhotoIds = useMemo(
    () => new Set(board.filter((c) => c.submittedBy === playerName).map((c) => c.photoId)),
    [board, playerName],
  );

  const handleSubmit = useCallback(
    async (photo: EvidencePhotoView) => {
      if (!playerName.trim()) {
        alert('먼저 이름을 입력해주세요.');
        return;
      }
      if (!photo.imageUrl) return;
      setSubmitting(true);
      try {
        if (isOnline) {
          const blob = await blobUrlToBlob(photo.imageUrl);
          await submitBoardCard(sessionId, photo.id, blob, {
            memo: photo.memo ?? '',
            roomName: photo.roomName,
            submittedBy: playerName.trim(),
          });
          // board는 onSnapshot이 자동 업데이트
        } else {
          const res = await fetch(photo.imageUrl);
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const cardId = `${photo.id}_${playerName}`;
          const card: LocalCard = {
            id: cardId,
            photoId: photo.id,
            imageUrl: dataUrl,
            memo: photo.memo ?? '',
            roomName: photo.roomName,
            submittedBy: playerName.trim(),
            submittedAt: Date.now(),
          };
          const next = [...board.filter((c) => c.id !== cardId), card].sort(
            (a, b) => b.submittedAt - a.submittedAt,
          );
          setBoard(next);
          saveLocalBoard(sessionId, next);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [board, isOnline, playerName, sessionId],
  );

  const handleRemoveCard = useCallback(
    async (cardId: string) => {
      if (isOnline) {
        await deleteBoardCard(sessionId, cardId).catch(() => undefined);
        // onSnapshot이 자동 반영
      } else {
        const next = board.filter((c) => c.id !== cardId);
        setBoard(next);
        saveLocalBoard(sessionId, next);
      }
    },
    [board, isOnline, sessionId],
  );

  const handleClearBoard = useCallback(async () => {
    if (board.length === 0) return;
    if (!window.confirm('공유 보드의 모든 사진을 삭제할까요? 되돌릴 수 없습니다.')) return;
    if (isOnline) {
      await clearBoardCards(sessionId).catch(() => undefined);
    } else {
      setBoard([]);
      saveLocalBoard(sessionId, []);
    }
  }, [board.length, isOnline, sessionId]);

  return (
    <main className="full-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="shrink-0 border-b border-[var(--border-dim)] px-5 pb-4 pt-6">
          <p className="font-mono text-xs tracking-[0.28em] text-text-mono terminal-glow">
            브리핑룸
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-[var(--text-dim)]">
            BRIEFING ROOM
          </p>
      </header>

      <div className="scroll-container min-h-0 flex-1 space-y-6 px-5 py-5 pb-24">
        {/* 이름 표시 */}
        <section className="flex items-center justify-between rounded-sm border border-white/10 bg-[var(--bg-secondary)] px-3 py-2">
          <span className="font-mono text-[10px] tracking-[0.24em] text-[var(--text-dim)]">
            내 이름
          </span>
          <span className="font-mono text-sm tracking-[0.12em] text-[var(--accent-teal)]">
            {playerName || 'UNKNOWN'}
          </span>
        </section>

        {/* 제출 패널 */}
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] tracking-[0.24em] text-[var(--text-dim)]">
              공유 보드 · {board.length}
            </p>
            <div className="flex items-center gap-3">
              {isAdmin && board.length > 0 && (
                <button
                  type="button"
                  onClick={() => void handleClearBoard()}
                  className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent-red)]"
                >
                  전체 삭제
                </button>
              )}
              <button
                type="button"
                onClick={() => setPicker((v) => !v)}
                className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent-teal)]"
              >
                {picker ? '닫기' : '+ 사진 추가'}
              </button>
            </div>
          </div>

          {picker && (
            <div className="rounded-sm border border-white/10 bg-black/30 p-3">
              <p className="mb-2 font-mono text-[9px] tracking-[0.2em] text-white/50">
                나의 사건 수첩 · 탭하여 전송
              </p>
              {loading ? (
                <p className="py-4 text-center font-mono text-[10px] text-white/40">LOADING...</p>
              ) : photos.length === 0 ? (
                <p className="py-4 text-center font-mono text-[10px] text-white/40">
                  NO EVIDENCE COLLECTED
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => {
                    const submitted = submittedPhotoIds.has(photo.id);
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        disabled={submitting || !photo.imageUrl}
                        onClick={() => void handleSubmit(photo)}
                        className={`relative aspect-square overflow-hidden border ${
                          submitted
                            ? 'border-[var(--accent-teal)]'
                            : 'border-white/10'
                        } bg-black/40`}
                      >
                        {photo.imageUrl && (
                          <Image
                            src={photo.imageUrl}
                            alt={photo.memo || photo.roomName}
                            fill
                            unoptimized
                            sizes="33vw"
                            className="object-cover"
                          />
                        )}
                        {submitted && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[9px] tracking-[0.18em] text-[var(--accent-teal)]">
                            SUBMITTED
                          </span>
                        )}
                        {submitting && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[9px] tracking-[0.18em] text-white/60">
                            UPLOADING...
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 보드 */}
          {board.length === 0 ? (
            <div className="flex min-h-[140px] items-center justify-center border border-dashed border-white/10 bg-black/20">
              <p className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                NO SUBMISSIONS YET
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {board.map((card) => (
                <article
                  key={card.id}
                  className="flex flex-col overflow-hidden rounded-sm border border-white/10 bg-[var(--bg-secondary)]"
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(card)}
                    className="relative aspect-square w-full overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.imageUrl}
                      alt={card.memo || card.roomName}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col p-2">
                    <p className="truncate font-mono text-[9px] tracking-[0.16em] text-[var(--accent-teal)]">
                      {card.memo}
                    </p>
                    {card.submittedBy === playerName && (
                      <button
                        type="button"
                        onClick={() => void handleRemoveCard(card.id)}
                        className="mt-1 self-end font-mono text-[9px] tracking-[0.18em] text-[var(--accent-red)]"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 용의자 지목 */}
        <section className="space-y-2">
          <label className="block font-mono text-[10px] tracking-[0.24em] text-[var(--text-dim)]">
            나의 추리 기록
          </label>
          <input
            value={suspect}
            onChange={(e) => saveSuspect(e.target.value)}
            placeholder="용의자 이름"
            className="w-full rounded-sm border border-white/10 bg-[var(--bg-secondary)] px-3 py-3 font-body text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-red)]"
          />
          <p className="font-mono text-[9px] tracking-[0.18em] text-white/40">
            회의 결과를 이곳에 기록하세요. 개인의 메모는 개인에게만 저장됩니다.
          </p>
        </section>
      </div>

      <BottomTabBar sessionId={sessionId} />

      {lightbox && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative flex max-h-full w-full max-w-md flex-col border-2 border-white bg-[var(--bg-primary)] shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_24px_60px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/80 bg-black px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent-red)]" />
                <p className="font-mono text-xs tracking-[0.28em] text-white">
                  증거물 · {lightbox.roomName}
                </p>
              </div>
            </div>

            <div className="bg-white px-4 pt-4 pb-6 text-black shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.imageUrl}
                alt={lightbox.memo || lightbox.roomName}
                className="block max-h-[50vh] w-full object-contain bg-black"
              />
              <div className="mt-2 flex items-center justify-between font-mono text-[9px] tracking-[0.18em] text-black/60">
                <span>BY · {lightbox.submittedBy}</span>
                <span>
                  {new Date(lightbox.submittedAt)
                    .toISOString()
                    .replace('T', ' ')
                    .slice(0, 16)}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-3xl text-center leading-snug text-black [font-family:var(--font-handwriting),cursive]">
                {lightbox.memo || <span className="text-black/30">메모 없음</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
