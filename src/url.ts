// Only allow safe link protocols. Anything else (javascript:, data:, …) → "#".
// Used on links whose URL comes from external data (e.g. the TIL feed).
export function safeUrl(url: unknown): string {
  if (typeof url !== "string") return "#";
  try {
    const u = new URL(url, "https://daniel.metzner.uk");
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? url : "#";
  } catch {
    return "#";
  }
}
