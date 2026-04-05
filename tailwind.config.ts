import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 배경 계층
        'bg-base':      'var(--bg-base)',
        'bg-primary':   'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-elevated':  'var(--bg-elevated)',

        // 텍스트
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-dim':       'var(--text-dim)',
        'text-mono':      'var(--text-mono)',

        // 액센트
        'accent-red':    'var(--accent-red)',
        'accent-amber':  'var(--accent-amber)',
        'accent-teal':   'var(--accent-teal)',
        'accent-yellow': 'var(--accent-yellow)',

        // 보더
        'border-dim':    'var(--border-dim)',
        'border-mid':    'var(--border-mid)',
        'border-bright': 'var(--border-bright)',

        // 특수 효과
        'siren-red':     'var(--siren-red)',
        'evidence-tape': 'var(--evidence-tape)',
      },
      fontFamily: {
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      height: {
        'screen-dvh': '100dvh',
        'screen-vh':  'calc(var(--vh, 1vh) * 100)',
      },
      minHeight: {
        'screen-dvh': '100dvh',
        'screen-vh':  'calc(var(--vh, 1vh) * 100)',
      },
      screens: {
        'portrait':  { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
      },
      boxShadow: {
        'phosphor': 'var(--phosphor-glow)',
      },
      borderColor: {
        dim:    'var(--border-dim)',
        mid:    'var(--border-mid)',
        bright: 'var(--border-bright)',
      },
    },
  },
  plugins: [],
};
export default config;
