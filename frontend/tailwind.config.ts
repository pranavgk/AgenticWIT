import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          500: '#6b7280',
          700: '#374151',
          900: '#111827',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e' },
        warning: { 50: '#fffbeb', 500: '#f59e0b' },
        error: { 50: '#fef2f2', 500: '#ef4444' },
        // Work item type colors
        epic: '#8b5cf6',
        feature: '#3b82f6',
        story: '#10b981',
        task: '#f59e0b',
        bug: '#ef4444',
        debt: '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'focus': '0 0 0 2px var(--primary-500)',
      },
    },
  },
  plugins: [],
}
export default config
