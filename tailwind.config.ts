import type { Config } from "tailwindcss";

const config: Config = {
  future: {
    // hover: 变体只在真有悬停能力的设备上生效，触屏不会有"点完粘住"的 hover 态
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#04060A",
        surface: "#0E131C",
        ink: "#E7ECF5",
        muted: "#93A0B4",
        line: "#1C2534",
        accent: "#D4501F",
        "accent-hover": "#E2602C",
      },
      fontFamily: {
        sans: [
          "var(--font-geist)",
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Noto Sans SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        pill: "999px",
      },
      transitionDuration: {
        160: "160ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        move: "cubic-bezier(0.77, 0, 0.175, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
