# Common Agent Mistakes & Anti-Patterns

This document catalogues mistakes an AI coding agent or new contributor might reasonably make in this repository, explains why they are harmful, and shows the correct pattern.

---

## 1. Introducing Runtime Dependencies

- ❌ **Mistake**: Running `npm install <package>` or adding an entry to `"dependencies"` in `package.json` (e.g. `glob`, `chalk`, `commander`, `minimist`).
- 💡 **Why**: `commerce-agent-gates` is fundamentally a zero-runtime-dependency CLI and programmatic library. Adding runtime dependencies violates the repository's core value proposition and introduces supply-chain security overhead for downstream consumers.
- ✅ **Correct**: Use Node 22+ standard library (`node:fs`, `node:path`, `node:util`, `node:assert`, `node:test`).

---

## 2. Counting Lines Manually

- ❌ **Mistake**: Splitting source text with `text.split("\n")` and attempting to track line numbers through regex matches on isolated lines.
- 💡 **Why**: Manual line splitting breaks on multi-line expressions, destroys absolute character offset mapping, and fails on nested construct boundaries.
- ✅ **Correct**: Use `positionAt(file.text, match.index)` from `src/lib/tokenize.mjs`.

---

## 3. Matching Regex Over Raw Source Text

- ❌ **Mistake**: Running a regex directly against `file.text` to detect code structures (e.g. `db.order.findMany`).
- 💡 **Why**: Decoy comments in fixture files (e.g. `// db.order.findMany() is banned`) and URLs (e.g. `https://example.com`) will trigger false positives or break parsing.
- ✅ **Correct**: Run structural syntax matching against `maskNonCode(file.text)`. For literal searches that need to see string contents (like demo credential prefixes), use `matchOutsideComments(file.text, regex)`.

---

## 4. Throwing Generic Errors for User Configuration Issues

- ❌ **Mistake**: Throwing `new Error("Invalid config")` or letting JSON parsing errors bubble up as uncaught exceptions.
- 💡 **Why**: The CLI prints full stack traces for unhandled exceptions, making user typos look like internal tool crashes.
- ✅ **Correct**: Throw `new ConfigError("actionable message explaining what was wrong and listing valid options")`. The CLI catches `ConfigError` and prints a clean message to `stderr` with exit code `2`.

---

## 5. Permitting Bare-Path Exemptions Without Reasons

- ❌ **Mistake**: Allowing `exemptions: ["app/api/health/route.ts"]` or inline `// gate-exempt`.
- 💡 **Why**: Exemption lists without written justification rot over time into security loopholes that nobody remembers agreeing to.
- ✅ **Correct**: Enforce `{ path, reason }` in config and `// gate-exempt(reason)` inline.

---

## 6. Weakening Tests to Make Changes Pass

- ❌ **Mistake**: Deleting a failing test case or removing a near-miss assertion from `test/checks/*.test.mjs`.
- 💡 **Why**: Case table tests protect against subtle false positives and regressions discovered during prior audits.
- ✅ **Correct**: Fix the check's regular expression or lexical analysis logic until both must-catch and must-pass assertions succeed.
