/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        primary: '#2563EB',
        positive: '#16A34A',
        negative: '#DC2626',
      },
    },
  },
  plugins: [],
}
