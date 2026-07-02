import { type ReactNode, useEffect, useRef, useState } from "react";
import { track } from "./analytics";
import { config, type Lang } from "./config";
import { Duck } from "./Duck";
import { Snake } from "./Snake";
import { useAi } from "./useAi";
import type { ThemePref } from "./useTheme";

type Line = { id: number; kind: "in" | "out" | "sys"; content: ReactNode };

let _id = 0;
const nextId = () => ++_id;

export default function Terminal({
  lang,
  setLang,
  themePref,
  setTheme,
  root,
  setRoot,
  onResetEdits,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  themePref: ThemePref;
  setTheme: (p: ThemePref) => void;
  root: boolean;
  setRoot: (v: boolean) => void;
  onResetEdits: () => void;
}) {
  const prompt = root ? "root@metzner:~#" : "guest@metzner:~$";
  const [history, setHistory] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [recall, setRecall] = useState<string[]>([]);
  const [, setRecallIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [running, setRunning] = useState(false);
  const [pendingAsk, setPendingAsk] = useState<string | null>(null);
  // on mobile the soft keyboard eats ~90% of the inline terminal, so once the
  // user actually types we promote it to a full-screen sheet (output + input
  // stacked above the keyboard). Desktop never enters this mode.
  const [full, setFull] = useState(false);

  const ai = useAi();
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLButtonElement>(null);

  // poke the duck → it waddles across the bar and back to its spot
  const runDuck = () => {
    if (running || !petRef.current) return;
    const cli = petRef.current.closest(".cli");
    const dist = (cli?.clientWidth ?? 320) - 110;
    petRef.current.style.setProperty("--run-x", `${dist}px`);
    setRunning(true);
  };

  const push = (kind: Line["kind"], content: ReactNode) =>
    setHistory((h) => [...h, { id: nextId(), kind, content }]);

  useEffect(() => {
    bodyRef.current?.scrollTo?.({ top: bodyRef.current.scrollHeight });
  }, [history, playing]);

  // lock background scroll while the full-screen sheet is open
  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [full]);

  const isMobile = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;

  const closeFull = () => {
    setFull(false);
    inputRef.current?.blur();
  };

  function answer(q: string) {
    // one line we keep updating: "thinking…" → streamed tokens → final answer
    const id = nextId();
    setHistory((h) => [...h, { id, kind: "out", content: "🦆 thinking…" }]);
    const update = (content: ReactNode) =>
      setHistory((h) => h.map((l) => (l.id === id ? { ...l, content } : l)));

    let acc = "";
    ai.generate(
      [
        { role: "system", content: systemPrompt(lang) },
        { role: "user", content: q },
      ],
      (tok) => {
        acc += tok;
        update(`🦆 ${acc}`);
      },
    )
      .then((ans) => update(`🦆 ${ans.trim()}`))
      .catch((err) => update(`🦆 model error: ${err}`));
  }

  // once the model finishes downloading, answer whatever was queued
  useEffect(() => {
    if (ai.status === "ready" && pendingAsk) {
      const q = pendingAsk;
      setPendingAsk(null);
      answer(q);
    } else if (ai.status === "error" && pendingAsk) {
      setPendingAsk(null);
      push(
        "out",
        "🦆 couldn't run the model in this browser (needs a WebGPU browser like Chrome).",
      );
      push("sys", "everything else in the shell still works — try `about`, `projects`, `snake`.");
    }
  }, [ai.status]);

  function enterRoot() {
    if (root) {
      push("out", "you are already root.");
      return;
    }
    setRoot(true);
    push("sys", "# root access granted. with great power comes… greater responsibility 😈");
    push("out", "go on — click the name, role or bio and rewrite history. vandalize responsibly.");
    push("sys", "edits save as you type · `exit` when you're done · `reset` to undo your crimes");
  }

  function run(raw: string) {
    const line = raw.trim();
    push("in", `${prompt} ${line}`);
    if (!line) return;
    setRecall((r) => [line, ...r].slice(0, 50));

    const [cmd, ...args] = line.replace(/^\//, "").split(/\s+/);
    const a = args.join(" ").toLowerCase();
    const c = cmd.toLowerCase();

    // command name only (never the typed args), and only a known verb — so
    // free-typed junk can't blow up the analytics path cardinality.
    track(KNOWN_CMDS.has(c) ? `cmd-${c}` : "cmd-unknown");

    switch (c) {
      case "help":
        push(
          "out",
          <div className="cli-help">
            <div>
              <b>about</b> — who I am · <b>whoami</b> — your session
            </div>
            <div>
              <b>projects</b> — what I'm working on
            </div>
            <div>
              <b>theme</b> [system|light|dark] · <b>lang</b> [en|de]
            </div>
            <div>
              <b>ai</b> — load a local model · <b>ask</b> &lt;question&gt; — chat with it 🦆
            </div>
            <div>
              <b>snake</b> — play a round 🐍 · <b>clear</b>
            </div>
          </div>,
        );
        break;
      case "about":
        push("out", config.copy[lang].about);
        break;
      case "whoami":
        whoami();
        break;
      case "projects":
      case "ls":
        for (const p of config.featured) {
          push(
            "out",
            <span>
              <span className="cli-accent">{p.name}</span> — {p.description[lang]}{" "}
              <a href={p.url} target="_blank" rel="noreferrer">
                {p.url.replace(/^https?:\/\//, "")}
              </a>
            </span>,
          );
        }
        break;
      case "theme": {
        const order: ThemePref[] = ["system", "light", "dark"];
        const target: ThemePref =
          a === "light" || a === "dark" || a === "system"
            ? a
            : order[(order.indexOf(themePref) + 1) % order.length];
        setTheme(target);
        push("out", `theme → ${target}`);
        break;
      }
      case "lang":
        if (a === "en" || a === "de") {
          setLang(a);
          push("out", `language → ${a}`);
        } else {
          setLang(lang === "en" ? "de" : "en");
          push("out", "language toggled");
        }
        break;
      case "sudo": {
        if (root) {
          push("out", "you're already root.");
          break;
        }
        const sub = (args[0] ?? "").toLowerCase();
        if (sub === "su" || sub === "-i" || sub === "-s" || sub === "bash") enterRoot();
        else if (!args.length) push("out", "usage: sudo <command> · try `sudo su`");
        else push("out", "guest is not in the sudoers file. This incident will be reported.");
        break;
      }
      case "su":
        enterRoot();
        break;
      case "exit":
      case "logout":
        if (root) {
          setRoot(false);
          push("sys", "dropped root — back to guest. edits saved.");
        } else {
          push("out", "there's no escape 🙂 — you're already a guest");
        }
        break;
      case "reset":
        onResetEdits();
        push("sys", "edits cleared — original text restored.");
        break;
      case "pwd":
        push("out", root ? "/root" : "/home/guest");
        break;
      case "uname":
        push("out", "metznerOS 1.0 · web edition · x86_64");
        break;
      case "date":
        push("out", new Date().toString());
        break;
      case "man":
        push(
          "out",
          args[0]
            ? `no manual entry for ${args[0]} — but \`help\` works.`
            : "what manual page do you want? (try `help`)",
        );
        break;
      case "rm":
        push(
          "out",
          line.includes("-rf") || args.includes("/")
            ? "🧯 nice try. nothing was deleted."
            : "rm: missing operand",
        );
        break;
      case "ai":
        if (ai.status === "ready") push("out", "model already loaded 🦆 — `ask <question>`.");
        else if (ai.status === "loading") push("out", "already downloading… progress top-right ↗");
        else {
          ai.load();
          push("sys", "downloading a tiny local model (~0.5GB, first visit only — cached after).");
          push("sys", "progress shows top-right ↗ · then `ask <question>` to chat.");
        }
        break;
      case "ask":
      case "chat": {
        const q = args.join(" ").trim();
        if (!q) {
          push("out", "ask me something — e.g. `ask what's your stack`");
          break;
        }
        if (ai.status === "ready") {
          answer(q);
        } else if (ai.status === "loading" || ai.status === "generating") {
          setPendingAsk(q);
          push("sys", "model still loading — queued your question, I'll answer once it's ready ↗");
        } else {
          ai.load();
          setPendingAsk(q);
          push("sys", "first question! fetching a small local model (~0.5GB, one-time, cached).");
          push("sys", "watch the progress top-right ↗ — I'll answer automatically when ready.");
        }
        break;
      }
      case "neofetch":
        push(
          "out",
          <div className="cli-fetch">
            <pre className="cli-fetch-art">{"   __\n <(o )___\n  (  ._> /\n   `----'"}</pre>
            <div className="cli-fetch-info">
              <div>
                <span className="cli-accent">guest</span>@metzner
              </div>
              <div>os · metznerOS 1.0 (web)</div>
              <div>shell · metzner-cli</div>
              <div>
                theme · {themePref}
                {root ? " (root)" : ""}
              </div>
              <div>lang · {lang}</div>
              <div>
                res · {window.screen.width}×{window.screen.height}
              </div>
            </div>
          </div>,
        );
        break;
      case "sport":
        push("out", "off the clock: sport. running, cycling, the usual — definitely not coffee.");
        break;
      case "coffee":
        push("out", "Error 418: I'm a teapot ☕ — and I don't even drink coffee. try `sport`.");
        break;
      case "joke":
        push("out", JOKES[Math.floor(Math.random() * JOKES.length)]);
        break;
      case "history":
        if (!recall.length) push("out", "(no history yet)");
        else [...recall].reverse().forEach((h, i) => void push("out", `${i + 1}  ${h}`));
        break;
      case "vim":
      case "nano":
        push("out", "you opened vim. there is no escape. (try `:q`)");
        break;
      case ":q":
      case ":q!":
      case ":wq":
        push("out", "you escaped vim. respect. 🫡");
        break;
      case "cowsay":
      case "ducksay": {
        const msg = args.join(" ") || "quack";
        const top = ` ${"_".repeat(msg.length + 2)}`;
        const bot = ` ${"-".repeat(msg.length + 2)}`;
        const duck = "   \\\n    \\   __\n     <(o )___\n      (  ._> /\n       `---'";
        push("out", <pre className="cli-fetch-art">{`${top}\n< ${msg} >\n${bot}\n${duck}`}</pre>);
        break;
      }
      case "snake":
        push("sys", "starting snake — arrows/wasd to move, esc to quit");
        setPlaying(true);
        break;
      case "clear":
        setHistory([]);
        break;
      case "echo":
        push("out", args.join(" "));
        break;
      default:
        push("out", `command not found: ${cmd} — type \`help\``);
    }
  }

  // whoami shows the *visitor's* own session — like a real terminal would.
  async function whoami() {
    const ua = navigator.userAgent;
    const browser = /edg/i.test(ua)
      ? "Edge"
      : /firefox/i.test(ua)
        ? "Firefox"
        : /chrome/i.test(ua)
          ? "Chrome"
          : /safari/i.test(ua)
            ? "Safari"
            : "a browser";
    const os = /iphone|ipad|ipod/i.test(ua)
      ? "iOS"
      : /android/i.test(ua)
        ? "Android"
        : /mac/i.test(ua)
          ? "macOS"
          : /win/i.test(ua)
            ? "Windows"
            : /linux/i.test(ua)
              ? "Linux"
              : "your OS";
    push(
      "out",
      <span>
        you are <span className="cli-accent">guest</span> — {browser} on {os} · {navigator.language}{" "}
        · {window.screen.width}×{window.screen.height}
      </span>,
    );
    push("sys", "resolving ip …");
    try {
      // bail after 5s so a slow/blocked lookup doesn't hang on "resolving ip …"
      const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(5000) });
      const d = await res.json();
      if (!d || d.success === false || !d.ip) throw new Error("ip");
      const loc = [d.city, d.country_code].filter(Boolean).join(", ");
      const isp = d.connection?.isp || d.connection?.org || "unknown network";
      push(
        "out",
        <span>
          ip <span className="cli-accent">{d.ip}</span>
          {loc ? ` · ${loc}` : ""} · {isp}
        </span>,
      );
      push("sys", "(looked up live via ipwho.is — nothing is stored here)");
    } catch {
      push("out", "ip lookup unavailable — offline or blocked");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" && full) {
      closeFull();
    } else if (e.key === "Enter") {
      run(input);
      setInput("");
      setRecallIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setRecallIdx((i) => {
        const ni = Math.min(i + 1, recall.length - 1);
        if (recall[ni] !== undefined) setInput(recall[ni]);
        return ni;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setRecallIdx((i) => {
        const ni = Math.max(i - 1, -1);
        setInput(ni === -1 ? "" : (recall[ni] ?? ""));
        return ni;
      });
    }
  }

  return (
    <div
      className={`cli${root ? " cli-root" : ""}${full ? " cli-full" : ""}`}
      onClick={() => !playing && inputRef.current?.focus()}
    >
      <div className="cli-bar">
        <span className="cli-dots" aria-hidden>
          <i /> <i /> <i />
        </span>
        <span className="cli-title">
          <button
            ref={petRef}
            type="button"
            className={`cli-pet-btn${running ? " running" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              runDuck();
            }}
            onAnimationEnd={() => setRunning(false)}
            aria-label="poke the duck"
            title="poke me"
          >
            <Duck className="cli-pet" />
          </button>
          duckshell
        </span>
        <span className="cli-hint mono">
          {ai.status === "loading"
            ? `model ${ai.progress}%`
            : ai.status === "ready"
              ? "ai ready 🦆"
              : ai.status === "generating"
                ? "thinking…"
                : ai.status === "error"
                  ? "ai unavailable"
                  : "type help"}
        </span>
        {full && (
          <button
            type="button"
            className="cli-close"
            onClick={(e) => {
              e.stopPropagation();
              closeFull();
            }}
            aria-label="close fullscreen terminal"
            title="close"
          >
            ✕
          </button>
        )}
      </div>

      <div className="cli-body" ref={bodyRef} role="log" aria-live="polite">
        {history.map((l) => (
          <div key={l.id} className={`cli-line cli-${l.kind}`}>
            {l.content}
          </div>
        ))}

        {playing ? (
          <Snake
            onExit={(score) => {
              setPlaying(false);
              push("sys", `snake over — score ${score}. gg.`);
              inputRef.current?.focus();
            }}
          />
        ) : (
          <div className="cli-input-row">
            <span className="cli-prompt">{prompt}</span>
            <input
              ref={inputRef}
              className="cli-input mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => {
                if (!isMobile()) return;
                setFull(true);
                // keep the input above the keyboard once it animates in
                setTimeout(() => inputRef.current?.scrollIntoView({ block: "center" }), 300);
              }}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="terminal input"
            />
          </div>
        )}
      </div>

      {!playing && (
        <div className="cli-chips">
          <span className="cli-chips-label mono">most used</span>
          {["about", "whoami", "ask", "snake", "sudo su"].map((c) => (
            <button
              key={c}
              type="button"
              data-cmd={c}
              className="cli-chip mono"
              onClick={() => {
                run(c);
                inputRef.current?.focus();
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// every verb the dispatch switch handles — keeps analytics paths bounded
const KNOWN_CMDS = new Set([
  "help",
  "about",
  "whoami",
  "projects",
  "ls",
  "theme",
  "lang",
  "sudo",
  "su",
  "exit",
  "logout",
  "reset",
  "pwd",
  "uname",
  "date",
  "man",
  "rm",
  "ai",
  "ask",
  "chat",
  "neofetch",
  "sport",
  "coffee",
  "joke",
  "history",
  "vim",
  "nano",
  ":q",
  ":q!",
  ":wq",
  "cowsay",
  "ducksay",
  "snake",
  "clear",
  "echo",
]);

const JOKES = [
  "there are 10 kinds of people: those who get binary and those who don't.",
  "a SQL query walks into a bar, walks up to two tables and asks: can I join you?",
  "why do programmers prefer dark mode? because light attracts bugs.",
  "it works on my machine ¯\\_(ツ)_/¯",
  "there are only two hard things in CS: cache invalidation, naming things, and off-by-one errors.",
];

// grounds the local model in real facts so it answers as the portfolio's assistant
function systemPrompt(lang: Lang): string {
  const c = config;
  const projects = c.featured.map((p) => `${p.name} — ${p.description.en}`).join("; ");
  return [
    `You are ${c.name}'s portfolio assistant. Answer the visitor's question directly`,
    `in 1-2 short sentences, ${lang === "de" ? "in German" : "in English"}. Do not repeat the question.`,
    `Facts about ${c.name}: ${c.copy.en.about}`,
    `Projects: ${projects}.`,
    `Contact — email ${c.email}, LinkedIn /in/daniel-metzner, GitHub @${c.githubUser}.`,
    "If unknown, say so briefly. Never invent facts.",
  ].join(" ");
}
