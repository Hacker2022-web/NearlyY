/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F4F2FF',
          100: '#E9E5FF',
          200: '#D5CDFF',
          300: '#B8A8FF',
          400: '#9475FF',
          500: '#6C47FF',
          600: '#5A38EC',
          700: '#4F32D4',
          800: '#4028AF',
          900: '#35228D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

