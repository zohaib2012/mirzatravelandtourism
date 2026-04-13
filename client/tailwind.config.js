/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0C446F", light: "#1a5a8f", dark: "#08324f" },
        accent: { DEFAULT: "#FAAF43", light: "#fbc06a", dark: "#d99230" },
        deepblue: { DEFAULT: "#034264", light: "#065a8a", dark: "#022e47" },
        success: "#28A745",
        danger: "#DC3545",
        warning: "#FFC107",
        info: "#17A2B8",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        opensans: ["Open Sans", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
