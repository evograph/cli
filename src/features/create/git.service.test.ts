import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const execFileSync = vi.fn();
vi.mock("node:child_process", () => ({
  execFileSync: (...args: unknown[]) => execFileSync(...args),
}));

describe("git.service", () => {
  beforeEach(() => {
    execFileSync.mockReset();
  });
  afterEach(() => vi.resetModules());
  const load = () => import("./git.service.js");
  it("detects work trees", async () => {
    execFileSync.mockReturnValue("true\n");
    const service = await load();
    expect(service.isGitRepo()).toBe(true);
    execFileSync.mockImplementation(() => {
      throw new Error("not a repo");
    });
    expect(service.isGitRepo()).toBe(false);
  });
  it("parses recent commits and rejects invalid limits", async () => {
    execFileSync.mockReturnValue(
      "aaaa\x1fbbbb\x1fFirst\ncccc\x1fdddd\x1fSecond",
    );
    const service = await load();
    expect(service.getRecentCommits(2)).toEqual([
      { sha: "aaaa", shortSha: "bbbb", message: "First" },
      { sha: "cccc", shortSha: "dddd", message: "Second" },
    ]);
    expect(service.getRecentCommits(-1)).toEqual([]);
  });
  it("returns empty lists on empty output or Git failure", async () => {
    execFileSync.mockReturnValue("");
    const service = await load();
    expect(service.getRecentCommits()).toEqual([]);
    expect(service.getWorktreeChanges()).toEqual([]);
    execFileSync.mockImplementation(() => {
      throw new Error("failure");
    });
    expect(service.getCommitChanges("abc")).toEqual([]);
    expect(service.getWorktreeChanges()).toEqual([]);
  });
  it("preserves leading status spaces, unusual filenames, and rename targets", async () => {
    execFileSync.mockReturnValue(
      " M first file.ts\0R  new name.ts\0old name.ts\0?? line\nbreak.ts\0?? .evolution/objects/new\0",
    );
    const service = await load();
    expect(service.getWorktreeChanges()).toEqual([
      { status: "M", path: "first file.ts" },
      { status: "R", path: "new name.ts" },
      { status: "??", path: "line\nbreak.ts" },
    ]);
  });
  it("passes refs as arguments and reads null-delimited commit paths", async () => {
    execFileSync
      .mockReturnValueOnce("abc123\n")
      .mockReturnValueOnce("M\0src/a.ts\0A\0file\twith tab.ts\0");
    const service = await load();
    expect(service.getCommitChanges("HEAD; echo unwanted")).toEqual([
      { status: "M", path: "src/a.ts" },
      { status: "A", path: "file\twith tab.ts" },
    ]);
    expect(execFileSync.mock.calls[0]?.[0]).toBe("git");
    expect(execFileSync.mock.calls[0]?.[1]).toContain(
      "HEAD; echo unwanted^{commit}",
    );
  });
});
