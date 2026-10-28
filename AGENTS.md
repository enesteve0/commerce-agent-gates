# AGENTS.md

Notes for coding agents, and people, working in this repo.

Three static checks for Next.js App Router code, in plain ESM JavaScript on Node 22 or newer. There are no runtime dependencies; ESLint, Prettier and publint are dev tooling only.

## Where things are

- `bin/commerce-agent-gates.mjs`: the CLI entry, which hands off to `src/cli.mjs`.
- `src/checks/`: the three checks, one file each, registered in `src/checks/index.mjs`.
- `src/lib/`: the masking scanner (`tokenize.mjs`), file walker, config loader and report formats.
- `test/`: `node:test` suites. `fixtures/pass` and `fixtures/fail` are the two sample apps every check runs against.
- `docs/checks/`: one page per check. `docs/adr/`: the design decisions.

## Rules

- Don't add runtime dependencies.
- Every check passes `fixtures/pass` and fails `fixtures/fail`, with a named reason per violation. A new detection gets table tests, near misses included.
- Findings report `file:line:column` through the helpers in `src/lib/tokenize.mjs`, never by counting lines by hand.
- No silent failures. A skipped file, an unreadable folder or an empty scan says why.
- Exemptions, in config or inline, need a written reason.
- When behaviour changes, update `README.md`, `docs/checks/` and `CHANGELOG.md` in the same change.

## Before you finish

```bash
npm run lint && npm run format && npm test && node bin/commerce-agent-gates.mjs .
```
