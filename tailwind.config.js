/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B3A2F',
          50: '#f2f7f5',
          100: '#e1ede8',
          200: '#c5dcd3',
          300: '#9bc2b4',
          400: '#6ba290',
          500: '#478370',
          600: '#346959',
          700: '#2a5447',
          800: '#1B3A2F',
          900: '#173128',
          950: '#0c1b16',
        },
        cream: {
          DEFAULT: '#F5F1E8',
          50: '#ffffff',
          100: '#faf7f2',
          200: '#F5F1E8',
          300: '#ede6d8',
          400: '#dfd4bf',
          500: '#ccbc9e',
          600: '#b8a37f',
          700: '#9a8563',
          800: '#7d6b4f',
          900: '#675841',
        },
        brand: {
          DEFAULT: '#1B3A2F',
          primary: '#1B3A2F',
          cream: '#F5F1E8',
          accent: '#2A5A49',
          dark: '#0c1b16',
          50: '#f2f7f5',
          100: '#e1ede8',
          500: '#1B3A2F',
          600: '#173128',
          700: '#11251e',
          900: '#0c1b16',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
