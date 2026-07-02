import { describe, expect, it } from "vitest";
import { EMOJI, sanitizeReaction } from "./reactions";

describe("sanitizeReaction", () => {
  it("accepts a known emoji with a valid x", () => {
    expect(sanitizeReaction({ emoji: "🔥", x: 0.3 })).toEqual({ emoji: "🔥", x: 0.3 });
  });

  it("accepts every emoji in the allow-list", () => {
    for (const emoji of EMOJI) {
      expect(sanitizeReaction({ emoji, x: 0.5 })).toEqual({ emoji, x: 0.5 });
    }
  });

  it("rejects an emoji outside the allow-list", () => {
    expect(sanitizeReaction({ emoji: "💀", x: 0.5 })).toBeNull();
    expect(sanitizeReaction({ emoji: "<script>", x: 0.5 })).toBeNull();
  });

  it("clamps x into [0,1]", () => {
    expect(sanitizeReaction({ emoji: "❤️", x: 5000 })?.x).toBe(1);
    expect(sanitizeReaction({ emoji: "❤️", x: -3 })?.x).toBe(0);
  });

  it("defaults x to 0.5 on NaN / missing", () => {
    expect(sanitizeReaction({ emoji: "🎉", x: "nope" })?.x).toBe(0.5);
    expect(sanitizeReaction({ emoji: "🎉" })?.x).toBe(0.5);
  });

  it("rejects non-object / empty payloads", () => {
    expect(sanitizeReaction(null)).toBeNull();
    expect(sanitizeReaction(undefined)).toBeNull();
    expect(sanitizeReaction("👋")).toBeNull();
    expect(sanitizeReaction({})).toBeNull();
  });
});
