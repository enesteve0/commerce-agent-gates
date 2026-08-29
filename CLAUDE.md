# Claude Code Instructions

@AGENTS.md

## Claude Code Specific Directives

- **Source of Truth**: All standing repository rules, invariants, and commands are defined in [`AGENTS.md`](./AGENTS.md).
- **Task Context Routing**: For deep subsystem context, always consult [`docs/agent/CONTEXT_MAP.md`](./docs/agent/CONTEXT_MAP.md).
- **Verification Protocol**: Before finishing any coding task, always run:
  ```bash
  npm run lint && npm run format && npm test && node bin/commerce-agent-gates.mjs .
  ```
- **Zero Runtime Dependencies**: Never install runtime packages. If a dependency seems necessary, stop and consult the maintainer.
