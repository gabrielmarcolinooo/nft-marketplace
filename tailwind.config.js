/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#140d0a', foreground: '#e9e1d8', surface: '#1a110d',
        'surface-raised': '#261711', border: '#4a2918',
        primary: { DEFAULT: '#e58a3c', hover: '#ee9a50', foreground: '#160d08' },
        muted: { DEFAULT: '#a88c72', foreground: '#8c7562' },
      },
      fontFamily: {
        sans: ['Space Mono', 'ui-monospace', 'monospace'],
        mono: ['Space Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(223, 139, 66, 0.18), 0 18px 50px rgba(0, 0, 0, 0.28)',
      },
      keyframes: { shimmer: { '100%': { transform: 'translateX(100%)' } } },
      animation: { shimmer: 'shimmer 1.6s infinite' },
    },
  },
  plugins: [],
};
