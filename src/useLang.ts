import { useEffect, useState } from "react";
import type { Lang } from "./config";

const KEY = "lang";

function initialLang(): Lang {
  // localStorage throws when site data is blocked; an uncaught throw here blanks the page
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {}
  if (saved === "en" || saved === "de") return saved;
  // first visit: honour the browser's preferred language
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

// Persisted EN/DE language choice. Updates <html lang> for accessibility/SEO.
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, lang);
    } catch {}
    document.documentElement.lang = lang;
  }, [lang]);

  return [lang, setLang];
}
