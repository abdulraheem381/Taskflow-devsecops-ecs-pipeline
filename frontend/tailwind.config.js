/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        paper: "#f8fafc",
        accent: "#f97316",
        mist: "#dbeafe",
        pine: "#052e16"
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 25px 80px rgba(15, 23, 42, 0.15)"
      }
    }
  },
  plugins: []
};
