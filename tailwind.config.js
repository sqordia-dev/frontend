/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        'strategy-blue': '#1A2B47',
        'momentum-orange': '#FF6B00',
        'light-ai-grey': '#F4F7FA',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}