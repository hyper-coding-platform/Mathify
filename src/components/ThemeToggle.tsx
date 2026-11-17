"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
  };

  return <button type="button" className={`theme-toggle ${compact ? "theme-toggle-compact" : ""}`} onClick={toggle} aria-label="Switch light or dark theme" title="Switch theme">
    <Sun className="theme-icon-light" size={19} aria-hidden="true" />
    <Moon className="theme-icon-dark" size={19} aria-hidden="true" />
    <span className="theme-label-light">Light</span>
    <span className="theme-label-dark">Dark</span>
  </button>;
}
