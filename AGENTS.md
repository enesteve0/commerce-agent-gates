# AGENTS.md

Guidance for AI coding agents working in this repository. Humans benefit from reading it too, but the primary audience is you.

---

## 1. Project Identity & Purpose

- **Product Name**: `commerce-agent-gates`
- **Purpose**: A zero-runtime-dependency developer tool containing three static-analysis checks that catch specific failure modes of AI-generated code in Next.js App Router projects.
- **Product Philosophy**: Selection over volume, mechanical rules, written reasons for every exception, zero silent failures.
- **Technology Stack**: Native ESM JavaScript, Node.js >=22 LTS standard library only. DevDependencies for tooling only (`eslint`, `prettier`, `publint`).

---

## 2. Context Router

Before beginning any task, read the targeted documentation:

| Task Type                        | Context to Read                                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Onboarding & Overview**        | [`docs/agent/START_HERE.md`](./docs/agent/START_HERE.md) & [`docs/PROJECT_OVERVIEW.md`](./docs/PROJECT_OVERVIEW.md)                                                     |
| **Comprehensive Context Router** | [`docs/agent/CONTEXT_MAP.md`](./docs/agent/CONTEXT_MAP.md)                                                                                                              |
| **File Ledger (All Files)**      | [`docs/agent/FILE_INVENTORY.md`](./docs/agent/FILE_INVENTORY.md)                                                                                                        |
| **Non-Negotiable Invariants**    | [`docs/agent/INVARIANTS.md`](./docs/agent/INVARIANTS.md)                                                                                                                |
| **Adding / Modifying a Check**   | [`docs/checks/README.md`](./docs/checks/README.md) & check spec in `docs/checks/`                                                                                       |
| **Masking Scanner / Tokenizer**  | [`docs/architecture/SCANNER_INTERNALS.md`](./docs/architecture/SCANNER_INTERNALS.md)                                                                                    |
| **Pipeline & Module Boundaries** | [`docs/architecture/SYSTEM_OVERVIEW.md`](./docs/architecture/SYSTEM_OVERVIEW.md) & [`docs/architecture/MODULE_BOUNDARIES.md`](./docs/architecture/MODULE_BOUNDARIES.md) |
| **Testing & Fixtures Contract**  | [`docs/testing/TESTING_STRATEGY.md`](./docs/testing/TESTING_STRATEGY.md) & [`docs/testing/FIXTURES_GUIDE.md`](./docs/testing/FIXTURES_GUIDE.md)                         |
| **CI/CD & Packaging**            | [`docs/operations/CI_CD.md`](./docs/operations/CI_CD.md) & [`docs/operations/PACKAGING_AND_RELEASE.md`](./docs/operations/PACKAGING_AND_RELEASE.md)                     |
| **Architectural Decisions**      | [`docs/adr/README.md`](./docs/adr/README.md)                                                                                                                            |
| **Troubleshooting & Pitfalls**   | [`docs/agent/TROUBLESHOOTING.md`](./docs/agent/TROUBLESHOOTING.md) & [`docs/agent/COMMON_MISTAKES.md`](./docs/agent/COMMON_MISTAKES.md)                                 |

---

## 3. Repository Map & Where Code Belongs

| Path                                | Purpose & Ownership                                                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `bin/commerce-agent-gates.mjs`      | Shebang executable entry point forwarding to `src/cli.mjs`.                                                                   |
| `src/index.mjs`                     | Programmatic API entry point (`runGates`, `checks`, `checkIds`, `ConfigError`).                                               |
| `src/cli.mjs`                       | Argument parsing, flag validation, format dispatch, and exit code management.                                                 |
| `src/lib/walk.mjs`                  | Deterministic file discovery, symlink canonical tracking, 1 MiB size caps, POSIX normalization.                               |
| `src/lib/tokenize.mjs`              | Offset-preserving masking scanner, span classifier, `positionAt`, `balancedArgument`.                                         |
| `src/lib/config.mjs`                | Configuration discovery and strict validation of `commerce-agent-gates.config.json`.                                          |
| `src/lib/report.mjs`                | Formatters: `pretty` (colorized TTY), `json`, `sarif` (SARIF 2.1.0), and `github` annotations.                                |
| `src/lib/errors.mjs`                | `ConfigError` custom error class for clean user error reporting.                                                              |
| `src/checks/index.mjs`              | Registry of all checks.                                                                                                       |
| `src/checks/*.mjs`                  | Individual checks (`no-mock-data-in-production`, `mutating-routes-must-be-guarded`, `queries-must-be-tenant-scoped`).         |
| `test/**`                           | Zero-dependency test suites running natively under `node:test`.                                                               |
| `fixtures/pass/` & `fixtures/fail/` | Synthetic Next.js App Router contract trees (pass tree must be 100% clean; fail tree contains planted violations and decoys). |

---

## 4. Non-Negotiable Invariants

1. **Zero Runtime Dependencies**: `package.json` must never contain a `"dependencies"` block. DevDependencies only.
2. **Positional Findings**: Every finding must carry 1-based `file:line:column` derived via `positionAt()` from `src/lib/tokenize.mjs`. Never count lines manually.
3. **Masked Code Matching**: Match structural AST-like syntax against `maskNonCode(file.text)` or literal strings via `matchOutsideComments(file.text, pattern)`. Never match raw text directly over comments.
4. **Clean User Errors (`ConfigError`)**: Configuration errors and usage errors must throw `ConfigError`, exiting with code `2` and clean messages without stack traces.
5. **Mandatory Exemption Reasons**: Every config exemption (`{ path, reason }`) and inline directive (`// gate-exempt(reason)`) must contain a non-empty written reason.
6. **Never Weaken Tests**: Never delete assertions or near-miss tests to make changes pass.

---

## 5. Essential Commands

```bash
# 1. Full test suite (14 suites, 116+ tests)
npm test

# 2. Test coverage report
npm run test:coverage

# 3. Lint check (0 warnings allowed)
npm run lint

# 4. Formatting check
npm run format

# 5. Automatically fix formatting
npm run format:fix

# 6. Dogfood check on this repository (exit code 0)
node bin/commerce-agent-gates.mjs .
```

---

## 6. Verification Before You Claim Done

Always run:

```bash
npm run lint && npm run format && npm test && node bin/commerce-agent-gates.mjs .
```

If you touched packaging (`package.json`, `bin/`, `src/index.mjs`), reproduce the packed-tarball smoke test:

```bash
mkdir -p /tmp/gates-pack && cd /tmp/gates-pack \
  && npm init -y >/dev/null \
  && npm pack /Users/enesteve/Desktop/Coding/repos/commerce-agent-gates --pack-destination /tmp/gates-pack \
  && npm install --no-audit --no-fund ./*.tgz >/dev/null \
  && npx commerce-agent-gates --list \
  && npx commerce-agent-gates --version
```
