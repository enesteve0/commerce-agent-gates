# Gemini CLI Instructions

See [`AGENTS.md`](./AGENTS.md) for canonical project instructions, core invariants, verified commands, and context routing.

## Gemini Agent Directives

1. **Context Routing**: Route all deep task research through [`docs/agent/CONTEXT_MAP.md`](./docs/agent/CONTEXT_MAP.md).
2. **Invariants**: Strictly enforce all non-negotiable invariants defined in [`docs/agent/INVARIANTS.md`](./docs/agent/INVARIANTS.md).
3. **Verification**: Always execute and pass:
   ```bash
   npm run lint && npm run format && npm test && node bin/commerce-agent-gates.mjs .
   ```
