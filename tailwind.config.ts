import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F3F0EE",
        lifted: "#FCFBFA",
        ink: "#141413",
        charcoal: "#262627",
        slate: "#696969",
        granite: "#555555",
        graphite: "#565656",
        dust: "#D1CDC7",
        signal: "#CF4500",
        "signal-light": "#F37338",
        clay: "#9A3A0A",
        "link-blue": "#3860BE",
        bone: "#F4F4F4",
      },
      fontFamily: {
        sans: ["Sofia Sans", "Arial", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
      },
    },
  },
  plugins: [],
};
export default config;
