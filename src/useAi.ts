import { useEffect, useRef, useState } from "react";

export type AiStatus = "idle" | "loading" | "ready" | "generating" | "error";
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type Callbacks = {
  onToken?: (t: string) => void;
  resolve?: (s: string) => void;
  reject?: (e: string) => void;
};

// Drives the local-model web worker: download (cached after), then generate.
export function useAi() {
  const workerRef = useRef<Worker | null>(null);
  const cbRef = useRef<Callbacks>({});
  const [status, setStatus] = useState<AiStatus>("idle");
  const [progress, setProgress] = useState(0);

  function ensureWorker(): Worker {
    if (workerRef.current) return workerRef.current;
    const w = new Worker(new URL("./aiWorker.ts", import.meta.url), { type: "module" });
    const fail = (msg: string) => {
      setStatus("error");
      cbRef.current.reject?.(msg);
    };
    // surface worker-level failures (module load, etc.) that never post a message
    w.onerror = (e) => fail(e.message || "worker failed to load");
    w.onmessageerror = () => fail("worker message error");
    w.onmessage = (e: MessageEvent) => {
      const m = e.data;
      switch (m.type) {
        case "progress":
          if (typeof m.data?.progress === "number") setProgress(Math.round(m.data.progress));
          break;
        case "ready":
          setProgress(100);
          setStatus("ready");
          break;
        case "token":
          cbRef.current.onToken?.(m.text);
          break;
        case "done":
          setStatus("ready");
          cbRef.current.resolve?.(m.text);
          break;
        case "error":
          setStatus("error");
          cbRef.current.reject?.(m.error);
          break;
      }
    };
    workerRef.current = w;
    return w;
  }

  const load = () => {
    if (status === "loading" || status === "ready") return;
    setStatus("loading");
    ensureWorker().postMessage({ type: "load" });
  };

  const generate = (messages: ChatMessage[], onToken?: (t: string) => void) =>
    new Promise<string>((resolve, reject) => {
      setStatus("generating");
      cbRef.current = { onToken, resolve, reject };
      ensureWorker().postMessage({ type: "generate", messages });
    });

  useEffect(() => () => workerRef.current?.terminate(), []);

  return { status, progress, load, generate };
}
