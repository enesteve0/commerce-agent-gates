# Architecture Decision Records (ADRs)

This directory records major architectural decisions made during the design and evolution of `commerce-agent-gates`.

---

## ADR Index

| ADR                                                                  | Title                                                              | Status   | Date       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | -------- | ---------- |
| [`0001`](./0001-zero-runtime-dependencies.md)                        | Zero Runtime Dependencies Invariant                                | Accepted | 2026-08-21 |
| [`0002`](./0002-offset-preserving-masking-scanner.md)                | Offset-Preserving Masking Scanner for Lexical Analysis             | Accepted | 2026-08-21 |
| [`0003`](./0003-strict-config-validation-with-mandatory-reasons.md)  | Strict Configuration Validation and Mandatory Exemption Reasons    | Accepted | 2026-08-21 |
| [`0004`](./0004-node-22-minimum-and-node-test-runner.md)             | Node 22 LTS Minimum Floor and Native `node:test` Runner            | Accepted | 2026-08-21 |
| [`0005`](./0005-unified-multi-format-reporting-sarif-github-json.md) | Unified Multi-Format Reporting (Pretty, JSON, SARIF 2.1.0, GitHub) | Accepted | 2026-08-21 |

---

## ADR Template

New ADRs should follow this structure:

```markdown
# ADR <NUMBER>: <TITLE>

- **Status**: Proposed / Accepted / Superseded / Deprecated
- **Date**: YYYY-MM-DD
- **Deciders**: Repository Maintainers

## Context

What is the problem or architectural constraint being addressed?

## Decision

What specific technical choice was made?

## Alternatives Considered

What other options were evaluated, and why were they rejected?

## Consequences

What are the positive and negative consequences of this decision?
```
