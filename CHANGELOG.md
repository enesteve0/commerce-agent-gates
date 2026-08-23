# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [Semantic Versioning](https://semver.org).

## [Unreleased]

### Fixed

- Empty scans no longer swallow walker notices: when every source file is
  skipped (for example, a file over the 1 MiB cap) or a directory is
  unreadable, the `note:` lines now accompany the "no source files found"
  error (and the `--allow-empty` status) instead of vanishing.

## [2.0.0] — 2026-08-22

Complete overhaul of detection precision, configurability, reporting, testing,
and packaging. Breaking changes are listed first.

### Breaking

- **Node >= 22 required.** Node 18 (EOL 2025-04) and 20 (EOL 2026-04) are past
  upstream end-of-life.
- **Distribution changed** from copy-in scripts to an installable CLI +
  programmatic API. `node checks/<name>.mjs <dir>` invocations become
  `npx commerce-agent-gates <dir>` (`--only <checkId>` replaces running one
  script).
- **Constants moved to configuration.** Guards, flag names, credential
  prefixes, clients, operations, scope pattern, and exemptions are now options
  in `commerce-agent-gates.config.json` instead of edits inside check source.
- **Exemption map replaced.** The v1 hardcoded path list becomes config
  exemptions with mandatory reasons plus inline `gate-exempt(reason)`
  directives on individual lines.
- **`credentialPrefixes` default expanded** to `demo_`, `demo-`, `sandbox_`;
  prefix-trust detection now covers `startsWith`, `includes`, anchored regex
  literals passed to `test`/`match`/`exec`, and `new RegExp`.

### Added

- Findings carry 1-based `line:column` positions everywhere.
- Output formats: `--format pretty|json|sarif|github` — SARIF 2.1.0 for
  GitHub code scanning, workflow-command annotations for inline PR comments.
- CLI surface: `--config`, `--only`, `--skip`, `--list`, `--allow-empty`,
  `--no-color`, `--help`, `--version`; documented exit codes 0/1/2.
- Programmatic API: `runGates()` returns the structured report.
- Configuration validation with typo protection: unknown keys, wrong types,
  reason-less exemptions, and invalid regexes are hard errors.
- Detection hardening: dynamic env access (`process.env["X"]`), destructured
  env reads, aliased guard imports, namespace guard usage, local guard stubs
  that never import, complete Prisma verb coverage including
  `findUniqueOrThrow`/`upsert`/`create`/`aggregate`/`groupBy`, optional
  `$queryRaw`/`$executeRaw` flagging, configurable refusal idioms.
- Offset-preserving masking scanner replacing chained strip-regexes; correct
  through block comments containing string markers, URLs, nested template
  interpolations, and regex-vs-division disambiguation.
- Deterministic sorted discovery with posix paths (Windows correctness),
  symlink-cycle protection, size cap, glob-lite excludes.
- Test suite on `node:test`: lexer tables, per-check adversarial case tables,
  config validation, formatter shapes, CLI integration, retained fixture
  contract with per-violation evidence assertions.
- CI (Node 22/24 matrix, lint, tests, publint, packed-tarball smoke,
  self-dogfooding) and provenance-enabled release workflow.
- Documentation: `docs/RESEARCH.md`, `docs/GAP_ANALYSIS.md`,
  `docs/OVERHAUL_PLAN.md`, `docs/ARCHITECTURE.md`, CONTRIBUTING, SECURITY,
  AGENTS guide, this changelog.

### Changed

- README rewritten around the same narrative voice, adding quickstart,
  configuration reference, CI recipes, OWASP API Top 10 mapping, positioning,
  and migration notes.

## [1.0.0]

Initial release: three checks (`no-mock-data-in-production`,
`mutating-routes-must-be-guarded`, `queries-must-be-tenant-scoped`), shared
walker/stripper, fixture test loop, MIT licence.
