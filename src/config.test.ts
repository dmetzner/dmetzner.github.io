import { describe, expect, it } from "vitest";
import { config } from "./config";

describe("config copy", () => {
  it("has identical keys in en and de (no missing translations)", () => {
    expect(Object.keys(config.copy.en).sort()).toEqual(Object.keys(config.copy.de).sort());
  });

  it("has no empty strings except the optional projectsSub", () => {
    for (const lang of ["en", "de"] as const) {
      for (const [key, value] of Object.entries(config.copy[lang])) {
        if (key === "projectsSub") continue;
        expect(value, `${lang}.${key}`).not.toBe("");
      }
    }
  });
});

describe("featured projects", () => {
  it("each has a name, url and both-language descriptions", () => {
    for (const p of config.featured) {
      expect(p.name).toBeTruthy();
      expect(p.url).toMatch(/^https?:\/\//);
      expect(p.description.en).toBeTruthy();
      expect(p.description.de).toBeTruthy();
    }
  });
});
