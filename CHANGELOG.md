# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `remember`: capture a choice and rationale with two fields, optional problem/file/commit links, preview, JSON, and supersession.
- `recall`: task-focused retrieval with source IDs, rationale, file scopes, status, and a hard output budget; also available as `context`.
- Local stdio MCP using the official SDK: recall, inspect, and status tools; recording is explicitly enabled with `--write` / `init --mcp-write`.
- `doctor`, `status`, JSON inspection, readable record listing, and `--cwd` project selection.
- Real packaged CLI and MCP client/server regression tests.

### Changed

- Initialization is non-interactive, detects existing tools, and preserves project instructions using managed sections.
- Commands discover the store from nested directories while respecting Git boundaries.
- `context` returns selected reasoning instead of a full graph dump. Use `graph` for the whole graph.
- `list` is human readable by default; use `list --ids` for the previous ID-oriented output.
- Superseded decisions are omitted from normal recall; use `--include-superseded` for history.
- Development version is `0.2.0-dev.0`; no npm publication has been performed.

### Compatibility and fixes

- Preserve schema-v1 records, legacy object layouts, existing IDs, and detailed graph commands.
- Keep rule frontmatter first, merge existing MCP configuration, and refuse unrelated server-name collisions.
- Read canonical relationships without relying on local indexes; tolerate corrupt cache JSON during link writes.
- Fail incomplete scripted commands promptly; validate capture inputs before creating records.
- Parse Git paths without losing spaces, tabs, or rename destinations; pass commit refs without a shell.
- Reject filesystem paths as record IDs, bound Git author lookup, and keep diagnostic stderr off the MCP protocol stream.
- Bundle the actual CLI entry point and embed its version for standalone use.

### Fixed

- Refresh compatible dependency versions in the lockfile; update prompt result typing for Clack 1.8 cancellation symbols.
- Align repository links and lockfile metadata with `evograph/cli`.
- Require Node.js 22.12+ to match Commander 15; verify Node.js 22 and 24 in CI using `npm ci`.

## [0.1.2] - 2026-09-29

### Added

- `ecs init --cli-prefix` to customize command strings in scaffolded agent docs
- `ecs --version` and CLI version line in `ecs context` output

### Changed

- Agent scaffolding defaults to the `ecs` command (not `npm run dev --`) for npm installs

### Fixed

- Scaffolded agent adapters use the same CLI prefix for `create` / `browse` as for `context` / `close-session`

## [0.1.1] - 2026-09-29

### Changed

- README aimed at npm users (`npm install -g @evograph/cli`, `ecs` usage) instead of contributor dev workflow
- GitHub issue templates refreshed with clearer prompts and labels
- CI: disable npm dependency cache until `package-lock.json` is committed (fixes setup-node lockfile error)

### Fixed

- npm publish tarball ships `bin/` + `dist/` via `files` in `package.json` (global install runs compiled CLI)

## [0.1.0] - 2026-09-29

### Changed

- npm package published as `@evograph/cli` with install docs and publish metadata (homepage [evograph.app](https://evograph.app))

### Added

- Open-source contribution docs, issue/PR templates, and CI workflow
- `ecs init --agents` scaffolds `.evolution/AGENT.md` plus thin adapters (Cursor, Claude, Codex, Copilot, Windsurf, Antigravity, custom)
- `ecs context` — non-interactive graph dump for AI agents at chat start
- `ecs close-session` — create problem + decision and `solves` link at chat end
- Non-interactive `ecs create` flags (`--title`, `--body`, `--description`, `--chosen`, etc.)
- `ecs graph` with no id prints the complete project evolution graph (all roots / components)
- Content-addressed object store with SHA-256 IDs
- Typed domain objects: `Note`, `Problem`, `Decision`, `Change`, `Edge`
- Interactive `create` command with typed prompts
- Git-native change tracking and `implemented_by` edge linking
- Automatic deduplication for identical content
- Abbreviated ID resolution
- Knowledge graph with typed relationships
- Graph traversal commands: `neighbors`, `ancestors`, `descendants`, `graph`
- Author attribution via flags, env vars, or git config
- Explore commands: `show`, `browse`, `list`

[Unreleased]: https://github.com/evograph/cli/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/evograph/cli/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/evograph/cli/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/evograph/cli/releases/tag/v0.1.0
