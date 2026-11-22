/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep obsidian black-blue scale
        brand: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#BAE0FF',
          300: '#7CC2FF',
          400: '#38A0FF',
          500: '#2563EB', // vivid royal blue
          600: '#1D4ED8',
          700: '#143AA2',
          800: '#0E225C',
          900: '#071233', // dark navy-black
          950: '#020617', // near pitch-black with deep blue undertone
        },
        // Electric cobalt & sapphire blue accent
        accent: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8', // vibrant sky/electric blue
          500: '#0EA5E9',
          600: '#2563EB', // electric sapphire
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#172554',
        },
        // Pure midnight obsidian
        midnight: {
          950: '#01040A',
          900: '#040915',
          850: '#071022',
          800: '#0B1731',
          750: '#102042',
        },
        gold: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(2, 6, 23, 0.06)',
        'card': '0 4px 20px -2px rgba(2, 6, 23, 0.12)',
        'card-dark': '0 10px 30px -5px rgba(2, 6, 23, 0.6), 0 0 1px 1px rgba(37, 99, 235, 0.2)',
        'glow-blue': '0 0 25px -2px rgba(37, 99, 235, 0.35), 0 0 10px -2px rgba(56, 189, 248, 0.3)',
        'dropdown': '0 12px 36px -4px rgba(2, 6, 23, 0.25)',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(1rem)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
