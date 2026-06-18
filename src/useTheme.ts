import { useEffect, useState } from "react";

// What the user picked. "system" follows the OS and is the default.
export type ThemePref = "system" | "light" | "dark";
export type Theme = "light" | "dark";

const KEY = "theme";
const ORDER: ThemePref[] = ["system", "light", "dark"];

function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function storedPref(): ThemePref {
  const saved = localStorage.getItem(KEY);
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

// Returns the user's preference, the resolved theme, a cycle() that steps
// system → light → dark → system, and a setter for a specific preference.
// In "system" mode it live-follows the OS.
export function useTheme(): [ThemePref, Theme, () => void, (p: ThemePref) => void] {
  const [pref, setPref] = useState<ThemePref>(storedPref);
  const [resolved, setResolved] = useState<Theme>(() =>
    storedPref() === "system" ? systemTheme() : (storedPref() as Theme),
  );

  useEffect(() => {
    if (pref === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);

    const apply = () => setResolved(pref === "system" ? systemTheme() : pref);
    apply();

    if (pref !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [pref]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  const cycle = () => setPref((p) => ORDER[(ORDER.indexOf(p) + 1) % ORDER.length]);
  return [pref, resolved, cycle, setPref];
}
