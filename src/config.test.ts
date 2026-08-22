import { existsSync } from "node:fs";
import { resolve } from "node:path";
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

describe("side projects", () => {
  it("each has a name, url, icon and both-language text", () => {
    for (const p of config.side) {
      expect(p.name).toBeTruthy();
      expect(p.url).toMatch(/^https?:\/\//);
      expect(p.icon, p.name).toMatch(/^\/icons\//);
      // the path shape alone would still pass with the file missing or
      // forgotten in `git add`, and the page would ship broken <img>s
      expect(existsSync(resolve("public", `.${p.icon}`)), p.icon).toBe(true);
      for (const lang of ["en", "de"] as const) {
        expect(p.blurb[lang], `${p.name}.blurb.${lang}`).toBeTruthy();
        expect(p.tag[lang], `${p.name}.tag.${lang}`).toBeTruthy();
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
