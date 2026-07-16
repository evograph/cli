# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Open-source contribution docs, issue/PR templates, and CI workflow
- `ecs init --agents` scaffolds `.evolution/AGENT.md` plus thin adapters (Cursor, Claude, Codex, Copilot, Windsurf, Antigravity, custom)
- `ecs context` — non-interactive graph dump for AI agents at chat start
- `ecs close-session` — create problem + decision and `solves` link at chat end
- Non-interactive `ecs create` flags (`--title`, `--body`, `--description`, `--chosen`, etc.)
- `ecs graph` with no id prints the complete project evolution graph (all roots / components)

## [0.1.0] - 2026-07-16

### Added

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

[Unreleased]: https://github.com/acefolioDev/ecs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/acefolioDev/ecs/releases/tag/v0.1.0
