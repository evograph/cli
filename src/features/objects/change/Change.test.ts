import { describe, expect, it } from "vitest";
import { Change } from "./Change.js";

describe("Change", () => {
  it("accepts a commit change with sha and files", () => {
    expect(() =>
      new Change({
        kind: "commit",
        commit: "abc123",
        files: [{ path: "a.ts", status: "M" }],
      }).validate(),
    ).not.toThrow();
  });

  it("accepts a worktree change without commit", () => {
    expect(() =>
      new Change({
        kind: "worktree",
        files: [{ path: "a.ts", status: "??" }],
      }).validate(),
    ).not.toThrow();
  });

  it("requires a commit SHA for commit changes", () => {
    expect(() =>
      new Change({
        kind: "commit",
        files: [{ path: "a.ts", status: "M" }],
      }).validate(),
    ).toThrow("Commit change requires a commit SHA");
  });

  it("requires at least one file", () => {
    expect(() =>
      new Change({ kind: "worktree", files: [] }).validate(),
    ).toThrow("Change must reference at least one file");
  });

  it("round-trips through fromJSON", () => {
    const change = new Change({
      kind: "commit",
      commit: "deadbeef",
      message: "fix",
      files: [{ path: "x.ts", status: "A" }],
    });
    const restored = Change.fromJSON(change.toJSON());

    expect(restored.type).toBe("change");
    expect(restored.content.commit).toBe("deadbeef");
  });
});
