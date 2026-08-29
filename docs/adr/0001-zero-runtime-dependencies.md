# ADR 0001: Zero Runtime Dependencies Invariant

- **Status**: Accepted
- **Date**: 2026-08-21
- **Deciders**: Repository Maintainers

## Context

Developer tooling that sits in CI pipelines must install instantly, remain resilient against transitive dependency breakage, and avoid introducing security vulnerabilities or license incompatibilities into consumer environments.

## Decision

Enforce a strict **zero runtime dependencies** invariant (`"dependencies": {}` in `package.json`). All runtime capabilities (file walking, lexical scanning, configuration parsing, CLI formatting, error handling) are implemented solely using the Node.js standard library. DevDependencies are permitted for linting (`eslint`), formatting (`prettier`), and package verification (`publint`).

## Alternatives Considered

1. **Using external CLI frameworks (Commander/Yargs/Meow)**: Rejected to eliminate 20–50 transitive packages for basic flag parsing.
2. **Using external globbing/walker libraries (fast-glob/globby)**: Rejected because a focused 150-line walker with POSIX normalization and canonical symlink tracking covers 100% of needs without dependencies.

## Consequences

- **Positive**: Zero install friction (`npx` execution is near-instant), zero supply-chain attack surface, absolute runtime stability across Node LTS lines.
- **Negative**: Maintainers must write and test custom utilities (walker, scanner, argument parser) rather than relying on external libraries.
