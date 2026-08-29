# Agent Knowledge Architecture & Navigation

This directory (`docs/agent/`) forms the specialized **AI coding-agent operating layer** for `commerce-agent-gates`. It provides fast, accurate context routing, operational rules, verified commands, invariants, and step-by-step recipes so that any coding session can immediately be productive and preserve repository invariants.

---

## 1. Documentation Architecture & Hierarchy

To prevent documentation drift and avoid wasting context with massive always-loaded files, this repository uses a tiered architecture:

```
[Tool Adapters] (CLAUDE.md, GEMINI.md, Copilot, Cursor)
       ↓ references
[Canonical Entry Point] (AGENTS.md)
       ↓ routes via CONTEXT_MAP.md
┌────────────────────────────────────────────────────────┐
│                   On-Demand Context                    │
│                                                        │
│  docs/agent/         Operational recipes, invariants,   │
│                      commands, checklists, mistakes   │
│                                                        │
│  docs/architecture/  Pipeline, lexer internals, data   │
│                      flow, module boundaries           │
│                                                        │
│  docs/checks/        Deep domain rules for each check   │
│                                                        │
│  docs/testing/       Test strategy, matrices, fixtures │
│                                                        │
│  docs/operations/    CI/CD, packaging, release model   │
│                                                        │
│  docs/adr/           Architecture Decision Records     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Source-of-Truth Hierarchy

When information needs to be confirmed or updated, consult these canonical sources:

| Category                     | Canonical Home                                        | Secondary / Routed References             |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------------- |
| Standing Agent Directives    | [`AGENTS.md`](../../AGENTS.md)                        | `CLAUDE.md`, `GEMINI.md`, Copilot, Cursor |
| Task Context Routing         | [`docs/agent/CONTEXT_MAP.md`](./CONTEXT_MAP.md)       | `AGENTS.md` § Context Router              |
| Complete File Ledger         | [`docs/agent/FILE_INVENTORY.md`](./FILE_INVENTORY.md) | `docs/agent/REPOSITORY_MAP.md`            |
| Verified Commands            | [`docs/agent/COMMANDS.md`](./COMMANDS.md)             | `AGENTS.md` § Essential Commands          |
| Non-Negotiable Invariants    | [`docs/agent/INVARIANTS.md`](./INVARIANTS.md)         | `AGENTS.md` § Core Invariants             |
| Check Domain Knowledge       | [`docs/checks/*.md`](../checks/)                      | `src/checks/*.mjs`                        |
| Pipeline & Scanner Internals | [`docs/architecture/*.md`](../architecture/)          | `src/lib/tokenize.mjs`, `walk.mjs`        |
| Testing Standards & Fixtures | [`docs/testing/*.md`](../testing/)                    | `test/`, `fixtures/`                      |
| Packaging & CI/CD            | [`docs/operations/*.md`](../operations/)              | `.github/workflows/`, `package.json`      |
| Architectural Decisions      | [`docs/adr/*.md`](../adr/)                            | `docs/architecture/`                      |

---

## 3. Directory Contents

- [`START_HERE.md`](./START_HERE.md) — Comprehensive onboarding walkthrough for fresh agents.
- [`CONTEXT_MAP.md`](./CONTEXT_MAP.md) — Task-to-documentation context router.
- [`FILE_INVENTORY.md`](./FILE_INVENTORY.md) — 100% complete coverage ledger for every repository file.
- [`REPOSITORY_MAP.md`](./REPOSITORY_MAP.md) — Semantic directory breakdown and architecture diagrams.
- [`COMMANDS.md`](./COMMANDS.md) — Verified commands reference for testing, linting, formatting, CLI execution, and releases.
- [`INVARIANTS.md`](./INVARIANTS.md) — Standing invariants (architectural, detection, reporting, testing, operational).
- [`DEFINITION_OF_DONE.md`](./DEFINITION_OF_DONE.md) — Verification checklists for each type of change.
- [`CHANGE_MATRIX.md`](./CHANGE_MATRIX.md) — Impact analysis matrix: "If I modify X, what else must change?"
- [`COMMON_TASKS.md`](./COMMON_TASKS.md) — Step-by-step recipes for recurring development tasks.
- [`COMMON_MISTAKES.md`](./COMMON_MISTAKES.md) — Catalog of known agent failure modes and their correct patterns.
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) — Solutions to real development, CI, and packaging issues.
- [`HANDOFF.md`](./HANDOFF.md) — Structured template for passing session context between agents.

---

## 4. Maintenance Rules & Agent Feedback Loop

1. **Documentation is Part of the Code**: Whenever a check is modified, a command added, an option added to `meta.defaultOptions`, or an invariant changed, update the corresponding Markdown documentation in the same commit.
2. **The Feedback Loop**: If an agent makes a mistake that could have been prevented by existing documentation, add an entry to [`COMMON_MISTAKES.md`](./COMMON_MISTAKES.md) or [`INVARIANTS.md`](./INVARIANTS.md) to immunize future sessions.
3. **No Documentation Theater**: Avoid generic phrases ("follow best practices"). State exact files, functions, regexes, and commands.
