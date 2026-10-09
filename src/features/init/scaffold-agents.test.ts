import {
  detectSuggestedAgents,
  isBuiltinAgent,
  scaffoldAgentFiles,
} from "./scaffold-agents.js";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("scaffold-agents", () => {
  let root = "";

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(process.cwd(), ".tmp-ecs-scaffold-"));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("recognizes builtin agent names", () => {
    expect(isBuiltinAgent("cursor")).toBe(true);
    expect(isBuiltinAgent("nope")).toBe(false);
  });

  it("writes agent adapters and skips existing files unless forced", () => {
    // Avoid creating `.cursor/` here — some environments block that path.
    const first = scaffoldAgentFiles({
      root,
      agents: ["claude", "copilot", "windsurf"],
    });

    expect(first.every((r) => r.status === "written")).toBe(true);
    expect(fs.existsSync(path.join(root, ".evolution", "AGENT.md"))).toBe(true);
    expect(
      fs.readFileSync(path.join(root, ".evolution", "AGENT.md"), "utf8"),
    ).toContain("ecs context");
    expect(fs.existsSync(path.join(root, "AGENTS.md"))).toBe(true);
    expect(fs.existsSync(path.join(root, "CLAUDE.md"))).toBe(true);
    expect(
      fs.existsSync(path.join(root, ".github", "copilot-instructions.md")),
    ).toBe(true);
    expect(fs.existsSync(path.join(root, ".windsurf", "rules", "ecs.md"))).toBe(
      true,
    );

    const skipped = scaffoldAgentFiles({
      root,
      agents: ["claude"],
    });
    expect(skipped.every((r) => r.status === "skipped")).toBe(true);

    const forced = scaffoldAgentFiles({
      root,
      agents: ["claude"],
      force: true,
    });
    expect(forced.some((r) => r.status === "forced")).toBe(true);
  });

  it("requires customPath for custom agents", () => {
    expect(() => scaffoldAgentFiles({ root, agents: ["custom"] })).toThrow(
      /Custom agent requires --custom-path/,
    );
    expect(fs.existsSync(path.join(root, ".evolution"))).toBe(false);
  });

  it("preserves project instructions and updates only one ECS section", () => {
    fs.writeFileSync(
      path.join(root, "AGENTS.md"),
      "# Team conventions\nKeep our formatter.\n",
    );
    scaffoldAgentFiles({ root, agents: ["codex"] });
    scaffoldAgentFiles({
      root,
      agents: ["codex"],
      cliPrefix: "npx --no-install ecs",
    });
    const text = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
    expect(text).toContain("Keep our formatter.");
    expect(text.match(/<!-- evograph:start -->/g)).toHaveLength(1);
    expect(text).toContain("npx --no-install ecs remember");
    expect(text).not.toContain("`ecs remember");
  });

  it("keeps rule frontmatter first and preserves it on repeated setup", () => {
    scaffoldAgentFiles({ root, agents: ["windsurf"] });
    const rule = path.join(root, ".windsurf", "rules", "ecs.md");
    const first = fs.readFileSync(rule, "utf8");
    expect(first.startsWith("---\ntrigger: always_on")).toBe(true);
    scaffoldAgentFiles({ root, agents: ["windsurf"] });
    expect(fs.readFileSync(rule, "utf8")).toBe(first);
  });

  it("writes a custom adapter path and AGENTS.md when basename matches", () => {
    const results = scaffoldAgentFiles({
      root,
      agents: ["custom"],
      customPath: "AGENTS.md",
    });

    expect(results.some((r) => r.path.endsWith("AGENTS.md"))).toBe(true);
    expect(fs.existsSync(path.join(root, "AGENTS.md"))).toBe(true);
  });

  it("detects suggested agents from existing tool markers", () => {
    fs.writeFileSync(path.join(root, "CLAUDE.md"), "x");
    fs.mkdirSync(path.join(root, ".github"), { recursive: true });
    fs.writeFileSync(
      path.join(root, ".github", "copilot-instructions.md"),
      "x",
    );
    fs.mkdirSync(path.join(root, ".windsurf"), { recursive: true });
    fs.writeFileSync(path.join(root, "AGENTS.md"), "x");

    expect(detectSuggestedAgents(root)).toEqual([
      "claude",
      "copilot",
      "windsurf",
      "codex",
    ]);
  });

  it("suggests cursor when a .cursor directory exists", () => {
    const spy = vi.spyOn(fs, "existsSync").mockImplementation((target) => {
      if (String(target).endsWith(`${path.sep}.cursor`)) {
        return true;
      }
      return false;
    });

    expect(detectSuggestedAgents(root)).toEqual(["cursor"]);
    spy.mockRestore();
  });
});
