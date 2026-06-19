// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE — everything personal lives here.
// ─────────────────────────────────────────────────────────────

export type Lang = "en" | "de";

export type FeaturedProject = {
  name: string;
  url: string;
  // description is per-language
  description: Record<Lang, string>;
  language?: string;
  tags?: string[];
  logo?: "niceshops" | "catrobat"; // optional brand logo rendered on the card
  accent?: string; // optional brand accent colour (hover + logo)
};

export const config = {
  name: "Daniel Metzner",

  githubUser: "dmetzner",

  // Links.
  linkedin: "https://www.linkedin.com/in/daniel-metzner/",

  // Email is kept split into local-part + host so the full address never
  // appears verbatim in the source, JS bundle, or static HTML — it's only
  // assembled at runtime, which defeats naive address-harvesting bots. Read it
  // through `config.email`; never reintroduce the literal "user@host" string.
  emailUser: "contact",
  emailHost: "metzner.uk",
  get email() {
    return `${this.emailUser}@${this.emailHost}`;
  },

  // FEATURED PROJECTS — hand-picked cards, rendered exactly as written here.
  featured: [
    {
      name: "Catroid / Catroweb",
      url: "https://github.com/Catrobat",
      logo: "catrobat",
      description: {
        en: "Catrobat's free coding apps for kids — build on your phone with Catroid, share and remix on Catroweb. I support the share platform as a lead developer and product owner.",
        de: "Catrobats kostenlose Programmier-Apps für Kinder: mit Catroid am Handy programmieren, auf Catroweb teilen und remixen. Die Share-Plattform unterstütze ich als Lead Developer und Product Owner.",
      },
      tags: ["Lead dev & PO", "Symfony", "Open source"],
    },
    {
      name: "niceshops",
      url: "https://www.niceshops.com",
      logo: "niceshops",
      accent: "#f2940e",
      description: {
        en: "I help to build and ship e-commerce at scale at niceshops — from backend services to the storefronts our customers see.",
        de: "Bei niceshops entwickle ich E-Commerce für große Shops — von den Backend-Services bis zu den Storefronts, die unsere Kund:innen sehen.",
      },
      tags: ["Day job", "Full-stack", "Austria"],
    },
  ] as FeaturedProject[],

  // TIL blog — the portfolio fetches `feed` client-side to show the latest notes.
  blog: {
    url: "https://til.metzner.uk",
    feed: "https://til.metzner.uk/posts.json",
  },

  // Cookieless analytics (no banner). Paste your GoatCounter site code here
  // (e.g. "metzner" → https://metzner.goatcounter.com) to switch on both the
  // tracking AND its privacy-policy disclosure. Empty string = analytics off.
  analytics: {
    goatcounter: "metzner",
  },

  // ── ALL TRANSLATABLE COPY ──────────────────────────────────
  // Add or tweak wording per language. `de` = German, `en` = English.
  copy: {
    en: {
      status: "based in austria",
      role: "Full-stack Developer",
      about:
        "I build from the database up to the pixels. " +
        "I care about robust, usable systems, open source, software security, and mentoring. " +
        "Off the clock, I’m usually somewhere doing sport.",
      cta: "Got something worth building? Let's talk.",
      copied: "copied ✓",
      projectsTitle: "Currently working on",
      projectsSub: "",
      writingTitle: "Writing",
      writingSub: "Latest from my Today I Learned blog, til.metzner.uk",
      writingAll: "all posts →",
      footer: "built with react + typescript + claude",
      impressum: "Imprint",
      privacy: "Privacy",
    },
    de: {
      status: "aus österreich",
      role: "Full-Stack-Entwickler · Dipl.-Ing.",
      about:
        "Ich baue von der Datenbank bis zu den Pixeln. " +
        "Mir liegen robuste, benutzerfreundliche Systeme, Open Source, Security und Mentoring. " +
        "Nach Feierabend findet man mich beim Sport.",
      cta: "Lass uns was bauen, das bleibt.",
      copied: "kopiert ✓",
      projectsTitle: "Woran ich gerade arbeite",
      projectsSub: "",
      writingTitle: "Beiträge",
      writingSub: "Neueste aus meinem Today I Learned Blog, til.metzner.uk",
      writingAll: "alle Beiträge →",
      footer: "gebaut mit react + typescript + claude",
      impressum: "Impressum",
      privacy: "Datenschutz",
    },
  } satisfies Record<Lang, Record<string, string>>,
};
