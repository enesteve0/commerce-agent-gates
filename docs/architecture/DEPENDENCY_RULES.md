# Dependency Rules & Allowed Import Directions

To maintain high cohesion, zero circular dependencies, and strict zero-runtime-dependency constraints, imports within `commerce-agent-gates` must adhere to these rules.

---

## 1. Allowed Import Graph

```
bin/commerce-agent-gates.mjs
    ↓ (imports)
src/cli.mjs
    ↓ (imports)
src/index.mjs  ───→  src/lib/report.mjs
 ┌──┴───────────────────────────┬───────────────────────────┐
 │                              │                           │
 ▼                              ▼                           ▼
src/lib/walk.mjs       src/lib/config.mjs          src/checks/index.mjs
                                │                           │
                                ▼                           ▼
                       src/lib/errors.mjs          src/checks/*.mjs
                                                            │
                                                            ▼
                                                   src/lib/tokenize.mjs
```

---

## 2. Strict Rules

1. **`src/lib/` Isolation**:
   - Modules in `src/lib/` must NEVER import from `src/cli.mjs`, `bin/`, or `src/checks/` (with the exception of `src/lib/config.mjs` which reads `src/checks/index.mjs` to know valid check IDs and default options).
   - `tokenize.mjs`, `walk.mjs`, `report.mjs`, and `errors.mjs` are pure leaf utilities.
2. **`src/checks/` Isolation**:
   - Check modules in `src/checks/*.mjs` must NEVER import from other checks or `src/cli.mjs`.
   - They may only import lexical helpers from `src/lib/tokenize.mjs` and `ConfigError` from `src/lib/errors.mjs`.
3. **No External Runtime Imports**:
   - Only Node.js built-in modules prefixed with `node:` (`node:fs`, `node:path`, `node:module`, `node:assert`, `node:test`) are permitted.
