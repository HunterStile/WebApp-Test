/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      boxShadow: { xs: "0 7.9px 7px 0 #2168693f", sm: "0 0 7px 0 #6a64ad19", md: "0 0 26px 0 #637a3066" },
    },
  },
  plugins: [],
}