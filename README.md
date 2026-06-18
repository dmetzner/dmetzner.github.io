# daniel.metzner.uk — portfolio

Dark-neon single-page portfolio with an interactive terminal. **React 18 + TypeScript + Vite**, bilingual (EN/DE), deployed to **GitHub Pages on every push to `main`** at [daniel.metzner.uk](https://daniel.metzner.uk).

All personal content (name, links, projects, copy in both languages) lives in **`src/config.ts`**. Architecture notes and gotchas are in **CLAUDE.md** — read it before changing `src/`.

```bash
npm install
npm run dev      # vite dev server
npm run build    # -> dist/
npm run check    # tsc + biome + vitest (pre-commit gate)
```

## Deploy

`.github/workflows/deploy.yml` builds and publishes via GitHub Actions on every push to `main` (Settings → Pages → Source = GitHub Actions).

Custom domain: `public/CNAME` holds `daniel.metzner.uk`; DNS has `CNAME daniel → dmetzner.github.io.`, with Enforce HTTPS on.
