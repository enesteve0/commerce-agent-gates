# Definition of Done

This document provides deterministic completion checklists for different categories of changes in `commerce-agent-gates`. No change is considered complete until all items in its respective checklist are satisfied.

---

## 1. Modifying or Adding a Check

- [ ] **Config Surface**: `meta.defaultOptions` defines all configurable options with typed defaults.
- [ ] **Import Resolution**: If checking wrappers or decorators, local identifier alias/namespace imports are resolved (not just raw function names).
- [ ] **Masked Lexing**: The check inspects `maskNonCode(file.text)` or uses `matchOutsideComments(file.text, pattern)`.
- [ ] **Inline Exemption Support**: Findings check `lineHasInlineExemption(file.text, hit.index)` to honor `// gate-exempt(reason)`.
- [ ] **Case Table Unit Tests**: `test/checks/<check-id>.test.mjs` contains:
  - Must-catch assertions with line/column checks.
  - Must-pass assertions for valid idioms.
  - At least 2 adversarial near-miss cases designed to tempt false positives.
  - Custom options override verification.
- [ ] **Fixture Trees**:
  - `fixtures/pass/` contains clean code passing the check.
  - `fixtures/fail/` contains deliberate violations caught by the check.
  - `test/fixtures.test.mjs` contains matching regex evidence assertions for the new/modified check.
- [ ] **Documentation**:
  - Domain documentation updated in `docs/checks/<CHECK_NAME>.md`.
  - User-facing README updated in `README.md` explaining the failure mode and configuration.

---

## 2. Modifying the Masking Scanner (`src/lib/tokenize.mjs`)

- [ ] **Offset Fidelity**: Every returned `masked` string has identical length and identical newline positions to the input.
- [ ] **State Machine Coverage**: Line comments, block comments, single/double quotes with escapes, template literals with `${}` nesting to arbitrary depth, and regex-vs-division disambiguation are verified.
- [ ] **Adversarial Lexer Tests**: `test/tokenize.test.mjs` includes tests for the new construct or edge case.
- [ ] **Zero Check Regression**: All check suites pass without false positives or missed findings.
- [ ] **Documentation**: `docs/architecture/SCANNER_INTERNALS.md` updated if scanner states or heuristics changed.

---

## 3. Modifying CLI or Formatters (`src/cli.mjs`, `src/lib/report.mjs`)

- [ ] **Exit Codes**: Returns `0` (clean), `1` (findings), or `2` (usage/config error or empty scan without `--allow-empty`).
- [ ] **TTY & NO_COLOR**: Pretty output colorizes only when stdout is a TTY and `NO_COLOR` is unset.
- [ ] **SARIF & JSON**: SARIF 2.1.0 output validates against schema; JSON output validates structure.
- [ ] **GitHub Annotations**: Workflow command escaping matches runner rules (`%3A` for colons, `%2C` for commas).
- [ ] **CLI Integration Tests**: `test/cli.test.mjs` verifies flag parsing, stdout/stderr output, and exit codes.
- [ ] **Documentation**: `docs/agent/COMMANDS.md` and `README.md` updated with any new flag or format.

---

## 4. Modifying Configuration Engine (`src/lib/config.mjs`)

- [ ] **Typo Protection**: Unknown top-level keys, unknown check IDs, and unknown per-check options throw `ConfigError` listing valid options.
- [ ] **Reason Enforcement**: Exemptions without a non-empty string `reason` throw `ConfigError`.
- [ ] **Config Tests**: `test/config.test.mjs` covers all rejection cases and valid override merges.
- [ ] **Documentation**: `docs/agent/INVARIANTS.md` and `README.md` updated.

---

## 5. Universal Verification Suite (Mandatory for ALL changes)

Before declaring any task complete, run and pass this four-command verification:

```bash
# 1. Linting (0 warnings allowed)
npm run lint

# 2. Formatting check (0 style discrepancies)
npm run format

# 3. Full test suite (all suites green)
npm test

# 4. Dogfood check (the gates pass on this repository)
node bin/commerce-agent-gates.mjs .
```
