# Semantic Repository Map

This document provides a structural and architectural map of the `commerce-agent-gates` codebase, detailing what each directory and file owns, its dependencies, and what modifications belong there.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Execution Entry Points
        BIN["bin/commerce-agent-gates.mjs (Shebang CLI)"]
        API["src/index.mjs (runGates Programmatic API)"]
        CLI["src/cli.mjs (Argument parsing, exit code orchestration)"]
    end

    subgraph Core Utilities ["src/lib/"]
        WALK["walk.mjs (Deterministic discovery, symlinks, size caps)"]
        CONFIG["config.mjs (Discovery, deep validation, option merging)"]
        TOK["tokenize.mjs (Masking scanner, spans, positionAt)"]
        REPORT["report.mjs (pretty, json, sarif, github formatters)"]
        ERR["errors.mjs (ConfigError definition)"]
    end

    subgraph Checks Registry ["src/checks/"]
        INDEX["index.mjs (Registry array and checkIds)"]
        C1["no-mock-data-in-production.mjs"]
        C2["mutating-routes-must-be-guarded.mjs"]
        C3["queries-must-be-tenant-scoped.mjs"]
    end

    subgraph Test & Fixtures
        TESTS["test/ (node:test suites: lexer, check tables, cli, config)"]
        PASS["fixtures/pass/ (Clean tree fixture)"]
        FAIL["fixtures/fail/ (Dirty tree fixture with decoys)"]
    end

    BIN --> CLI
    CLI --> API
    API --> WALK
    API --> CONFIG
    API --> INDEX
    INDEX --> C1 & C2 & C3
    C1 & C2 & C3 --> TOK
    C3 --> ERR
    CONFIG --> ERR
    CLI --> REPORT
    TESTS -.-> API & Core Utilities & Checks Registry
```

---

## 2. Semantic Directory Breakdown

### Root Directory (`/`)

- **Purpose**: Project root, package manifest, tooling configs, contributor guidelines, and canonical agent instructions.
- **Key Files**:
  - [`package.json`](../../package.json): Package metadata, export points (`.` and `./package.json`), bin entry, zero runtime dependencies.
  - [`commerce-agent-gates.config.json`](../../commerce-agent-gates.config.json): Root configuration defining local overrides for self-dogfooding.
  - [`eslint.config.js`](../../eslint.config.js): Flat ESLint config (ignoring fixtures, node_modules, coverage).
  - [`AGENTS.md`](../../AGENTS.md): Canonical agent entry point.
  - [`README.md`](../../README.md): User-facing narrative documentation and configuration reference.

---

### `bin/` (CLI Executable)

- **Purpose**: Shebang executable invoked by `npx commerce-agent-gates` or global installs.
- **Key Files**:
  - `bin/commerce-agent-gates.mjs`: Ultra-thin wrapper importing `main` from `src/cli.mjs` and calling `process.exit(main(process.argv.slice(2)))`.

---

### `src/` (Core Application Engine)

- **`src/index.mjs`**: The programmatic API entry point. Exports `runGates()`, `checks`, `checkIds`, and `ConfigError`.
- **`src/cli.mjs`**: CLI orchestrator. Parses command line arguments, handles `--help`, `--version`, `--list`, runs `runGates()`, dispatches to formatters, and maps results to exit codes `0`, `1`, or `2`.
- **`src/lib/`**:
  - `walk.mjs`: Deterministic directory traversal, POSIX path normalization (win32 compatibility), symlink canonical resolution, file size cap enforcement (1 MiB default), and glob-lite exclude matching.
  - `tokenize.mjs`: Offset-preserving masking scanner. Produces `masked` text (blanking comments/strings/regexes to spaces) and classified `spans`. Exposes `maskNonCode()`, `matchOutsideComments()`, `positionAt()`, `lineHasInlineExemption()`, and `balancedArgument()`.
  - `config.mjs`: Locates and validates `commerce-agent-gates.config.json`. Enforces strict typing, typo prevention on keys, and mandatory exemption reasons.
  - `report.mjs`: Formatters for human terminals (`pretty`), scripting (`json`), security dashboards (`sarif`), and PR annotations (`github`).
  - `errors.mjs`: Exports `ConfigError`.
- **`src/checks/`**:
  - `index.mjs`: Registry array aggregating all check modules.
  - `no-mock-data-in-production.mjs`: Rule 1 — Single authority module, refusal idioms, flag leakage, and prefix trust.
  - `mutating-routes-must-be-guarded.mjs`: Rule 2 — Mutating HTTP exports (`POST`, `PUT`, `PATCH`, `DELETE`) guarded by imported functions.
  - `queries-must-be-tenant-scoped.mjs`: Rule 3 — Route handler database operations scoped to `tenantId: session.tenantId` (OWASP API1 / BOLA protection).

---

### `test/` (Test Suites)

- **Purpose**: Comprehensive test coverage running under `node:test` (100% zero-dependency).
- **Subdirectories & Files**:
  - `test/index.test.mjs`: Tests programmatic `runGates()` API contract.
  - `test/cli.test.mjs`: Tests CLI argument parsing, flags, formatting, and exit codes using in-memory mock IO.
  - `test/config.test.mjs`: Tests configuration discovery, invalid types, unknown keys, and exemption parsing.
  - `test/tokenize.test.mjs`: Tests masking scanner on adversarial strings, comments, regexes, and template interpolations.
  - `test/walk.test.mjs`: Tests deterministic sorting, symlink cycle handling, and glob exclusions.
  - `test/fixtures.test.mjs`: Tests that `fixtures/pass` is 100% clean and `fixtures/fail` catches all planted violations.
  - `test/checks/*.test.mjs`: Detailed case-table tests per check, including near-misses and false-positive traps.

---

### `fixtures/` (Test Fixture Trees)

- **`fixtures/pass/`**: Clean synthetic Next.js App Router codebase. Must always produce 0 findings across all checks.
- **`fixtures/fail/`**: Dirty synthetic Next.js App Router codebase containing intentional violations of all three checks, plus adversarial decoy patterns (URLs containing slashes, comment text, legitimate non-route queries).

---

### `docs/` (Knowledge & Documentation Layer)

- **`docs/agent/`**: AI agent operating instructions, file coverage ledger, context map, invariants, recipes.
- **`docs/architecture/`**: System overview, data flow, module boundaries, scanner internals.
- **`docs/checks/`**: Deep-dive domain documentation for each of the three checks.
- **`docs/testing/`**: Testing philosophy, test matrix, fixtures guide.
- **`docs/operations/`**: CI/CD workflows, npm packaging, release management.
- **`docs/adr/`**: Architectural Decision Records (0001–0005).
