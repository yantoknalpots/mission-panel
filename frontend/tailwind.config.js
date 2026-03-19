/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: { 0: "#0f0f0f", 1: "#161616", 2: "#1e1e1e", 3: "#272727", 4: "#2e2e2e", hover: "#333" },
        t: { 1: "#efefef", 2: "#a0a0a0", 3: "#666" },
        border: { DEFAULT: "#232323", light: "#2e2e2e" },
        blue: { 1: "#6366f1", 2: "#818cf8" },
        green: { 1: "#22c55e", 2: "#4ade80" },
        amber: { 1: "#f59e0b", 2: "#fbbf24" },
        red: { 1: "#ef4444", 2: "#f87171" },
        purple: { 1: "#a855f7", 2: "#c084fc" },
      },
      fontSize: { "2xs": "0.65rem" },
    },
  },
  plugins: [],
};
