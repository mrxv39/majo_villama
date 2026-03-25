import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#8B7355",
        "accent-dark": "#6B5740",
        bg: "#FAF8F5",
        "bg-warm": "#E8DFD3",
        "accent-green": "#7A8B6F",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
