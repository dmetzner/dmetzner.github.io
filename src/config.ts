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
  email: "contact@metzner.uk",

  // FEATURED PROJECTS — hand-picked cards, rendered exactly as written here.
  featured: [
    {
      name: "Catroid / Catroweb",
      url: "https://github.com/Catrobat",
      logo: "catrobat",
      description: {
        en: "Catrobat's free coding apps for kids — build on your phone with Catroid, share and remix on Catroweb. I'm the lead developer and product owner of the share platform.",
        de: "Catrobats kostenlose Programmier-Apps für Kinder: mit Catroid am Handy programmieren, auf Catroweb teilen und remixen. Die Share-Plattform leite ich als Lead Developer und Product Owner.",
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
      status: "available · based in austria",
      role: "Full-stack Developer",
      about:
        "I build from the database up to the pixels. " +
        "I care about robust, usable systems, open source, software security, and mentoring. " +
        "Off the clock, I’m usually somewhere doing sport.",
      cta: "Got something worth building? Let's talk.",
      projectsTitle: "Currently working on",
      projectsSub: "",
      writingTitle: "Writing",
      writingAll: "all notes →",
      footer: "built with react + typescript + claude",
    },
    de: {
      status: "verfügbar · aus österreich",
      role: "Full-Stack-Entwickler",
      about:
        "Ich baue von der Datenbank bis zu den Pixeln. " +
        "Mir liegen robuste, benutzerfreundliche Systeme, Open Source, Security und Mentoring. " +
        "Nach Feierabend findet man mich beim Sport.",
      cta: "Du baust was Großes und brauchst Verstärkung? Sag Bescheid.",
      projectsTitle: "Woran ich gerade arbeite",
      projectsSub: "",
      writingTitle: "Notizen",
      writingAll: "alle notizen →",
      footer: "gebaut mit react + typescript",
    },
  } satisfies Record<Lang, Record<string, string>>,
};
