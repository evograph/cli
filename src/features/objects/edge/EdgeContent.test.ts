import { describe, expect, it } from "vitest";
import { isRelation, RELATIONS } from "./EdgeContent.js";

describe("EdgeContent", () => {
  it("lists the supported relations", () => {
    expect(RELATIONS).toEqual([
      "solves",
      "informed_by",
      "implemented_by",
      "supersedes",
      "relates_to",
    ]);
  });

  it("accepts known relations", () => {
    for (const relation of RELATIONS) {
      expect(isRelation(relation)).toBe(true);
    }
  });

  it("rejects unknown or differently cased relations", () => {
    expect(isRelation("depends_on")).toBe(false);
    expect(isRelation("Solves")).toBe(false);
    expect(isRelation("")).toBe(false);
  });
});
