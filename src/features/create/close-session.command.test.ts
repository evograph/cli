import { useEvolutionFixture } from "#/test/evolution-fixture.js";
import { describe, expect, it, vi } from "vitest";
import { Note } from "#/features/objects/note/Note.js";
import { Problem } from "#/features/objects/problem/Problem.js";

useEvolutionFixture();

describe("closeSessionCommand", () => {
  async function repo() {
    const { ObjectRepository } = await import(
      "#/features/objects/object.repository.js"
    );
    return new ObjectRepository();
  }

  it("dry-run prints the plan without writing objects", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { closeSessionCommand } = await import("./close-session.command.js");
    const objectRepo = await repo();

    closeSessionCommand({
      problemTitle: "Need tests",
      problemDescription: "Cover the core slices",
      decisionTitle: "Add vitest suite",
      chosen: "colocated slice tests",
      rationale: "matches vertical slices",
      dryRun: true,
    });

    expect(objectRepo.list()).toEqual([]);
    expect(log.mock.calls.flat().join("\n")).toContain("[dry-run]");
    log.mockRestore();
  });

  it("creates problem, decision, and solves edge", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { closeSessionCommand } = await import("./close-session.command.js");
    const objectRepo = await repo();

    closeSessionCommand({
      problemTitle: "Need tests",
      problemDescription: "Cover the core slices",
      decisionTitle: "Add vitest suite",
      chosen: "colocated slice tests",
      rationale: "matches vertical slices",
      alternatives: "one giant suite, no tests",
      author: "Tester",
    });

    const problems = objectRepo.listByType("problem");
    const decisions = objectRepo.listByType("decision");
    const edges = objectRepo.listByType("edge");

    expect(problems).toHaveLength(1);
    expect(decisions).toHaveLength(1);
    expect(edges).toHaveLength(1);
    expect(edges[0]!.object.content).toMatchObject({
      relation: "solves",
      from: decisions[0]!.id,
      to: problems[0]!.id,
    });
    expect(log.mock.calls.flat().join("\n")).toContain("Linked:");
    log.mockRestore();
  });

  it("reuses an existing problem id", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { closeSessionCommand } = await import("./close-session.command.js");
    const objectRepo = await repo();

    const problem = objectRepo.save(
      new Problem({
        title: "Existing",
        description: "Already tracked",
        severity: "medium",
      }),
    );

    closeSessionCommand({
      problemId: problem.id.slice(0, 8),
      decisionTitle: "Reuse problem",
      chosen: "problem-id flag",
      rationale: "avoid duplicates",
    });

    expect(objectRepo.listByType("problem")).toHaveLength(1);
    expect(objectRepo.listByType("decision")).toHaveLength(1);
    expect(log.mock.calls.flat().join("\n")).toContain("(reused)");
    log.mockRestore();
  });

  it("fails when decision flags are missing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { closeSessionCommand } = await import("./close-session.command.js");

    process.exitCode = undefined;
    closeSessionCommand({
      problemTitle: "P",
      problemDescription: "D",
    });

    expect(process.exitCode).toBe(1);
    expect(error.mock.calls.flat().join("\n")).toContain(
      "close-session requires --decision-title",
    );
    process.exitCode = undefined;
    error.mockRestore();
  });

  it("rejects non-problem ids", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { closeSessionCommand } = await import("./close-session.command.js");
    const objectRepo = await repo();
    const note = objectRepo.save(new Note({ title: "n", body: "b" }));

    process.exitCode = undefined;
    closeSessionCommand({
      problemId: note.id,
      decisionTitle: "x",
      chosen: "y",
      rationale: "z",
    });

    expect(process.exitCode).toBe(1);
    expect(error.mock.calls.flat().join("\n")).toContain("is not a problem");
    process.exitCode = undefined;
    error.mockRestore();
  });
});
