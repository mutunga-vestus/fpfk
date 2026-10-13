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
          DEFAULT: '#c69239',
          deep: '#916930',
          soft: '#bf9f69',
          light: '#cfae6e',
          dark: '#0a0a0a',
          red: '#a63036',
          'red-dark': '#832126',
          'red-light': '#c2474e',
          secondary: '#cf986e',
          cream: '#ebe4d6',
          paper: '#f5f3ef',
          fg: '#f6f5f4',
          muted: '#aaa6a1',
          border: '#252422',
        },
      },
    },
  },
  plugins: [],
}

