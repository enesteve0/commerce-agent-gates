# Cross-Cutting Change Matrix

This matrix answers the question: **"If I modify X, what other files and tests must I inspect and update?"**

---

## Change Impact Table

| What You Changed                                                      | Files to Also Inspect & Update                             | Tests to Run / Update                                                                         | Docs to Update                                             |
| --------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **A Check's logic** (`src/checks/<id>.mjs`)                           | `src/checks/index.mjs`, `commerce-agent-gates.config.json` | `test/checks/<id>.test.mjs`, `test/fixtures.test.mjs`, `fixtures/pass/**`, `fixtures/fail/**` | `docs/checks/<NAME>.md`, `README.md`, `AGENTS.md`          |
| **A Check's options** (`meta.defaultOptions`)                         | `src/lib/config.mjs`, `commerce-agent-gates.config.json`   | `test/config.test.mjs`, `test/checks/<id>.test.mjs`                                           | `docs/checks/<NAME>.md`, `README.md` § Configuration       |
| **Masking Scanner** (`src/lib/tokenize.mjs`)                          | `src/checks/*.mjs`                                         | `test/tokenize.test.mjs`, all `test/checks/*.test.mjs`, `test/fixtures.test.mjs`              | `docs/architecture/SCANNER_INTERNALS.md`                   |
| **Walker / Discovery** (`src/lib/walk.mjs`)                           | `src/index.mjs`                                            | `test/walk.test.mjs`, `test/cli.test.mjs`                                                     | `docs/architecture/SYSTEM_OVERVIEW.md`                     |
| **Config Loader** (`src/lib/config.mjs`)                              | `src/lib/errors.mjs`, `src/index.mjs`                      | `test/config.test.mjs`, `test/index.test.mjs`                                                 | `docs/agent/INVARIANTS.md`, `README.md`                    |
| **CLI Flags / Parsing** (`src/cli.mjs`)                               | `src/index.mjs`, `bin/commerce-agent-gates.mjs`            | `test/cli.test.mjs`, `test/index.test.mjs`                                                    | `docs/agent/COMMANDS.md`, `README.md` § Output formats     |
| **Report Formatter** (`src/lib/report.mjs`)                           | `src/cli.mjs`                                              | `test/cli.test.mjs`                                                                           | `docs/adr/0005-*.md`, `README.md` § Output formats         |
| **Package Exports / Bin** (`package.json`)                            | `bin/commerce-agent-gates.mjs`, `src/index.mjs`            | `test/cli.test.mjs`, packed-tarball smoke test                                                | `docs/operations/PACKAGING_AND_RELEASE.md`, `CHANGELOG.md` |
| **ESLint / Prettier Config** (`eslint.config.js`, `.prettierrc.json`) | `.prettierignore`                                          | `npm run lint`, `npm run format`                                                              | `docs/agent/COMMANDS.md`                                   |
| **CI / Release Workflow** (`.github/workflows/*.yml`)                 | `package.json`                                             | CI Action runs on branch/PR                                                                   | `docs/operations/CI_CD.md`                                 |
