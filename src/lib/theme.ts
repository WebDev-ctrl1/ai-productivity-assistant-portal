import { useEffect, useState } from "react";

const KEY = "wpa.theme";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  // Restore saved preference after mount (SSR-safe).
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  // Keep the <html> class in sync with the chosen theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // ignore storage errors; theme still applies for this session
    }
    setTheme(next);
  };

  return { theme, toggleTheme };
}
