import fs from "node:fs";
import path from "node:path";
import { cliInvocation } from "#/kernel/cli-invocation.js";
import type { BuiltinAgent } from "./scaffold-agents.js";

type Config = { mcpServers?: Record<string, unknown>; [key: string]: unknown };

export function configureMcp(
  root: string,
  agents: BuiltinAgent[],
  write: boolean,
): string[] {
  const targets = [path.join(root, ".mcp.json")];
  if (agents.includes("cursor"))
    targets.push(path.join(root, ".cursor", "mcp.json"));
  const invocation = cliInvocation();
  const entry = {
    command: invocation.command,
    args: [
      ...invocation.args,
      "--cwd",
      root,
      "mcp",
      ...(write ? ["--write"] : []),
    ],
    env: { EVOGRAPH_MCP_CONFIG: "1" },
  };
  // Validate all existing configurations before writing any of them.
  const configs = targets.map((target) => {
    const config: Config = fs.existsSync(target)
      ? JSON.parse(fs.readFileSync(target, "utf8"))
      : {};
    if (
      !config ||
      typeof config !== "object" ||
      Array.isArray(config) ||
      (config.mcpServers !== undefined &&
        (!config.mcpServers ||
          typeof config.mcpServers !== "object" ||
          Array.isArray(config.mcpServers)))
    )
      throw new Error(
        `Invalid MCP configuration: ${target}. Existing contents were preserved.`,
      );
    const existing = config.mcpServers?.evograph;
    if (existing && JSON.stringify(existing) !== JSON.stringify(entry)) {
      const old = existing as {
        args?: unknown;
        env?: { EVOGRAPH_MCP_CONFIG?: string };
      };
      if (
        old.env?.EVOGRAPH_MCP_CONFIG !== "1" &&
        (!Array.isArray(old.args) ||
          !old.args.includes("mcp") ||
          !old.args.some(
            (arg) => typeof arg === "string" && arg.endsWith("/bin/ecs.js"),
          ))
      )
        throw new Error(
          `An unrelated MCP server is already named evograph in ${target}; rename it before configuring ECS.`,
        );
    }
    return {
      target,
      config: {
        ...config,
        mcpServers: { ...config.mcpServers, evograph: entry },
      },
    };
  });
  return configs.map(({ target, config }) => {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(config, null, 2) + "\n", "utf8");
    return `Configured ${path.relative(root, target)} (${write ? "read and write tools" : "read-only tools"}).`;
  });
}
