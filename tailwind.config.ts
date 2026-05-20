import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["var(--font-arabic)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0f172a",
          muted: "#475569",
        },
        parchment: "#faf7f0",
        accent: {
          DEFAULT: "#0d7c66",
          dark: "#075e4d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
