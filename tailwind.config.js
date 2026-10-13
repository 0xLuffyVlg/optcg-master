/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        op: {
          red: '#E53E3E',
          green: '#38A169',
          blue: '#3182CE',
          purple: '#805AD5',
          black: '#2D3748',
          yellow: '#D69E2E',
          gold: '#ECC94B',
          dark: '#0F172A',
          card: '#1E293B',
          border: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        onepiece: ['Impact', 'Arial Black', 'sans-serif']
      }
    },
  },
  plugins: [],
}
