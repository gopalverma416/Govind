/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // SF Pro on Apple devices, Inter everywhere else
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
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
        },
        ink: '#1d1d1f',
        mist: '#f5f5f7',
        muted: '#6e6e73',
        brand: {
          DEFAULT: '#8a6a24',
          hover: '#735819',
          light: '#e6b948',
        },
      },
      maxWidth: {
        content: '980px',
        wide: '1440px',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.28, 0.11, 0.32, 1)',
      },
      keyframes: {
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-down': 'fade-down 320ms cubic-bezier(0.28, 0.11, 0.32, 1) both',
      },
    },
  },
  plugins: [],
};
