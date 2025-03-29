import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "system";

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if there's a theme stored in localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      const storedTheme = window.localStorage.getItem("theme") as Theme | null;
      if (storedTheme) {
        return storedTheme;
      }

      // If no theme is stored, check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }

    // Default to light if localStorage is not available or no preference
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove the current theme class
    root.classList.remove("light", "dark");

    // Add the new theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Save the theme preference to localStorage
    if (window.localStorage) {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return { theme, setTheme };
}

export { useTheme };
