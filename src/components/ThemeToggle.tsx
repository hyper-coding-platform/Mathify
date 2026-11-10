"use client";

import { useLayoutEffect } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "ssc-theme";

export function ThemeToggle() {
  useLayoutEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") document.documentElement.dataset.theme = saved;
  }, []);

  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
  };

  return <button type="button" className="theme-toggle" onClick={toggle} aria-label="Switch light or dark theme" title="Switch theme">
    <Sun className="theme-icon-light" size={19} aria-hidden="true" />
    <Moon className="theme-icon-dark" size={19} aria-hidden="true" />
    <span className="theme-label-light">Light</span>
    <span className="theme-label-dark">Dark</span>
  </button>;
}
