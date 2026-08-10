/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f6f0ff',
          100: '#ebdbf9',
          500: '#660ba8', 
          600: '#4B0082', 
          700: '#3b0066',
          900: '#1d0033',
        },
        secondary: '#facc15', // yellow-400
        darkBg: '#0f172a',    // slate-900
        darkCard: '#1e293b',  // slate-800
      }
    },
  },
  darkMode: 'class', // enable dark mode by toggling the "dark" class on html tag
  plugins: [],
}
