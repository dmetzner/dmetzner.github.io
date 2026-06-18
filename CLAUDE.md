# CLAUDE.md

Day-1 briefing for `daniel.metzner.uk` — a single-page dark-neon portfolio with an
interactive terminal ("duckshell"). Captures the invariants and gotchas that aren't
obvious from any one file. Skim before changing `src/`.

## Stack

- React 18 + TypeScript (strict) + Vite 5, ESM. **npm** (not pnpm).
- Biome 2.x for lint + format. Vitest for unit tests (pure logic only).
- framer-motion for animation. Self-hosted fonts. No CSS framework — hand-rolled `*.css`.
- Local LLM via `@huggingface/transformers` (WebGPU, lazy). Cookieless analytics via GoatCounter.
- Deploys to **GitHub Pages on every push to `main`** (`.github/workflows/deploy.yml`), custom domain.

## Commands

```bash
npm run dev      # vite dev server
npm run build    # tsc -b && vite build  (typecheck is part of the build)
npm run preview  # serve the production build
npm run lint     # biome check .
npm run format   # biome check --write .
npm run test     # vitest run
npm run check    # tsc -b && biome check . && vitest run  — the pre-commit gate
```

## Layout

```
src/
  config.ts        EDIT HERE. all personal content: name, links, featured projects,
                   copy (en + de), blog feed, analytics toggle. Components read from this.
  App.tsx          page shell — hero, project cards, writing feed, footer, root-edit mode
  Terminal.tsx     the duckshell CLI — command dispatch + render
  Snake.tsx        snake component (loop, input, canvas)
  snakeEngine.ts   pure snake logic (no DOM/React) — unit-tested
  Duck.tsx         the rubber-duck mascot SVG
  useAi.ts         local-LLM hook (worker lifecycle, status, progress)
  aiWorker.ts      Transformers.js in a Web Worker — model load + generate
  useLang/useTheme/useTil   hooks (language, theme, TIL blog feed)
  analytics.ts     GoatCounter (cookieless) — no-op unless a code is configured
  Legal.tsx        Impressum + Datenschutzerklärung modals
  url.ts           safeUrl() — link-protocol guard
  *.test.ts        Vitest specs (url, snakeEngine, config parity)
```

## Conventions

- **All user-facing text and links live in `config.ts`.** Don't hardcode copy in components.
- **Bilingual is enforced**: every key in `config.copy.en` must exist in `config.copy.de`
  (`config.test.ts` fails otherwise). Translate idiomatically — don't map English 1:1; German
  literal-translations read stiff.
- Comments explain *why*, not *what*. Well-named identifiers carry the *what*.
- Run `npm run check` before committing. Biome owns formatting — don't hand-format.
- Tests cover **pure logic** (`snakeEngine`, `url`, config invariants). Don't try to test the
  canvas/worker/DOM — keep logic extractable instead.

## Gotchas (load-bearing)

- **The AI needs WebGPU.** On browsers without it, `ask` shows a graceful "needs WebGPU" message —
  that's expected, not a bug. WASM is forced single-threaded (`numThreads = 1`) because the
  threaded build needs `SharedArrayBuffer` → COOP/COEP headers, **which GitHub Pages cannot set**.
  Don't "fix" it by adding those headers; they'd break other cross-origin fetches.
- **The model + 21 MB ORT wasm are lazy chunks** — only fetched when someone runs `ai`. They must
  never be imported at the top level, or the main bundle (~94 KB gzip) balloons. `vite.config.ts`
  excludes transformers from `optimizeDeps` on purpose.
- **Fonts are self-hosted** (`src/fonts.css`, `public/fonts/`). Do NOT re-add the Google Fonts
  `<link>` — it leaks visitor IPs to Google (the whole reason they were localized).
- **GoatCounter silently ignores `localhost`** — analytics only counts on the live domain, so
  "no events in dev" is normal. It's also off entirely unless `config.analytics.goatcounter` is set.
- **Theme has a no-flash bootstrap**: an inline script in `index.html` sets `data-theme` before
  paint. Keep it consistent with `useTheme.ts` (3 states: system/light/dark).
- **Root mode** (`sudo su` in the CLI) sets `data-root` on `<html>` (red accent) and makes hero
  text `contentEditable`; edits persist to `localStorage` per language. `reset` clears them.
- External link hrefs that come from data (the TIL feed) go through `safeUrl()` — keep it that way.
```
