import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          raised: "var(--bg-raised)",
          subtle: "var(--bg-subtle)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          dim: "var(--gold-dim)",
          glow: "var(--gold-glow)",
        },
        diff: {
          add: "var(--diff-add)",
          addBg: "var(--diff-add-bg)",
          remove: "var(--diff-remove)",
          removeBg: "var(--diff-remove-bg)",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
