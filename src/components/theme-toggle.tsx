"use client";

/**
 * @file theme-toggle.tsx
 * @description A client-side React component that provides an interactive toggle 
 * to switch between 'light' and 'dark' application themes. It utilizes the HTML5 
 * localStorage API to persist user preference across page reloads and toggles 
 * the 'dark' utility class on the document's root element to trigger Tailwind CSS's 
 * dark mode styles.
 */

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  // State to track whether the active theme is dark mode
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize the theme status based on localStorage or client-side preferences
  useEffect(() => {
    // Access documentElement to verify if dark theme was set
    const theme = localStorage.getItem("theme");
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Determine the active theme state
    const shouldBeDark = theme === "dark" || (!theme && isSystemDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  /**
   * Toggles the theme state, updates the localStorage cache, 
   * and modifies the root HTML class list.
   */
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full bg-secondary/80 hover:bg-secondary border border-border text-foreground transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-500 animate-pulse" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-700 dark:text-indigo-400" />
      )}
    </button>
  );
}
