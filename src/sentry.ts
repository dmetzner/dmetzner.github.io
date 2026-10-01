import * as Sentry from "@sentry/browser";

// Error tracking → GlitchTip (org metzneruk, project "portfolio"). The DSN is a
// public value (safe in the client bundle), so it's inline — no build secret needed.
// Errors only, with noise filters, to stay inside the GlitchTip free-tier budget.
Sentry.init({
  dsn: "https://2d036a3bdb6b4b889a2c643ae4b8f394@app.glitchtip.com/26054",
  tracesSampleRate: 0,
  // v11 replaced sendDefaultPii with dataCollection, and its defaults COLLECT (userInfo: true
  // makes the server infer the visitor IP). Turn the PII categories off explicitly.
  dataCollection: { userInfo: false, cookies: false, httpHeaders: false },
  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error promise rejection captured",
    "AbortError",
    "NetworkError",
    "Failed to fetch",
    "Load failed",
  ],
  denyUrls: [/extension:\/\//, /^chrome:\/\//, /^moz-extension:\/\//, /^safari-extension:\/\//],
  beforeSend(event) {
    // drop noise with no frame from our own bundle (ad-block / extension / 3rd-party)
    const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
    if (frames.length && !frames.some((f) => f.in_app)) return null;
    // anonymize: no user identity, no request headers/cookies
    delete event.user;
    delete event.request;
    return event;
  },
});
