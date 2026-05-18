/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0b0b12',
          secondary: '#111120',
          tertiary: '#191926',
          card: '#1e1e2e',
          hover: '#27273d',
          input: '#141422',
          border: '#2d2d48',
        },
        brand: {
          blue: '#6366f1',
          amber: '#f59e0b',
          green: '#22c55e',
          red: '#f43f5e',
          purple: '#a78bfa',
          orange: '#fb923c',
          cyan: '#22d3ee',
          yellow: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}
