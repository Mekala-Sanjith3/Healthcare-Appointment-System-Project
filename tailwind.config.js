/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A76D1",
        background: "white",
        card: "white",
        muted: "#f1f5f9",
        input: "#e2e8f0",
      }
    },
  },
  plugins: [],
} 