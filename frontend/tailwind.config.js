/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0b0f14',
          900: '#111720',
          850: '#161e2a',
          800: '#1c2534',
          700: '#2b3749',
          600: '#42526b',
        },
        brand: {
          copper: '#c88242',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
