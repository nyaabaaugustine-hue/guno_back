/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        juno: {
          green: '#A3E635',
          'light-green': '#ECFCCB',
          'mid-green': '#065F46',
          'dark-green': '#013A2F',
          brand: '#0B3D2E',
          'brand-dark': '#0D3B2A',
          accent: '#1FAA6F',
          'accent-light': '#22C58B',
          mint: '#E8F5E8',
          'bg-subtle': '#F7F9F8',
          card: '#F4F5F4',
          border: '#E5E7E5',
          heading: '#1A1D1B',
          body: '#6B7280',
        },
        dark: {
          50: '#F8FAFC',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#64748B',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#020617',
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)'],
        sans: ['var(--font-outfit)'],
      },
    },
  },
  plugins: [],
}
