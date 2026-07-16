import {
  getMockPaths,
  useEvolutionFixture,
} from "#/test/evolution-fixture.js";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Note } from "#/features/objects/note/Note.js";
import { Problem } from "#/features/objects/problem/Problem.js";

useEvolutionFixture();

async function loadRepo() {
  const { ObjectRepository } = await import("./object.repository.js");
  return new ObjectRepository();
}

describe("ObjectRepository", () => {
  it("saves with content hash id and loads via deserialize", async () => {
    const repo = await loadRepo();
    const note = new Note(
      { title: "Hello", body: "World" },
      { createdAt: "2020-01-01T00:00:00.000Z", version: 1 },
    );

    const first = repo.save(note);
    const second = repo.save(
      new Note(
        { title: "Hello", body: "World" },
        { createdAt: "2099-01-01T00:00:00.000Z", version: 9 },
      ),
    );

    expect(first.created).toBe(true);
    expect(second).toEqual({ id: first.id, created: false });
    expect(first.id).toMatch(/^[a-f0-9]{64}$/);

    const loaded = repo.load(first.id);
    expect(loaded.type).toBe("note");
    expect(loaded.content).toEqual({ title: "Hello", body: "World" });
    expect(repo.exists(first.id)).toBe(true);
    expect(repo.list()).toEqual([first.id]);
  });

  it("rejects invalid objects before writing", async () => {
    const repo = await loadRepo();

    expect(() =>
      repo.save(new Note({ title: "", body: "x" })),
    ).toThrow("Note title is required");
    expect(repo.list()).toEqual([]);
  });

  it("listByType filters by type and skips corrupt records", async () => {
    const repo = await loadRepo();
    const note = repo.save(new Note({ title: "n", body: "b" }));
    const problem = repo.save(
      new Problem({
        title: "p",
        description: "d",
        severity: "low",
      }),
    );

    const corruptId = "ee" + "f".repeat(62);
    const corruptPath = path.join(
      getMockPaths().OBJECTS_DIR,
      "notes",
      "ee",
      "f".repeat(62),
    );
    fs.mkdirSync(path.dirname(corruptPath), { recursive: true });
    fs.writeFileSync(corruptPath, "{not-json", "utf8");

    const notes = repo.listByType("note");
    expect(notes.map((entry) => entry.id)).toEqual([note.id]);
    expect(repo.listByType("problem").map((entry) => entry.id)).toEqual([
      problem.id,
    ]);
    expect(repo.list()).toContain(corruptId);
  });
});
