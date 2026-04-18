import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        canvas: "#F2F2F7",
        ink: "#1C1C1E",
        inkMuted: "#8E8E93",
        hairline: "rgba(60, 60, 67, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
