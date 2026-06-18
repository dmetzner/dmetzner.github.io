# daniel.metzner.uk — portfolio

Dark-neon single-page portfolio. Vite + React + TS. Live GitHub stats, auto project list, Konami easter egg. Deploys to GitHub Pages on every push to `main`.

## Edit your content

Everything personal lives in **`src/config.ts`** — name, links, featured projects, and all on-page copy in both **English and German** (`copy.en` / `copy.de`). The EN/DE toggle (top-right) is persisted per visitor and defaults to the browser language.

Social/share assets: `public/favicon.svg` (DM monogram) and `public/og.png` (1200×630 card used for link previews). To regenerate the OG card, edit a temporary `og-source.html` and screenshot it at 1200×630.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
```

## Deploy (one-time setup)

1. Create a GitHub repo. For the cleanest URL use the name **`dmetzner.github.io`**.
2. Push this folder to `main`.
3. Repo → **Settings → Pages → Build and deployment → Source = GitHub Actions**.
4. Every push to `main` now builds + deploys automatically.

## Custom domain `daniel.metzner.uk`

`public/CNAME` already contains `daniel.metzner.uk`. At your DNS provider for `metzner.uk` add:

```
Type   Name      Value
CNAME  daniel    dmetzner.github.io.
```

Then GitHub → Settings → Pages → Custom domain → enter `daniel.metzner.uk` → tick **Enforce HTTPS** (after the cert provisions, a few minutes).

## Notes

- GitHub stats use the public REST API (no key). Limit ~60 req/h per visitor IP — fine for a portfolio.
- Stack strip: `config.stack` is hand-curated (the web tech you want to advertise), not GitHub's auto-detected languages.
- Projects: fill `config.featured` to render hand-picked cards linking straight to any repo (incl. org repos). Leave it `[]` to auto-show your most-starred public repos.
