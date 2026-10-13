// The AI worker always uses ORT's bundled asyncify runtime (see aiWorker.ts).
// transformers.js deliberately avoids asyncify on Safari < 26 without WebGPU, so
// that combination would download the ~1 GB model and then fail. Refuse it up front.
// Detection mirrors transformers' own isSafariBelow26 (src/env.js).
export function aiUnsupported(userAgent: string, vendor: string, hasWebGPU: boolean): boolean {
  if (hasWebGPU) return false;
  const isSafari =
    vendor.includes("Apple") &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|mercury|brave/i.test(userAgent) &&
    !userAgent.includes("Chrome") &&
    !userAgent.includes("Android");
  const major = Number(userAgent.match(/Version\/(\d+)/)?.[1]);
  return isSafari && major > 0 && major < 26;
}
