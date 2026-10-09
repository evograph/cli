import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const binary = fileURLToPath(new URL("../../bin/ecs.js", import.meta.url));
let root = "";
function cli(args: string[], cwd = root) {
  return spawnSync(process.execPath, [binary, ...args], {
    cwd,
    encoding: "utf8",
    timeout: 10000,
  });
}
function success(args: string[], cwd = root) {
  const result = cli(args, cwd);
  expect(result.stderr).toBe("");
  expect(result.status).toBe(0);
  return result.stdout.trim();
}
beforeEach(() => {
  root = fs.mkdtempSync(path.join(process.cwd(), ".tmp-ecs-workflow-"));
  fs.mkdirSync(path.join(root, ".git"));
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe("packaged CLI workflow", () => {
  it("sets up without a terminal, preserves instructions, and runs from nested folders", () => {
    fs.writeFileSync(
      path.join(root, "AGENTS.md"),
      "# Project rules\nUse our formatter.\n",
    );
    success(["init"]);
    const first = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
    expect(first).toContain("Use our formatter.");
    expect(first).toContain('ecs remember "choice" --because "reason"');
    success(["init", "--yes"]);
    expect(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8")).toBe(first);
    const nested = path.join(root, "src", "auth");
    fs.mkdirSync(nested, { recursive: true });
    const saved = JSON.parse(
      success(
        [
          "remember",
          "Use SQLite",
          "--because",
          "Works offline",
          "--files",
          "session.ts",
          "--json",
        ],
        nested,
      ),
    );
    const result = JSON.parse(
      success(["recall", "offline", "--file", "src/auth", "--json"]),
    );
    expect(result.records[0].id).toBe(saved.id);
    expect(result.records[0].files).toEqual(["src/auth/session.ts"]);
    expect(
      JSON.parse(success(["--cwd", root, "status", "--json"], nested)).root,
    ).toBe(root);
    expect(success(["list"])).toContain("Use SQLite");
    expect(
      JSON.parse(success(["show", saved.id.slice(0, 8), "--json"])).record
        .content.rationale,
    ).toBe("Works offline");
    expect(JSON.parse(success(["doctor", "--json"])).ok).toBe(true);
    const bounded = cli(["context", "--max-chars", "512"]);
    expect(bounded.status).toBe(0);
    expect(bounded.stdout.length).toBeLessThanOrEqual(512);
  });

  it("reports incomplete commands promptly without writing or waiting on prompts", () => {
    expect(cli(["remember", "Use SQLite", "--because", "Offline"]).status).toBe(
      1,
    );
    expect(fs.existsSync(path.join(root, ".evolution"))).toBe(false);
    expect(cli(["init", "--agents", "wrong"]).status).toBe(1);
    expect(fs.existsSync(path.join(root, ".evolution"))).toBe(false);
    success(["init", "--agents", "none"]);
    for (const args of [
      ["create"],
      ["create", "decision", "--title", "Incomplete"],
      ["browse"],
      ["show", "../../etc/passwd"],
      ["recall", "--limit", "oops"],
    ]) {
      const result = cli(args);
      expect(result.status).toBe(1);
      expect(result.stderr).not.toContain("at file:");
      expect(result.error).toBeUndefined();
    }
    expect(JSON.parse(success(["list", "--json"]))).toEqual([]);
    success([
      "create",
      "decision",
      "--title",
      "Choice",
      "--chosen",
      "SQLite",
      "--rationale",
      "Offline",
    ]);
    expect(JSON.parse(success(["list", "--json"]))).toHaveLength(1);
  });

  it("attaches actual Git history and safely handles shell metacharacters in a ref", () => {
    fs.rmdirSync(path.join(root, ".git"));
    execFileSync("git", ["init", root], { stdio: "ignore" });
    fs.writeFileSync(
      path.join(root, " file with spaces.ts "),
      "export const local = true;\n",
    );
    execFileSync("git", ["-C", root, "add", "."]);
    execFileSync(
      "git",
      [
        "-C",
        root,
        "-c",
        "user.name=Test",
        "-c",
        "user.email=test@example.com",
        "commit",
        "-m",
        "Initial code",
      ],
      { stdio: "ignore" },
    );
    success(["init", "--agents", "none"]);
    const saved = JSON.parse(
      success([
        "remember",
        "Keep data local",
        "--because",
        "Offline use",
        "--commit",
        "HEAD",
        "--json",
      ]),
    );
    expect(saved.commit).toMatch(/^[a-f0-9]{40}$/);
    const recalled = JSON.parse(success(["recall", "offline", "--json"]));
    expect(recalled.records[0].files).toContain(" file with spaces.ts ");
    const before = JSON.parse(success(["list", "--json"])).length;
    expect(
      cli([
        "remember",
        "Bad",
        "--because",
        "Bad",
        "--commit",
        "HEAD; touch INJECTED",
      ]).status,
    ).toBe(1);
    expect(fs.existsSync(path.join(root, "INJECTED"))).toBe(false);
    expect(JSON.parse(success(["list", "--json"]))).toHaveLength(before);
  });
});
