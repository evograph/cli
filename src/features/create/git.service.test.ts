import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const execSync = vi.fn();

vi.mock("node:child_process", () => ({
  execSync: (...args: unknown[]) => execSync(...args),
}));

describe("git.service", () => {
  beforeEach(() => {
    execSync.mockReset();
  });

  afterEach(() => {
    vi.resetModules();
  });

  async function load() {
    return import("./git.service.js");
  }

  it("isGitRepo is true only for work trees", async () => {
    execSync.mockReturnValue("true");
    const { isGitRepo } = await load();
    expect(isGitRepo()).toBe(true);

    vi.resetModules();
    execSync.mockImplementation(() => {
      throw new Error("not a repo");
    });
    const again = await import("./git.service.js");
    expect(again.isGitRepo()).toBe(false);
  });

  it("parses recent commits from unit-separated log lines", async () => {
    execSync.mockReturnValue(
      [
        "aaaa\x1fbbbb\x1fFirst",
        "cccc\x1fdddd\x1fSecond",
      ].join("\n"),
    );

    const { getRecentCommits } = await load();
    expect(getRecentCommits(2)).toEqual([
      { sha: "aaaa", shortSha: "bbbb", message: "First" },
      { sha: "cccc", shortSha: "dddd", message: "Second" },
    ]);
  });

  it("returns empty arrays when git output is empty or fails", async () => {
    execSync.mockReturnValue("");
    const empty = await load();
    expect(empty.getRecentCommits()).toEqual([]);
    expect(empty.getWorktreeChanges()).toEqual([]);

    vi.resetModules();
    execSync.mockImplementation(() => {
      throw new Error("fail");
    });
    const failing = await import("./git.service.js");
    expect(failing.getRecentCommits()).toEqual([]);
    expect(failing.getWorktreeChanges()).toEqual([]);
    expect(failing.getCommitChanges("abc")).toEqual([]);
  });

  it("parses porcelain worktree and name-status commit changes", async () => {
    // Leading spaces are trimmed by git(); keep a non-space status first.
    execSync.mockReturnValue("?? src/b.ts\n M src/a.ts");
    const { getWorktreeChanges } = await load();
    expect(getWorktreeChanges()).toEqual([
      { status: "??", path: "src/b.ts" },
      { status: "M", path: "src/a.ts" },
    ]);

    vi.resetModules();
    execSync.mockReturnValue("M\tsrc/a.ts\nA\tsrc/c.ts\n");
    const { getCommitChanges } = await import("./git.service.js");
    expect(getCommitChanges("deadbeef")).toEqual([
      { status: "M", path: "src/a.ts" },
      { status: "A", path: "src/c.ts" },
    ]);
  });
});
