import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f9f7",
          100: "#d4efe8",
          200: "#aadfce",
          300: "#78c8ad",
          400: "#48ac8e",
          500: "#2f8f73",
          600: "#23735e",
          700: "#1f5c4d",
          800: "#1b493f",
          900: "#173c34"
        },
        ink: "#0d1b1f",
        paper: "#f8fbfb"
      }
    }
  },
  plugins: []
};

export default config;
