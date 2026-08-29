# Project Overview

`commerce-agent-gates` is a zero-runtime-dependency static-analysis tool and CI gate that catches three high-impact, recurring failure modes in AI-generated Next.js App Router codebases.

---

## 1. The Core Problem

When software engineering teams use AI coding agents (Claude, Codex, Gemini, Cursor, Copilot) to generate code from requirements or user stories, agents excel at producing syntactic shapes that look correct and pass initial single-tenant tests. However, agents routinely make specific category mistakes:

1. **Demo Mock Leakage**: Creating mock data fallback flags across multiple files that eventually ship to production.
2. **Unguarded Mutating Handlers**: Implementing `POST`/`PUT`/`DELETE` handlers without wrapping them in authentication guards.
3. **Confused Deputy & BOLA (OWASP API1)**: Sourcing `tenantId` from the client request body rather than the authenticated session object, allowing tenant data leakage.

Human code reviewers frequently miss these flaws because the diffs resemble valid surrounding code.

---

## 2. Product Philosophy: Selection Over Volume

Unlike heavyweight SAST tools (Semgrep, SonarQube, Snyk) or massive linters (ESLint plugins) that report hundreds of low-signal warnings, `commerce-agent-gates` is built on **selection over volume**:

- Exactly **three** high-precision, high-impact checks.
- Zero runtime dependencies (`0` npm dependencies, Node 22+ standard library).
- Mechanical rules that require written justification for every exception (`// gate-exempt(reason)` or config `{ path, reason }`).
- First-class CI ergonomics: SARIF 2.1.0, GitHub annotations, strict exit codes (`0`, `1`, `2`).

---

## 3. Product Scope & Deliberate Boundaries

### What This Tool Owns

- Fast, deterministic scanning of Next.js App Router source trees.
- Precise line-and-column findings powered by an offset-preserving masking scanner.
- Configurable rule parameters via `commerce-agent-gates.config.json`.
- Dual distribution: CLI binary (`bin/commerce-agent-gates.mjs`) and programmatic API (`src/index.mjs`).

### What This Tool Does Not Own

- It is **not** a general-purpose security engine or whole-program dataflow/taint tracker. (For complex cross-file taint analysis, consumers should graduate to [Semgrep](https://semgrep.dev) or [ast-grep](https://ast-grep.github.io)).
- It does **not** execute or bundle the scanned code.
- It makes **no** network requests.
