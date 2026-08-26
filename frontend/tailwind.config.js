/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Harvest Bridge color system — Earth + Intelligence + Urgency
        harvest: {
          50:  '#fef9f0',
          100: '#fef0d3',
          200: '#fcd98a',
          300: '#f9bc3a',
          400: '#f7a51c',
          500: '#e8870a',
          600: '#c96507',
          700: '#a14810',
          800: '#823914',
          900: '#6a2f14',
        },
        forest: {
          50:  '#f0f9f4',
          100: '#dcf0e3',
          200: '#bbe1cb',
          300: '#8ecaaa',
          400: '#5dac84',
          500: '#3a9068',
          600: '#2b7253',
          700: '#235b43',
          800: '#1f4937',
          900: '#1a3c2e',
        },
        earth: {
          50:  '#faf6f0',
          100: '#f0e8d8',
          200: '#e0ccb0',
          300: '#cca87f',
          400: '#b88455',
          500: '#a06938',
          600: '#875530',
          700: '#6e4228',
          800: '#5a3523',
          900: '#4a2c1e',
        },
        slate: {
          750: '#2d3748',
          850: '#1a202c',
          950: '#0d1117',
        },
        risk: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444',
          critical: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'harvest-gradient': 'linear-gradient(135deg, #1a3c2e 0%, #2b7253 50%, #3a9068 100%)',
        'earth-gradient': 'linear-gradient(135deg, #4a2c1e 0%, #875530 100%)',
        'risk-gradient': 'linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'countUp 1s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'risk-pulse': 'riskPulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        riskPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(239, 68, 68, 0)' },
        },
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(58, 144, 104, 0.4)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}
