# ECS — Evolution Control System

> Git tracks history. ECS tracks **evolution**.

ECS is a knowledge layer that versions *meaning* instead of files. Where Git stores commits (file snapshots), ECS stores **typed artifacts** and the **relationships** between them, forming a knowledge graph of how ideas, problems, and decisions connect.

This document describes the **current state (v0.1)** and how to test it end-to-end.

---

## Current capabilities

- **Content-addressed object store** — every object is identified by the SHA-256 hash of its canonical form (`header` + `content`).
- **Typed domain objects** — `Note`, `Problem`, `Decision`, `Change`, and `Edge`, built on an abstract `ECSObject` base class.
- **Interactive create** — `ecs create` walks you through typed prompts with predefined options plus a "Custom…" escape hatch.
- **Git-native change tracking** — auto-detects commits and uncommitted working-tree changes and links them as a `change` node via an `implemented_by` edge.
- **Automatic deduplication** — identical `header` + `content` produce the same ID and are stored only once.
- **Abbreviated IDs** — refer to any object by a unique prefix, like Git short hashes.
- **Knowledge graph** — connect objects with typed relationships (edges).
- **Graph traversal** — inspect neighbors, ancestors, descendants, and print a textual graph.
- **Author attribution** — resolved from `--author` flag → `ECS_AUTHOR` env → `git config`.

---



## Requirements

- Node.js 20+
- npm



## Setup

```bash
npm install
```

All commands run through the `dev` script:

```bash
npm run dev -- <command> [args]
```

The `--` separates npm args from ECS args.

---



## Repository layout

Running `init` creates a `.evolution/` directory:

```
.evolution/
  objects/
    notes/     # note objects (content-addressed by id)
    problems/  # problem objects
    decisions/ # decision objects
    changes/   # git-change objects
    edges/     # relationship edges
    ...        # other types (fallback buckets)
  index/       # graph index (incoming/outgoing edge lookups)
  refs/        # reserved for future named pointers
  artifacts/   # reserved for future large artifacts
  tmp/
```

---



## Commands


| Command                       | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `init`                        | Initialize an ECS repository (`.evolution/`)                   |
| `create [type]`               | Create an object interactively (`note`, `problem`, `decision`) |
| `show <id>`                   | Print a human-readable summary and its relationships           |
| `browse`                      | Interactively pick decisions/problems and follow links         |
| `list`                        | List all object IDs                                            |
| `link <from> <to> <relation>` | Create a typed edge between two objects                        |
| `neighbors <id>`              | Show direct incoming + outgoing relationships                  |
| `ancestors <id>`              | Walk incoming edges (what led here)                            |
| `descendants <id>`            | Walk outgoing edges (what follows)                             |
| `graph <id>`                  | Print a textual graph from an object                           |


**Relations:** `solves`, `informed_by`, `implemented_by`, `supersedes`, `relates_to`

---



## Testing the current state

Follow this walkthrough to exercise every feature.

### 1. Initialize

```bash
npm run dev -- init
```

Expected: `Initialized ECS repository.` and a new `.evolution/` folder.

### 2. Create an object

```bash
npm run dev -- create            # pick a type interactively
npm run dev -- create problem     # or preselect the type
```

`create` runs an interactive flow: choose a type (`note`, `problem`, `decision`), answer the prompts (predefined options offer a "Custom…" choice), and — if you're in a git repo with changes — it offers to link commits or working-tree changes as a `change` node.

Expected on success: `Created <type> <id>`. Re-creating the same content shows `No evolution: this <type> already exists at <id>` (deduplication).

> Interactive prompts require a real terminal (TTY).



### 3. List objects

```bash
npm run dev -- list
```

Expected: one or more 64-character object IDs.

### 4. Show an object

Use the full ID from `list`, or an abbreviated prefix:

```bash
npm run dev -- show <id-or-prefix>
```

Expected: the object's JSON, followed by any relationships.

### 5. Build a small graph

Create a `problem` and a `decision` interactively:

```bash
npm run dev -- create problem
npm run dev -- create decision
```

When creating the `decision`, ECS offers to link it to the existing `problem` (a `solves` edge) and to link git changes. You can also link objects manually with the two IDs from `list` (abbreviated prefixes are fine):

```bash
npm run dev -- link <decision-id> <problem-id> solves
```

Expected:

```
Linked: <decision-id>
  --[solves]--> <problem-id>
Edge recorded at <edge-id>
```

Re-run the same link to confirm edges deduplicate:

```bash
npm run dev -- link <decision-id> <problem-id> solves
```

Expected: `No evolution: this relationship already exists at <edge-id>`

### 6. Inspect relationships

```bash
npm run dev -- show <decision-id>
```

Expected: the object JSON followed by:

```
Outgoing:
  • solves → note (<short-id>)
```



### 7. Traverse the graph

```bash
npm run dev -- neighbors <decision-id>
npm run dev -- ancestors <problem-id>
npm run dev -- descendants <decision-id>
npm run dev -- graph <decision-id>
```

`graph` prints a textual tree:

```
note (<decision>)
    │ solves
    ▼
    note (<problem>)
```

### 8. Author attribution (optional)

```bash
npm run dev -- create --author "Jane" --author-email "jane@example.com"
# or
ECS_AUTHOR=ci-bot ECS_AUTHOR_EMAIL=bot@ci npm run dev -- create
```

Author is stored in metadata and does **not** affect the object ID.

---



## Type-check

```bash
npx tsc --noEmit
```

---



## Architecture

Vertical-slice layout — each feature owns its command, domain, and persistence:

```text
src/
  kernel/           # shared primitives (ECSObject, hash, paths, author, prompts)
  features/
    init/           # repository bootstrap
    objects/        # artifact types, store, repository, registry, view
    graph/          # edges, linking, traversal
    create/         # interactive creation + git linking
    explore/        # human-readable show + browse
  cli/              # commander wiring (composition root)
```

```text
cli/index.ts
      │
      ├── features/init
      ├── features/objects  (note, problem, decision, change, edge)
      ├── features/graph
      ├── features/create
      └── features/explore
            │
            ▼
      kernel/  (ECSObject, hash, paths, author, prompts)
            │
            ▼
      .evolution/  (filesystem)
```

**Dependency rules**

| Layer | May import |
|-------|------------|
| `kernel/` | only `kernel/` |
| `features/*` | `kernel/`, other features when needed |
| `cli/` | all features (composition only) |

**Key design points**

- Object **identity** = `hash(canonicalize(header + content))`. Metadata (author, timestamps) is excluded, so the same content always dedupes.
- **Storage is dumb** — `features/objects/object.store.ts` only reads/writes JSON by ID. Domain classes own canonicalization and validation.
- **Edges are objects too** — relationships are `Edge` artifacts, hashed and deduplicated like any other object.
- The **graph index** (`features/graph/graph.index.ts`) avoids full-store scans during traversal.

---



## Roadmap

- **Now:** typed nodes + typed edges + traversal + interactive `create` + git change linking ✅
- **Next:** named refs, richer git linking, non-interactive/scriptable `create` flags
- **Then:** `ecs ask` (AI over the graph), SynthCode artifacts

---



## Notes

- This is an early prototype (v0.1). `create` is interactive and requires a TTY.
- ECS complements Git — it is not a replacement. Git stays the source of truth for code; ECS is the source of truth for project knowledge.

