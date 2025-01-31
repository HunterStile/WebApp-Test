/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class', // Add this line to enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      boxShadow: { 
        xs: "0 7.9px 7px 0 #2168693f", 
        sm: "0 0 7px 0 #6a64ad19", 
        md: "0 0 26px 0 #637a3066" 
      },
      colors: {
        // Light mode colors
        'dark-green': '#1C4B43',
        'light-green': '#C9EBE5',
        'dark-blue': '#1A2B88',
        'paid-green': '#49A078',
        
        // Dark mode colors
        'dark-bg': '#121212',
        'dark-card': '#1E1E1E',
        'dark-text': '#E0E0E0',
        'dark-accent': '#2C2C2C',
      },
      spacing: {
        '1024': '1024px',
        '800': '800px',
        '1500': '1500px',
        '900': '900px',
        '1000': '1000px',
        '1600': '1600px',
      },
    },
  },
  plugins: [],
}
