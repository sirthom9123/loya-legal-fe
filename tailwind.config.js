/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        vanilla: "#faf8f5",
        cream: "#fffdf8",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        /** Formal serif for wordmark / brand text (law faculty–appropriate) */
        brand: ['"Cormorant Garamond"', "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(20, 83, 45, 0.08), 0 4px 6px -4px rgba(20, 83, 45, 0.06)",
      },
    },
  },
  plugins: [],
};
