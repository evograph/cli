import { describe, expect, it } from "vitest";
import { Edge } from "./Edge.js";

describe("Edge", () => {
  const valid = {
    from: "aaa",
    to: "bbb",
    relation: "solves" as const,
  };

  it("validates a well-formed edge", () => {
    expect(() => new Edge(valid).validate()).not.toThrow();
  });

  it("requires from and to", () => {
    expect(() =>
      new Edge({ ...valid, from: "  " }).validate(),
    ).toThrow("Edge 'from' id is required");
    expect(() =>
      new Edge({ ...valid, to: "" }).validate(),
    ).toThrow("Edge 'to' id is required");
  });

  it("rejects self-links", () => {
    expect(() =>
      new Edge({ ...valid, from: "same", to: "same" }).validate(),
    ).toThrow("Edge cannot link an object to itself");
  });

  it("rejects unknown relations", () => {
    expect(() =>
      new Edge({
        from: "a",
        to: "b",
        relation: "depends_on" as "solves",
      }).validate(),
    ).toThrow(/Unknown relation 'depends_on'/);
  });

  it("round-trips through fromJSON", () => {
    const edge = new Edge(valid, {
      createdAt: "2020-01-01T00:00:00.000Z",
      version: 1,
    });
    const restored = Edge.fromJSON(edge.toJSON());

    expect(restored.type).toBe("edge");
    expect(restored.content).toEqual(valid);
    expect(restored.metadata.createdAt).toBe("2020-01-01T00:00:00.000Z");
  });
});
