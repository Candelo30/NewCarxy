/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "kingfisher-daisy": {
          50: "#f9f4ff",
          100: "#f2e6ff",
          200: "#e6d2ff",
          300: "#d3aeff",
          400: "#b87bff",
          500: "#9d49ff",
          600: "#8825f8",
          700: "#7315db",
          800: "#6317b2",
          900: "#52148f",
          950: "#400080",
        },
      },
    },
  },
  plugins: [],
};
