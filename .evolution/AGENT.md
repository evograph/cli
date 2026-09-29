# ECS Agent Protocol

This repository uses **ECS (Evolution Control System)** to track problems, decisions, and how they connect. Compliance is best-effort until MCP/hooks exist — follow this protocol whenever you work in this repo.

Canonical store: `.evolution/`

## At the start of every chat (before coding)

Run:

```bash
npm run dev -- context
```

Read the output. Prefer existing problem/decision IDs. Do not invent duplicate problems for the same issue.

## During work

- Link new work to existing nodes when relevant.
- Do **not** run interactive `create` / `browse` (they need a TTY).

## At the end of the discussion (once)

Only if an architectural/product problem was solved or a meaningful decision was made — **not** for typos, pure refactors, or no decision. Run **once** at the end of the chat:

```bash
npm run dev -- close-session \
  --problem-title "..." \
  --problem-description "..." \
  --decision-title "..." \
  --chosen "..." \
  --rationale "..." \
  --alternatives "a,b,c"
```

To reuse an existing problem:

```bash
npm run dev -- close-session \
  --problem-id <id-or-prefix> \
  --decision-title "..." \
  --chosen "..." \
  --rationale "..."
```

## Rules

- Run `close-session` only at end; at most once per chat unless the user starts a distinct new problem.
- Skip `close-session` when nothing meaningful was decided.
- Never store secrets in ECS objects.
