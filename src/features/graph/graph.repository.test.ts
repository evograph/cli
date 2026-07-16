import { useEvolutionFixture } from "#/test/evolution-fixture.js";
import { describe, expect, it } from "vitest";
import { Note } from "#/features/objects/note/Note.js";

useEvolutionFixture();

async function loadGraph() {
  const { GraphRepository } = await import("./graph.repository.js");
  return new GraphRepository();
}

async function loadRepo() {
  const { ObjectRepository } = await import(
    "#/features/objects/object.repository.js"
  );
  return new ObjectRepository();
}

describe("GraphRepository", () => {
  it("links nodes, indexes edges, and walks ancestors/descendants", async () => {
    const repo = await loadRepo();
    const graph = await loadGraph();

    const a = repo.save(new Note({ title: "A", body: "a" }));
    const b = repo.save(new Note({ title: "B", body: "b" }));
    const c = repo.save(new Note({ title: "C", body: "c" }));

    const ab = graph.link(a.id, b.id, "relates_to");
    const bc = graph.link(b.id, c.id, "relates_to");

    expect(ab.created).toBe(true);
    expect(graph.outgoing(a.id)).toEqual([
      { edgeId: ab.edgeId, relation: "relates_to", nodeId: b.id },
    ]);
    expect(graph.incoming(c.id)).toEqual([
      { edgeId: bc.edgeId, relation: "relates_to", nodeId: b.id },
    ]);

    expect(graph.neighbors(b.id)).toEqual({
      incoming: [
        { edgeId: ab.edgeId, relation: "relates_to", nodeId: a.id },
      ],
      outgoing: [
        { edgeId: bc.edgeId, relation: "relates_to", nodeId: c.id },
      ],
    });

    expect(graph.descendants(a.id).map((n) => n.nodeId)).toEqual([
      b.id,
      c.id,
    ]);
    expect(graph.ancestors(c.id).map((n) => n.nodeId)).toEqual([
      b.id,
      a.id,
    ]);
  });

  it("skips already-visited nodes when walking cycles", async () => {
    const repo = await loadRepo();
    const graph = await loadGraph();

    const a = repo.save(new Note({ title: "A", body: "a" }));
    const b = repo.save(new Note({ title: "B", body: "b" }));

    graph.link(a.id, b.id, "relates_to");
    graph.link(b.id, a.id, "relates_to");

    expect(graph.descendants(a.id).map((n) => n.nodeId)).toEqual([b.id]);
  });

  it("is idempotent for duplicate edge content", async () => {
    const repo = await loadRepo();
    const graph = await loadGraph();

    const a = repo.save(new Note({ title: "A", body: "a" }));
    const b = repo.save(new Note({ title: "B", body: "b" }));

    const first = graph.link(a.id, b.id, "solves");
    const second = graph.link(a.id, b.id, "solves");

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.edgeId).toBe(first.edgeId);
    expect(graph.outgoing(a.id)).toHaveLength(1);
  });
});
