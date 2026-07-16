import { describe, expect, it } from "vitest";
import { Decision } from "./Decision.js";

describe("Decision", () => {
  const valid = {
    title: "Pick store",
    chosen: "content-addressed files",
    rationale: "git-friendly",
    status: "successful",
  };

  it("validates required fields", () => {
    expect(() => new Decision(valid).validate()).not.toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() =>
      new Decision({ ...valid, title: "" }).validate(),
    ).toThrow("Decision title is required");
    expect(() =>
      new Decision({ ...valid, chosen: " " }).validate(),
    ).toThrow("Decision 'chosen' option is required");
    expect(() =>
      new Decision({ ...valid, rationale: "" }).validate(),
    ).toThrow("Decision rationale is required");
    expect(() =>
      new Decision({ ...valid, status: "\t" }).validate(),
    ).toThrow("Decision status is required");
  });

  it("round-trips through fromJSON", () => {
    const decision = new Decision({
      ...valid,
      alternatives: ["db", "files"],
    });
    const restored = Decision.fromJSON(decision.toJSON());

    expect(restored.type).toBe("decision");
    expect(restored.content.alternatives).toEqual(["db", "files"]);
  });
});
