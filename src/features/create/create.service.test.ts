import { describe, expect, it } from "vitest";
import { useEvolutionFixture } from "#/test/evolution-fixture.js";

useEvolutionFixture();

describe("create.service pure helpers", () => {
  it("parseCommaList trims and drops empties", async () => {
    const { parseCommaList } = await import("./create.service.js");

    expect(parseCommaList(undefined)).toEqual([]);
    expect(parseCommaList("")).toEqual([]);
    expect(parseCommaList(" a, b , ,c ")).toEqual(["a", "b", "c"]);
  });

  it("has*Flags require the mandatory fields", async () => {
    const {
      hasNoteFlags,
      hasProblemFlags,
      hasDecisionFlags,
    } = await import("./create.service.js");

    expect(hasNoteFlags({ title: "t" })).toBe(false);
    expect(hasNoteFlags({ title: "t", body: "b" })).toBe(true);
    expect(hasProblemFlags({ title: "t", description: "d" })).toBe(false);
    expect(
      hasProblemFlags({ title: "t", description: "d", severity: "low" }),
    ).toBe(true);
    expect(
      hasDecisionFlags({ title: "t", chosen: "c", rationale: "r" }),
    ).toBe(false);
    expect(
      hasDecisionFlags({
        title: "t",
        chosen: "c",
        rationale: "r",
        status: "proposed",
      }),
    ).toBe(true);
  });

  it("resolveCreateMeta wraps author overrides", async () => {
    const { resolveCreateMeta } = await import("./create.service.js");

    expect(
      resolveCreateMeta({
        author: "Ada",
        authorEmail: "ada@example.com",
      }),
    ).toEqual({
      author: { name: "Ada", mail: "ada@example.com" },
    });
  });
});

describe("create.service flag writers", () => {
  it("noteFromFlags / problemFromFlags / decisionFromFlags persist objects", async () => {
    const {
      noteFromFlags,
      problemFromFlags,
      decisionFromFlags,
    } = await import("./create.service.js");
    const { ObjectRepository } = await import(
      "#/features/objects/object.repository.js"
    );
    const repo = new ObjectRepository();

    const note = noteFromFlags({ title: "N", body: "B" });
    const problem = problemFromFlags({
      title: "P",
      description: "D",
      severity: "medium",
      context: "ctx",
    });
    const decision = decisionFromFlags({
      title: "Dec",
      chosen: "A",
      rationale: "R",
      status: "in-progress",
      alternatives: "B, C",
      expectedOutcome: "ok",
    });

    expect(note.created).toBe(true);
    expect(repo.load(note.id).type).toBe("note");
    expect(repo.load(problem.id).content).toMatchObject({
      context: "ctx",
      severity: "medium",
    });
    expect(repo.load(decision.id).content).toMatchObject({
      alternatives: ["B", "C"],
      expectedOutcome: "ok",
    });
  });

  it("throws clear errors when required flags are missing", async () => {
    const {
      noteFromFlags,
      problemFromFlags,
      decisionFromFlags,
    } = await import("./create.service.js");

    expect(() => noteFromFlags({ title: "t" })).toThrow(
      "Note requires --title and --body",
    );
    expect(() =>
      problemFromFlags({ title: "t", description: "d" }),
    ).toThrow("Problem requires --title, --description, and --severity");
    expect(() =>
      decisionFromFlags({ title: "t", chosen: "c", rationale: "r" }),
    ).toThrow(
      "Decision requires --title, --chosen, --rationale, and --status",
    );
  });
});
