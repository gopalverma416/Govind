/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDF5E6',
          100: '#FAECD5',
          200: '#F5D790',
          300: '#E6B948',
          500: '#D4AF37',
          600: '#BD9B30',
          700: '#A47E2D',
          800: '#8C6E2A',
        }
      }
    },
  },
  plugins: [],
};
