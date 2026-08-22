# Overhaul Plan

Date: 2026-08-21
Inputs: repository inspection, `docs/RESEARCH.md`, `docs/GAP_ANALYSIS.md`.

## Product decisions locked for this overhaul

1. Exactly three checks; precision over volume. (Webhook-signature and
   server-action guard candidates are recorded as future options.)
2. Zero runtime dependencies preserved. Dev tooling allowed.
3. Node floor `>=22`. CI matrix 22/24.
4. Distribution: npm-installable CLI (`bin`) + programmatic API + config file;
   copy-in-scripts mode retired with documented migration (major version).
5. Every finding carries file:line:column; SARIF 2.1.0 / JSON / GitHub
   annotation output in addition to pretty text.

## Target architecture

```
bin/commerce-agent-gates.mjs        thin shebang executable
src/
  index.mjs                         programmatic API (runGates, checks)
  cli.mjs                           arg parsing, orchestration, exit codes
  lib/
    tokenize.mjs                    offset-preserving masking lexer
    walk.mjs                        deterministic, cycle-safe discovery
    config.mjs                      discovery, validation, defaults
    report.mjs                      formatters: pretty/json/sarif/github
  checks/
    index.mjs                       registry (id, description, defaults)
    no-mock-data-in-production.mjs
    mutating-routes-must-be-guarded.mjs
    queries-must-be-tenant-scoped.mjs
test/                               node:test suites (unit + integration)
fixtures/pass/ fixtures/fail/       expanded trees incl. false-positive traps
docs/                               research, gap analysis, architecture
.github/workflows/                  ci.yml (22/24 matrix), release.yml
```

Data flow: `walk` → files `{path, text}` → each enabled check receives files +
its resolved options → findings `{ruleId, file, line, column, severity,
message}` → formatter → stdout + exit code.

## Phases

### Phase 1 — Research record (done during planning)

`RESEARCH.md`, `GAP_ANALYSIS.md`, this plan.

### Phase 2 — Core libraries

- `tokenize.mjs`: single-pass scanner; masks comments, all string forms,
  template literals with `${}` nesting, regex literals (division
  disambiguation via previous significant token); output preserves length and
  newlines so offsets map to 1-based line/column exactly. Exposes
  `maskNonCode(text)` and `positionAt(text, offset)`.
- `walk.mjs`: sorted traversal, ignored-dir set, extension filter, symlink
  cycle guard (visited canonical dirs), 1 MiB size cap producing notices,
  glob-lite excludes, posix path normalisation, BOM stripping, non-UTF8
  tolerance.
- `config.mjs`: locate `commerce-agent-gates.config.json` at root or
  `--config`; deep-validate against known keys (unknown key ⇒ error listing
  nearest valid names); per-check option merge with defaults; exemption
  entries require non-empty reason; invalid regexes rejected with context.

### Phase 3 — Checks on the shared Finding model

- `no-mock-data-in-production`: authority presence + refusal idioms
  (`NODE_ENV`/`VERCEL_ENV`/`import.meta.env.PROD`, negated dev checks);
  direct/dynamic/destructured flag reads outside authority; competing
  resolver detection (exported boolean-returning functions reading the flag
  elsewhere); prefix-trust shapes (`startsWith`, `/^…/` regex literal,
  `includes`, `slice` comparison) against configurable prefixes.
- `mutating-routes-must-be-guarded`: route-file detection on normalised
  paths; both `export const POST = <guard>(…)`, `export const POST =
async (…) => …` and `export [async] function POST(…)` shapes; alias-aware
  import verification (guard used but not imported ⇒ distinct finding);
  configurable guard list.
- `queries-must-be-tenant-scoped`: verb set
  findMany/findFirst/findUnique/findUniqueOrThrow/findFirstOrThrow/create/
  update/updateMany/upsert/delete/deleteMany/count/aggregate/groupBy;
  configurable client names and scope pattern; balanced-paren argument
  extraction over masked text; config exemptions + inline
  `gate-exempt(reason)` directive honoured on the finding's source line;
  opt-in `$queryRaw`/`$executeRaw` manual-review flagging.
  All three honour the inline exemption directive uniformly.

### Phase 4 — Reporting & CLI

- Formatters: pretty (colour when TTY, `NO_COLOR` respected), JSON document,
  SARIF 2.1.0 (one run, rules from registry, relative posix URIs), GitHub
  workflow-command annotations.
- CLI: `[paths…] --format F --only id --skip id --config file --list
--allow-empty --no-color --version --help`; exit 0/1/2; zero-files-scanned
  is a config error unless `--allow-empty`.
- Programmatic API: `runGates({root, configPath, only, skip})` returning the
  full result object.

### Phase 5 — Tests & fixtures

- Lexer table tests (comments, strings+escapes, nested templates, regex vs
  division, CRLF/BOM, offset fidelity).
- Per-check adversarial case tables (must-catch and must-pass snippets):
  aliased imports, local stubs, dynamic env access, prefix variants, exotic
  verbs, inline exemptions, comment decoys.
- Config validation tests; formatter snapshot-shape tests; CLI spawn tests
  (exit codes, formats parse, annotations well-formed); retained tree-level
  contract: every check passes `fixtures/pass`, fails `fixtures/fail`.
- Fixtures expanded to a realistic Next.js tree including false-positive
  traps (URLs containing `//`, comments mentioning banned patterns, health
  routes, webhook-shaped files).

### Phase 6 — Packaging, tooling, CI

- package.json v2.0.0: bin/exports/files/engines/repository/keywords;
  `prepublishOnly` gate; sideEffects false.
- ESLint flat config + Prettier (devDeps only); `.editorconfig`.
- `ci.yml`: Node 22/24 matrix — lint, test with coverage, publint, pack +
  install smoke running the packed tarball against fixtures.
- `release.yml`: tag-triggered npm publish with provenance (`id-token:
write`).

### Phase 7 — Documentation

README overhaul preserving narrative voice; add quickstart, config reference,
output formats, CI recipes, OWASP mapping, positioning vs Semgrep/ast-grep/
ESLint plugins, migration notes from v1 scripts. `ARCHITECTURE.md`,
`CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `AGENTS.md`.

### Phase 8 — Validation & closure

Full local run (lint, tests, coverage, publint, packed smoke). Second external
research pass for missed gaps; update `GAP_ANALYSIS.md`. Final repo-wide audit
against the definition of done.

## Definition of done

- All suites green on Node 22 and 24; coverage reported for src/.
- Each check demonstrably catches its failure modes and stays silent on
  near-misses (case tables prove it; fixtures enforce it end-to-end).
- `npx`-style invocation works from the packed tarball in a clean directory.
- Findings carry positions; all four formats emitted correctly.
- Docs coherent end to end; no undocumented behaviour.
- Honest scope statement intact (pattern matcher, not a security product).
