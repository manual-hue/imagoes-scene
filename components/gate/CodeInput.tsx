'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';

interface CodeInputProps {
  value: string;
  maxLength: number;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function CodeInput({
  value,
  maxLength,
  disabled,
  onChange,
  onSubmit,
}: CodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length > 0 && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Build underscore display: filled chars + remaining blanks
  const chars = value.split('');
  const blanks = Math.max(0, maxLength - chars.length);

  return (
    <div
      className="relative cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Hidden real input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
          if (v.length <= maxLength) onChange(v);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        aria-label="Access code input"
      />

      {/* Visual underscore display */}
      <div className="flex items-center justify-center gap-2 py-3 px-4">
        {chars.map((char, i) => (
          <span
            key={i}
            className="
              font-mono text-2xl tracking-widest
              text-[var(--text-mono)] terminal-glow
              border-b-2 border-[var(--text-mono)]
              w-7 text-center pb-1 uppercase
            "
          >
            {char}
          </span>
        ))}
        {Array.from({ length: blanks }).map((_, i) => (
          <span
            key={`blank-${i}`}
            className={`
              font-mono text-2xl
              border-b-2 border-[var(--text-dim)]
              w-7 text-center pb-1
              ${i === 0 && chars.length < maxLength ? 'cursor-blink' : ''}
            `}
          >
            &nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}
