export const DEFAULT_CLI_PREFIX = "ecs";

export function agentProtocolMarkdown(
  cliPrefix: string = DEFAULT_CLI_PREFIX
): string {
  return `# ECS Agent Protocol

This repository uses **ECS (Evolution Control System)** to track problems, decisions, and how they connect. Compliance is best-effort until MCP/hooks exist — follow this protocol whenever you work in this repo.

Canonical store: \`.evolution/\`

## At the start of every chat (before coding)

Run:

\`\`\`bash
${cliPrefix} context
\`\`\`

Read the output. Prefer existing problem/decision IDs. Do not invent duplicate problems for the same issue.

## During work

- Link new work to existing nodes when relevant.
- Do **not** run interactive \`create\` / \`browse\` (they need a TTY).

## At the end of the discussion (once)

Only if an architectural/product problem was solved or a meaningful decision was made — **not** for typos, pure refactors, or no decision. Run **once** at the end of the chat:

\`\`\`bash
${cliPrefix} close-session \\
  --problem-title "..." \\
  --problem-description "..." \\
  --decision-title "..." \\
  --chosen "..." \\
  --rationale "..." \\
  --alternatives "a,b,c"
\`\`\`

To reuse an existing problem:

\`\`\`bash
${cliPrefix} close-session \\
  --problem-id <id-or-prefix> \\
  --decision-title "..." \\
  --chosen "..." \\
  --rationale "..."
\`\`\`

## Rules

- Run \`close-session\` only at end; at most once per chat unless the user starts a distinct new problem.
- Skip \`close-session\` when nothing meaningful was decided.
- Never store secrets in ECS objects.
`;
}

export function thinAdapterBlurb(
  cliPrefix: string = DEFAULT_CLI_PREFIX
): string {
  return `This repo uses ECS (.evolution/). Follow \`.evolution/AGENT.md\`.

Before coding: \`${cliPrefix} context\`
At end of a decision-making chat (once): \`${cliPrefix} close-session\` with problem + decision flags.
Do not use interactive \`${cliPrefix} create\` / \`${cliPrefix} browse\`.
Never store secrets in ECS objects.`;
}

export function cursorRuleMarkdown(
  cliPrefix: string = DEFAULT_CLI_PREFIX
): string {
  return `---
description: ECS evolution tracking — load context at start, record decisions at end
alwaysApply: true
---

# ECS

${thinAdapterBlurb(cliPrefix)}
`;
}

export function windsurfRuleMarkdown(
  cliPrefix: string = DEFAULT_CLI_PREFIX
): string {
  return `---
trigger: always_on
description: ECS evolution tracking
---

# ECS

${thinAdapterBlurb(cliPrefix)}
`;
}

export function agentsMdMarkdown(
  cliPrefix: string = DEFAULT_CLI_PREFIX
): string {
  return `# AGENTS

${thinAdapterBlurb(cliPrefix)}

Full protocol: [\`.evolution/AGENT.md\`](.evolution/AGENT.md)
`;
}

export function claudeMdMarkdown(
  cliPrefix: string = DEFAULT_CLI_PREFIX
): string {
  return `# Claude Code — ECS

${thinAdapterBlurb(cliPrefix)}

Full protocol: [\`.evolution/AGENT.md\`](.evolution/AGENT.md)
`;
}

export function copilotInstructionsMarkdown(
  cliPrefix: string = DEFAULT_CLI_PREFIX
): string {
  return `# Copilot instructions — ECS

${thinAdapterBlurb(cliPrefix)}

Full protocol: see \`.evolution/AGENT.md\` in this repository.
`;
}

export function customAdapterMarkdown(
  cliPrefix: string = DEFAULT_CLI_PREFIX
): string {
  return `# ECS Agent Instructions

${thinAdapterBlurb(cliPrefix)}

Full protocol: \`.evolution/AGENT.md\`
`;
}
