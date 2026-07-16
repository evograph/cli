import { describe, expect, it } from "vitest";
import { hash } from "./hash.js";

describe("hash", () => {
  it("returns the sha256 hex digest of the content", () => {
    expect(hash("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("is deterministic for the same input", () => {
    expect(hash("same")).toBe(hash("same"));
  });
});
