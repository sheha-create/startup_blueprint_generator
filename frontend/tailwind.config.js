/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Brand palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0ebff',
          200: '#c7d9ff',
          300: '#a4bbff',
          400: '#7a91fc',
          500: '#5b67f7',
          600: '#4547ec',
          700: '#3836d1',
          800: '#2f2da8',
          900: '#2a2c85',
          950: '#1a1b55',
        },
        // Vibrant accent
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        // Dark sidebar
        sidebar: {
          DEFAULT: '#0f1117',
          hover:   '#1a1d27',
          border:  '#1e2235',
          text:    '#a0aec0',
          active:  '#5b67f7',
        },
        // Surface
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
      },
      backgroundImage: {
        'brand-gradient':    'linear-gradient(135deg, #5b67f7 0%, #8b5cf6 50%, #06b6d4 100%)',
        'brand-gradient-2':  'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 50%, #5b67f7 100%)',
        'card-gradient':     'linear-gradient(135deg, rgba(91,103,247,0.08) 0%, rgba(139,92,246,0.05) 100%)',
        'dark-gradient':     'linear-gradient(180deg, #0f1117 0%, #141724 100%)',
        'glow-brand':        'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,103,247,0.3) 0%, transparent 60%)',
        'glow-violet':       'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.25) 0%, transparent 70%)',
      },
      boxShadow: {
        'brand-sm':   '0 2px 8px rgba(91,103,247,0.25)',
        'brand-md':   '0 4px 20px rgba(91,103,247,0.35)',
        'brand-lg':   '0 8px 40px rgba(91,103,247,0.4)',
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 20px rgba(91,103,247,0.15), 0 1px 4px rgba(0,0,0,0.08)',
        'elevated':   '0 8px 30px rgba(0,0,0,0.12)',
        'glass':      '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'dark-card':  '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease forwards',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-right':  'slideRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.8s linear infinite',
        'bounce-dot':   'bounceDot 1.2s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
        'count-up':     'countUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(91,103,247,0.4)' },
          '50%':      { boxShadow: '0 0 40px rgba(91,103,247,0.7), 0 0 60px rgba(139,92,246,0.3)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceDot: {
          '0%, 100%': { transform: 'translateY(0)',    opacity: '0.4' },
          '50%':      { transform: 'translateY(-6px)', opacity: '1'   },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)'   },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
