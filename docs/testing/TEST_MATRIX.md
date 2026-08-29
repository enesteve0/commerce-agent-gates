# Subsystem Test Matrix

This matrix maps every subsystem and source file in `commerce-agent-gates` to its corresponding test suite.

---

## Test Mapping Table

| Subsystem / Module           | Source File                                      | Test Suite File                                        | Tested Behaviors                                                                       |
| ---------------------------- | ------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **Programmatic API**         | `src/index.mjs`                                  | `test/index.test.mjs`                                  | Multi-root handling, prefixing, check selection, error propagation                     |
| **CLI & Argument Parser**    | `src/cli.mjs`                                    | `test/cli.test.mjs`                                    | Flag parsing (`--format`, `--only`, etc.), exit codes 0/1/2, mock IO capture           |
| **Formatters**               | `src/lib/report.mjs`                             | `test/cli.test.mjs`                                    | JSON, SARIF 2.1.0 schema compliance, GitHub annotations, ANSI color logic              |
| **Config Loader**            | `src/lib/config.mjs`                             | `test/config.test.mjs`                                 | Typo detection, JSON errors, exemption validation, option types                        |
| **Masking Scanner**          | `src/lib/tokenize.mjs`                           | `test/tokenize.test.mjs`                               | Length/newline preservation, strings, templates, regexes, positionAt, balancedArgument |
| **File Discovery**           | `src/lib/walk.mjs`                               | `test/walk.test.mjs`                                   | POSIX normalization, symlink cycles, size cap notices, glob-lite matching              |
| **Check 1: Mock Data**       | `src/checks/no-mock-data-in-production.mjs`      | `test/checks/no-mock-data-in-production.test.mjs`      | Authority existence, refusal patterns, dynamic flag access, prefix trust               |
| **Check 2: Mutating Routes** | `src/checks/mutating-routes-must-be-guarded.mjs` | `test/checks/mutating-routes-must-be-guarded.test.mjs` | Mutating methods, bare functions, guard import checking, aliasing, re-exports          |
| **Check 3: Tenant Scoping**  | `src/checks/queries-must-be-tenant-scoped.mjs`   | `test/checks/queries-must-be-tenant-scoped.test.mjs`   | BOLA vectors, write verbs, Prisma operations, argument balancing, exemptions           |
| **Fixture Contracts**        | `fixtures/pass/`, `fixtures/fail/`               | `test/fixtures.test.mjs`                               | Tree-level integration, false positive traps, decoy resilience                         |
