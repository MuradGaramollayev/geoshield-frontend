/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A0F1E',
        surface: '#111827',
        panel: '#1F2937',
        emerald: '#10B981',
        cyan: '#06B6D4',
      },
    },
  },
  plugins: [],
}