import { describe, expect, it } from "vitest";
import { Note } from "#/features/objects/note/Note.js";
import { Problem } from "#/features/objects/problem/Problem.js";
import { Decision } from "#/features/objects/decision/Decision.js";
import { Edge } from "#/features/objects/edge/Edge.js";
import { Change } from "#/features/objects/change/Change.js";
import {
  objectLabel,
  objectTitle,
  renderHumanSummary,
  shortId,
} from "./object.view.js";

describe("object.view", () => {
  it("shortId returns the first 8 characters", () => {
    expect(shortId("abcdef0123456789")).toBe("abcdef01");
  });

  it("objectTitle uses content.title or a type fallback", () => {
    const note = new Note({ title: "Hello", body: "b" });
    const edge = new Edge({
      from: "a",
      to: "b",
      relation: "solves",
    });

    expect(objectTitle(note)).toBe("Hello");
    expect(objectTitle(edge)).toBe("edge object");
  });

  it("objectLabel combines type, title, and short id", () => {
    const note = new Note({ title: "Hello", body: "b" });
    expect(objectLabel("abcdef0123456789", note)).toBe(
      "note: Hello (abcdef01)",
    );
  });

  it("renderHumanSummary covers note, problem, decision, change, and edge", () => {
    const noteSummary = renderHumanSummary(
      "n".repeat(64),
      new Note(
        { title: "N", body: "Body text" },
        {
          createdAt: "2020-01-01T00:00:00.000Z",
          author: { name: "Ada", mail: "ada@example.com" },
        },
      ),
    );
    expect(noteSummary).toContain("NOTE");
    expect(noteSummary).toContain("Author: Ada <ada@example.com>");
    expect(noteSummary).toContain("Body text");

    const problemSummary = renderHumanSummary(
      "p".repeat(64),
      new Problem({
        title: "P",
        description: "Desc",
        severity: "high",
        context: "ctx",
      }),
    );
    expect(problemSummary).toContain("Severity: high");
    expect(problemSummary).toContain("Context:");
    expect(problemSummary).toContain("ctx");

    const decisionSummary = renderHumanSummary(
      "d".repeat(64),
      new Decision({
        title: "D",
        chosen: "A",
        rationale: "Because",
        status: "successful",
        alternatives: ["B"],
        expectedOutcome: "Win",
        problem: "P1",
      }),
    );
    expect(decisionSummary).toContain("Chosen: A");
    expect(decisionSummary).toContain("- B");
    expect(decisionSummary).toContain("Expected Outcome:");
    expect(decisionSummary).toContain("Problem Context: P1");

    const files = Array.from({ length: 16 }, (_, i) => ({
      path: `f${i}.ts`,
      status: "M",
    }));
    const changeSummary = renderHumanSummary(
      "c".repeat(64),
      new Change({
        kind: "commit",
        commit: "abc",
        message: "msg",
        files,
      }),
    );
    expect(changeSummary).toContain("Commit: abc");
    expect(changeSummary).toContain("... and 1 more");

    const edgeSummary = renderHumanSummary(
      "e".repeat(64),
      new Edge({ from: "aaa", to: "bbb", relation: "solves" }),
    );
    expect(edgeSummary).toContain("Relation: solves");
    expect(edgeSummary).toContain("From: aaa");
  });
});
