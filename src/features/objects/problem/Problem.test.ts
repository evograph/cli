import { describe, expect, it } from "vitest";
import { Problem } from "./Problem.js";

describe("Problem", () => {
  const valid = {
    title: "Bug",
    description: "Something broke",
    severity: "high",
  };

  it("validates required fields", () => {
    expect(() => new Problem(valid).validate()).not.toThrow();
  });

  it("rejects missing title, description, or severity", () => {
    expect(() =>
      new Problem({ ...valid, title: " " }).validate(),
    ).toThrow("Problem title is required");
    expect(() =>
      new Problem({ ...valid, description: "" }).validate(),
    ).toThrow("Problem description is required");
    expect(() =>
      new Problem({ ...valid, severity: "  " }).validate(),
    ).toThrow("Problem severity is required");
  });

  it("round-trips through fromJSON", () => {
    const problem = new Problem({ ...valid, context: "prod" });
    const restored = Problem.fromJSON(problem.toJSON());

    expect(restored.type).toBe("problem");
    expect(restored.content).toEqual({ ...valid, context: "prod" });
  });
});
