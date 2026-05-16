"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "dawrem-theme";
const LEGACY_STORAGE_KEY = ["velo", "ure-theme"].join("");
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const value =
    window.localStorage.getItem(STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_STORAGE_KEY);
  return value === "dark" || value === "light" ? value : null;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function commitTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-change-lock");
  void root.offsetHeight;
  applyTheme(theme);
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      root.classList.remove("theme-change-lock");
    });
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });
  const [mounted, setMounted] = useState(false);

  const setTheme = useCallback((nextTheme: Theme) => {
    commitTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  useEffect(() => {
    const initialTheme = storedTheme() ?? systemTheme();
    applyTheme(initialTheme);
    window.localStorage.setItem(STORAGE_KEY, initialTheme);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    const mountTimer = window.setTimeout(() => {
      setThemeState(initialTheme);
      setMounted(true);
    }, 0);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (storedTheme()) return;
      const nextTheme = event.matches ? "dark" : "light";
      commitTheme(nextTheme);
      setThemeState(nextTheme);
    };

    media.addEventListener("change", handleSystemChange);
    return () => {
      window.clearTimeout(mountTimer);
      media.removeEventListener("change", handleSystemChange);
    };
  }, []);

  const value = useMemo(
    () => ({ theme, mounted, setTheme, toggleTheme }),
    [theme, mounted, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
