import { execFileSync } from "node:child_process";
import path from "node:path";
import { ECS_DIR } from "#/kernel/paths.js";
import type { ChangedFile } from "#/features/objects/change/ChangeContent.js";

function git(args: string[]): string {
  return execFileSync("git", ["-C", path.dirname(ECS_DIR), ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}
const isProjectFile = (file: ChangedFile) =>
  file.path !== ".evolution" && !file.path.startsWith(".evolution/");
export function isGitRepo(): boolean {
  try {
    return git(["rev-parse", "--is-inside-work-tree"]).trim() === "true";
  } catch {
    return false;
  }
}
export interface CommitInfo {
  sha: string;
  shortSha: string;
  message: string;
}
export function getRecentCommits(limit = 10): CommitInfo[] {
  try {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) return [];
    const out = git([
      "log",
      "--pretty=format:%H%x1f%h%x1f%s",
      "-n",
      String(limit),
    ]).trim();
    return out
      ? out.split("\n").map((line) => {
          const [sha = "", shortSha = "", message = ""] = line.split("\x1f");
          return { sha, shortSha, message };
        })
      : [];
  } catch {
    return [];
  }
}
export function getWorktreeChanges(): ChangedFile[] {
  try {
    const entries = git([
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
    ]).split("\0");
    const result: ChangedFile[] = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!;
      if (!entry) continue;
      const status = entry.slice(0, 2).trim();
      result.push({ status, path: entry.slice(3) });
      if (status.includes("R") || status.includes("C")) i++;
    }
    return result.filter(isProjectFile);
  } catch {
    return [];
  }
}
export function getCommitChanges(ref: string): ChangedFile[] {
  try {
    const sha = git([
      "rev-parse",
      "--verify",
      "--end-of-options",
      `${ref}^{commit}`,
    ]).trim();
    const entries = git([
      "show",
      "--name-status",
      "--format=",
      "--no-renames",
      "-z",
      sha,
      "--",
    ]).split("\0");
    const result: ChangedFile[] = [];
    for (let i = 0; i + 1 < entries.length; i += 2) {
      if (entries[i])
        result.push({ status: entries[i]!.trim(), path: entries[i + 1]! });
    }
    return result.filter(isProjectFile);
  } catch {
    return [];
  }
}
