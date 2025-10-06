/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indraGreen: "#ABFF73",
        indraPurpleSec: "#A872C0",
        indraPurpleMain: "#2B1B38",
        indraBlue: "#8ECCD9",
        indraPurpleTer: "#755F9D",
      },
    },
  },
  plugins: [],
}
