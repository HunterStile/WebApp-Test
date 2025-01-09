/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      boxShadow: { xs: "0 7.9px 7px 0 #2168693f", sm: "0 0 7px 0 #6a64ad19", md: "0 0 26px 0 #637a3066" },
      colors: {
        'dark-green': '#1C4B43', // Colore principale
        'light-green': '#C9EBE5', // Colore derivato più chiaro
        'dark-blue': '#1A2B88', // Colore per convaidated
        'paid-green': '#49A078' // Colore per paid
        },
    },
  },
  plugins: [],
}