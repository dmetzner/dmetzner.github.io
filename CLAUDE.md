# CLAUDE.md

`daniel.metzner.uk` — single-page dark-neon portfolio with an interactive terminal
("duckshell"). Human-facing description and deploy setup: `README.md`.

## The gate

Run `npm run check` (`tsc -b && biome check . && vitest run`) before reporting done. Biome owns
formatting. Tests cover pure logic only (`snakeEngine`, `url`, config) — don't test
canvas/worker/DOM.

## Invariants

- **Every change goes through a pull request — no direct pushes to `main`.** Merging needs
  three things: the gate green locally, CI green, and an independent review with no unresolved
  high or major finding on the commit that gets merged.
- **A CI job that could not START is not a pass.** An Actions billing block dies instantly with
  no logs and no steps; that is "could not run", and it is said out loud on the PR rather than
  merged past in silence.
- **The only exception is a project Daniel has explicitly called prototyping. This is not one.**
- **All user-facing text/links live in `src/config.ts`** — don't hardcode copy in components.
- **Bilingual is enforced**: every `config.copy.en` key must exist in `de` (`config.test.ts`
  fails otherwise). Translate idiomatically, not 1:1 — German literal-translations read stiff.
- **Fonts are self-hosted** (`src/fonts.css`, `public/fonts/`). Do NOT re-add the Google Fonts
  `<link>` — it leaks visitor IPs to Google.
- **Contact email is assembled at runtime** from `config.emailUser` + `emailHost` (read via
  `config.email`) and copied to clipboard — never a literal `user@host` string or a `mailto:`,
  to deter scrapers. The Impressum is the one allowed exception.
- **Live room (`Room.tsx`/`useRoom.ts`) is opt-in by design.** It must NOT auto-connect on
  load — the connection is the first time a visitor's IP reaches Supabase, so it only opens on
  the explicit "enter the room" click. `supabase-js` is `await import()`-ed inside `join()` so
  it stays a lazy chunk — never top-level import it. `config.room` empty = feature off and zero
  connections.
- **External link hrefs from data (the TIL feed) go through `safeUrl()`** (`src/url.ts`).

## Stack

- React + TypeScript (strict) + Vite, ESM. **npm** (not pnpm). Biome (lint+format), Vitest.
  Versions: `package.json`.
- No CSS framework — hand-rolled `*.css`.
- Local LLM via `@huggingface/transformers` (WebGPU, lazy). Cookieless GoatCounter analytics.
- Deploys to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

## Layout

- `src/config.ts` — EDIT HERE. All personal content: name, links, featured projects, copy
  (en + de), blog feed, analytics toggle. Components read from this.
- `src/Terminal.tsx` — the duckshell CLI: command dispatch + render.
- `src/useAi.ts` / `src/aiWorker.ts` — local-LLM hook + Transformers.js Web Worker.
- `src/Legal.tsx` — Impressum + Datenschutzerklärung modals.

## Gotchas

- **The AI needs WebGPU.** Without it, `ask` shows a graceful "needs WebGPU" message — expected,
  not a bug. WASM is forced single-threaded (`numThreads = 1`); the threaded build needs
  `SharedArrayBuffer` → COOP/COEP headers, **which GitHub Pages cannot set**. Don't add them.
- **The model + ORT wasm are lazy chunks** — only fetched when someone runs `ai`. Never import
  at the top level or the main bundle balloons. `vite.config.ts` excludes transformers from
  `optimizeDeps` on purpose.
- **GoatCounter ignores `localhost`** — "no events in dev" is normal. Off unless
  `config.analytics.goatcounter` is set.
- **Theme has a no-flash bootstrap**: an inline script in `index.html` sets `data-theme` before
  paint. Keep it consistent with `useTheme.ts` (system/light/dark).
- **Root mode** (`sudo su`) sets `data-root` on `<html>` and makes hero text `contentEditable`;
  edits persist to `localStorage` per language. `reset` clears them.
- **Room state is ephemeral** (presence + broadcast, no DB tables) and shares one EU Supabase
  project with the TIL blog's likes.
