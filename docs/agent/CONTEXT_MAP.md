# Task Context Map & Router

This router maps specific coding and maintenance tasks directly to the required documentation, code files, and test files you should inspect.

---

## Task-to-Context Router

| Task Category                           | Read First                                                                                                                           | Then Read                                                                                                                              | Primary Code Files                                             | Primary Test Files                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| **Add or Modify a Check**               | [`docs/checks/README.md`](../checks/README.md)                                                                                       | Check-specific doc in `docs/checks/` & [`docs/agent/INVARIANTS.md`](./INVARIANTS.md)                                                   | `src/checks/*.mjs`, `src/checks/index.mjs`                     | `test/checks/*.test.mjs`, `test/fixtures.test.mjs`, `fixtures/` |
| **Masking Scanner / Lexer Work**        | [`docs/architecture/SCANNER_INTERNALS.md`](../architecture/SCANNER_INTERNALS.md)                                                     | [`docs/adr/0002-offset-preserving-masking-scanner.md`](../adr/0002-offset-preserving-masking-scanner.md)                               | `src/lib/tokenize.mjs`                                         | `test/tokenize.test.mjs`                                        |
| **File Discovery / Walker Changes**     | [`docs/architecture/SYSTEM_OVERVIEW.md`](../architecture/SYSTEM_OVERVIEW.md)                                                         | [`docs/agent/INVARIANTS.md`](./INVARIANTS.md)                                                                                          | `src/lib/walk.mjs`                                             | `test/walk.test.mjs`                                            |
| **Configuration Surface & Validation**  | [`docs/adr/0003-strict-config-validation-with-mandatory-reasons.md`](../adr/0003-strict-config-validation-with-mandatory-reasons.md) | [`docs/agent/INVARIANTS.md`](./INVARIANTS.md)                                                                                          | `src/lib/config.mjs`, `src/lib/errors.mjs`                     | `test/config.test.mjs`                                          |
| **CLI Options, Flags & Formatters**     | [`docs/architecture/DATA_FLOW.md`](../architecture/DATA_FLOW.md)                                                                     | [`docs/adr/0005-unified-multi-format-reporting-sarif-github-json.md`](../adr/0005-unified-multi-format-reporting-sarif-github-json.md) | `src/cli.mjs`, `src/lib/report.mjs`, `src/index.mjs`           | `test/cli.test.mjs`, `test/index.test.mjs`                      |
| **Investigate a Failing Test / CI Bug** | [`docs/agent/TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)                                                                              | [`docs/testing/TESTING_STRATEGY.md`](../testing/TESTING_STRATEGY.md)                                                                   | Relevant `src/` file                                           | Relevant `test/` file                                           |
| **Packaging & Release Preparation**     | [`docs/operations/PACKAGING_AND_RELEASE.md`](../operations/PACKAGING_AND_RELEASE.md)                                                 | [`docs/operations/CI_CD.md`](../operations/CI_CD.md)                                                                                   | `package.json`, `bin/commerce-agent-gates.mjs`, `CHANGELOG.md` | `test/cli.test.mjs`, smoke test script                          |
| **Fixture Tree Updates (Clean/Dirty)**  | [`docs/testing/FIXTURES_GUIDE.md`](../testing/FIXTURES_GUIDE.md)                                                                     | [`docs/testing/TEST_MATRIX.md`](../testing/TEST_MATRIX.md)                                                                             | `fixtures/pass/**`, `fixtures/fail/**`                         | `test/fixtures.test.mjs`                                        |
| **Documentation Updates**               | [`docs/agent/README.md`](./README.md)                                                                                                | [`docs/README.md`](../README.md)                                                                                                       | `docs/**`, `AGENTS.md`, `README.md`                            | Format check via `npm run format`                               |

---

## Detailed Task Flow Examples

### 1. Modifying the Guarded Routes Check (`mutating-routes-must-be-guarded`)

1. Read [`docs/checks/MUTATING_ROUTES.md`](../checks/MUTATING_ROUTES.md).
2. Inspect `src/checks/mutating-routes-must-be-guarded.mjs`.
3. Check `meta.defaultOptions` to determine if the config surface needs updating.
4. Modify logic in `src/checks/mutating-routes-must-be-guarded.mjs`.
5. Add adversarial test cases in `test/checks/mutating-routes-must-be-guarded.test.mjs`.
6. Update `fixtures/fail/` and `fixtures/pass/` if new language constructs or traps are introduced.
7. Run `npm test && npm run lint && npm run format && node bin/commerce-agent-gates.mjs .`.

### 2. Modifying the Masking Scanner (`tokenize.mjs`)

1. Read [`docs/architecture/SCANNER_INTERNALS.md`](../architecture/SCANNER_INTERNALS.md).
2. Inspect `src/lib/tokenize.mjs`.
3. Add must-mask and must-not-mask test cases to `test/tokenize.test.mjs`.
4. Implement scanner state machine adjustments in `scan()`.
5. Run full test suite (`npm test`) and dogfood check to ensure no check is broken by altered masked text.

### 3. Adding a New CLI Flag or Output Format

1. Read [`docs/architecture/DATA_FLOW.md`](../architecture/DATA_FLOW.md).
2. Update parser in `src/cli.mjs` (and `src/index.mjs` if programmatic API options change).
3. If adding a formatter, implement in `src/lib/report.mjs`.
4. Add CLI execution tests in `test/cli.test.mjs`.
5. Update [`docs/agent/COMMANDS.md`](./COMMANDS.md) and [`README.md`](../../README.md).
