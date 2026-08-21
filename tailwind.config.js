/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // CoFilmery Brand Colors
        primary:     '#1f3a5f',   // navy — C, headlines, primary buttons
        accent:      '#c8912f',   // amber gold — iris, highlights, badges
        'bg-soft':   '#f7f4ee',   // warm cream — page background
        card:        '#ffffff',   // card background
        ink:         '#22262b',   // primary text
        muted:       '#5b6470',   // secondary text, captions
        line:        '#e3e7ec',   // borders, dividers
        'warn-bg':   '#fbeee2',   // warning callout bg
        'warn-line': '#c8912f',   // warning border
        'drama-tone':'#1f3a5f',   // Drama Mode cards (navy)
        'legacy-tone':'#c8912f',  // Legacy Mode cards (amber)
        'elder-accent':'#2d6a4f', // subtle green for elderly saved states
        // shadcn compatible
        border: '#e3e7ec',
        input: '#e3e7ec',
        ring: '#1f3a5f',
        background: '#f7f4ee',
        foreground: '#22262b',
        secondary: {
          DEFAULT: '#f7f4ee',
          foreground: '#22262b',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#22262b',
        },
        'primary-foreground': '#ffffff',
        'accent-foreground': '#ffffff',
        'muted-foreground': '#5b6470',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'PingFang HK', 'Microsoft JhengHei', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'hero': ['54px', { lineHeight: '1.15', fontWeight: '700' }],
        'section': ['30px', { lineHeight: '1.35' }],
        'card-title': ['20px', { lineHeight: '1.4' }],
        'body': ['16px', { lineHeight: '1.75' }],
        'elder-body': ['22px', { lineHeight: '1.75' }],
        'caption': ['14px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',    // rounded-xl — creator/admin cards
        xl: '16px',    // rounded-2xl — elderly cards
        full: '9999px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(31,58,95,0.06)',
        'card-hover': '0 8px 32px rgba(31,58,95,0.12)',
        nav: '0 2px 12px rgba(31,58,95,0.08)',
      },
      spacing: {
        section: '4rem',  // 64px min py between major sections
      },
    },
  },
  plugins: [],
}
