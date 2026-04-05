'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RoomEntry {
  key: string;
  shortCode: string;
  name: string;
  description: string;
}

let roomKeyCounter = 0;

function createRoom(index: number): RoomEntry {
  roomKeyCounter += 1;
  return {
    key: `room-${roomKeyCounter}`,
    shortCode: `R${String(index).padStart(2, '0')}`,
    name: '',
    description: '',
  };
}

function nextShortCode(rooms: RoomEntry[]): string {
  const used = new Set(rooms.map((r) => r.shortCode.toUpperCase()));
  for (let i = 1; i <= 99; i++) {
    const code = `R${String(i).padStart(2, '0')}`;
    if (!used.has(code)) return code;
  }
  return `R${String(rooms.length + 1).padStart(2, '0')}`;
}

interface NewSessionFormProps {
  adminEmail: string;
  defaultAccessCode: string;
  createAction: (formData: FormData) => Promise<void>;
}

export function NewSessionForm({ adminEmail, defaultAccessCode, createAction }: NewSessionFormProps) {
  const [rooms, setRooms] = useState<RoomEntry[]>(() => [createRoom(1)]);
  const [errors, setErrors] = useState<string[]>([]);

  function addRoom() {
    setRooms((prev) => {
      const code = nextShortCode(prev);
      roomKeyCounter += 1;
      return [
        ...prev,
        {
          key: `room-${roomKeyCounter}`,
          shortCode: code,
          name: '',
          description: '',
        },
      ];
    });
  }

  function removeRoom(key: string) {
    if (rooms.length <= 1) return;
    setRooms((prev) => prev.filter((r) => r.key !== key));
  }

  function updateRoom(key: string, field: keyof Omit<RoomEntry, 'key'>, value: string) {
    setRooms((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  }

  function validate(): boolean {
    const errs: string[] = [];

    const form = document.querySelector<HTMLFormElement>('form[data-session-form]');
    const nameValue = form?.querySelector<HTMLInputElement>('[name="name"]')?.value.trim();
    if (!nameValue) errs.push('세션 이름을 입력해주세요');

    if (rooms.length === 0) {
      errs.push('최소 1개의 방을 추가해주세요');
    }

    const codes = new Set<string>();
    for (const room of rooms) {
      if (!room.shortCode.trim()) {
        errs.push('방 코드를 입력해주세요');
        break;
      }
      if (!room.name.trim()) {
        errs.push('방 이름을 입력해주세요');
        break;
      }
      const upper = room.shortCode.trim().toUpperCase();
      if (codes.has(upper)) {
        errs.push('중복된 방 코드가 있습니다');
        break;
      }
      codes.add(upper);
    }

    setErrors(errs);
    return errs.length === 0;
  }

  const roomsJson = JSON.stringify(
    rooms.map((r, i) => ({
      shortCode: r.shortCode.trim().toUpperCase(),
      name: r.name.trim(),
      description: r.description.trim(),
      order: i + 1,
    })),
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      {/* Header */}
      <div className="pb-6">
        <p className="font-mono text-[10px] tracking-[0.4em] text-black/35 uppercase">
          New Session
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold text-black">
          세션 생성
        </h1>
        <p className="mt-1 font-mono text-xs text-black/30">
          {adminEmail}
        </p>
      </div>

      <form
        data-session-form
        action={createAction}
        onSubmit={(e) => {
          if (!validate()) {
            e.preventDefault();
          }
        }}
        className="space-y-6"
      >
        <input type="hidden" name="rooms" value={roomsJson} />

        {/* Section 1: Basic Info */}
        <section className="border border-black/12">
          <div className="border-b border-black/8 px-5 py-3">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
              Basic Info
            </h2>
          </div>
          <div className="divide-y divide-black/[0.06]">
            <label className="flex items-center gap-4 px-5 py-3">
              <span className="w-20 shrink-0 font-mono text-[10px] tracking-wider text-black/35 uppercase">
                Name
              </span>
              <input
                type="text"
                name="name"
                required
                placeholder="2026년 크라임씬"
                className="min-h-[40px] flex-1 border border-black/12 bg-transparent px-3 text-sm text-black outline-none transition placeholder:text-black/20 focus:border-black/30"
              />
            </label>
            <label className="flex items-center gap-4 px-5 py-3">
              <span className="w-20 shrink-0 font-mono text-[10px] tracking-wider text-black/35 uppercase">
                Code
              </span>
              <input
                type="text"
                name="sessionCode"
                placeholder="자동 생성"
                maxLength={6}
                className="min-h-[40px] flex-1 border border-black/12 bg-transparent px-3 font-mono text-sm uppercase text-black outline-none transition placeholder:text-black/20 focus:border-black/30"
              />
            </label>
          </div>
        </section>

        {/* Section 2: Game Settings */}
        <section className="border border-black/12">
          <div className="border-b border-black/8 px-5 py-3">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
              Settings
            </h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-black/[0.06]">
            <label className="flex flex-col gap-1.5 px-5 py-3 border-b border-black/[0.06]">
              <span className="font-mono text-[10px] tracking-wider text-black/30 uppercase">
                Interval (min)
              </span>
              <input
                type="number"
                name="intervalMinutes"
                min={1}
                defaultValue={20}
                className="min-h-[36px] w-full border border-black/12 bg-transparent px-3 font-mono text-sm text-black outline-none transition focus:border-black/30"
              />
            </label>
            <label className="flex flex-col gap-1.5 px-5 py-3 border-b border-black/[0.06]">
              <span className="font-mono text-[10px] tracking-wider text-black/30 uppercase">
                Checkpoints
              </span>
              <input
                type="number"
                name="totalIntervals"
                min={1}
                defaultValue={5}
                className="min-h-[36px] w-full border border-black/12 bg-transparent px-3 font-mono text-sm text-black outline-none transition focus:border-black/30"
              />
            </label>
            <label className="flex flex-col gap-1.5 px-5 py-3">
              <span className="font-mono text-[10px] tracking-wider text-black/30 uppercase">
                Max Players
              </span>
              <input
                type="number"
                name="maxPlayers"
                min={1}
                defaultValue={20}
                className="min-h-[36px] w-full border border-black/12 bg-transparent px-3 font-mono text-sm text-black outline-none transition focus:border-black/30"
              />
            </label>
            <label className="flex flex-col gap-1.5 px-5 py-3">
              <span className="font-mono text-[10px] tracking-wider text-black/30 uppercase">
                Access Code
              </span>
              <input
                type="text"
                name="accessCode"
                defaultValue={defaultAccessCode}
                className="min-h-[36px] w-full border border-black/12 bg-transparent px-3 font-mono text-sm text-black outline-none transition focus:border-black/30"
              />
            </label>
          </div>
        </section>

        {/* Section 3: Rooms */}
        <section className="border border-black/12">
          <div className="flex items-center justify-between border-b border-black/8 px-5 py-3">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
              Rooms
              <span className="ml-2 text-black/20">{rooms.length}</span>
            </h2>
            <button
              type="button"
              onClick={addRoom}
              className="border border-black/25 px-3 py-1 font-mono text-[10px] tracking-wider text-black/50 transition hover:bg-black hover:text-white"
            >
              + ADD
            </button>
          </div>

          <div className="divide-y divide-black/[0.06]">
            {rooms.map((room, index) => (
              <div key={room.key} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-black/20">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRoom(room.key)}
                    disabled={rooms.length <= 1}
                    className="font-mono text-[10px] text-black/20 tracking-wider transition hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    DEL
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-[80px_1fr]">
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-black/25 uppercase">Code</span>
                    <input
                      type="text"
                      value={room.shortCode}
                      onChange={(e) => updateRoom(room.key, 'shortCode', e.target.value)}
                      maxLength={4}
                      className="min-h-[36px] w-full border border-black/12 bg-transparent px-2 font-mono text-sm uppercase text-black outline-none transition focus:border-black/30"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-black/25 uppercase">Name</span>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => updateRoom(room.key, 'name', e.target.value)}
                      placeholder="101호 — 피해자 침실"
                      className="min-h-[36px] w-full border border-black/12 bg-transparent px-3 text-sm text-black outline-none transition placeholder:text-black/20 focus:border-black/30"
                    />
                  </label>
                </div>

                <label className="mt-2 flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-black/25 uppercase">Desc</span>
                  <input
                    type="text"
                    value={room.description}
                    onChange={(e) => updateRoom(room.key, 'description', e.target.value)}
                    placeholder="방에 대한 간략한 설명"
                    className="min-h-[36px] w-full border border-black/12 bg-transparent px-3 text-sm text-black outline-none transition placeholder:text-black/20 focus:border-black/30"
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="border border-black/15 px-5 py-3">
            {errors.map((err) => (
              <p key={err} className="font-mono text-xs text-black/60">
                !! {err}
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center border border-black bg-black px-6 font-mono text-xs font-bold tracking-[0.15em] text-white transition hover:bg-black/85"
          >
            CREATE SESSION
          </button>
          <Link
            href="/admin"
            className="inline-flex min-h-[44px] items-center justify-center border border-black/12 px-6 font-mono text-xs tracking-wider text-black/35 transition hover:border-black/30 hover:text-black/70"
          >
            CANCEL
          </Link>
        </div>
      </form>
    </main>
  );
}
