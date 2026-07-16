# AGENTS

This repo uses ECS (.evolution/). Follow `.evolution/AGENT.md`.

Before coding: `npm run dev -- context`
At end of a decision-making chat (once): `npm run dev -- close-session` with problem + decision flags.
Do not use interactive `ecs create` / `ecs browse`.
Never store secrets in ECS objects.

Full protocol: [`.evolution/AGENT.md`](.evolution/AGENT.md)
