# Standing Repository Invariants

This document captures the essential truths that must remain valid across all code modifications. Each invariant explains **what** is enforced and **why**.

---

## 1. Architectural Invariants

### 1.1 Zero Runtime Dependencies

- **Invariant**: The `package.json` manifest must never define a `"dependencies"` block. The runtime footprint must remain exactly `0` dependencies.
- **Why**: `commerce-agent-gates` is designed as an ultra-fast, zero-friction developer tool and CI gate. Adding runtime dependencies bloats consumer installs, creates supply chain vulnerability exposure, and causes potential version conflict nightmares in monorepos. DevDependencies (`eslint`, `prettier`, `publint`) are strictly separated.

### 1.2 Unidirectional Internal Dependencies

- **Invariant**: Modules in `src/lib/` must never import from `src/checks/` or `src/cli.mjs`. Modules in `src/checks/` may only import from `src/lib/`. `src/index.mjs` orchestrates checks and lib.
- **Why**: Keeps the parsing and lexical scanner decoupled and reusable, preventing circular dependencies and enabling independent unit testing.

### 1.3 Node 22+ Standard Library Foundation

- **Invariant**: All code must execute natively in Node.js 22 LTS and Node.js 24 LTS using built-in ESM modules (`node:fs`, `node:path`, `node:module`, `node:test`, `node:assert/strict`).
- **Why**: Ensures long-term maintenance and portability across modern CI environments without transpilation steps or polyfills.

---

## 2. Detection & Lexing Invariants

### 2.1 Character-Offset & Newline Preservation

- **Invariant**: The masking scanner (`src/lib/tokenize.mjs`) must return a `masked` string whose length is strictly equal to the original source string and where every `\n` character is preserved in its original position.
- **Why**: Allows regular expressions to run against masked code while preserving byte offsets so that `positionAt()` maps any match index back to its exact 1-based `line:column` in the user's original source file.

### 2.2 Masked Code Matching vs Raw Text Matching

- **Invariant**: Structural syntax checks (function declarations, route exports, query calls) must match against `masked` code. Literal-aware checks (credential prefixes, flag names) must use `matchOutsideComments()` to ignore comments while remaining visible in string literals.
- **Why**: Prevents false positives caused by code mentioned in comments (e.g. `// db.order.findMany()` in prose) and prevents false negatives where string literals contained comment delimiters (e.g. `"/*"` or URLs `https://`).

### 2.3 POSIX Path Normalization

- **Invariant**: All discovered file paths must be normalized to forward slashes (`/`), even on Windows (`win32`).
- **Why**: Next.js App Router route regexes (e.g. `/(^|\/)route\.[cm]?[jt]sx?$/`) rely on forward slashes. Backslashes on Windows would cause all route files to silently pass without scanning.

---

## 3. Reporting & Configuration Invariants

### 3.1 Strict Configuration Validation (Zero Silent Failure)

- **Invariant**: Any typo in a configuration key, unsupported check ID, invalid regex, or wrong option type in `commerce-agent-gates.config.json` must immediately throw a `ConfigError` with an actionable error message listing the valid alternatives.
- **Why**: A typo'd option (e.g. `"flagAuthoraty"`) would otherwise be silently ignored, causing the check to revert to default behavior without the developer realizing their custom rule was inactive.

### 3.2 Mandatory Exemption Reasons

- **Invariant**: Every exemption entry in configuration files (`{ path, reason }`) and every inline directive (`// gate-exempt(reason)`) must provide a non-empty written reason.
- **Why**: A list of bare paths without rationale rots into an exemption list nobody understands or dares to remove. Forcing written justification ensures security decisions are deliberate and reviewable.

### 3.3 Config Errors are User Input, Not Crashes

- **Invariant**: Errors caused by invalid user configuration or missing files must be instances of `ConfigError`. The CLI catches `ConfigError` and prints `error: <message>` to `stderr` with exit code `2`, without stack traces.
- **Why**: Stack traces for user typos look like internal tool crashes and degrade developer trust. Stack traces are reserved for unexpected runtime defects.

### 3.4 Empty Scan Protection

- **Invariant**: Pointing the tool at a directory with 0 scannable source files must exit with code `2` and an explanatory error message, unless `--allow-empty` is passed.
- **Why**: Pointing a CI gate at an incorrect directory or misconfigured glob would otherwise silently pass with exit code `0`, creating a false sense of security where nothing was actually checked.

---

## 4. Testing & Verification Invariants

### 4.1 Retained Fixture Contract

- **Invariant**: `npm test` must verify that every check passes 100% of files in `fixtures/pass/` with 0 findings, and catches every planted violation in `fixtures/fail/` with matching error regexes.
- **Why**: Guarantees that the checks never silently degrade into no-ops and never trigger false alarms on valid Next.js App Router idioms.

### 4.2 Never Weaken Tests to Pass Changes

- **Invariant**: Never delete assertions or remove near-misses from `test/checks/*.test.mjs` to make a change pass.
- **Why**: Near-miss test cases exist specifically because previous versions had false positive or false negative edge cases.
