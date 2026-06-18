/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bronze: {
          50: '#F9F7F3',
          100: '#E8DFD3',
          300: '#C9A46A',
          500: '#B08D57',
          700: '#7A5F3A',
          900: '#3D2F1F',
        },
      },
    },
  },
  plugins: [],
}
