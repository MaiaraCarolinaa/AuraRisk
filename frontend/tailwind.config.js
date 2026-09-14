export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aura: {
          950: '#0d2318',
          900: '#122e1f',
          800: '#173a28',
          700: '#1f4a34',
          600: '#2b6a49',
          500: '#3a8a5f',
          400: '#5bab7c',
          300: '#8ecaa4',
          100: '#e4f3ea',
          bg: '#f5f7f4',
        },
        risk: {
          low: '#3a8a5f',
          moderate: '#d9a441',
          high: '#e0692f',
          critical: '#c73b3b',
          unknown: '#8a94a6',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 35, 24, 0.06), 0 1px 8px rgba(15, 35, 24, 0.05)',
      },
    },
  },
  plugins: [],
};
