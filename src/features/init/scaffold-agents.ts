import fs from "node:fs";
import path from "node:path";

import {
  agentProtocolMarkdown,
  agentsMdMarkdown,
  claudeMdMarkdown,
  copilotInstructionsMarkdown,
  cursorRuleMarkdown,
  customAdapterMarkdown,
  windsurfRuleMarkdown,
  DEFAULT_CLI_PREFIX,
} from "#/features/init/templates.js";

export const BUILTIN_AGENTS = [
  "cursor",
  "claude",
  "codex",
  "copilot",
  "windsurf",
  "antigravity",
  "custom",
] as const;

export type BuiltinAgent = (typeof BUILTIN_AGENTS)[number];

export function isBuiltinAgent(value: string): value is BuiltinAgent {
  return (BUILTIN_AGENTS as readonly string[]).includes(value);
}

export type WriteResult = {
  path: string;
  status: "written" | "skipped" | "forced" | "updated";
};

const START = "<!-- evograph:start -->";
const END = "<!-- evograph:end -->";

function writeFileSafe(
  filePath: string,
  content: string,
  force: boolean,
): WriteResult {
  const absolute = path.resolve(filePath);
  const exists = fs.existsSync(absolute);

  // Cursor/Windsurf must see YAML frontmatter at the start of the file.
  const frontmatter = content.match(/^---\n[\s\S]*?\n---\n/)?.[0] ?? "";
  const managed = `${START}\n${content.slice(frontmatter.length).trim()}\n${END}\n`;
  let output = frontmatter + managed;
  if (exists && !force) {
    const previous = fs.readFileSync(absolute, "utf8");
    const start = previous.indexOf(START);
    const end = previous.indexOf(END);
    if (start >= 0 !== end >= 0 || (start >= 0 && end < start))
      throw new Error(
        `Incomplete ECS markers in ${absolute}; repair the markers before updating.`,
      );
    output =
      start >= 0
        ? previous.slice(0, start) +
          managed.trimEnd() +
          previous.slice(end + END.length)
        : `${previous.trimEnd()}\n\n${managed}`;
    if (output === previous) return { path: absolute, status: "skipped" };
  }

  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, output, "utf8");

  return {
    path: absolute,
    status: exists ? (force ? "forced" : "updated") : "written",
  };
}

function needsAgentsMd(agents: BuiltinAgent[]): boolean {
  return agents.some((agent) =>
    ["claude", "codex", "antigravity", "windsurf"].includes(agent),
  );
}

export type ScaffoldOptions = {
  root?: string;
  agents: BuiltinAgent[];
  customPath?: string;
  force?: boolean;
  cliPrefix?: string;
};

export function scaffoldAgentFiles(options: ScaffoldOptions): WriteResult[] {
  if (options.agents.includes("custom") && !options.customPath)
    throw new Error("Custom agent requires --custom-path <file>.");
  const root = options.root ?? process.cwd();
  const force = options.force ?? false;
  const cliPrefix = options.cliPrefix ?? DEFAULT_CLI_PREFIX;
  const results: WriteResult[] = [];

  const evolutionAgent = path.join(root, ".evolution", "AGENT.md");
  results.push(
    writeFileSafe(evolutionAgent, agentProtocolMarkdown(cliPrefix), force),
  );

  const agents = options.agents;
  const writeAgentsMd =
    needsAgentsMd(agents) ||
    (agents.includes("custom") &&
      options.customPath !== undefined &&
      path.basename(options.customPath) === "AGENTS.md");

  if (writeAgentsMd) {
    results.push(
      writeFileSafe(
        path.join(root, "AGENTS.md"),
        agentsMdMarkdown(cliPrefix),
        force,
      ),
    );
  }

  if (agents.includes("cursor")) {
    results.push(
      writeFileSafe(
        path.join(root, ".cursor", "rules", "ecs.mdc"),
        cursorRuleMarkdown(cliPrefix),
        force,
      ),
    );
  }

  if (agents.includes("claude")) {
    results.push(
      writeFileSafe(
        path.join(root, "CLAUDE.md"),
        claudeMdMarkdown(cliPrefix),
        force,
      ),
    );
    // AGENTS.md already handled above when claude selected
  }

  if (agents.includes("copilot")) {
    results.push(
      writeFileSafe(
        path.join(root, ".github", "copilot-instructions.md"),
        copilotInstructionsMarkdown(cliPrefix),
        force,
      ),
    );
  }

  if (agents.includes("windsurf")) {
    results.push(
      writeFileSafe(
        path.join(root, ".windsurf", "rules", "ecs.md"),
        windsurfRuleMarkdown(cliPrefix),
        force,
      ),
    );
  }

  if (agents.includes("custom")) {
    if (!options.customPath) {
      throw new Error(
        "Custom agent requires --custom-path <file> (or provide a path interactively).",
      );
    }

    const target = path.isAbsolute(options.customPath)
      ? options.customPath
      : path.join(root, options.customPath);

    results.push(
      writeFileSafe(target, customAdapterMarkdown(cliPrefix), force),
    );
  }

  return results;
}

export function detectSuggestedAgents(root = process.cwd()): BuiltinAgent[] {
  const suggested: BuiltinAgent[] = [];

  if (fs.existsSync(path.join(root, ".cursor"))) {
    suggested.push("cursor");
  }
  if (fs.existsSync(path.join(root, "CLAUDE.md"))) {
    suggested.push("claude");
  }
  if (fs.existsSync(path.join(root, ".github", "copilot-instructions.md"))) {
    suggested.push("copilot");
  }
  if (
    fs.existsSync(path.join(root, ".windsurf")) ||
    fs.existsSync(path.join(root, ".windsurfrules"))
  ) {
    suggested.push("windsurf");
  }
  if (fs.existsSync(path.join(root, "AGENTS.md"))) {
    suggested.push("codex");
  }

  return suggested;
}
