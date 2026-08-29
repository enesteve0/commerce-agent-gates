# ADR 0003: Strict Configuration Validation and Mandatory Exemption Reasons

- **Status**: Accepted
- **Date**: 2026-08-21
- **Deciders**: Repository Maintainers

## Context

A major risk with developer tools is silent misconfiguration: an engineer misspells an option in a JSON file (e.g. `"flagAuthoraty"` instead of `"flagAuthority"`), the tool silently ignores the unknown key and falls back to defaults, and the expected check rule fails to run. Furthermore, bare path exemption lists rot over time into security blind spots.

## Decision

1. **Strict Validation**: Reject unknown top-level keys, unknown check IDs, and unknown per-check option names as `ConfigError`, listing nearest valid options in the error message.
2. **Mandatory Reasons**: Require a non-empty `reason` string for every configuration exemption (`{ path, reason }`) and every inline code directive (`// gate-exempt(reason)`).
3. **Clean User Error Presentation**: Catch `ConfigError` in the CLI and emit a clean message to `stderr` with exit code `2`, suppressing stack traces.

## Alternatives Considered

1. **Permissive Configuration**: Silently ignoring unknown keys. Rejected because silent failure contradicts the project's primary thesis.
2. **Bare Path Exemptions**: Allowing simple string arrays of paths. Rejected because exemption without documented intent creates unmaintainable security holes.

## Consequences

- **Positive**: Complete typo protection, auditable security exemptions, clear actionable error output without crash dumps.
- **Negative**: Users must adhere strictly to the configuration schema and write justifications for every exception.
