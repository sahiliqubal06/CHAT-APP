import daisyui from "daisyui";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Keeps dark mode class-based
  theme: {
    extend: {},
  },
  plugins: [daisyui],
};
