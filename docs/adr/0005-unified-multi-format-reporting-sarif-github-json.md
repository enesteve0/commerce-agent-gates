# ADR 0005: Unified Multi-Format Reporting (Pretty, JSON, SARIF 2.1.0, GitHub)

- **Status**: Accepted
- **Date**: 2026-08-21
- **Deciders**: Repository Maintainers

## Context

Static analysis gates need to integrate seamlessly into diverse environments: local terminal inspection for developers, structured JSON for custom tooling, SARIF 2.1.0 for GitHub code scanning alerts, and workflow commands for inline pull request review comments.

## Decision

Implement a single structured Finding model `{ ruleId, file, line, column, severity, message }` in `src/index.mjs` that feeds four specialized formatters in `src/lib/report.mjs`:

1. `formatPretty`: High-contrast ANSI colors for TTY terminals with `NO_COLOR` support.
2. `formatJson`: Machine-readable document with version, summary counts, and findings array.
3. `formatSarif`: Full SARIF 2.1.0 OASIS standard output uploadable via `@actions/upload-sarif`.
4. `formatGithub`: Workflow command annotations (`::error file=...,line=...,col=...,title=...::message`) rendered inline on PR diffs.

## Alternatives Considered

1. **Text-Only Output**: Rejected because CI systems require machine-readable formats to create interactive UI annotations.
2. **Third-Party SARIF Builder Libraries**: Rejected to maintain the zero-runtime-dependency invariant.

## Consequences

- **Positive**: First-class CI integration across GitHub Actions, native terminal developer ergonomics, full programmatic transparency.
- **Negative**: Maintainers must verify that SARIF output strictly complies with the OASIS schema without schema-builder helper libraries.
