// Shared reaction constants + receive-side validation for the live room.
// Both the UI (Room.tsx, which renders the send buttons) and the hook
// (useRoom.ts, which sanitizes inbound broadcasts) import from here so the
// allow-list has a single source of truth.

// On-brand: the rubber duck rides along with the usual reactions.
export const EMOJI = ["👋", "❤️", "🎉", "🔥", "🦆"] as const;

// The Supabase anon key ships in the public bundle by design, so anyone can
// broadcast arbitrary payloads to the channel. Never trust an inbound payload:
// accept only a known emoji and a clamped x, or reject it outright.
export function sanitizeReaction(payload: unknown): { emoji: string; x: number } | null {
  if (typeof payload !== "object" || payload === null) return null;
  const { emoji, x } = payload as { emoji?: unknown; x?: unknown };
  if (typeof emoji !== "string" || !(EMOJI as readonly string[]).includes(emoji)) return null;
  // Clamp x into [0,1] (the viewport-width fraction); default to center on NaN
  // so a bad value never renders off-canvas.
  const n = Number(x);
  const clampedX = Number.isNaN(n) ? 0.5 : Math.min(1, Math.max(0, n));
  return { emoji, x: clampedX };
}
