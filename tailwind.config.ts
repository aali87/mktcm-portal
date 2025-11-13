import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors from Framer site
        primary: {
          DEFAULT: '#7fa69b', // Muted sage green
          dark: '#6a8f85',
          light: '#9bc1b6',
        },
        neutral: {
          50: '#fafafa',  // Light beige
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#535956', // Body text gray
          700: '#404040',
          800: '#2e3231', // Dark accent
          900: '#171717',
        },
        background: '#ffffff',
        foreground: '#2e3231',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#2e3231',
        },
        border: '#e5e5e5',
        input: '#e5e5e5',
        ring: '#7fa69b',
        // Shadcn-compatible colors
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#fafafa',
          foreground: '#535956',
        },
        accent: {
          DEFAULT: '#7fa69b',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#2e3231',
        },
      },
      fontFamily: {
        serif: ['var(--font-crimson-text)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1', letterSpacing: '-0.03em' }], // 36px
        'h1': ['2rem', { lineHeight: '1', letterSpacing: '-0.03em' }], // 32px
        'h2': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 24px
        'h3': ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 20px
        'body-lg': ['1.125rem', { lineHeight: '1.7' }], // 18px
        'body': ['1rem', { lineHeight: '1.7' }], // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.6' }], // 14px
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        'container': '1600px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
