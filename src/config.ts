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
  demo?: "niceshops" | "catrobat"; // optional interactive mini-demo rendered in the card body
};

// A side project — rendered as a small tile under the two featured cards, so the
// hierarchy on the page matches the real one (day job + lead role first).
// `icon` names a file in /public/icons; `blurb` is ONE short line, not a paragraph.
export type SideProject = {
  name: string;
  url: string;
  icon: string; // path under /icons
  accent: string;
  blurb: Record<Lang, string>;
  tag: Record<Lang, string>;
  demo?: "mulatschak";
};

export const config = {
  name: "Daniel Metzner",

  githubUser: "dmetzner",

  // Links.
  linkedin: "https://www.linkedin.com/in/daniel-metzner/",
  buymeacoffee: "https://buymeacoffee.com/metzner",

  // Email is kept split into local-part + host so the full address never
  // appears verbatim in the source, JS bundle, or static HTML — it's only
  // assembled at runtime, which defeats naive address-harvesting bots. Read it
  // through `config.email`; never reintroduce the literal "user@host" string.
  emailUser: "contact",
  emailHost: "metzner.uk",
  get email() {
    return `${this.emailUser}@${this.emailHost}`;
  },

  // The address the LEGAL pages print, which is deliberately not the one above. `config.email`
  // is what a reader is invited to write to (the copy button, the terminal's `contact`); this is
  // a dedicated alias for the imprint and the privacy policy. § 5 ECG requires a contact that
  // WORKS, so it wants to be an address that can be re-pointed or, once harvested, burned
  // without taking the human contact address down with it. Same split-at-runtime treatment.
  legalUser: "legal",
  get legalEmail() {
    return `${this.legalUser}@${this.emailHost}`;
  },

  // FEATURED PROJECTS — hand-picked cards, rendered exactly as written here.
  featured: [
    {
      name: "niceshops",
      url: "https://www.niceshops.com",
      logo: "niceshops",
      accent: "#f2940e",
      demo: "niceshops",
      description: {
        en: "Senior full-stack developer at niceshops — DevOps, backend, frontend. I help ship e-commerce at scale across the whole chain: from marketing to delivery.",
        de: "Senior Full-Stack-Entwickler bei niceshops — DevOps, Backend, Frontend. Ich begleite E-Commerce in großem Maßstab über die ganze Kette: von Marketing bis Delivery.",
      },
      tags: ["Day job", "Full-stack", "Austria"],
    },
    {
      name: "Catroid / Catroweb",
      url: "https://github.com/Catrobat",
      logo: "catrobat",
      demo: "catrobat",
      description: {
        en: "Catrobat's free coding apps for kids — build on your phone with Catroid, share and remix on Catroweb. I support the share platform as a lead developer and product owner.",
        de: "Catrobats kostenlose Programmier-Apps für Kinder: mit Catroid am Handy programmieren, auf Catroweb teilen und remixen. Die Share-Plattform unterstütze ich als Lead Developer und Product Owner.",
      },
      tags: ["Lead dev & PO", "Symfony", "Open source"],
    },
  ] as FeaturedProject[],

  // SIDE PROJECTS — smaller tiles. All four are live; the icons are each app's
  // own mark, copied into /public/icons (never hot-linked from the other sites).
  side: [
    {
      name: "Verso",
      url: "https://verso.metzner.uk",
      icon: "/icons/verso.svg",
      accent: "#9c2f2b",
      blurb: {
        en: "Scan a book before you buy it — is it already on your shelf?",
        de: "Buch scannen, bevor du es kaufst — steht es schon im Regal?",
      },
      tag: { en: "SvelteKit · PWA", de: "SvelteKit · PWA" },
    },
    {
      name: "Tempo",
      url: "https://tempo.metzner.uk",
      icon: "/icons/tempo.svg",
      accent: "#3f86e8",
      blurb: {
        en: "A training log that stays on your device. No feed, no ads.",
        de: "Trainingstagebuch, das am Gerät bleibt. Kein Feed, keine Werbung.",
      },
      tag: { en: "Local-first", de: "Local-first" },
    },
    {
      name: "Mulatschak",
      url: "https://mulatschak.metzner.uk",
      icon: "/icons/mulatschak.png",
      accent: "#c2410c",
      blurb: {
        en: "The Austrian card game — in the browser and on Android, free.",
        de: "Das österreichische Kartenspiel — im Browser und auf Android, gratis.",
      },
      tag: { en: "TypeScript", de: "TypeScript" },
      demo: "mulatschak",
    },
    {
      name: "Overhead",
      url: "https://overhead.metzner.uk",
      icon: "/icons/overhead.svg",
      accent: "#6366f1",
      blurb: {
        en: "Send the request headers you choose — per URL, local only.",
        de: "Genau die Request-Header senden, die du willst — pro URL, rein lokal.",
      },
      tag: { en: "Extension", de: "Erweiterung" },
    },
  ] as SideProject[],

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

  // Live "room" — opt-in presence + emoji reactions shared between visitors who
  // are on the page at the same time. Realtime is impossible on static GitHub
  // Pages, so it rides a Supabase Realtime channel (broadcast + presence only —
  // no database rows, nothing persisted). Both values empty = feature OFF and no
  // connection is ever made. The anon key is public by design (RLS-safe: there
  // are no tables to reach); paste a project from an EU region for clean GDPR.
  // Privacy is preserved by *opt-in*: the browser connects (and only then sends
  // an IP to Supabase) when the visitor clicks "enter the room" — never on load.
  room: {
    url: "https://ivvjxeirjofilyrhnkuu.supabase.co",
    anonKey: "sb_publishable_GvyuwPa9pPDx1yjSzwU4IA_Ny-V_jBc",
  },

  // ── ALL TRANSLATABLE COPY ──────────────────────────────────
  // Add or tweak wording per language. `de` = German, `en` = English.
  copy: {
    en: {
      status: "based in austria",
      role: "Full-stack Developer",
      about:
        "Solving problems is what I enjoy most — from the database up to the interface. " +
        "Security and open source matter to me, and I like passing on what I know. " +
        "When I’m not with my family or coding, you’ll usually find me doing sport.",
      cta: "Got an idea? Let’s hear it.",
      copied: "copied ✓",
      projectsTitle: "Currently working on",
      projectsSub: "",
      sideTitle: "Side projects",
      writingTitle: "Writing",
      writingSub: "Latest from my Today I Learned blog, til.metzner.uk",
      writingAll: "all posts →",
      footer: "built with react + typescript + claude",
      impressum: "Imprint",
      privacy: "Privacy",
      roomIdle: "live",
      roomTitle: "Live visitors",
      roomBody: "See who else is here right now — and send reactions together.",
      roomJoin: "Join the room",
      roomLeave: "leave",
      roomOnline: "here",
      roomConnecting: "connecting…",
      roomHint: "opt-in · connects only when you join · no cookies, nothing stored",
    },
    de: {
      status: "aus österreich",
      role: "Full-Stack-Entwickler · Dipl.-Ing.",
      about:
        "Probleme zu lösen macht mir einfach Spaß — von der Datenbank bis ins Interface. " +
        "Sicherheit und Open Source liegen mir am Herzen, und ich gebe mein Wissen gern weiter. " +
        "Wenn ich nicht bei der Familie oder am Coden bin, findet man mich meistens beim Sport.",
      cta: "Idee im Kopf? Her damit.",
      copied: "kopiert ✓",
      projectsTitle: "Woran ich gerade arbeite",
      projectsSub: "",
      sideTitle: "Eigene Projekte",
      writingTitle: "Beiträge",
      writingSub: "Das Neueste aus meinem Today-I-Learned-Blog auf til.metzner.uk",
      writingAll: "alle Beiträge →",
      footer: "gebaut mit react + typescript + claude",
      impressum: "Impressum",
      privacy: "Datenschutz",
      roomIdle: "live",
      roomTitle: "Live-Besucher",
      roomBody: "Sieh, wer gerade hier ist — und schickt euch gemeinsam Reaktionen.",
      roomJoin: "Raum betreten",
      roomLeave: "verlassen",
      roomOnline: "hier",
      roomConnecting: "verbinde…",
      roomHint: "freiwillig · verbindet erst beim Beitreten · keine Cookies, nichts gespeichert",
    },
  } satisfies Record<Lang, Record<string, string>>,
};

// ─────────────────────────────────────────────────────────────
//  niceshops brands — the shops & own-labels shown in the card's
//  logo marquee. `path` is relative to niceshops.com; `logo` is a
//  Storyblok CDN base URL (a resize transform is appended at render
//  time). Lifted from the niceshops storefront's own brand slider.
// ─────────────────────────────────────────────────────────────
export type Brand = { name: string; path: string; logo: string };

export const niceshopsBrands: Brand[] = [
  {
    name: "3DJake",
    path: "/shops/3djake",
    logo: "https://a.storyblok.com/f/178467/281x91/1f37d76004/01_logo_3djake_90px.png",
  },
  {
    name: "PURE SKIN FOOD",
    path: "/eigenmarken/pure-skin-food",
    logo: "https://a.storyblok.com/f/178467/281x91/604216ab29/01_logo_psf_90px.png",
  },
  {
    name: "Ecco Verde",
    path: "/shops/ecco-verde",
    logo: "https://a.storyblok.com/f/178467/463x91/209a5e6a8d/logo_eccoverde_90px.png",
  },
  {
    name: "Ayurveda101",
    path: "/shops/ayurveda101",
    logo: "https://a.storyblok.com/f/178467/232x91/49b55437cf/logo_ayurveda101_90px.png",
  },
  {
    name: "Ecosplendo",
    path: "/shops/Ecosplendo",
    logo: "https://a.storyblok.com/f/178467/490x148/3c474eded2/02_logo_ecosplendo_490x148px.png",
  },
  {
    name: "bloomling",
    path: "/shops/bloomling",
    logo: "https://a.storyblok.com/f/178467/229x91/3a6a7409f2/logo_bloomling_90px.png",
  },
  {
    name: "Cosmeterie",
    path: "/shops/cosmeterie",
    logo: "https://a.storyblok.com/f/178467/319x90/9839fc1f62/logo_cosmeterie_90px.png",
  },
  {
    name: "Equus Vitalis",
    path: "/shops/equus-vitalis",
    logo: "https://a.storyblok.com/f/178467/454x91/331d9d2589/logo_equusvitalis_90px.png",
  },
  {
    name: "From Austria",
    path: "/shops/from-austria",
    logo: "https://a.storyblok.com/f/178467/314x91/a48d10bbd0/logo_fromaustria_90px.png",
  },
  {
    name: "Peganto",
    path: "/shops/peganto",
    logo: "https://a.storyblok.com/f/178467/263x91/3e248563cb/logo_peganto_90px.png",
  },
  {
    name: "Babymondino",
    path: "/shops/babymondino",
    logo: "https://a.storyblok.com/f/178467/304x91/2505d5cec5/logo_babymondino_90px.png",
  },
  {
    name: "Geero",
    path: "/eigenmarken/geero",
    logo: "https://a.storyblok.com/f/178467/281x91/7799eb5a47/logo_geero_90px.png",
  },
  {
    name: "Interismo",
    path: "/shops/interismo",
    logo: "https://a.storyblok.com/f/178467/280x91/3312d163f8/logo_interismo_90px.png",
  },
  {
    name: "oh feliz",
    path: "/shops/oh-feliz",
    logo: "https://a.storyblok.com/f/178467/221x91/10d6d9f81f/logo_ohfeliz_90px.png",
  },
  {
    name: "olibetta",
    path: "/shops/olibetta",
    logo: "https://a.storyblok.com/f/178467/486x91/28c33dda8f/logo_olibetta_90px.png",
  },
  {
    name: "Piccantino",
    path: "/shops/piccantino",
    logo: "https://a.storyblok.com/f/178467/359x91/896b2ab00b/logo_piccantino_90px.png",
  },
  {
    name: "playPolis",
    path: "/shops/playpolis",
    logo: "https://a.storyblok.com/f/178467/590x91/5df2891b56/logo_playpolis_90px.png",
  },
  {
    name: "pools.shop",
    path: "/shops/pools-shop",
    logo: "https://a.storyblok.com/f/178467/360x91/7f0d7956bc/logo_poolsshop_90px.png",
  },
  {
    name: "saaza",
    path: "/shops/saaza",
    logo: "https://a.storyblok.com/f/178467/253x91/c990919af8/logo_saaza_90px.png",
  },
  {
    name: "VitalAbo",
    path: "/shops/vitalabo",
    logo: "https://a.storyblok.com/f/178467/399x91/71d295c0e5/logo_vitalabo_90px.png",
  },
  {
    name: "Zoolini",
    path: "/shops/zoolini",
    logo: "https://a.storyblok.com/f/178467/231x90/616b5c8c0f/logo_zoolini_90px.png",
  },
];
