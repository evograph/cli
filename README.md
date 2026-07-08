# ECS — Evolution Control System

> Git tracks history. ECS tracks **evolution**.

ECS is a knowledge layer that versions *meaning* instead of files. Where Git stores commits (file snapshots), ECS stores **typed artifacts** and the **relationships** between them, forming a knowledge graph of how ideas, problems, and decisions connect.

This document describes the **current state (v0.1)** and how to test it end-to-end.

---

## Current capabilities

- **Content-addressed object store** — every object is identified by the SHA-256 hash of its canonical form (`header` + `content`).
- **Typed domain objects** — `Note` and `Edge`, built on an abstract `ECSObject` base class.
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
  objects/     # content-addressed objects (notes, edges)
  index/       # graph index (incoming/outgoing edge lookups)
  refs/        # reserved for future named pointers
  artifacts/   # reserved for future large artifacts
  tmp/
```

---

## Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize an ECS repository (`.evolution/`) |
| `create` | Create a sample `Note` object |
| `show <id>` | Print an object and its relationships |
| `list` | List all object IDs |
| `link <from> <to> <relation>` | Create a typed edge between two objects |
| `neighbors <id>` | Show direct incoming + outgoing relationships |
| `ancestors <id>` | Walk incoming edges (what led here) |
| `descendants <id>` | Walk outgoing edges (what follows) |
| `graph <id>` | Print a textual graph from an object |

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
npm run dev -- create
```

Expected: `Evolved: new object recorded at <id>`

Run it again — deduplication kicks in:

```bash
npm run dev -- create
```

Expected: `No evolution: header and content are unchanged — this state already exists at <id>`

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

Expected: the object's JSON. (No relationships yet.)

### 5. Build a small graph

Create two distinct objects to link. Since `create` produces a fixed sample note, use a quick inline script to add two unique notes:

```bash
npx tsx -e "
import { ObjectRepository } from './src/repositories/ObjectRepository.ts';
import { Note } from './src/types/Note.ts';
const repo = new ObjectRepository();
const problem  = repo.save(new Note({ title: 'Problem: slow queries',   body: 'Dashboard queries take 4s' }));
const decision = repo.save(new Note({ title: 'Decision: add Redis cache', body: 'Cache hot queries in Redis' }));
console.log('problem: ', problem.id);
console.log('decision:', decision.id);
"
```

Note the two IDs, then link them (abbreviated prefixes are fine):

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

```
CLI (commander)
      │
      ▼
Repositories ── ObjectRepository (save/load/list)
      │         GraphRepository (link/traverse)
      ▼
Storage ─────── objectStore (content-addressed blobs)
                graphIndex   (incoming/outgoing edge maps)
      │
      ▼
Filesystem (.evolution/)

Domain model:  ECSObject (abstract)
                 ├── Note
                 └── Edge
```

**Key design points**

- Object **identity** = `hash(canonicalize(header + content))`. Metadata (author, timestamps) is excluded, so the same content always dedupes.
- **Storage is dumb** — it only reads/writes JSON records by ID. Domain classes own canonicalization and validation.
- **Edges are objects too** — a relationship is just an `Edge` object, so it's hashed, deduplicated, and traversable like any other artifact.
- The **graph index** avoids scanning the whole store: each node keeps lists of the edge IDs that touch it.

---

## Roadmap

- **Now:** typed nodes + typed edges + traversal ✅
- **Next:** real `create note|problem|decision` commands with CLI input
- **Then:** named refs, `ecs ask` (AI over the graph), SynthCode artifacts

---

## Notes

- This is an early prototype (v0.1). The `create` command currently produces a fixed sample note; richer creation is on the roadmap.
- ECS complements Git — it is not a replacement. Git stays the source of truth for code; ECS is the source of truth for project knowledge.
