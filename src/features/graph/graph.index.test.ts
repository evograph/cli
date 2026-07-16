import {
  getMockPaths,
  useEvolutionFixture,
} from "#/test/evolution-fixture.js";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

useEvolutionFixture();

async function index() {
  return import("./graph.index.js");
}

describe("graph.index", () => {
  it("indexes outgoing and incoming edges without duplicates", async () => {
    const { indexEdge, getOutgoingEdgeIds, getIncomingEdgeIds } =
      await index();

    indexEdge("edge1", "fromA", "toB");
    indexEdge("edge1", "fromA", "toB");
    indexEdge("edge2", "fromA", "toC");

    expect(getOutgoingEdgeIds("fromA")).toEqual(["edge1", "edge2"]);
    expect(getIncomingEdgeIds("toB")).toEqual(["edge1"]);
    expect(getIncomingEdgeIds("toC")).toEqual(["edge2"]);
    expect(getOutgoingEdgeIds("missing")).toEqual([]);

    expect(
      fs.existsSync(path.join(getMockPaths().INDEX_DIR, "outgoing", "fromA")),
    ).toBe(true);
  });
});
