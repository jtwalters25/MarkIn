"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function getInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("markin-theme") as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitial();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("markin-theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`w-8 h-8 rounded-md border border-border text-text-muted hover:text-gold hover:border-gold transition flex items-center justify-center ${className}`}
    >
      {mounted ? (theme === "dark" ? "☼" : "☾") : ""}
    </button>
  );
}
