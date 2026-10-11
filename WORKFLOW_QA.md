# ECS workflow review — 0.2.0-dev.0

This is an unreleased development version. These results do not describe the current npm release.

## What changed

- Automatic, repeatable setup that preserves existing project instructions.
- One-command capture: `ecs remember "Choice" --because "Reason"`.
- Task and file scoped recall with rationale, source IDs, supersession awareness, and an output budget.
- Local stdio MCP with read-only tools by default and explicit write enablement.
- Project discovery from nested directories, explicit `--cwd`, readable lists, and setup/integrity diagnostics.
- Existing object formats and advanced commands retained; CLI output changes are documented in the changelog.

## Verification

Local verification on macOS, 9 October 2026:

| Check                                                                                                   | Result                                                                         |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| TypeScript type check and compiled build                                                                | Passed                                                                         |
| Full test suite on Node 24.19.0                                                                         | 101 tests, 29 files passed                                                     |
| Full test suite on Node 25.2.1                                                                          | 101 tests, 29 files passed                                                     |
| Runtime dependency audit                                                                                | Zero reported vulnerabilities                                                  |
| Standalone JavaScript bundle                                                                            | Built and reported the development version                                     |
| npm tarball                                                                                             | Includes the new CLI entry point; excludes source, tests, and local store data |
| Clean temporary tarball installation on Node 24                                                         | Passed                                                                         |
| Generated Claude and Cursor MCP configurations                                                          | Both connected through the installed binary                                    |
| Installed read-only MCP                                                                                 | Handshake, discovery, and status passed; write tool absent                     |
| Installed write MCP                                                                                     | Capture, task/file recall, source ID, and store health passed                  |
| Existing rules, Git paths, nested project boundaries, invalid input, dry runs, retries, corrupt records | Covered by automated tests                                                     |

CI checks Node 22 and Node 24. The local checks above do not substitute for their remote results.

## Practical limits

- Retrieval is lexical and relationship based; it does not understand every paraphrase. No embeddings, hosted account, or external model is required.
- MCP transport and tools were tested using the official client. Interactive Claude, Cursor, Codex, and other agent sessions were not tested; each host controls tool approval and whether the model uses available tools.
- MCP configuration records local executable paths. Regenerate it after moving the installation or changing computers. Automatic project configuration covers Claude and selected Cursor projects; other hosts require their own configuration.
- Write mode is explicit. Approval annotations are hints to clients, not an ECS permission enforcement layer. Dry runs are available.
- Saved reasoning can be stale or wrong. Records are data, and agents are instructed to verify their applicability and cite their sources.
- ECS does not upload records. Git sharing, agent hosts, and model providers have their own data handling. Never record secrets or entire conversations.
- Native executables for every target platform were not packaged or tested. The JavaScript bundle and npm installation were verified.
- Large repositories have not been benchmarked. Recall scans canonical records; this favors correctness when caches are absent over unmeasured scale claims.
- No npm publication or production release was performed.

## First user trial

Use the development checkout with a disposable project:

```bash
node bin/ecs.js --cwd /path/to/project init --agents claude,cursor --mcp
node bin/ecs.js --cwd /path/to/project remember "Use SQLite" --because "Works offline" --files src/storage.ts
node bin/ecs.js --cwd /path/to/project recall "offline storage"
node bin/ecs.js --cwd /path/to/project doctor
```

For an instruction-only adapter in a source checkout, set `--cli-prefix` to the full executable invocation as described in the README. The generated MCP configuration already uses the exact installed executable.

Have a developer complete a real task, then start a fresh agent session and check whether it retrieves the relevant reason. Record time to first useful retrieval, setup failures, unnecessary tool calls, and whether the source actually changed the implementation. Those observations should determine the next iteration.
