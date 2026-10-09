import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configureMcp } from "./mcp-config.js";
let root = "";
beforeEach(() => {
  root = fs.mkdtempSync(path.join(process.cwd(), ".tmp-ecs-mcp-config-"));
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe("project MCP setup", () => {
  it("preserves existing servers and settings, and explicitly toggles write tools", () => {
    const target = path.join(root, ".mcp.json");
    fs.writeFileSync(
      target,
      JSON.stringify({
        custom: true,
        mcpServers: { existing: { command: "other" } },
      }),
    );
    configureMcp(root, ["claude"], false);
    let config = JSON.parse(fs.readFileSync(target, "utf8"));
    expect(config.custom).toBe(true);
    expect(config.mcpServers.existing.command).toBe("other");
    expect(config.mcpServers.evograph.args).toContain(root);
    expect(config.mcpServers.evograph.args).not.toContain("--write");
    configureMcp(root, ["claude"], true);
    config = JSON.parse(fs.readFileSync(target, "utf8"));
    expect(config.mcpServers.evograph.args).toContain("--write");
  });
  it("does not overwrite malformed or unrelated configuration", () => {
    const target = path.join(root, ".mcp.json");
    for (const content of [
      "{bad",
      JSON.stringify({ mcpServers: { evograph: { command: "someone-else" } } }),
    ]) {
      fs.writeFileSync(target, content);
      expect(() => configureMcp(root, ["claude"], false)).toThrow();
      expect(fs.readFileSync(target, "utf8")).toBe(content);
    }
  });
});
