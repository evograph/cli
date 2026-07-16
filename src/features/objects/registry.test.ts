import { describe, expect, it } from "vitest";
import { deserialize } from "./registry.js";
import type { ECSObjectRecord } from "#/kernel/ECSObjectRecord.js";

function record(
  type: string,
  content: unknown,
): ECSObjectRecord {
  return {
    header: { type, schemaVersion: 1 },
    content,
    metadata: { createdAt: "2020-01-01T00:00:00.000Z", version: 1 },
  };
}

describe("deserialize", () => {
  it("deserializes each known object type", () => {
    expect(
      deserialize(record("note", { title: "t", body: "b" })).type,
    ).toBe("note");
    expect(
      deserialize(
        record("problem", {
          title: "t",
          description: "d",
          severity: "low",
        }),
      ).type,
    ).toBe("problem");
    expect(
      deserialize(
        record("decision", {
          title: "t",
          chosen: "c",
          rationale: "r",
          status: "proposed",
        }),
      ).type,
    ).toBe("decision");
    expect(
      deserialize(
        record("edge", { from: "a", to: "b", relation: "solves" }),
      ).type,
    ).toBe("edge");
    expect(
      deserialize(
        record("change", {
          kind: "worktree",
          files: [{ path: "a.ts", status: "M" }],
        }),
      ).type,
    ).toBe("change");
  });

  it("throws for unknown types", () => {
    expect(() => deserialize(record("widget", {}))).toThrow(
      "Unknown object type: widget",
    );
  });
});
