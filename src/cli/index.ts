import { Command } from "commander";
import { browseCommand } from "#/features/explore/browse.command.js";
import { contextCommand } from "#/features/explore/context.command.js";
import { initRepository } from "#/features/init/init.command.js";
import { createCommand } from "#/features/create/create.command.js";
import { closeSessionCommand } from "#/features/create/close-session.command.js";
import { listObjectsCommand } from "#/features/objects/list.command.js";
import { showObject } from "#/features/explore/show.command.js";
import { linkObjects } from "#/features/graph/link.command.js";
import {
  neighborsCommand,
  ancestorsCommand,
  descendantsCommand,
} from "#/features/graph/traverse.command.js";
import { graphCommand } from "#/features/graph/graph.command.js";
import { RELATIONS } from "#/features/objects/edge/EdgeContent.js";
import { DECISION_STATUSES } from "#/features/objects/decision/DecisionContent.js";
import { SEVERITIES } from "#/features/objects/problem/ProblemContent.js";
import { BUILTIN_AGENTS } from "#/features/init/scaffold-agents.js";
import { getCliVersion } from "#/kernel/package-version.js";
import { rememberCommand } from "#/features/create/remember.command.js";
import {
  doctorCommand,
  statusCommand,
} from "#/features/explore/doctor.command.js";
import type { ContextOptions } from "#/features/explore/context.command.js";

const program = new Command();

program
  .name("ecs")
  .description("Keep and recover the reasoning behind your code.")
  .version(getCliVersion());
program.addHelpText(
  "after",
  '\nStart: ecs init\nSave:  ecs remember "Choice" --because "Reason"\nFind:  ecs recall "Your task"\nUse ecs --cwd <project> <command> from another directory.',
);
program.action(() => statusCommand());

program
  .command("init")
  .description("Initialize ECS repository and optional AI agent rule files")
  .option(
    "--agents <list>",
    `Comma-separated agents: ${BUILTIN_AGENTS.join(", ")}`,
  )
  .option("--custom-path <path>", "Rules file path when using the custom agent")
  .option(
    "--cli-prefix <prefix>",
    "Command prefix in scaffolded agent docs (default: ecs)",
  )
  .option("--force", "Overwrite existing agent rule files", false)
  .option("-y, --yes", "Use automatic setup without prompts", false)
  .option(
    "--mcp",
    "Configure local read-only MCP for Claude and selected Cursor projects",
    false,
  )
  .option("--mcp-write", "Also enable the MCP decision recording tool", false)
  .action(initRepository);

program
  .command("remember <choice>")
  .description("Save a choice and its reason in one command; no prompts")
  .requiredOption("--because <reason>", "Why this choice was made")
  .option("--problem <summary>", "Create and link the problem this solves")
  .option("--problem-id <id>", "Link an existing problem")
  .option("--files <paths...>", "Associate project files or directories")
  .option("--commit <ref>", "Attach a real Git commit")
  .option(
    "--supersedes <id>",
    "Replace an earlier decision while preserving history",
  )
  .option(
    "--status <status>",
    `Decision status: ${DECISION_STATUSES.join(", ")}`,
  )
  .option("--author <name>", "Override author name")
  .option("--author-email <email>", "Override author email")
  .option("--dry-run", "Preview without saving")
  .option("--json", "Print structured output")
  .action(rememberCommand);

program
  .command("doctor")
  .description("Check setup, record integrity, and missing relationships")
  .option("--json", "Print structured output")
  .action(doctorCommand);
program
  .command("status")
  .description("Show this project's store and next steps")
  .option("--json", "Print structured output")
  .action(statusCommand);
program
  .command("mcp")
  .description("Serve local MCP tools over stdio (read-only by default)")
  .option("--write", "Enable the decision recording tool")
  .action(async (options) => {
    const { startMcp } = await import("#/features/mcp/server.js");
    startMcp(options);
  });

program
  .command("create [type]")
  .description("Create an object (interactive, or non-interactive with flags)")
  .option("--author <name>", "Override the object author name")
  .option("--author-email <mail>", "Override the object author email")
  .option("--title <title>", "Title (note/problem/decision)")
  .option("--body <body>", "Body (note)")
  .option("--description <text>", "Description (problem)")
  .option("--severity <level>", `Severity (problem): ${SEVERITIES.join(", ")}`)
  .option("--context <text>", "Context (problem)")
  .option("--chosen <text>", "Chosen option (decision)")
  .option("--rationale <text>", "Rationale (decision)")
  .option("--alternatives <list>", "Comma-separated alternatives (decision)")
  .option(
    "--status <status>",
    `Status (decision): ${DECISION_STATUSES.join(", ")}`,
  )
  .option("--problem <text>", "Problem summary text (decision)")
  .option("--expected-outcome <text>", "Expected outcome (decision)")
  .action(createCommand);

program
  .command("close-session")
  .description(
    "Record end-of-chat problem + decision and link them (non-interactive)",
  )
  .option("--problem-id <id>", "Reuse an existing problem id/prefix")
  .option("--problem-title <title>", "New problem title")
  .option("--problem-description <text>", "New problem description")
  .option(
    "--severity <level>",
    `Problem severity (default: medium): ${SEVERITIES.join(", ")}`,
  )
  .option("--problem-context <text>", "Optional problem context")
  .option("--decision-title <title>", "Decision title")
  .option("--chosen <text>", "Chosen option")
  .option("--rationale <text>", "Rationale")
  .option("--alternatives <list>", "Comma-separated alternatives")
  .option(
    "--status <status>",
    `Decision status (default: in-progress): ${DECISION_STATUSES.join(", ")}`,
  )
  .option("--expected-outcome <text>", "Expected outcome")
  .option("--author <name>", "Override author name")
  .option("--author-email <mail>", "Override author email")
  .option("--dry-run", "Print actions without writing", false)
  .action(closeSessionCommand);

program
  .command("context [query...]")
  .alias("recall")
  .description(
    "Retrieve relevant reasoning with source IDs and a bounded output",
  )
  .option("-n, --limit <n>", "Maximum matching records (1–50)", "5")
  .option("--file <paths...>", "Filter by associated files or directories")
  .option("--max-chars <n>", "Maximum output characters (512–100000)", "8000")
  .option("--include-superseded", "Include replaced decisions with a warning")
  .option("--json", "Print structured output")
  .action((query: string[], options: ContextOptions) =>
    contextCommand((query ?? []).join(" "), options),
  );

program
  .command("show <id>")
  .description("Show an ECS object in a human-readable format")
  .option("--json", "Print the record and relationships as JSON")
  .action(showObject);

program
  .command("browse")
  .description("Interactively browse decisions/problems and follow links")
  .action(browseCommand);

program
  .command("list")
  .description("List saved reasoning with readable titles")
  .option("--json", "Print structured records")
  .option("--ids", "Print only object IDs, including relationships")
  .action(listObjectsCommand);

program
  .command("link <from> <to> <relation>")
  .description(`Link two objects (relations: ${RELATIONS.join(", ")})`)
  .option("--author <name>", "Override the edge author name")
  .option("--author-email <mail>", "Override the edge author email")
  .action(linkObjects);

program
  .command("neighbors <id>")
  .description("Show direct incoming and outgoing relationships")
  .action(neighborsCommand);

program
  .command("ancestors <id>")
  .description("Show all objects reachable via incoming edges")
  .action(ancestorsCommand);

program
  .command("descendants <id>")
  .description("Show all objects reachable via outgoing edges")
  .action(descendantsCommand);

program
  .command("graph [id]")
  .description(
    "Show a textual evolution graph (full project, or starting from an object)",
  )
  .action(graphCommand);

program.parseAsync().catch((error: unknown) => {
  console.error(
    `ECS: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
