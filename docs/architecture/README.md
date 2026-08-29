# Architecture Overview

This section documents the internal architecture of `commerce-agent-gates`.

---

## Architecture Documents

- [`SYSTEM_OVERVIEW.md`](./SYSTEM_OVERVIEW.md) — High-level pipeline architecture and component model.
- [`MODULE_BOUNDARIES.md`](./MODULE_BOUNDARIES.md) — Module encapsulation, interfaces, and responsibilities.
- [`DEPENDENCY_RULES.md`](./DEPENDENCY_RULES.md) — Unidirectional dependency graphs and forbidden imports.
- [`DATA_FLOW.md`](./DATA_FLOW.md) — End-to-end data lifecycle from invocation to exit code.
- [`SCANNER_INTERNALS.md`](./SCANNER_INTERNALS.md) — State machine design of `src/lib/tokenize.mjs`.

---

## Core Pipeline Summary

```
discover          loadConfig            check()                format
┌─────────┐     ┌───────────┐      ┌──────────────┐      ┌──────────┐
│ walk.mjs │ →   │ config.mjs │  →   │ checks/*.mjs │  →   │ report.* │ → stdout
└─────────┘     └───────────┘      └──────────────┘      └──────────┘
 files[]         merged options       findings[]            + exit code
 {path, text}    per check            {ruleId, file,
                 validated strictly    line, column,
                                       severity, message}
```
