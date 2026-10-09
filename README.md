# Evograph — Evolution Control System

> Git tracks history. Evograph tracks **evolution**.

**Evograph** (CLI command: `ecs`) is a knowledge layer that versions *meaning* instead of files. Git stores commits and file snapshots; ECS stores **typed artifacts**—notes, problems, decisions, and changes—and the **relationships** between them, so you can see how ideas, tradeoffs, and outcomes connect over time.

**Website:** [evograph.app](https://evograph.app) · **Package:** [`@evograph/cli`](https://www.npmjs.com/package/@evograph/cli)

---

## Requirements

- Node.js 22.12+
- npm

## Install

```bash
npm install -g @evograph/cli
```

In your project repository:

```bash
ecs init
```

---

## What you get

- **Typed objects** — `note`, `problem`, `decision`, and git-linked `change` records.
- **Interactive create** — `ecs create` guides you with prompts; optional flags for scripts and CI.
- **Knowledge graph** — link objects with relations such as `solves`, `informed_by`, and `implemented_by`.
- **Git-aware changes** — when you create objects, ECS can attach recent commits or working-tree changes as `change` nodes.
- **Stable IDs** — content-addressed IDs with short prefixes (like Git short hashes); identical content deduplicates automatically.
- **Graph views** — list, show, browse, and print evolution trees for one object or the whole project.
- **Author attribution** — from `--author` / `--author-email`, `ECS_AUTHOR` / `ECS_AUTHOR_EMAIL`, or your Git config.

---

## Data in your repo

`ecs init` creates a `.evolution/` directory in the project root (safe to commit with your code):

```
.evolution/
  objects/     # notes, problems, decisions, changes, edges
  index/       # graph lookups for fast traversal
  refs/        # reserved for future named pointers
  artifacts/   # reserved for future large artifacts
```

ECS complements Git: Git remains the source of truth for code; `.evolution/` holds project knowledge and how it connects.

---

## Commands

| Command | Description |
| -------- | ------------- |
| `ecs init` | Initialize `.evolution/` and optional AI agent rule files |
| `ecs context` | Dump graph context for AI agents (non-interactive; use at chat start) |
| `ecs close-session` | Record problem + decision and link them (non-interactive; use at chat end) |
| `ecs create [type]` | Create an object (`note`, `problem`, `decision`) interactively or with flags |
| `ecs show <id>` | Human-readable summary and relationships |
| `ecs browse` | Interactively explore decisions/problems and follow links |
| `ecs list` | List all object IDs |
| `ecs link <from> <to> <relation>` | Connect two objects |
| `ecs neighbors <id>` | Direct incoming and outgoing relationships |
| `ecs ancestors <id>` | What led to this object (incoming edges) |
| `ecs descendants <id>` | What follows from this object (outgoing edges) |
| `ecs graph [id]` | Full project evolution graph, or a tree from one object |

**Relations:** `solves`, `informed_by`, `implemented_by`, `supersedes`, `relates_to`

Use abbreviated ID prefixes wherever a full 64-character ID is shown.

---

## Quick start

### 1. Initialize

```bash
ecs init
```

Optional: scaffold agent instructions so coding tools load ECS context:

```bash
ecs init --agents cursor,claude,copilot
ecs init --agents custom --custom-path .myagent/RULES.md
ecs init --agents cursor,claude --force   # overwrite existing adapter files
ecs init --cli-prefix "npx ecs"           # optional: custom command prefix in agent docs (default: ecs)
```

Supported agents: `cursor`, `claude`, `codex`, `copilot`, `windsurf`, `antigravity`, `custom`.

| Output | Purpose |
| -------- | --------- |
| `.evolution/AGENT.md` | Canonical protocol (source of truth) |
| `AGENTS.md` | Shared adapter (Claude, Codex, Windsurf, Antigravity) |
| `.cursor/rules/ecs.mdc` | Cursor |
| `CLAUDE.md` | Claude Code |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.windsurf/rules/ecs.md` | Windsurf |
| Your custom path | Any other agent |

Agents are instructed to run `ecs context` at chat start and `ecs close-session` at the end of a decision-making session (best-effort until deeper IDE integration).

### 2. Create objects

Interactive (requires a terminal):

```bash
ecs create
ecs create problem
```

Non-interactive examples:

```bash
ecs create note --title "..." --body "..."
ecs create problem --title "..." --description "..." --severity medium
ecs create decision --title "..." --chosen "..." --rationale "..." --status in-progress --alternatives "a,b"
```

When you create a decision, ECS can offer to link an existing problem (`solves`) and recent Git activity.

### 3. Inspect and link

```bash
ecs list
ecs show <id-or-prefix>
ecs link <decision-id> <problem-id> solves
ecs neighbors <decision-id>
ecs graph
ecs graph <decision-id>
```

`ecs graph` with no id prints the **complete** project graph. With an id, it prints a tree from that object.

### 4. AI agent workflow

```bash
# Chat start
ecs context

# Chat end
ecs close-session \
  --problem-title "..." \
  --problem-description "..." \
  --decision-title "..." \
  --chosen "..." \
  --rationale "..." \
  --alternatives "a,b,c"
```

### 5. Author override (optional)

```bash
ecs create --author "Jane" --author-email "jane@example.com"
ECS_AUTHOR=ci-bot ECS_AUTHOR_EMAIL=bot@ci ecs create
```

Author metadata does not change object IDs.

---

## Roadmap

- **Now:** typed objects, graph traversal, interactive create, git change linking, agent scaffolding, `context` / `close-session`
- **Next:** named refs, richer git linking, stronger agent enforcement (hooks / MCP)
- **Later:** `ecs ask` — AI over the evolution graph

---

## Version and status

Early release (v0.1). Interactive commands need a TTY. See [CHANGELOG.md](./CHANGELOG.md) for release notes.

---

## Contributing

Bug reports, ideas, and pull requests are welcome. Development setup and publish workflow live in [CONTRIBUTING.md](./CONTRIBUTING.md). See also [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) and [SECURITY.md](./SECURITY.md).

**Maintainer:** Muhammad Atif · [acefolio.dev](https://acefolio.dev) · GitHub [@acefolioDev](https://github.com/acefolioDev)
