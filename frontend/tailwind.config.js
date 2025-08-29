module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          light: '#93C5FD',
          dark: '#1D4ED8'
        },
        secondary: {
          DEFAULT: '#10B981',
          light: '#6EE7B7',
          dark: '#047857'
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FCA5A5',
          dark: '#B91C1C'
        }
      }
    },
  },
  plugins: [],
}