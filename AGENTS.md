# AGENTS.md

Guidance for AI coding agents working in this repository. Humans benefit from
reading it too, but the primary audience is you.

## What this repository is

A zero-runtime-dependency developer tool: three static-analysis checks that
catch specific failure modes of AI-generated code in Next.js App Router
projects. The product philosophy — selection over volume, mechanical rules,
written reasons for every exception, no silent failures — applies to changes
you make here as much as to the checks themselves.

## Before you change anything

1. Read `docs/ARCHITECTURE.md` end to end. It explains the pipeline, the
   check contract, and the deliberate limitations.
2. Read `docs/GAP_ANALYSIS.md` to understand what was already fixed and why,
   so you do not reintroduce it.

## Non-negotiables

- **No runtime dependencies.** DevDependencies only. Node 22+ standard
  library. If you believe a runtime dependency is justified, stop and ask; the
  bar is deliberately very high.
- **Every finding carries `file:line:column`.** Use `positionAt()` and the
  masking scanner from `src/lib/tokenize.mjs`; never count lines yourself.
- **Match against masked code or span-aware raw text**, never raw text alone;
  comment decoys in fixtures exist precisely because v1 got this wrong.
- **Errors that are the user's fault are `ConfigError`** with an actionable
  message and exit code 2. Never print stack traces for those.
- **Exemptions require reasons** — config entries and inline directives alike.
- **Do not weaken a test to make a change pass.** If a case table entry is
  wrong, say why in your summary and adjust both together.

## Verification before you claim done

```bash
npm run lint          # ESLint clean
npm run format        # Prettier clean
npm test              # all suites green
node bin/commerce-agent-gates.mjs .   # gates pass on this repository (exit 0)
```

CI additionally runs these on Node 22/24 plus a packed-tarball smoke test.
If you touched packaging (`package.json`, `bin/`, `src/index.mjs`), reproduce
that smoke test locally:

```bash
npm pack --pack-destination /tmp/gates-pack && cd /tmp/gates-pack \
  && npm init -y >/dev/null && npm install ./*.tgz >/dev/null \
  && npx commerce-agent-gates --list
```

## Where things live

| Path                             | Role                                                            |
| -------------------------------- | --------------------------------------------------------------- |
| `src/lib/tokenize.mjs`           | masking scanner; load-bearing, change with table tests          |
| `src/lib/walk.mjs`               | deterministic discovery, excludes, notices                      |
| `src/lib/config.mjs`             | discovery/validation of `commerce-agent-gates.config.json`      |
| `src/checks/*.mjs`               | the three checks; each exports `meta` + `check(files, options)` |
| `src/cli.mjs`, `bin/`            | argument parsing, formatting dispatch, exit codes               |
| `test/**`                        | node:test suites; case tables live beside their subject's name  |
| `fixtures/pass`, `fixtures/fail` | tree-level contract trees; fail is dirty on purpose             |

## When you add or modify a check

1. Extend `meta.defaultOptions` first — configuration surface follows logic,
   never the other way round.
2. Add must-catch _and_ must-pass entries to the check's case table, including
   at least two near-misses that should stay silent.
3. Update `fixtures/fail` (and `fixtures/pass` if a trap belongs there) plus
   `test/fixtures.test.mjs` evidence regexes.
4. Document user-visible behaviour in the README section for that check.
5. Run the four verification commands above.
