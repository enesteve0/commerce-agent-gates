# Gap Analysis

Date: 2026-08-21 (initial), 2026-08-22 (second pass after implementation)
Basis: repository inspection of `master` @ 8e85ce7 + research in `RESEARCH.md`.

Legend — Importance: Critical / High / Medium / Low.
Status values: Open → In progress → Done.

---

## Current State

A single-commit repository containing three regex-over-text checks, a shared
walker/stripper module, an ad-hoc fixture test loop, minimal fixtures, and an
excellent narrative README. Zero dependencies, Node >=18 claim, MIT licensed,
no packaging, no CI, no line-level findings, constants and exemptions editable
only by editing check source.

## Expected Professional State

An installable, configurable CI gate with precise detection, positional
findings, machine-readable output, adversarial test coverage, release hygiene,
and documentation a new engineer or agent can act on without archaeology.

---

## Product Gaps

| #   | Gap                                                                                                                     | Evidence                                                           | Importance | Recommended solution                                                                                               | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| P1  | Customising guards/flag names/exemptions requires forking check source ("change the constants at the top of each file") | README §"What these are not"; hardcoded arrays in all three checks | High       | Config file discovered at target root; defaults = current constants; validation with typo protection               | Done   |
| P2  | Exemption list lives inside the check source; "written reason" philosophy not portable                                  | `queries-must-be-tenant-scoped.mjs` EXEMPT map                     | High       | Config exemptions `{path, reason}` (reason mandatory) + inline `gate-exempt(reason)` directive on the flagged line | Done   |
| P3  | Not installable; consumers copy scripts by hand; no `npx` path                                                          | No `bin`, no publish config                                        | High       | npm package with `bin`, `files`, `exports`; programmatic API also exported                                         | Done   |
| P4  | Findings lack positions; reviewers must grep to locate the offending code                                               | All checks push bare `path: message` strings                       | High       | Every finding carries 1-based line/column from offset-preserving lexer                                             | Done   |
| P5  | No machine-readable output for CI dashboards/code scanning                                                              | CLI prints text only                                               | High       | `--format pretty\|json\|sarif\|github`; SARIF 2.1.0 per OASIS spec; GitHub annotation lines                        | Done   |
| P6  | Silent-pass hazards: pointing the gate at an empty/wrong directory exits 0                                              | `sources()` returns []; report PASSes                              | High       | Zero-files-scanned is an error (exit 2) unless `--allow-empty`                                                     | Done   |
| P7  | No OWASP framing despite being the strongest justification for the tenant check                                         | README never cites API1/BOLA                                       | Medium     | Map each check to OWASP API Security Top 10 in README/docs                                                         | Done   |

## UX Gaps

| #   | Gap                                                                                | Evidence                                    | Importance | Recommended solution                                                     | Status |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------- | ---------- | ------------------------------------------------------------------------ | ------ |
| U1  | No `--help` / `--version` / `--list`                                               | `runAsScript` only handles missing target   | Medium     | Full flag surface with usage text; exit codes documented                 | Done   |
| U2  | Deterministic output not guaranteed across runs/machines                           | `readdirSync` order is filesystem-dependent | Medium     | Sorted directory traversal; stable finding ordering (file, line, column) | Done   |
| U3  | Colour/TTY handling absent (no readability win in terminals, no degradation story) | n/a                                         | Low        | ANSI colouring when stdout is TTY; honour `NO_COLOR`; plain otherwise    | Done   |

## Engineering Gaps

| #   | Gap                                                                                                                                                                                     | Evidence                                | Impact                                          | Importance | Recommended solution                                                                                                                                             | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| E1  | Comment/string stripping is incorrect: block comments stripped before strings corrupts string literals containing `/*`; `//` inside template literals eaten; no regex-literal awareness | `stripCommentsAndStrings` replace-chain | Both false positives and silent false negatives | Critical   | Offset-preserving masking lexer with template-nesting and regex-vs-division disambiguation; table-tested                                                         | Done   |
| E2  | Windows paths break route-file matching (`relative()` yields `\`)                                                                                                                       | ROUTE_FILE regex vs walk output         | Gate silently passes everything on win32        | Critical   | Normalise to posix separators at discovery; regression-tested via normalisation unit tests                                                                       | Done   |
| E3  | Guard verification ignores imports: aliased imports flagged as unguarded (false positive); locally shadowed guard name defeats the check (false negative)                               | Guarded-shape regex only                | Wrong verdicts in both directions               | Critical   | Resolve local identifier from import statement; require the guard be imported; alias support                                                                     | Done   |
| E4  | Prisma verb list incomplete: `findUniqueOrThrow`, `findFirstOrThrow`, `upsert`, `aggregate`, `groupBy`, `create` missing — bare-`id` `findUnique` is exactly BOLA                       | QUERY regex                             | Real vulnerability class missed                 | Critical   | Complete verb set; raw queries opt-in flagged                                                                                                                    | Done   |
| E5  | Demo-flag detection bypassable: `process.env["DEMO_MODE"]`, destructured env, competing resolver modules undetected; prefix-trust misses `/^demo_/` matches and `includes()`            | FLAG/PREFIX_TRUST regexes               | Check evaded by trivial rewrites                | High       | Dynamic-member + destructuring detection; competing-authority detection; expanded prefix-trust patterns; configurable prefixes                                   | Done   |
| E6  | Authority-module production refusal matched against one exact string shape only                                                                                                         | `NODE_ENV\s*===?\s*["'`]production`     | Legitimate refusals flagged; weak ones missed   | Medium     | Accept several refusal idioms (`VERCEL_ENV`, `import.meta.env.PROD`, negated dev checks); keep strict default, document                                          | Done   |
| E7  | Walker: no symlink-cycle protection, no size cap, non-deterministic order, no exclusion mechanism                                                                                       | `walk()`                                | Hangs/noise on odd repos                        | Medium     | Visited-set cycle guard, 1 MiB cap with notice, sorted traversal, glob-lite excludes                                                                             | Done   |
| E8  | Test suite proves only tree-level pass/fail on two tiny trees; no per-snippet cases, no adversarial near-misses, no CLI tests, no coverage                                              | `test.mjs`                              | Regressions invisible                           | High       | `node:test` suites: lexer tables, per-check case tables (~15–25 snippets each), config validation, formatters, CLI spawn integration, fixtures contract retained | Done   |
| E9  | No CI; nothing verifies the gates keep working as the repo evolves                                                                                                                      | No `.github/`                           | Unbounded regression risk                       | High       | Actions workflow: lint + test + publint + packed-tarball smoke on Node 22/24 matrix                                                                              | Done   |
| E10 | Not packaged: no version, no changelog, no metadata, engines outdated (>=18; both 18 and 20 now EOL)                                                                                    | package.json                            | Unsupported-runtime claim                       | High       | v2.0.0, engines >=22, CHANGELOG (Keep a Changelog), provenance-enabled release workflow                                                                          | Done   |
| E11 | Exit-code semantics under-specified (usage=2 undocumented)                                                                                                                              | `runAsScript`                           | Fragile CI wiring                               | Medium     | Documented contract: 0 clean, 1 findings, 2 usage/config/internal error                                                                                          | Done   |

## Outdated Approaches

| #   | Item                                | Superseded by                           | Status |
| --- | ----------------------------------- | --------------------------------------- | ------ |
| O1  | Ad-hoc assertion loop in `test.mjs` | `node:test` runner (stable, zero-dep)   | Done   |
| O2  | `engines >=18`                      | `>=22` (lowest supported LTS line)      | Done   |
| O3  | Text-only reporting                 | SARIF 2.1.0 + JSON + GitHub annotations | Done   |

## Unnecessary Complexity

None found. The implementation is small and direct; complexity added by this
overhaul (lexer, config, formatters) is each justified by a concrete gap above
(E1/E4 precision, P1 configurability, P5 CI integration).

## Deliberate Non-Goals

- New checks beyond the three (product decision: selection over volume;
  webhook-signature and server-action candidates recorded as future options).
- AST/dataflow analysis (Semgrep/ast-grep territory; document graduation path).
- `.gitignore` emulation (config-driven `exclude` gives explicit semantics).

---

## Second Research Pass (post-implementation)

Re-evaluated competitors, standards, and framework guidance once the new
implementation existed and was understood end to end. Findings:

| #   | Finding                                                                                                                      | Evidence                                                              | Verdict                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| S1  | Next.js App Router route-handler convention is unchanged through Next 16: named HTTP-method exports in `route.ts`/`route.js` | nextjs.org route-handlers docs (updated 2026)                         | Detection targets remain correct; no change needed                                                               |
| S2  | `export { handler as POST }` re-export shape bypassed the guarded-routes check silently                                      | GitHub discussion on default-export handlers; surfaced in second pass | **Fixed**: re-export form now fails loudly with guidance to use the canonical wrapper shape (+ case-table tests) |
| S3  | `--list` printed bare ids, weaker than category norms for CLI discoverability                                                | CLI ergonomics review                                                 | **Fixed**: ids aligned with one-line descriptions from check metadata                                            |
| S4  | SARIF `informationUri` carried `git+` prefix from package.json repository field                                              | SARIF/GitHub ingestion conventions                                    | **Fixed**: normalised to a plain HTTPS URL                                                                       |
| S5  | Coverage reported but not threshold-enforced in CI                                                                           | node:test coverage flags                                              | Accepted: reporting at ~98% line coverage; thresholds deferred until a coverage drop has actually bitten         |
| S6  | Webhook-signature and server-action checks remain the top future candidates                                                  | Product decision recorded during planning                             | Deliberate non-goal; documented in ARCHITECTURE.md                                                               |

## Final Status

All product, UX, engineering, and outdated-approach gaps P1–P7, U1–U3,
E1–E11, O1–O3 are **Done**, verified by the suite (109 tests), lint/format,
publint, packed-tarball smoke test against both fixture trees, self-dogfooding
(exit 0 on this repository), and 97.94% line coverage.
