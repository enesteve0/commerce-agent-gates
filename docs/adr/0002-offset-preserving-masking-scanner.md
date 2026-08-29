# ADR 0002: Offset-Preserving Masking Scanner for Lexical Analysis

- **Status**: Accepted
- **Date**: 2026-08-21
- **Deciders**: Repository Maintainers

## Context

In v1, checks operated on text where comments and strings were removed with chained regular expressions. This corrupted strings containing `/*`, misfired on URLs with `//`, could not distinguish division `/` from regular expressions, and destroyed character offsets so findings could not report line or column numbers.

## Decision

Implement a single-pass lexical scanner (`src/lib/tokenize.mjs`) that produces a `masked` string of identical byte length with all newlines preserved, alongside a classified list of non-code `spans` (`comment`, `string`, `regex`). Structural checks run against `masked` text, while `positionAt()` maps any character index directly to 1-based `{ line, column }`.

## Alternatives Considered

1. **Full AST Parsing (Babel, Acorn, TypeScript Compiler API)**: Rejected because adding an AST parser introduces heavy runtime dependencies or compiled binaries, slows down scanning by 10–50x, and creates maintenance overhead when new JS/TS syntax features are introduced.
2. **Naive Chained Regex Stripping**: Rejected due to fundamental correctness failure classes (E1 in Gap Analysis).

## Consequences

- **Positive**: Blazing fast execution (~1ms per file), zero runtime dependencies, accurate 1-based `line:column` coordinates for all findings, elimination of comment false positives.
- **Negative**: Scanner uses heuristics for JSX text nodes and division disambiguation that accept deliberate edge-case trade-offs (favoring silence over false positives).
