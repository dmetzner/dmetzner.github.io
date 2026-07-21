import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { initAnalytics } from "./analytics";
import { BrandsSlider, CatrowebSlider } from "./CardDemos";
import { config, type FeaturedProject, type Lang } from "./config";
import { Duck } from "./Duck";
import Legal, { type LegalKind } from "./Legal";
import Room from "./Room";
import Terminal from "./Terminal";
import { useLang } from "./useLang";
import { useTheme } from "./useTheme";
import { useTil } from "./useTil";
import "./App.css";

const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
const SystemIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

// brand marks (Simple Icons, CC0) — referential use for linking to own profiles
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);
const CoffeeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
    <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M8 2v2M12 2v2" />
  </svg>
);

// niceshops smiley — recolorable via currentColor (mirrors the original brand SVG)
const NiceshopsLogo = () => (
  <svg viewBox="0 0 52.437 56.654" fill="currentColor" role="img" aria-label="niceshops">
    <g transform="translate(-201.129 -214.732)">
      <circle cx="2.387" cy="2.387" r="2.387" transform="translate(217.014 237.509)" />
      <circle
        cx="2.387"
        cy="2.387"
        r="2.387"
        transform="matrix(0.967,-0.253,0.253,0.967,234.419,233.236)"
      />
      <path d="M236.9,270.332a28.028,28.028,0,0,1-34.8-19.843,28.436,28.436,0,0,1,20.179-34.734c6.924-1.855,13.179-1.206,20.284,2.1a1.162,1.162,0,0,1,.594,1.414l-.027.068-.251.544a1.1,1.1,0,0,1-1.56.468c-6.3-3.038-11.967-3.643-18.328-1.939a25.681,25.681,0,0,0-18.23,31.361,25.471,25.471,0,0,0,46.267,6.731,1.154,1.154,0,0,1,.793-.542,1,1,0,0,1,.8.208l.468.33a1.041,1.041,0,0,1,.336,1.424A27.236,27.236,0,0,1,236.9,270.332Z" />
      <path
        d="M232.793,231.237l-1.434-.441a.715.715,0,0,0-.839.5,11.5,11.5,0,0,1-7.528,6.638h0l-.037.01h0a11.5,11.5,0,0,1-9.838-1.983.714.714,0,0,0-.975-.01l-1.02,1.1a.572.572,0,0,0,0,.849,14.061,14.061,0,0,0,22.1-5.919A.571.571,0,0,0,232.793,231.237Z"
        transform="translate(9.238 15.129)"
      />
    </g>
  </svg>
);

// Reveal a section on scroll: adds `.in-view` once it crosses into the viewport,
// then disconnects (once-only, matching the old framer `viewport={{ once: true }}`).
// Children carry the CSS fade-up and stagger (via --i); the class just triggers it.
// Callback ref (not useRef+useEffect): sections like "writing" mount late, once an
// async fetch populates them, so the observer must attach whenever the node shows
// up — not just once after the first render, or a late-mounting section never
// gets `.in-view` and its .fade-up children stay opacity:0 forever.
function useInView<T extends HTMLElement>() {
  const cleanup = useRef<() => void>(() => {});
  return useCallback((el: T | null) => {
    cleanup.current();
    if (!el) return;
    // No IntersectionObserver (old browsers, jsdom) → reveal immediately.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in-view");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            io.disconnect();
          }
        }
      },
      { rootMargin: "-80px" },
    );
    io.observe(el);
    cleanup.current = () => io.disconnect();
  }, []);
}

// Copies the runtime-assembled email to the clipboard with brief feedback.
// We never render a mailto: link (and never expose the address in an
// aria-label/title), so harvesters can't scrape it from the DOM.
function CopyEmailButton({
  className,
  idleLabel,
  copiedLabel,
  icon,
}: {
  className?: string;
  idleLabel: string;
  copiedLabel: string;
  icon?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(config.email).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => {},
    );
  };
  return (
    <button
      type="button"
      className={className}
      onClick={copy}
      aria-label="copy email address to clipboard"
    >
      {icon}
      {copied ? copiedLabel : idleLabel}
    </button>
  );
}

// the profile portrait, but a flippable coin: tap to spin it on its Y-axis;
// the reverse side is the rubber duck (an easter egg). Each call site renders
// its own instance with independent flip state.
function Coin() {
  // +540° per tap = 1.5 turns, so it always lands on the opposite face with a
  // satisfying coin-toss spin (180° would also alternate, but reads as a flip).
  const [deg, setDeg] = useState(0);
  return (
    <button
      type="button"
      className="coin"
      style={{ transform: `rotateY(${deg}deg)` }}
      onClick={() => setDeg((d) => d + 540)}
      aria-label="flip the coin"
      title="flip me"
    >
      <span className="coin-face coin-front">
        <img src="/avatar.webp" alt="Daniel Metzner" width={120} height={120} />
      </span>
      <span className="coin-face coin-back" aria-hidden="true">
        <span className="coin-back-inner">
          <Duck className="coin-duck" />
        </span>
      </span>
    </button>
  );
}

// a little duckling that waddles along — legs step, body rocks (comic style)
const WalkingDuck = () => (
  <svg className="wduck" viewBox="0 0 64 62" aria-hidden="true">
    <defs>
      <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe15c" />
        <stop offset="1" stopColor="#f6b400" />
      </linearGradient>
    </defs>
    <g className="wd-leg wd-leg1">
      <rect x="21" y="43" width="3.6" height="12" rx="1.8" fill="#ef8b1f" />
      <path d="M16 55 H27 L24.5 59 H18.5 Z" fill="#ef8b1f" />
    </g>
    <g className="wd-leg wd-leg2">
      <rect x="32" y="43" width="3.6" height="12" rx="1.8" fill="#ef8b1f" />
      <path d="M27 55 H38 L35.5 59 H29.5 Z" fill="#ef8b1f" />
    </g>
    <g className="wd-body">
      <path d="M11 30 L2 25 L5 38 Z" fill="url(#wd)" />
      <ellipse cx="26" cy="33" rx="18" ry="13" fill="url(#wd)" />
      <circle cx="45" cy="19" r="11" fill="url(#wd)" />
      <path d="M54 15 H64 L60 22 H54 Z" fill="#ef8b1f" />
      <circle cx="47" cy="16" r="2" fill="#0a0a0f" />
      <path
        d="M18 32 q8 7 17 1"
        fill="none"
        stroke="#b97f0a"
        strokeOpacity="0.4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

function FeaturedCard({ project, i, lang }: { project: FeaturedProject; i: number; lang: Lang }) {
  // --i drives the CSS stagger delay; hover lift + fade-up now live in App.css.
  const style = {
    "--i": i,
    ...(project.accent ? { "--card-accent": project.accent } : {}),
  } as React.CSSProperties;
  // The card is a container, not a single <a>: the interactive demos below
  // contain real <button>s, which can't legally nest inside an anchor. Instead a
  // full-bleed overlay link (.card-link) makes the whole card clickable, while
  // the demo sits above it and swallows its own clicks. Keyboard users still
  // reach the link (it's focusable); the demo buttons come after it in tab order.
  return (
    <div className="card fade-up" style={style}>
      <a className="card-link" href={project.url} target="_blank" rel="noreferrer">
        <span className="sr-only">{project.name} ↗</span>
      </a>
      <div className="card-top">
        <span className="card-name-wrap">
          {project.logo === "niceshops" && (
            <span className="card-logo">
              <NiceshopsLogo />
            </span>
          )}
          {project.logo === "catrobat" && (
            <img className="card-logo-img" src="/catrobat.svg" alt="" aria-hidden="true" />
          )}
          <span className="card-name">{project.name}</span>
        </span>
        <span className="card-arrow">↗</span>
      </div>
      <p className="card-desc">{project.description[lang]}</p>
      {project.demo === "catrobat" && <CatrowebSlider lang={lang} />}
      {project.demo === "niceshops" && <BrandsSlider lang={lang} />}
      <div className="card-meta">
        {project.language && (
          <span className="tag">
            <i className="dot" /> {project.language}
          </span>
        )}
        {project.tags?.map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

type Edits = Partial<Record<Lang, Record<string, string>>>;

function loadEdits(): Edits {
  try {
    return JSON.parse(localStorage.getItem("edits") ?? "{}");
  } catch {
    return {};
  }
}

export default function App() {
  const [lang, setLang] = useLang();
  const [themePref, , cycleTheme, setThemePref] = useTheme();
  const til = useTil();
  const t = config.copy[lang];

  // ── root mode: locally-persisted, editable page text ──
  const [root, setRoot] = useState(false);
  const [edits, setEdits] = useState<Edits>(loadEdits);
  const [legal, setLegal] = useState<LegalKind>(null);

  // scroll-reveal refs (one per below-the-fold section)
  const projectsRef = useInView<HTMLElement>();
  const writingRef = useInView<HTMLElement>();
  const playgroundRef = useInView<HTMLElement>();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (root) document.documentElement.dataset.root = "";
    else delete document.documentElement.dataset.root;
  }, [root]);

  const val = (key: string, fallback: string) => edits[lang]?.[key] ?? fallback;

  const saveEdit = (key: string, text: string) => {
    const v = text.replace(/\s+/g, " ").trim();
    setEdits((prev) => {
      const forLang = { ...(prev[lang] ?? {}) };
      if (v) forLang[key] = v;
      else delete forLang[key];
      const next = { ...prev, [lang]: forLang };
      localStorage.setItem("edits", JSON.stringify(next));
      return next;
    });
  };

  const resetEdits = () => {
    setEdits({});
    localStorage.removeItem("edits");
  };

  // props that turn an element into an inline editor while root is active
  const ed = (key: string) =>
    root
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
          spellCheck: false,
          onBlur: (e: React.FocusEvent<HTMLElement>) =>
            saveEdit(key, e.currentTarget.textContent ?? ""),
        }
      : {};

  const dateFmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "de" ? "de-AT" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const themeIcon =
    themePref === "system" ? <SystemIcon /> : themePref === "light" ? <SunIcon /> : <MoonIcon />;

  return (
    <main className="wrap">
      {/* ── CONTROLS: theme + language ── */}
      <div className="controls">
        {root && (
          <span className="root-badge mono" title="root mode — text is editable">
            ● root
          </span>
        )}
        <button
          type="button"
          className="theme-btn"
          onClick={cycleTheme}
          aria-label={`theme: ${themePref} (click to change)`}
          title={`theme: ${themePref}`}
        >
          {themeIcon}
        </button>
        {/* biome-ignore lint/a11y/useSemanticElements: a styled segmented toggle, not a form fieldset */}
        <div className="lang-toggle mono" role="group" aria-label="language">
          <button
            type="button"
            className={lang === "en" ? "on" : ""}
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <span aria-hidden>/</span>
          <button
            type="button"
            className={lang === "de" ? "on" : ""}
            aria-pressed={lang === "de"}
            onClick={() => setLang("de")}
          >
            DE
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="status fade-up fade-load" style={{ "--i": 0 } as React.CSSProperties}>
          <i className="status-dot" />
          <span className="mono">{t.status}</span>
        </div>

        <h1 className="name fade-up fade-load" style={{ "--i": 1 } as React.CSSProperties}>
          <span className={`line${root ? " editable" : ""}`} {...ed("name1")}>
            {val("name1", "DANIEL")}
          </span>
          <span className={`line glow${root ? " editable" : ""}`} {...ed("name2")}>
            {val("name2", "METZNER")}
          </span>
          {/* mobile-only portrait: anchored to the name so it tracks the
              vertically-centered hero content (a fixed offset would float
              too high on tall screens). The desktop copy lives in .hero-bio;
              exactly one is ever shown (the other is display:none). */}
          <span className="avatar avatar-m">
            <Coin />
          </span>
        </h1>

        <p className="role mono fade-up fade-load" style={{ "--i": 2 } as React.CSSProperties}>
          &gt;{" "}
          {/* split on " · " so each segment (e.g. "Dipl.-Ing.") sits on its own
              line — avoids ugly mid-word wraps on narrow screens. In root mode we
              render the raw string so contentEditable round-trips the separator. */}
          <span className={`role-text${root ? " editable" : ""}`} {...ed("role")}>
            {root
              ? val("role", t.role)
              : val("role", t.role)
                  .split(" · ")
                  .flatMap((part, i, arr) => {
                    const seg = (
                      <span className="role-line" key={part}>
                        {part}
                      </span>
                    );
                    // " ·" glues the dot to the preceding segment; the
                    // trailing normal space is the only break point, so a wrap
                    // gives "… ·" / "next" rather than a dangling "· next".
                    return i < arr.length - 1
                      ? [seg, <span key={`${part}-sep`}>{" · "}</span>]
                      : [seg];
                  })}
          </span>
          <span className="caret" />
        </p>

        {/* fade-up lives on the children, not this wrapper: a transform on
            .hero-bio would make it the containing block for the absolutely-
            positioned mobile avatar (which must anchor to .hero instead). */}
        <div className="hero-bio">
          <p
            className={`about fade-up fade-load${root ? " editable" : ""}`}
            style={{ "--i": 3 } as React.CSSProperties}
            {...ed("about")}
          >
            {val("about", t.about)}
          </p>
          <span className="avatar fade-up fade-load" style={{ "--i": 3 } as React.CSSProperties}>
            <Coin />
          </span>
        </div>

        <p className="cta-line fade-up fade-load" style={{ "--i": 4 } as React.CSSProperties}>
          {t.cta}
        </p>

        <div className="cta fade-up fade-load" style={{ "--i": 5 } as React.CSSProperties}>
          <a className="btn primary" href={config.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a
            className="btn"
            href={`https://github.com/${config.githubUser}`}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <CopyEmailButton className="btn ghost" idleLabel="Email" copiedLabel={t.copied} />
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className="projects reveal" ref={projectsRef}>
        <h2 className="section-title fade-up" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="section-idx mono">01</span> {t.projectsTitle}
        </h2>
        {t.projectsSub && (
          <p className="section-sub fade-up" style={{ "--i": 1 } as React.CSSProperties}>
            {t.projectsSub}
          </p>
        )}

        <div className={`grid${config.featured.length === 1 ? " grid-single" : ""}`}>
          {config.featured.map((p, i) => (
            <FeaturedCard project={p} i={i} lang={lang} key={p.name} />
          ))}
        </div>
      </section>

      {/* ── WRITING (latest TIL notes) ── */}
      {til.posts.length > 0 && (
        <section className="writing reveal" ref={writingRef}>
          <h2 className="section-title fade-up" style={{ "--i": 0 } as React.CSSProperties}>
            <span className="section-idx mono">02</span> {t.writingTitle}
          </h2>
          {t.writingSub && (
            <p className="section-sub fade-up" style={{ "--i": 1 } as React.CSSProperties}>
              {/* linkify the bare "til.metzner.uk" mention → the blog */}
              {t.writingSub.split("til.metzner.uk").flatMap((part, i) =>
                i === 0
                  ? [part]
                  : [
                      <a key="til" href={config.blog.url} target="_blank" rel="noreferrer">
                        til.metzner.uk
                      </a>,
                      part,
                    ],
              )}
            </p>
          )}
          <ul className="til-list">
            {til.posts.map((p, i) => (
              <li
                className="til-item fade-up"
                style={{ "--i": i } as React.CSSProperties}
                key={p.url}
              >
                <a href={p.url} target="_blank" rel="noreferrer">
                  <span className="til-date mono">{dateFmt(p.pubDate)}</span>
                  <span className="til-title">{p.title}</span>
                  <span className="til-desc">{p.description}</span>
                  {p.tags.length > 0 && (
                    <span className="til-tags mono">
                      {p.tags.slice(0, 3).map((tg) => (
                        <span className="til-tag" key={tg}>
                          {tg}
                        </span>
                      ))}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <a className="til-all mono" href={config.blog.url} target="_blank" rel="noreferrer">
            {t.writingAll}
          </a>
        </section>
      )}

      {/* ── PLAYGROUND (interactive CLI) — kept last; it's a toy, not the pitch ── */}
      <section className="playground reveal" ref={playgroundRef}>
        <h2 className="section-title fade-up" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="section-idx mono">03</span> Playground
        </h2>
        <div className="fade-up" style={{ "--i": 1 } as React.CSSProperties}>
          <Terminal
            lang={lang}
            setLang={setLang}
            themePref={themePref}
            setTheme={setThemePref}
            root={root}
            setRoot={setRoot}
            onResetEdits={resetEdits}
          />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        {/* a duckling waddles across the footer line now and then */}
        <span className="footer-water" aria-hidden>
          <span className="footer-duck">
            <WalkingDuck />
          </span>
        </span>
        <div className="footer-links mono">
          <a href={config.linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon /> linkedin
          </a>
          <a href={`https://github.com/${config.githubUser}`} target="_blank" rel="noreferrer">
            <GitHubIcon /> github
          </a>
          <CopyEmailButton idleLabel="email" copiedLabel={t.copied} icon={<MailIcon />} />
          <a href={config.buymeacoffee} target="_blank" rel="noreferrer">
            <CoffeeIcon /> coffee
          </a>
        </div>
        <div className="footer-legal mono">
          <button type="button" onClick={() => setLegal("impressum")}>
            {t.impressum}
          </button>
          <span aria-hidden>·</span>
          <button type="button" onClick={() => setLegal("privacy")}>
            {t.privacy}
          </button>
        </div>
        <p className="footer-note mono">
          © {config.name.toLowerCase()} · {t.footer}
        </p>
      </footer>

      <Legal kind={legal} lang={lang} onClose={() => setLegal(null)} />
      <Room lang={lang} />
    </main>
  );
}
