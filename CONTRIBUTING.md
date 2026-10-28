# Contributing

## Setup

```bash
git clone https://github.com/enesteve0/commerce-agent-gates.git
cd commerce-agent-gates
npm install        # dev tooling only; the tool itself has zero runtime deps
npm test           # node:test, no configuration needed
```

## Everyday commands

| Command                               | Does                                           |
| ------------------------------------- | ---------------------------------------------- |
| `npm test`                            | full suite (unit, check tables, fixtures, CLI) |
| `npm run test:coverage`               | same, with V8 coverage report                  |
| `npm run lint`                        | ESLint over the repo                           |
| `npm run format`                      | Prettier check (`format:fix` to write)         |
| `node bin/commerce-agent-gates.mjs .` | dogfood the gates on this repository           |

The CI workflow runs all of the above on Node 22 and 24, plus a packed-tarball
smoke test. It runs by hand from the Actions tab. A PR that fails any of them
is not reviewable.

## Ground rules

1. **Zero runtime dependencies.** DevDependencies are fine; anything under
   `"dependencies"` is not. Node 22+ standard library only.
2. **Selection is the product.** New checks require a documented failure mode,
   a mechanical rule a human would endorse, case-table tests including
   near-misses, fixture coverage in both trees, and a README section written
   in the voice of the existing three.
3. **Findings carry positions.** Any new detection must report
   `file:line:column`, derived through `src/lib/tokenize.mjs` helpers, never
   by counting lines with bespoke code.
4. **No silent failures.** Unreadable input, skipped files, empty scans: every
   path either succeeds verifiably or reports why not.
5. **Exemptions need reasons.** Whether in config or inline, an exemption
   without a written justification is a bug, not a shortcut.
6. **Match the existing style** (Prettier handles formatting; ESLint handles
   correctness). Comments explain _why_, never _what_.

## Changing the masking scanner

The scanner is load-bearing for all three checks. Changes require:

- new table cases covering both directions (must-mask and must-not-mask),
- the full suite green,
- a moment of honesty about whether your change could mask real code.

When in doubt, prefer false positives over false negatives: annoyance is
visible, silence is not.

## Releases

Maintainers only:

1. Update `CHANGELOG.md` under a new version heading.
2. Bump `version` in `package.json`.
3. Run the release workflow from the Actions tab; it publishes to npm with
   provenance after tests pass.

## Licence

By contributing you agree that your contributions are licensed under the MIT
licence.
