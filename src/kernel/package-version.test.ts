import { describe, expect, it } from "vitest";
import { getCliVersion } from "./package-version.js";

describe("getCliVersion", () => {
  it("reads version from package.json", () => {
    expect(getCliVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
