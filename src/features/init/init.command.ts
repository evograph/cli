import fs from "node:fs";
import path from "node:path";
import { ECS_DIR } from "#/kernel/paths.js";
import {
  BUILTIN_AGENTS,
  detectSuggestedAgents,
  isBuiltinAgent,
  scaffoldAgentFiles,
  type BuiltinAgent,
} from "./scaffold-agents.js";
import { configureMcp } from "./mcp-config.js";

export type InitOptions = {
  agents?: string;
  customPath?: string;
  cliPrefix?: string;
  force?: boolean;
  yes?: boolean;
  mcp?: boolean;
  mcpWrite?: boolean;
};

export async function initRepository(options: InitOptions = {}): Promise<void> {
  const root = path.dirname(ECS_DIR);
  const detected = detectSuggestedAgents(root);
  let agents: BuiltinAgent[] = detected.length ? detected : ["codex"];
  if (options.agents !== undefined) {
    agents = [];
    if (options.agents !== "none") {
      for (const agent of options.agents
        .split(",")
        .map((value) => value.trim().toLowerCase())) {
        if (!isBuiltinAgent(agent))
          throw new Error(
            `Unknown agent '${agent}'. Use ${BUILTIN_AGENTS.join(", ")}, or none.`,
          );
        if (!agents.includes(agent)) agents.push(agent);
      }
    }
  }
  if (agents.includes("custom") && !options.customPath)
    throw new Error("Custom agent needs --custom-path <file>.");
  const created = !fs.existsSync(ECS_DIR);
  for (const folder of ["objects", "refs", "index", "artifacts", "tmp"])
    fs.mkdirSync(path.join(ECS_DIR, folder), { recursive: true });
  console.log(`${created ? "Initialized" : "Ready"}: ${ECS_DIR}`);
  if (agents.length) {
    for (const result of scaffoldAgentFiles({
      root,
      agents,
      ...(options.customPath ? { customPath: options.customPath } : {}),
      ...(options.cliPrefix ? { cliPrefix: options.cliPrefix } : {}),
      force: options.force ?? false,
    })) {
      console.log(`${result.status}: ${path.relative(root, result.path)}`);
    }
  }
  if (options.mcp || options.mcpWrite) {
    for (const result of configureMcp(root, agents, options.mcpWrite ?? false))
      console.log(result);
    console.log(
      "Restart your agent and approve the project MCP server. Configuration uses this machine's installed CLI path.",
    );
  }
  console.log(
    '\nNext: ecs remember "Your choice" --because "Why it matters"\nLater: ecs recall "Your next task"\nCheck setup: ecs doctor',
  );
}
