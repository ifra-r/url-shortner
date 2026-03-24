/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#111111',
        border: '#222222',
        red: {
          primary: '#e53e3e',
          hover: '#c53030',
        },
        text: {
          primary: '#f5f5f5',
          muted: '#888888',
        }
      }
    },
  },
  plugins: [],
}