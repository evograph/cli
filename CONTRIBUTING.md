# Contributing to ECS

Thank you for your interest in contributing to **ECS (Evolution Control System)**.

This guide explains how to set up the project, propose changes, and get pull requests merged.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Coding guidelines](#coding-guidelines)
- [Branch and commit conventions](#branch-and-commit-conventions)
- [Pull request process](#pull-request-process)
- [Review expectations](#review-expectations)
- [Release and changelog](#release-and-changelog)

## Code of conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Ways to contribute

You can help in several ways:

- Report bugs with clear reproduction steps
- Suggest features or improvements in issues first
- Fix bugs or implement approved features via pull request
- Improve documentation
- Add tests when behavior changes

For larger changes, **open an issue before starting work** so maintainers can agree on direction and avoid duplicate effort.

Good first contributions:

- Documentation fixes
- Small CLI UX improvements
- Test coverage for existing commands
- Typo and error-message improvements

## Development setup

### Requirements

- Node.js 20+
- npm
- Git

### Install and run

```bash
git clone https://github.com/acefolioDev/ecs.git
cd ecs
npm install
```

Run the CLI in development mode:

```bash
npm run dev -- <command> [args]
```

The `--` separates npm args from ECS args.

### Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev -- init --agents cursor,claude` | Initialize `.evolution/` + agent rule adapters |
| `npm run dev -- context` | Dump graph context for agents |
| `npm run dev -- close-session ...` | Record problem + decision at chat end |
| `npm run build` | Compile TypeScript to `dist/` |
| `npx tsc --noEmit` | Type-check without writing output |
| `npm run bundle` | Build bundled CLI artifact |

### Local testing workflow

1. `npm run dev -- init --agents cursor`
2. Exercise commands (`context`, `create`, `close-session`, `list`, `show`, `link`, `graph`, etc.)
3. Confirm type-check and build pass before opening a PR

> Interactive `create` and `browse` require a TTY. Prefer non-interactive flags / `close-session` for agent and CI use.

### Agent protocol files

When scaffolding agents, prefer editing `.evolution/AGENT.md` (canonical). Thin adapters (`.cursor/rules/ecs.mdc`, `AGENTS.md`, `CLAUDE.md`, etc.) should stay short pointers.

## Project structure

ECS uses a vertical-slice architecture:

```text
src/
  kernel/           # shared primitives (ECSObject, hash, paths, author, prompts)
  features/
    init/           # repository bootstrap + agent rule scaffolding
    objects/        # artifact types, store, repository, registry, view
    graph/          # edges, linking, traversal
    create/         # interactive/non-interactive creation + close-session + git linking
    explore/        # show, browse, context
  cli/              # commander wiring (composition root)
```

### Dependency rules

| Layer | May import |
|-------|------------|
| `kernel/` | only `kernel/` |
| `features/*` | `kernel/`, other features when needed |
| `cli/` | all features (composition only) |

Keep these boundaries intact when adding code.

### Design principles to preserve

- Object identity = `hash(canonicalize(header + content))`
- Metadata (author, timestamps) does **not** affect object ID
- Storage layer stays dumb; domain classes own canonicalization
- Edges are first-class objects, hashed and deduplicated like other artifacts

## Coding guidelines

- Match existing TypeScript style and naming in the file you edit
- Keep changes focused: one logical change per pull request
- Prefer extending existing abstractions over duplicating logic
- Add comments only for non-obvious behavior
- Do not commit generated artifacts (`dist/`, `build/`)
- Do not commit local ECS data (`.evolution/`)

### TypeScript

- Strict mode is enabled; keep types accurate
- Use path alias imports (`#/...`) consistently
- Run `npx tsc --noEmit` before submitting

### CLI behavior

- Preserve backward compatibility for existing commands when possible
- New commands should include `--help` descriptions via Commander
- Error messages should be actionable and concise

## Branch and commit conventions

### Branch naming

Use descriptive prefixes:

- `feat/<short-description>` — new feature
- `fix/<short-description>` — bug fix
- `docs/<short-description>` — documentation only
- `chore/<short-description>` — tooling, deps, CI
- `refactor/<short-description>` — internal refactor without behavior change

Examples:

- `feat/non-interactive-create-flags`
- `fix/link-dedup-message`
- `docs/contributing-guide`

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(create): add --title flag for non-interactive mode
fix(graph): handle missing node in traversal
docs: add branch protection checklist
chore(ci): run typecheck on pull requests
```

Keep the subject line under 72 characters. Add a body when context is needed.

## Pull request process

ECS uses a **fork + pull request** workflow. Contributors do **not** push directly to `main`.

1. Fork the repository on GitHub
2. Create a branch from `main`
3. Make your changes with clear commits
4. Ensure checks pass locally:
   - `npx tsc --noEmit`
   - `npm run build`
5. Push your branch to your fork
6. Open a pull request against `main`
7. Fill out the PR template completely
8. Request review and address feedback
9. Maintainer merges after approval and passing CI

### PR checklist

Before requesting review, confirm:

- [ ] PR solves one focused problem
- [ ] Branch is up to date with `main` (rebase if needed)
- [ ] Type-check passes
- [ ] Build passes
- [ ] Manual CLI testing done for behavior changes
- [ ] Docs updated when user-facing behavior changes
- [ ] `CHANGELOG.md` updated for notable changes (optional for tiny fixes)

### Draft PRs

Use draft pull requests for early feedback on large or uncertain changes.

## Review expectations

Maintainers review for:

- Correctness and edge cases
- Architecture fit (kernel/features/cli boundaries)
- Backward compatibility
- Documentation quality
- Scope (avoid unrelated changes)

Review turnaround depends on maintainer availability. Friendly follow-ups after a few days are welcome.

If changes are requested:

1. Push additional commits or squash locally as requested
2. Re-run checks
3. Re-request review

Please do not force-push after review starts unless a maintainer asks.

## Release and changelog

Maintainers handle versioning and releases.

- Notable changes are recorded in [`CHANGELOG.md`](./CHANGELOG.md)
- Releases are tagged (`v0.1.0`, `v0.2.0`, etc.)
- `main` should remain releasable at all times

### Publishing `@evograph/cli` to npm

The package ships compiled `dist/` and `bin/` only (see `files` in [`package.json`](./package.json)).

1. Bump `version` in `package.json` and update [`CHANGELOG.md`](./CHANGELOG.md).
2. Log in as an npm user with access to the [evograph org](https://www.npmjs.com/settings/evograph/packages): `npm login`
3. From the repo root:

   ```bash
   npm publish
   ```

   `prepublishOnly` runs `build` and `test`; scoped packages use `publishConfig.access: "public"`.

4. Smoke-test locally before publishing:

   ```bash
   npm run build
   npm pack --dry-run   # must list dist/cli/index.js, not src/
   npm pack
   npm install -g ./evograph-cli-<version>.tgz
   ecs --help
   ```

5. After publish, confirm [npmjs.com/package/@evograph/cli](https://www.npmjs.com/package/@evograph/cli) and update [evograph.app](https://evograph.app) install docs if needed.

## Questions

- Open a [GitHub Discussion](https://github.com/acefolioDev/ecs/discussions) for questions
- Open an issue for bugs and feature proposals
- See [SECURITY.md](./SECURITY.md) for vulnerability reports (do not open public issues for security bugs)

Thank you for helping ECS evolve.
