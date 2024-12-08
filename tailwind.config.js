/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        library: {
          wood: '#8B7355',
          paper: '#FFF9E8',
          accent: '#D4A373',
          dark: '#594A3C',
          light: '#F5EBE0'
        }
      }
    },
  },
  plugins: [],
};