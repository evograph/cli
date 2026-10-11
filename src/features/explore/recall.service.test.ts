import { useEvolutionFixture, getMockPaths } from "#/test/evolution-fixture.js";
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { remember } from "#/features/create/remember.command.js";
import { boundedRecall, recall } from "./recall.service.js";
import { ObjectRepository } from "#/features/objects/object.repository.js";
import { Note } from "#/features/objects/note/Note.js";
import { GraphRepository } from "#/features/graph/graph.repository.js";

const fixture = useEvolutionFixture();

describe("task-focused recall", () => {
  it("finds rationale and related problem context rather than dumping all records", () => {
    remember("Use SQLite", {
      because: "Offline storage keeps customer records local",
      problem: "Database connectivity fails on trains",
    });
    remember("Use a green icon", { because: "Matches the identity" });
    const result = recall({ query: "offline database", limit: 1 });
    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.chosen, JSON.stringify(result)).toBe(
      "Use SQLite",
    );
    expect(result.records[0]?.rationale).toContain("Offline");
    expect(result.records[0]?.links[0]?.relation).toBe("solves");
    expect(result.omitted).toBeGreaterThan(0);
    expect(recall({ query: "nonexistent-phrase" }).records).toEqual([]);
  });

  it("retrieves notes, filters file scopes, and preserves source IDs", () => {
    const result = remember("Use refresh tokens", {
      because: "Keep access sessions short",
      files: [path.join(fixture.getRoot(), "src/auth")],
    });
    new ObjectRepository().save(
      new Note({
        title: "Auth caveat",
        body: "Do not persist access tokens in browser storage",
      }),
    );
    const byFile = recall({
      files: [path.join(fixture.getRoot(), "src/auth/session.ts")],
    });
    expect(byFile.records.map((record) => record.id)).toEqual([result.id]);
    expect(
      recall({ query: "browser storage" }).records.some(
        (record) => record.type === "note",
      ),
    ).toBe(true);
    expect(boundedRecall({ query: "refresh" })).toContain(
      `Source: ecs show ${result.id}`,
    );
  });

  it("excludes superseded choices while retaining explicit historical access", () => {
    const old = remember("Use file cache", {
      because: "Simple initial deployment",
    });
    const latest = remember("Use Redis cache", {
      because: "Multiple workers share invalidation",
      supersedes: old.id,
    });
    expect(
      recall({ query: "cache" }).records.map((record) => record.id),
    ).toEqual([latest.id]);
    const history = recall({ query: "cache", includeSuperseded: true });
    expect(
      history.records.find((record) => record.id === old.id)?.supersededBy,
    ).toEqual([latest.id]);
  });

  it("recovers relationships without the index and skips corrupt objects with a warning", () => {
    const decision = remember("Use SQLite", {
      because: "Local operation",
      problem: "Needs offline storage",
    });
    fs.rmSync(getMockPaths().INDEX_DIR, { recursive: true, force: true });
    expect(recall({ query: "SQLite" }).records[0]?.links).toHaveLength(1);
    expect(new GraphRepository().outgoing(decision.id)).toHaveLength(1);
    const broken = path.join(
      getMockPaths().OBJECTS_DIR,
      "notes",
      "aa",
      "b".repeat(62),
    );
    fs.mkdirSync(path.dirname(broken), { recursive: true });
    fs.writeFileSync(broken, "not JSON");
    expect(recall().warnings).toHaveLength(1);
  });

  it("bounds the entire response and keeps JSON parseable under hostile escaping", () => {
    for (let i = 0; i < 20; i++)
      remember(`Storage choice ${i}`, { because: '\\"\n'.repeat(3000) });
    for (const maxChars of [512, 800, 2000, 8000]) {
      for (const json of [true, false]) {
        const output = boundedRecall(
          { query: "storage", maxChars, limit: 20 },
          json,
          "CLI version: test\n",
        );
        expect(output.length).toBeLessThanOrEqual(maxChars);
        if (json) expect(JSON.parse(output).omitted).toBeGreaterThan(0);
      }
    }
    expect(() => boundedRecall({ limit: "garbage" })).toThrow(/whole number/);
    expect(() => boundedRecall({ maxChars: 100 })).toThrow(/at least 512/);
  });
});
