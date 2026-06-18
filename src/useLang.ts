import { useEffect, useState } from "react";
import type { Lang } from "./config";

const KEY = "lang";

function initialLang(): Lang {
  const saved = localStorage.getItem(KEY);
  if (saved === "en" || saved === "de") return saved;
  // first visit: honour the browser's preferred language
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

// Persisted EN/DE language choice. Updates <html lang> for accessibility/SEO.
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return [lang, setLang];
}
