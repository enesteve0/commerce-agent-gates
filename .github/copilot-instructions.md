# GitHub Copilot Custom Instructions

Canonical repository rules and instructions live in [`AGENTS.md`](../AGENTS.md).

## Standing Copilot Constraints

- **Zero Runtime Dependencies**: Do not suggest or import third-party packages in `src/`. Node 22+ standard library only.
- **Masking Scanner**: When working with JavaScript/TypeScript parsing, use `src/lib/tokenize.mjs` (`maskNonCode`, `matchOutsideComments`, `positionAt`). Never count lines with ad-hoc string splits.
- **Mandatory Exemption Reasons**: All exemptions in config and inline `// gate-exempt(reason)` comments must include a non-empty written reason.
- **Verification**: Ensure code changes pass `npm test`, `npm run lint`, and `npm run format`.
