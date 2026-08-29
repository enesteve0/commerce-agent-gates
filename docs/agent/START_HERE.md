# Agent Onboarding: Start Here

Welcome to `commerce-agent-gates`. This document quickly gives you an accurate mental model of what this project does, how it is constructed, and how you should navigate it during an AI coding session.

---

## 1. What This Repository Is

`commerce-agent-gates` is a zero-runtime-dependency developer tool containing three opinionated static-analysis checks designed to catch the specific failure modes AI coding agents frequently make in Next.js App Router codebases:

1. **`no-mock-data-in-production`**: Ensures exactly one designated authority module resolves the demo/mock flag and refuses to serve mock data in production; verifies demo credentials instead of trusting them by prefix/shape.
2. **`mutating-routes-must-be-guarded`**: Ensures every exported `POST`, `PUT`, `PATCH`, and `DELETE` handler in App Router `route.ts` files is wrapped in an identity-establishing guard that is genuinely imported.
3. **`queries-must-be-tenant-scoped`**: Ensures database read/write queries inside route handlers scope to the session tenant (preventing OWASP API1: Broken Object Level Authorization / BOLA / confused deputy flaws) or carry an explicit exemption with a written reason.

---

## 2. The Core Pipeline & Architecture

The entire tool is synchronous, offline, and zero-runtime-dependency (Node 22+ standard library only).

```
┌──────────────┐      ┌──────────────┐      ┌─────────────────────────┐      ┌──────────────┐      ┌──────────┐
│   CLI Args   │  ──> │   walk.mjs   │  ──> │       config.mjs        │  ──> │ checks/*.mjs │  ──> │report.mjs│
│ (or runGates)│      │  (discover)  │      │(load & strictly validate)│      │(find issues) │      │(format)  │
└──────────────┘      └──────────────┘      └─────────────────────────┘      └──────────────┘      └──────────┘
                             │                                                      │                    │
                             ▼                                                      │                    ▼
                      files: {path, text}                                     findings[]            stdout/stderr
                             │                                             {ruleId, file, line,     + exit code
                             ▼                                              column, severity,         (0/1/2)
                      tokenize.mjs                                               message}
                     (maskNonCode,
                    matchOutsideComments,
                        positionAt)
```

1. **Discovery (`src/lib/walk.mjs`)**: Deterministically scans directories, normalizes all paths to POSIX separators (`/`), resolves symlinks safely to prevent recursion cycles, enforces a 1 MiB file size cap with notices, and filters via glob-lite excludes.
2. **Scanner & Lexer (`src/lib/tokenize.mjs`)**: Masks comments, strings, template interpolations (`${...}`), and regex literals while strictly preserving character offsets and newlines. This allows regular expressions to match structure safely without comment false positives, and enables `positionAt()` to return exact 1-based `line:column` coordinates.
3. **Configuration (`src/lib/config.mjs`)**: Loads and strictly validates `commerce-agent-gates.config.json`. Rejecting unknown keys, wrong types, or exemptions missing reasons as `ConfigError` (clean message, exit code 2, no stack traces).
4. **Checks Registry (`src/checks/index.mjs`)**: Contains the 3 check modules. Each exports `meta` (`id`, `description`, `defaultOptions`) and `check(files, options)`.
5. **Reporting (`src/lib/report.mjs`)**: Formats findings into `pretty` (colorized for TTY, respects `NO_COLOR`), `json`, `sarif` (SARIF 2.1.0 for GitHub code scanning), or `github` (workflow command annotations).
6. **CLI Wrapper (`src/cli.mjs`) & Bin (`bin/commerce-agent-gates.mjs`)**: Maps outcomes to exit codes: `0` (clean), `1` (findings), `2` (usage/config error or empty scan without `--allow-empty`).

---

## 3. Non-Negotiable Engineering Invariants

When modifying this repository, you must never violate these core invariants:

- **Zero Runtime Dependencies**: `package.json` must never have a `"dependencies"` block. Only `devDependencies` for linting/formatting/testing.
- **Node 22+ Standard Library**: Use Node 22/24 built-in APIs (`node:fs`, `node:path`, `node:test`, `node:assert/strict`, `structuredClone`).
- **Exact Coordinates**: Every finding MUST report `file:line:column` computed via `positionAt()`. Never count line numbers by splitting lines manually.
- **Masked Matching**: Match syntax against `maskNonCode(text)` or `matchOutsideComments(text, regex)`. Never run naive raw string regexes over unmasked code.
- **Config Errors are User Input Errors**: Throw `ConfigError` for misconfigurations or missing mandatory reasons; `cli.mjs` handles this cleanly with exit code 2 and no stack trace.
- **Written Reasons for Exemptions**: Exemptions in config and inline `// gate-exempt(reason)` MUST state a non-empty reason.
- **Never Weaken Tests**: If a case table test fails, investigate why; never reduce test coverage or remove near-miss assertions.

---

## 4. Immediate Next Steps & Context Routing

Depending on what task you are performing, read the specialized documentation next:

- For a complete map of all repository files: read [`docs/agent/FILE_INVENTORY.md`](./FILE_INVENTORY.md).
- To find which docs to read for your specific task: read [`docs/agent/CONTEXT_MAP.md`](./CONTEXT_MAP.md).
- To view verified commands to run: read [`docs/agent/COMMANDS.md`](./COMMANDS.md).
- To understand the invariants: read [`docs/agent/INVARIANTS.md`](./INVARIANTS.md).
- To follow a step-by-step development recipe: read [`docs/agent/COMMON_TASKS.md`](./COMMON_TASKS.md).
