import { config } from "./config";

// Cookieless, no-banner analytics via GoatCounter. Off unless a site code is set.
const code = config.analytics.goatcounter;

type GoatCounter = { count?: (opts: { path: string; title?: string; event?: boolean }) => void };

export function initAnalytics() {
  if (!code) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "//gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", `https://${code}.goatcounter.com/count`);
  document.head.appendChild(s); // auto-counts the pageview on load
}

// fire an anonymous usage event (category only — never user-typed text)
export function track(event: string) {
  if (!code) return;
  (window as unknown as { goatcounter?: GoatCounter }).goatcounter?.count?.({
    path: event,
    title: event,
    event: true,
  });
}
