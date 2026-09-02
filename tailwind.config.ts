import type { Config } from 'tailwindcss';
import rtl from 'tailwindcss-rtl';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cinematic dark palette — gold sparingly, warm bias throughout.
        ink: {
          950: '#0A0A0A',
          900: '#111111',
          800: '#1A1814', // warm charcoal surface
          700: '#262320',
          600: '#3A3530',
        },
        gold: {
          DEFAULT: '#C9A961',
          400: '#D9BE7F',
          500: '#C9A961',
          600: '#A88A45',
          700: '#8B7355', // bronze depth
        },
        /*
         * Campaign surfaces only — see `docs/02-DESIGN-SOURCE-OF-TRUTH.md`,
         * Amendment 1. The site itself stays Direction B dark and never uses
         * these.
         *
         * Sampled from LitHome's own catalogue (23 pages rendered and every
         * pixel counted): `#B87333` is the most common saturated
         * non-photographic colour in it. `700` is the same hue and saturation
         * darkened on lightness alone, because the accent has to carry text:
         *   gold  #C9A961 on bone -> 2.00  (fails everything)
         *   500   #B87333 on bone -> 3.36  (large text only)
         *   700   #845225 on bone -> 5.80  (AA)
         * Gold is a dark-ground colour and copper is a light-ground one; they
         * do not cross over. Do not use `copper` on the dark site — #845225 on
         * ink.950 is 3.03.
         */
        copper: {
          DEFAULT: '#B87333',
          500: '#B87333',
          700: '#845225',
        },
        bone: {
          DEFAULT: '#F5F1E8',
          100: '#F5F1E8', // warm off-white text
          300: '#D6D0C2',
          500: '#A39E94', // muted text
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        arabic: ['"Noto Naskh Arabic"', '"Cormorant Garamond"', 'serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Cormorant Garamond"', 'serif'],
      },
      letterSpacing: {
        luxe: '0.18em',
        wider2: '0.08em',
      },
      fontSize: {
        display: ['clamp(3rem, 7vw, 6.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        hero: ['clamp(2.25rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },
      boxShadow: {
        glow: '0 20px 80px -20px rgba(201, 169, 97, 0.35)',
        card: '0 30px 60px -30px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'gold-line': 'linear-gradient(90deg, transparent, #C9A961 50%, transparent)',
        'warm-radial': 'radial-gradient(ellipse at 50% 0%, rgba(201,169,97,0.12), transparent 60%)',
      },
      transitionTimingFunction: {
        'out-luxe': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [rtl],
} satisfies Config;
