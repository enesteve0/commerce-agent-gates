# ADR 0004: Node 22 LTS Minimum Floor and Native `node:test` Runner

- **Status**: Accepted
- **Date**: 2026-08-21
- **Deciders**: Repository Maintainers

## Context

Node.js 18 reached end-of-life on 2025-04-30 and Node.js 20 reached end-of-life on 2026-04-30. Claiming compatibility with unsupported runtimes created technical debt and prevented the adoption of modern, stable standard library features (such as the native `node:test` runner, `--experimental-test-coverage`, and native ESM enhancements).

## Decision

Set the minimum supported engine to Node.js 22 LTS (`"engines": { "node": ">=22" }`). Replace ad-hoc test scripts with the native `node:test` and `node:assert/strict` test runner.

## Alternatives Considered

1. **Jest / Vitest / Mocha**: Rejected because they require tens of megabytes of third-party devDependencies and complex configuration files, whereas `node:test` is built into the runtime.
2. **Maintaining Node 18/20 Support**: Rejected due to upstream EOL and security maintenance policies.

## Consequences

- **Positive**: Zero test framework dependencies, lightning-fast test execution (<1 second for entire suite), native subtest and coverage reporting.
- **Negative**: Consumers running deprecated Node 18 or 20 environments cannot run v2.0.0 without upgrading.
