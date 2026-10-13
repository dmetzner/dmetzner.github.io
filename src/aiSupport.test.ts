import { describe, expect, it } from "vitest";
import { aiUnsupported } from "./aiSupport";

const SAFARI_18 =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15";
const SAFARI_26 = SAFARI_18.replace("Version/18.5", "Version/26.0");
const IOS_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1 Version/17.5";
const CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

describe("aiUnsupported", () => {
  it("blocks Safari below 26 without WebGPU", () => {
    expect(aiUnsupported(SAFARI_18, "Apple Computer, Inc.", false)).toBe(true);
  });
  it("allows old Safari when WebGPU is there", () => {
    expect(aiUnsupported(SAFARI_18, "Apple Computer, Inc.", true)).toBe(false);
  });
  it("allows Safari 26+", () => {
    expect(aiUnsupported(SAFARI_26, "Apple Computer, Inc.", false)).toBe(false);
  });
  it("allows other browsers on Apple vendor strings and non-Safari browsers", () => {
    expect(aiUnsupported(IOS_CHROME, "Apple Computer, Inc.", false)).toBe(false);
    expect(aiUnsupported(CHROME, "Google Inc.", false)).toBe(false);
  });
  it("assumes a modern Safari when the version is missing", () => {
    expect(aiUnsupported("Mozilla/5.0 AppleWebKit Safari/605", "Apple Computer, Inc.", false)).toBe(
      false,
    );
  });
});
