/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        colors: {
          primary: "#00955f",
          primaryComp: "#00c77f",
          disableCard: "#C8D0CB",
          primaryLight: "#CFF2E5",
          secondary: "#EA3C58",
        },
        screens: {
          'ms': '480px',  // Medium Small
          'md': '768px',  // Medium
          'lg': '1024px', // Large
          'xl': '1280px', // Extra Large
        },
      },
      fontFamily: {
        'harmony': ['HarmonyOS Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
