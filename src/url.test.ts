import { describe, expect, it } from "vitest";
import { safeUrl } from "./url";

describe("safeUrl", () => {
  it("allows http, https and mailto", () => {
    expect(safeUrl("https://til.metzner.uk/posts/x/")).toBe("https://til.metzner.uk/posts/x/");
    expect(safeUrl("http://example.com")).toBe("http://example.com");
    expect(safeUrl("mailto:contact@metzner.uk")).toBe("mailto:contact@metzner.uk");
  });

  it("allows relative URLs (resolved against the site)", () => {
    expect(safeUrl("/posts/hello/")).toBe("/posts/hello/");
  });

  it("blocks javascript: and data: URLs", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("#");
    expect(safeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  it("rejects non-strings and garbage", () => {
    expect(safeUrl(null)).toBe("#");
    expect(safeUrl(undefined)).toBe("#");
    expect(safeUrl(42)).toBe("#");
  });
});
