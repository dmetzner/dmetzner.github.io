import { useCallback, useEffect, useState } from "react";
import { type Brand, type Lang, niceshopsBrands } from "./config";
import { safeUrl } from "./url";

// ─────────────────────────────────────────────────────────────
//  Interactive product mini-demos rendered inside the featured
//  cards — no iframes, no screenshots-of-screenshots.
//
//  Each demo sits ABOVE the card's full-bleed overlay link (higher
//  z-index, see App.css). Because that overlay link is a *sibling*
//  with a lower z-index, clicks inside a demo land on the demo's
//  own elements and never reach the card link — so the demos need
//  no click interception of their own.
// ─────────────────────────────────────────────────────────────

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fire a callback the first time the element scrolls into view. We defer the
// Catroweb request until then instead of firing it on page load: the fetch
// reaches a third-party server (leaking the visitor's IP), so — like the live
// room's Supabase connection — it should only happen if the visitor actually
// gets to the projects section. Falls back to firing immediately where there's
// no IntersectionObserver (old browsers, jsdom).
function useInViewOnce(onView: () => void) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      if (typeof IntersectionObserver === "undefined") {
        onView();
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              onView();
              io.disconnect();
            }
          }
        },
        { rootMargin: "80px" },
      );
      io.observe(el);
    },
    [onView],
  );
}

// ═══════════════════════ CATROBAT ═══════════════════════
// A live slider of the platform's *trending* projects — the real,
// whitelisted community showcase, pulled straight from the Catroweb
// share API (the platform Daniel is lead dev & PO on). CORS is open,
// so the visitor's browser fetches it directly; no backend.

type CwProject = {
  id: string;
  name: string;
  author: string;
  views?: number;
  downloads?: number;
  avif?: string | null;
  webp?: string | null;
};

// How many project tiles are visible at once, and the gutter between them (px).
// The translate math below (and the matching CSS) depend on these two values.
const PER_VIEW = 2;
const GAP = 8;

// Production share API. `attributes` trims the payload to just what the slide
// renders; `category=trending` is the popular-and-approved community feed.
const CW_API =
  "https://share.catrobat.org/api/projects?category=trending&limit=8" +
  "&attributes=id,name,author,views,downloads,screenshot";

// Pick the best-fitting image variant set (card ≈ tile width) and pull the 1x
// URLs. Every field is nullable in the schema, so guard the whole chain.
type VariantSet = { avif_1x?: string | null; webp_1x?: string | null } | null | undefined;
function pickImage(screenshot: unknown): Pick<CwProject, "avif" | "webp"> {
  const s = screenshot as
    | { card?: VariantSet; thumb?: VariantSet; detail?: VariantSet }
    | undefined;
  const set = s?.card ?? s?.detail ?? s?.thumb;
  return { avif: set?.avif_1x ?? null, webp: set?.webp_1x ?? null };
}

function parseProjects(json: unknown): CwProject[] {
  const data = (json as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];
  return data
    .map((raw): CwProject | null => {
      const p = raw as Record<string, unknown>;
      if (typeof p.id !== "string" || typeof p.name !== "string") return null;
      return {
        id: p.id,
        name: p.name,
        author: typeof p.author === "string" ? p.author : "",
        views: typeof p.views === "number" ? p.views : undefined,
        downloads: typeof p.downloads === "number" ? p.downloads : undefined,
        ...pickImage(p.screenshot),
      };
    })
    .filter((p): p is CwProject => p !== null);
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

// module-level cache: survives card re-renders and language toggles so the
// API is hit at most once per page load.
let cwCache: CwProject[] | null = null;

export function CatrowebSlider({ lang }: { lang: Lang }) {
  const [projects, setProjects] = useState<CwProject[] | null>(cwCache);
  const [failed, setFailed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const load = useCallback(() => {
    if (cwCache) {
      setProjects(cwCache);
      return;
    }
    // No custom headers → this stays a CORS "simple request" (no preflight),
    // so the API only needs Access-Control-Allow-Origin on the GET. The
    // endpoint defaults to application/json without an explicit Accept.
    fetch(CW_API)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        const list = parseProjects(json);
        if (list.length === 0) throw new Error("empty");
        cwCache = list;
        setProjects(list);
      })
      .catch(() => setFailed(true));
  }, []);

  const mountRef = useInViewOnce(load);

  // the track scrolls one tile at a time; the last stop leaves PER_VIEW tiles
  // flush against the right edge (no trailing blank space)
  const count = projects?.length ?? 0;
  const maxIdx = Math.max(0, count - PER_VIEW);

  // auto-advance, paused on hover/focus or when the user prefers reduced motion
  useEffect(() => {
    if (maxIdx < 1 || paused || prefersReducedMotion()) return;
    const id = window.setInterval(() => setIdx((i) => (i >= maxIdx ? 0 : i + 1)), 3500);
    return () => clearInterval(id);
  }, [maxIdx, paused]);

  const go = useCallback(
    (dir: number) =>
      setIdx((i) => {
        const n = i + dir;
        if (n < 0) return maxIdx;
        if (n > maxIdx) return 0;
        return n;
      }),
    [maxIdx],
  );

  // failed → render nothing; the card still reads fine with its copy + tags
  if (failed) return null;

  const label = lang === "de" ? "Beliebte Projekte gerade" : "Trending on the platform";
  // one step = one tile width + one gap; tile width is (100% - (n-1) gaps) / n
  const step = `calc((100% - ${(PER_VIEW - 1) * GAP}px) / ${PER_VIEW} + ${GAP}px)`;

  return (
    <div
      className="demo demo-cw"
      ref={mountRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="cw-head">
        <span className="cw-live" aria-hidden="true" />
        <span className="cw-label">{label}</span>
      </div>

      {projects === null ? (
        <div className="cw-viewport">
          <div className="cw-track">
            <div className="cw-slide cw-skeleton" aria-hidden="true" />
            <div className="cw-slide cw-skeleton" aria-hidden="true" />
          </div>
        </div>
      ) : (
        <div className="cw-viewport">
          <div
            className="cw-track"
            style={{ transform: `translateX(calc(${idx} * -1 * ${step}))` }}
          >
            {projects.map((p) => (
              <a
                key={p.id}
                className="cw-slide"
                href={safeUrl(`https://share.catrobat.org/app/project/${p.id}`)}
                target="_blank"
                rel="noreferrer"
              >
                <picture className="cw-img">
                  {p.avif && <source srcSet={p.avif} type="image/avif" />}
                  {p.webp && <source srcSet={p.webp} type="image/webp" />}
                  <img
                    src={p.webp ?? p.avif ?? ""}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.currentTarget.closest(".cw-img") as HTMLElement)?.classList.add(
                        "is-empty",
                      );
                    }}
                  />
                </picture>
                <div className="cw-meta">
                  <span className="cw-name">{p.name}</span>
                  <span className="cw-sub">
                    {p.author && <span className="cw-author">{p.author}</span>}
                    {typeof p.views === "number" && (
                      <span className="cw-stat">▶ {fmt(p.views)}</span>
                    )}
                    {typeof p.downloads === "number" && (
                      <span className="cw-stat">⬇ {fmt(p.downloads)}</span>
                    )}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {maxIdx > 0 && (
            <>
              <button
                type="button"
                className="cw-arrow cw-prev"
                onClick={() => go(-1)}
                aria-label={lang === "de" ? "Vorherige" : "Previous"}
              >
                ‹
              </button>
              <button
                type="button"
                className="cw-arrow cw-next"
                onClick={() => go(1)}
                aria-label={lang === "de" ? "Nächste" : "Next"}
              >
                ›
              </button>
              <div className="cw-dots" aria-hidden="true">
                {Array.from({ length: maxIdx + 1 }, (_, i) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: dots are positional, index IS the identity
                    key={i}
                    className={`cw-dot${i === idx ? " is-on" : ""}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════ NICESHOPS ═══════════════════════
// A continuously scrolling marquee of the shops & own-labels
// niceshops runs — the same brand strip the storefront shows,
// rebuilt here from the brand list in config. Logos load straight
// from the niceshops Storyblok CDN (cross-origin <img> needs no
// CORS). Hover pauses; each logo links to its shop.

// Storyblok resize transform for crisp logos at ~2x the render height.
const brandLogo = (b: Brand) => `${b.logo}/m/240x0`;

export function BrandsSlider({ lang }: { lang: Lang }) {
  // Two back-to-back copies make the -50% marquee loop seamless. The clones
  // (index ≥ N) are kept out of tab order; the marquee is decorative, so the
  // small screen-reader duplication is acceptable.
  const loop = [...niceshopsBrands, ...niceshopsBrands];
  const n = niceshopsBrands.length;
  return (
    <div className="demo demo-brands">
      <div className="brands-head">
        {lang === "de" ? "Shops & Eigenmarken" : "Shops & own brands"}
      </div>
      <div className="brands-viewport">
        <div className="brands-track">
          {loop.map((b, i) => (
            <a
              // biome-ignore lint/suspicious/noArrayIndexKey: intentional 2× duplication, path isn't unique across copies
              key={`${b.path}-${i}`}
              className="brand-tile"
              href={safeUrl(`https://www.niceshops.com${b.path}`)}
              target="_blank"
              rel="noreferrer"
              tabIndex={i >= n ? -1 : undefined}
            >
              <img src={brandLogo(b)} alt="" loading="lazy" decoding="async" />
              <span className="sr-only">{b.name} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
