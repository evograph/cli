# Evograph — keep the reasoning behind your code

Save a choice and its reason. Recover it when a developer or coding agent needs it again.

Evograph is a local CLI (`ecs`) for linked decisions, problems, notes, and code changes. Records stay in your project's `.evolution/` directory. No account, API key, subscription, or hosted model is needed.

**This branch contains the unreleased `0.2.0-dev.0` workflow.** The npm release currently available is `0.1.2` and does not include the new commands below. See [Try this checkout](#try-this-checkout) to test the changes before release.

[Website](https://evograph.app) · [Issues](https://github.com/evograph/cli/issues) · [Contributing](CONTRIBUTING.md)

## The everyday workflow

Requires **Node.js 22.12+** and npm. After installing a release that contains this workflow:

```sh
cd your-project
ecs init
ecs remember "Use SQLite for local storage" --because "The app must work offline"
ecs recall "offline storage"
```

`recall` returns the recorded choice, rationale, status, relationships, and source ID. It searches stored reasoning; it does not generate an AI answer or inspect your entire codebase.

You do not need to fill out a problem form, select graph relations, or record every coding session. Save decisions that someone will need to understand later.

### Associate the files that matter

```sh
ecs remember "Rotate refresh tokens" \
  --because "A reused token should invalidate its session" \
  --files src/auth

ecs recall "session security" --file src/auth/session.ts
```

Paths are relative to where you run the command and must remain inside the project. `--files` associates paths without reading or uploading their contents. File filters match associated files and directories, including files attached through Git changes.

### Link a problem or implementation when useful

```sh
ecs remember "Use SQLite" --because "Offline operation" --problem "Network access is unreliable"
ecs remember "Use prepared statements" --because "Keep values separate from SQL" --commit HEAD
```

Use `--problem-id <id>` to reuse a problem. `--commit` resolves a real Git commit and records its changed paths and commit message, not its diff. All supplied inputs are checked before new records are saved.

### Change your mind without erasing history

```sh
ecs remember "Use Postgres" \
  --because "Multiple workers now need shared storage" \
  --supersedes <earlier-decision-id>
```

Superseded choices are omitted from normal recall. Use `--include-superseded` to inspect history. Other statuses remain visible: a proposed or failed decision should not be mistaken for current policy.

## Agent setup

Initialization detects existing tool markers and installs the corresponding instructions. Without a detected tool, it adds the shared `AGENTS.md` adapter. Existing project instructions are preserved; ECS updates its own marked section. Repeating setup is safe.

```sh
ecs init --agents claude,cursor,codex
```

Adapters are also available for Copilot, Windsurf, Antigravity, and a custom file. Use `--agents none` for the store alone. `--yes` is accepted for scripts; initialization never needs a terminal or a questionnaire.

Agents are instructed to retrieve relevant reasoning before work and record a supported, meaningful decision afterward. They should skip routine edits and duplicates, and continue your task if ECS is unavailable. Instruction files are best effort; they cannot enforce model behavior.

### Local MCP tools

For Claude Code:

```sh
ecs init --agents claude --mcp
```

Restart the agent and approve the project MCP server. The setup merges an `evograph` entry into `.mcp.json` and preserves other servers. For Cursor, `--agents cursor --mcp` also writes `.cursor/mcp.json`.

Read-only tools are enabled by default:

| Tool         | Use                                                               |
| ------------ | ----------------------------------------------------------------- |
| `ecs_recall` | Retrieve relevant, bounded context with rationale and source IDs. |
| `ecs_get`    | Inspect a source record by ID or unique prefix.                   |
| `ecs_status` | Check the bound project and record health.                        |

Enable recording explicitly:

```sh
ecs init --agents claude --mcp-write
```

This adds `ecs_remember`. It accepts a choice and reason, plus optional problem, files, commit, and superseded decision. Its `dryRun` argument previews without writing. The host controls tool approval; write annotations do not provide an approval mechanism by themselves. An agent must use reasoning supported by the working session and must not invent why a choice was made.

The server uses the official MCP SDK and stdio. It opens no network listener and makes no model/API calls. Records returned to your coding agent may become part of that agent's context; its own data handling still applies. Never store secrets or whole transcripts in ECS.

For another MCP host, configure this command with the project directory:

```sh
ecs --cwd /absolute/path/to/project mcp
# Add --write only if you want the recording tool.
```

Generated config uses this machine's Node and CLI paths to avoid surprise downloads. Regenerate it after moving the CLI or project, or on another machine. Other agents can use the generated instruction files and CLI without MCP. See [Claude Code project MCP configuration](https://code.claude.com/docs/en/mcp).

## Find the right amount of context

```sh
ecs recall "authentication" --limit 3
ecs context "authentication" --max-chars 4000
ecs recall "authentication" --json
```

`context` and `recall` are the same retrieval command. The default is five matching records and at most 8,000 output characters. `--max-chars` bounds the entire text/JSON response, including the version header for text. It preserves valid JSON, reports omitted records, and abbreviates long fields. Use `ecs show <id>` for the full record.

Retrieval uses text matches and directly connected reasoning, prioritizes decision context, and sorts equal matches by recency. It is deterministic lexical retrieval, not semantic search. Empty queries show recent reasoning. No matches produce a clear empty result rather than unrelated records. For corrupt records, recall warns and skips them; run `ecs doctor` to investigate.

## Check your setup

```sh
ecs             # Project status and next step
ecs doctor      # Store integrity, missing references, and adapters
ecs list        # Readable IDs, types, and titles
ecs show <id>   # Full reasoning and relationships
```

Commands find the nearest store from subdirectories and stop at a Git project boundary. To operate from elsewhere, put `--cwd <directory>` before the command. Graph reads use canonical relationship records, so an absent local index does not hide shared history.

`doctor --json`, `status --json`, `list --json`, and `show <id> --json` support scripts. `list --ids` preserves raw ID listing, including edge objects. Unique hexadecimal prefixes need at least four characters.

## Detailed graph tools

The earlier commands remain available:

| Command                               | Purpose                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `create [note\|problem\|decision]`    | Guided creation in a terminal, or flags for scripts.                             |
| `close-session`                       | Detailed linked problem/decision capture with alternatives and expected outcome. |
| `link <from> <to> <relation>`         | Connect existing records.                                                        |
| `neighbors <id>`                      | Direct incoming and outgoing links.                                              |
| `ancestors <id>` / `descendants <id>` | Follow the graph.                                                                |
| `graph [id]`                          | Full graph or a selected tree.                                                   |
| `browse`                              | Interactive graph navigation in a terminal.                                      |

Run `ecs <command> --help` for options. Non-interactive `create` fails promptly when required fields are missing. Problems default to medium severity; decisions default to in-progress status. Existing custom status values in old records remain readable.

## Data and compatibility

- Existing typed and legacy object layouts remain readable; no migration is required.
- Object IDs hash the type/schema/content. Author and timestamps do not change identity.
- Repeated identical captures deduplicate. New file associations are part of a decision's content.
- Records and links are append-only. Supersession preserves the original decision.
- Commit `.evolution/objects/` with your code when you want shared reasoning. Review records for sensitive data before committing, just as you review source.
- ECS has no telemetry, automatic transcript collection, cloud sync, or background service.

## Try this checkout

```sh
git clone https://github.com/evograph/cli.git
cd cli
git switch improve/ecs-workflow
npm ci
npm test
node bin/ecs.js --cwd /absolute/path/to/your-project init
node bin/ecs.js --cwd /absolute/path/to/your-project remember "Choice" --because "Reason"
node bin/ecs.js --cwd /absolute/path/to/your-project recall "Task"
```

`npm test` builds the CLI and runs unit, real CLI, and real stdio MCP tests. For agent setup on this checkout, `node bin/ecs.js --cwd /path/to/project init --agents claude --mcp-write` configures the built binary directly. For instruction-only setup, pass an absolute CLI command with `--cli-prefix` or install the local package before using `ecs` in those files.

This is an early release. Report a reproducible issue without private project content. [Security policy](SECURITY.md) · [Code of conduct](CODE_OF_CONDUCT.md).

ISC licensed. Maintained by [Muhammad Atif](https://github.com/acefolioDev).
