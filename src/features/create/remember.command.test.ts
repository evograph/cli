import { useEvolutionFixture } from "#/test/evolution-fixture.js";
import { describe, expect, it } from "vitest";
import path from "node:path";
import { remember } from "./remember.command.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import { GraphRepository } from "#/features/graph/graph.repository.js";

const fixture = useEvolutionFixture();
const repository = new ObjectRepository();

describe("remember", () => {
  it("captures a real decision with two fields and deduplicates retries", () => {
    const first = remember(" Use SQLite ", { because: " Works offline " });
    const again = remember("Use SQLite", { because: "Works offline" });
    expect(first.created).toBe(true);
    expect(again.created).toBe(false);
    expect(again.id).toBe(first.id);
    expect(repository.list()).toHaveLength(1);
    expect(repository.load(first.id).content).toMatchObject({
      chosen: "Use SQLite",
      rationale: "Works offline",
      status: "in-progress",
    });
  });

  it("previews a linked problem without writing any records", () => {
    const preview = remember("Use SQLite", {
      because: "Offline",
      problem: "No network",
      dryRun: true,
    });
    expect(preview.problemId).toHaveLength(64);
    expect(preview.dryRun).toBe(true);
    expect(repository.list()).toEqual([]);
    const saved = remember("Use SQLite", {
      because: "Offline",
      problem: "No network",
    });
    expect(saved.id).toBe(preview.id);
    expect(new GraphRepository().outgoing(saved.id)[0]?.relation).toBe(
      "solves",
    );
  });

  it("validates all inputs before creating an orphan problem or decision", () => {
    const badOptions = [
      { because: " ", problem: "A real issue" },
      { because: "Offline", problem: " ", status: "in-progress" },
      { because: "Offline", problem: "A real issue", status: "wrong" },
      { because: "Offline", problem: "A real issue", commit: "not-a-real-ref" },
      {
        because: "Offline",
        files: [path.resolve(fixture.getRoot(), "../outside")],
      },
      { because: "Offline", supersedes: "../../etc/passwd" },
    ];
    for (const options of badOptions) {
      expect(() => remember("Use SQLite", options)).toThrow();
      expect(repository.list()).toEqual([]);
    }
  });

  it("reuses a problem and preserves the earlier decision when superseding", () => {
    const old = remember("Use SQLite", {
      because: "Single worker",
      problem: "Need storage",
    });
    const replacement = remember("Use Postgres", {
      because: "Multiple workers",
      problemId: old.problemId!,
      supersedes: old.id,
    });
    expect(repository.listByType("problem")).toHaveLength(1);
    expect(repository.load(old.id).type).toBe("decision");
    expect(
      new GraphRepository()
        .outgoing(replacement.id)
        .map((edge) => edge.relation)
        .sort(),
    ).toEqual(["solves", "supersedes"]);
  });
});
