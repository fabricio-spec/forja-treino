/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#07090b', 900: '#0c0f12', 850: '#11151a', 800: '#161b21', 700: '#1f262e', 600: '#2b343e', 500: '#46525e', 400: '#6b7886', 300: '#9aa6b2', 200: '#c8d0d8', 100: '#eef2f5' },
        lime: { DEFAULT: '#c6ff3d', soft: '#c6ff3d26', deep: '#9fd61a' },
        volt: { DEFAULT: '#2fb8ff', soft: '#2fb8ff26' },
        warn: '#ffb02e',
        danger: '#ff5a5f',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: { glow: '0 0 0 1px #c6ff3d55, 0 10px 40px -10px #c6ff3d66' },
    },
  },
  plugins: [],
};
