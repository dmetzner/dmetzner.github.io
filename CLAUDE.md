# CLAUDE.md

`daniel.metzner.uk` — single-page dark-neon portfolio with an interactive terminal
("duckshell"). Invariants and gotchas that aren't obvious from any one file. Skim
before changing `src/`.

## Stack

- React 18 + TS (strict) + Vite 5, ESM. **npm** (not pnpm). Biome 2.x (lint+format), Vitest.
- framer-motion. Self-hosted fonts. No CSS framework — hand-rolled `*.css`.
- Local LLM via `@huggingface/transformers` (WebGPU, lazy). Cookieless GoatCounter analytics.
- Deploys to **GitHub Pages on every push to `main`** (`.github/workflows/deploy.yml`), custom domain.

## Commands

```bash
npm run dev      # vite dev server
npm run build    # tsc -b && vite build  (typecheck is part of the build)
npm run check    # tsc -b && biome check . && vitest run  — the pre-commit gate
```

## Layout

```
src/
  config.ts        EDIT HERE. all personal content: name, links, featured projects,
                   copy (en + de), blog feed, analytics toggle. Components read from this.
  App.tsx          page shell — hero, project cards, writing feed, footer, root-edit mode
  Terminal.tsx     the duckshell CLI — command dispatch + render
  Snake.tsx / snakeEngine.ts   snake component + pure logic (engine is unit-tested)
  Duck.tsx         the rubber-duck mascot SVG (unique gradient id per instance via useId)
  useAi.ts / aiWorker.ts       local-LLM hook + Transformers.js Web Worker
  useLang/useTheme/useTil      hooks (language, theme, TIL blog feed)
  analytics.ts     GoatCounter (cookieless) — no-op unless a code is configured
  Legal.tsx        Impressum + Datenschutzerklärung modals
  url.ts           safeUrl() — link-protocol guard
  *.test.ts        Vitest specs (url, snakeEngine, config parity)
```

## Conventions

- **All user-facing text/links live in `config.ts`** — don't hardcode copy in components.
- **Bilingual is enforced**: every `config.copy.en` key must exist in `de` (`config.test.ts`
  fails otherwise). Translate idiomatically, not 1:1 — German literal-translations read stiff.
- Run `npm run check` before committing; Biome owns formatting. Comments explain *why*.
  Tests cover pure logic only (`snakeEngine`, `url`, config) — don't test canvas/worker/DOM.

## Gotchas (load-bearing)

- **The AI needs WebGPU.** Without it, `ask` shows a graceful "needs WebGPU" message — expected,
  not a bug. WASM is forced single-threaded (`numThreads = 1`); the threaded build needs
  `SharedArrayBuffer` → COOP/COEP headers, **which GitHub Pages cannot set**. Don't add them.
- **The model + 21 MB ORT wasm are lazy chunks** — only fetched when someone runs `ai`. Never
  import at the top level or the main bundle balloons. `vite.config.ts` excludes transformers
  from `optimizeDeps` on purpose.
- **Fonts are self-hosted** (`src/fonts.css`, `public/fonts/`). Do NOT re-add the Google Fonts
  `<link>` — it leaks visitor IPs to Google.
- **Contact email is assembled at runtime** from `config.emailUser` + `emailHost` (read via
  `config.email`) and copied to clipboard — never a literal `user@host` string or a `mailto:`,
  to deter scrapers. Don't reintroduce either; the Impressum is the one allowed exception.
- **GoatCounter ignores `localhost`** — "no events in dev" is normal. Off unless
  `config.analytics.goatcounter` is set.
- **Theme has a no-flash bootstrap**: an inline script in `index.html` sets `data-theme` before
  paint. Keep it consistent with `useTheme.ts` (system/light/dark).
- **Root mode** (`sudo su`) sets `data-root` on `<html>` and makes hero text `contentEditable`;
  edits persist to `localStorage` per language. `reset` clears them.
- External link hrefs from data (the TIL feed) go through `safeUrl()` — keep it that way.
- **Live room (`Room.tsx`/`useRoom.ts`) is opt-in by design.** It must NOT auto-connect on
  load — the connection is the first time a visitor's IP reaches Supabase, so it only opens on
  the explicit "enter the room" click (same privacy stance as dropping Google Fonts). `supabase-js`
  is `await import()`-ed inside `join()` so it stays a **lazy chunk** — never top-level import it.
  Room state is ephemeral (presence + broadcast, no DB tables). `config.room` empty = feature off
  and zero connections. Shares one EU Supabase project with the TIL blog's likes.
