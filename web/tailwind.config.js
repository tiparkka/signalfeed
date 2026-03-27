/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          dark: "#4f46e5",
        },
        surface: {
          DEFAULT: "#1e293b",
          dark: "#0f172a",
          light: "#334155",
        },
      },
    },
  },
  plugins: [],
};
