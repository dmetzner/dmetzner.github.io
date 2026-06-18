/// <reference lib="webworker" />
import { type AllTasks, env, pipeline, TextStreamer } from "@huggingface/transformers";

// pull weights from the HF CDN; cache them in the browser (Cache Storage) so
// return visits skip the download entirely.
env.allowLocalModels = false;
// single-threaded WASM avoids SharedArrayBuffer, which needs COOP/COEP headers
// that a static host (GitHub Pages) can't set. slower, but works everywhere.
if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.numThreads = 1;

// instruct model — swap here to trade size for quality.
// (0.5B is smaller but rambles; 1.5B actually answers properly.)
const MODEL = "onnx-community/Qwen2.5-1.5B-Instruct";

// biome-ignore lint/suspicious/noExplicitAny: transformers.js pipeline is loosely typed
let generator: any = null;

const hasWebGPU = "gpu" in navigator;

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;
  try {
    if (msg.type === "load") {
      if (!generator) {
        generator = await pipeline("text-generation" as keyof AllTasks, MODEL, {
          dtype: hasWebGPU ? "q4f16" : "q4",
          device: hasWebGPU ? "webgpu" : "wasm",
          progress_callback: (p) => self.postMessage({ type: "progress", data: p }),
        });
      }
      self.postMessage({ type: "ready" });
      return;
    }

    if (msg.type === "generate") {
      if (!generator) {
        self.postMessage({ type: "error", error: "model not loaded" });
        return;
      }
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        callback_function: (t: string) => self.postMessage({ type: "token", text: t }),
      });
      const out = await generator(msg.messages, {
        max_new_tokens: 160,
        do_sample: true,
        temperature: 0.4,
        top_p: 0.9,
        repetition_penalty: 1.3, // kills the "Stack We We Build A Stack" loops
        no_repeat_ngram_size: 3,
        streamer,
      });
      const text = out[0].generated_text.at(-1).content as string;
      self.postMessage({ type: "done", text });
    }
  } catch (err) {
    self.postMessage({ type: "error", error: err instanceof Error ? err.message : String(err) });
  }
};
