# Research Record

Research date: 2026-08-21
Researcher: overhaul planning session (repository discovery + external research)
Product category: developer tools — static analysis / CI gates for AI-generated code

## What this product is

`commerce-agent-gates` is a set of three opinionated static-analysis checks that
encode specific failure modes of AI coding agents working on Next.js App Router
codebases:

1. `no-mock-data-in-production` — exactly one module may resolve the demo/mock
   flag, it must refuse in production, and demo credentials are verified, never
   recognised by prefix.
2. `mutating-routes-must-be-guarded` — every exported `POST`/`PUT`/`PATCH`/
   `DELETE` route handler must pass through an identity-establishing wrapper.
3. `queries-must-be-tenant-scoped` — queries inside route handlers must scope to
   the session tenant or sit on an exemption list with a written reason.

The product thesis (validated by research): deterministic, cheap, mechanical
checks catch the _specific_ mistakes agents make before they consume human
review attention. The 2026 SAST consensus is that AI explanation layers
complement rather than replace deterministic scanning; teams generating >30% of
code with AI need policy enforcement tuned to agent failure modes.

## Authoritative sources consulted

### Platform / runtime

- Node.js release schedule — supported lines as of 2026-08: Node 22
  (maintenance LTS until 2027-04-30), Node 24 (Active LTS until 2028-04-30),
  Node 26 (Current). Node 18 reached EOL 2025-04-30; Node 20 reached EOL
  2026-04-30.
  https://nodejs.org/en/about/previous-releases , https://endoflife.date/nodejs
  → Consequence: the repository's `engines: >=18` claim was outdated; floor is
  now `>=22`. All features used must be stable in Node 22.
- `node:test` built-in test runner — stable since Node 20, feature-complete in
  Node 22+ (subtests, mocking, coverage via `--experimental-test-coverage`,
  multiple reporters). Recommended for zero-dependency CLI tools.
  https://nodejs.org/api/test.html
  → Consequence: replaces the ad-hoc fixture loop in `test.mjs`; keeps the
  package at zero runtime dependencies.

### Standards

- SARIF v2.1.0 (OASIS Static Analysis Results Interchange Format) — the
  interchange standard for static-analysis output; GitHub code scanning ingests
  it via `github/codeql-action/upload-sarif`.
  https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
  https://docs.github.com/en/code-security/concepts/code-scanning/sarif-files
  → Consequence: findings carry `file`, `line`, `column`, `ruleId`; the CLI
  emits SARIF so results surface as native GitHub code-scanning alerts and PR
  annotations. Note: GitHub no longer combines multiple runs in one file
  (deprecated July 2025) — emit one run per invocation with distinct rule ids.
- OWASP API Security Top 10 (2023 edition, still current in 2026):
  - API1 Broken Object Level Authorization (BOLA/IDOR) — the #1 API risk,
    present in ~40% of API attacks; exactly the confused-deputy failure mode
    `queries-must-be-tenant-scoped` targets.
    https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
  - API2 Broken Authentication / API5 Broken Function Level Authorization —
    the failure modes `mutating-routes-must-be-guarded` targets.
    https://owasp.org/API-Security/
    → Consequence: README maps each check to its OWASP category; check docs cite
    them.

### Category landscape (competitors and adjacent tools)

- Semgrep — AST-pattern rules, 2000+ community rules, custom YAML rules;
  heavyweight, Python-distributed; the enterprise choice for org-specific
  security invariants. https://github.com/semgrep/semgrep
- ast-grep — Rust binary, structural search/rewrite, YAML rules; lighter than
  Semgrep, still an external toolchain. https://ast-grep.github.io
- ESLint + typescript-eslint / eslint-plugin-security — deep JS/TS analysis but
  plugin-per-concern setup inside the consumer's lint config.
- CodeRabbit / Qodo / Greptile — AI PR-review assistants; explicitly not
  deterministic gates.
- SonarQube / Snyk Code / Codacy / Qodana — platform SAST vendors marketing
  "guardrails for AI-generated code" in 2026.
- gitleaks — closest philosophical sibling: small, zero-config-by-default,
  single-purpose gate that drops into CI.

→ Positioning conclusion: this project's differentiation is being a ~small,
readable, zero-dependency artifact whose value is _selection_ (three checks,
each justified by an observed agent failure mode) and drop-in CI ergonomics.
It should not grow into a general linter framework; it should make those three
checks precise, configurable without forking, and first-class CI citizens.
AST-based competitors exist for consumers who want full dataflow analysis; we
document when to graduate to them instead of competing.

## Technical discoveries influencing implementation

1. **Regex-over-text matching has known failure classes** that motivated the
   rewrite around a real lexer:
   - stripping block comments _before_ strings corrupts string literals that
     contain `/*`;
   - `//` line-comment heuristics misfire on URLs and on `//` inside template
     literals;
   - regex-vs-division ambiguity requires previous-significant-token context.
     An offset-preserving masking scanner (comments/strings/templates/regex
     literals blanked to spaces, newlines preserved) gives both correct matching
     text _and_ accurate line/column reporting for every finding.
2. **Windows path divergence**: `path.relative()` returns backslashes on win32;
   any `(^|\/)route\.tsx?$` style match silently fails there. All paths must be
   normalised to posix separators at discovery time.
3. **Guard detection needs import awareness**: checking only
   `export const POST = withSession(` produces false negatives for aliasing
   (`import { withSession as auth }`) and false positives for local stubs that
   shadow the guard name without importing it. Verifying the resolved local
   identifier is actually imported closes both.
4. **Prisma verb coverage**: `findUniqueOrThrow`/`findFirstOrThrow`/`upsert`/
   `aggregate`/`groupBy`/`create` were missing from the original verb list even
   though `findUnique({ where: { id } })` by bare id is precisely the BOLA
   vector. `$queryRaw`/`$executeRaw` cannot be pattern-checked reliably and are
   opt-in flagged for manual review instead.
5. **npm packaging**: `bin` + `files` whitelist + `exports` map + publint
   validation are current best practice; npm provenance (`id-token: write` in
   Actions) attests publish origin. https://docs.npmjs.com/cli/v10/using-npm/package-json
6. **GitHub Actions annotations**: `::error file=…,line=…,col=…::message`
   workflow commands render inline PR annotations without any upload step.

## Product expectations for this category (table stakes)

- Installable and runnable without reading source (`npx …`).
- Configurable per-repository without forking the tool.
- Findings with file:line:column and actionable messages.
- Machine-readable output (JSON, SARIF) plus human-readable default.
- Deterministic ordering of output.
- Honest scope statement (what the tool does not guarantee).
- Exit codes suitable for CI gating (0 clean, 1 violations, 2 usage/config).
- A test suite that proves each check catches what it claims and stays silent
  otherwise.

## Conclusions adopted by this repository

1. Keep exactly three checks; invest in precision, configurability, reporting.
2. Zero runtime dependencies remains a feature; dev-time tooling (eslint,
   prettier, publint) is allowed and does not affect consumers.
3. Node floor ≥22; CI matrix over 22/24.
4. Config file (`commerce-agent-gates.config.json`) discovered in the target
   repo; inline `gate-exempt(reason)` directives honour the "written reason"
   philosophy at finer granularity than path lists.
5. Every finding carries position information; SARIF + JSON + GitHub annotation
   formats supported alongside pretty text.
6. Test suite migrates to `node:test` with adversarial case tables per check.
