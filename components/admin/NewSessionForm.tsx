'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NewSessionFormProps {
  adminEmail: string;
  defaultAccessCode: string;
  createAction: (formData: FormData) => Promise<void>;
}

export function NewSessionForm({ adminEmail, defaultAccessCode, createAction }: NewSessionFormProps) {
  const [errors, setErrors] = useState<string[]>([]);

  function validate(): boolean {
    const errs: string[] = [];

    const form = document.querySelector<HTMLFormElement>('form[data-session-form]');
    const nameValue = form?.querySelector<HTMLInputElement>('[name="name"]')?.value.trim();
    if (!nameValue) errs.push('세션 이름을 입력해주세요');

    setErrors(errs);
    return errs.length === 0;
  }

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
