import fs from "node:fs";
import path from "node:path";

import { confirm, multiselect, text } from "@clack/prompts";

import { ensure } from "#/kernel/prompts.js";
import {
  BUILTIN_AGENTS,
  detectSuggestedAgents,
  isBuiltinAgent,
  scaffoldAgentFiles,
  type BuiltinAgent,
} from "#/features/init/scaffold-agents.js";

const folders = ["objects", "refs", "index", "artifacts", "tmp"];

export type InitOptions = {
  agents?: string;
  customPath?: string;
  force?: boolean;
};

function ensureEvolutionDir(root: string): boolean {
  const evolution = path.join(root, ".evolution");

  if (fs.existsSync(evolution)) {
    return false;
  }

  fs.mkdirSync(evolution);
  for (const folder of folders) {
    fs.mkdirSync(path.join(evolution, folder), {
      recursive: true,
    });
  }

  return true;
}

function parseAgentsFlag(raw: string | undefined): BuiltinAgent[] | undefined {
  if (!raw || raw.trim() === "") {
    return undefined;
  }

  const parts = raw.split(",").map((value) => value.trim().toLowerCase());
  const agents: BuiltinAgent[] = [];

  for (const part of parts) {
    if (!isBuiltinAgent(part)) {
      throw new Error(
        `Unknown agent '${part}'. Valid: ${BUILTIN_AGENTS.join(", ")}`
      );
    }
    if (!agents.includes(part)) {
      agents.push(part);
    }
  }

  return agents;
}

function printScaffoldResults(
  results: ReturnType<typeof scaffoldAgentFiles>
): void {
  for (const result of results) {
    const rel = path.relative(process.cwd(), result.path) || result.path;
    if (result.status === "skipped") {
      console.log(`Skipped (exists): ${rel}  (use --force to overwrite)`);
    } else if (result.status === "forced") {
      console.log(`Overwrote: ${rel}`);
    } else {
      console.log(`Wrote: ${rel}`);
    }
  }
}

async function promptAgents(): Promise<{
  agents: BuiltinAgent[];
  customPath?: string;
}> {
  const suggested = detectSuggestedAgents();

  const options = BUILTIN_AGENTS.map((agent) => {
    const option: { value: BuiltinAgent; label: string; hint?: string } = {
      value: agent,
      label: agent,
    };
    if (suggested.includes(agent)) {
      option.hint = "detected";
    }
    return option;
  });

  const selected = ensure(
    await multiselect({
      message: "Which AI agents should ECS scaffold rules for?",
      options,
      initialValues: suggested.length > 0 ? suggested : (["cursor"] as BuiltinAgent[]),
      required: true,
    })
  ) as BuiltinAgent[];

  let customPath: string | undefined;

  if (selected.includes("custom")) {
    customPath = ensure(
      await text({
        message: "Path for custom agent rules file",
        placeholder: ".myagent/RULES.md",
        validate: (value) => {
          if (!value || !value.trim()) {
            return "Path is required for custom agent";
          }
        },
      })
    ) as string;
  }

  return { agents: selected, ...(customPath !== undefined ? { customPath } : {}) };
}

export async function initRepository(options: InitOptions = {}): Promise<void> {
  const root = process.cwd();
  const created = ensureEvolutionDir(root);

  if (created) {
    console.log("Initialized ECS repository.");
  } else if (!options.agents) {
    // Existing repo, interactive: ask whether to scaffold agents only
    console.log("Repository already initialized.");
  } else {
    console.log("Repository already initialized — scaffolding agent files.");
  }

  let agents: BuiltinAgent[] | undefined;
  let customPath = options.customPath;

  try {
    agents = parseAgentsFlag(options.agents);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  if (!agents) {
    // Interactive: always offer agent scaffolding on fresh init;
    // on existing repo, ask first.
    if (!created) {
      const doScaffold = ensure(
        await confirm({
          message: "Scaffold AI agent rule files for this repo?",
          initialValue: true,
        })
      );
      if (!doScaffold) {
        return;
      }
    }

    const prompted = await promptAgents();
    agents = prompted.agents;
    customPath = prompted.customPath ?? customPath;
  }

  if (agents.includes("custom") && !customPath) {
    console.error("Custom agent selected but --custom-path was not provided.");
    process.exitCode = 1;
    return;
  }

  try {
    const results = scaffoldAgentFiles({
      root,
      agents,
      force: options.force ?? false,
      ...(customPath !== undefined ? { customPath } : {}),
    });
    printScaffoldResults(results);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
