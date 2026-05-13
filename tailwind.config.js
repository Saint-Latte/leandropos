/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f0f0f',
          secondary: '#161616',
          tertiary: '#1c1c1c',
          card: '#222222',
          hover: '#2a2a2a',
          input: '#1a1a1a',
          border: '#2d2d2d',
        },
        brand: {
          blue: '#3b82f6',
          orange: '#f97316',
          green: '#22c55e',
          red: '#ef4444',
          purple: '#a855f7',
          cyan: '#06b6d4',
          yellow: '#eab308',
        },
      },
    },
  },
  plugins: [],
}
