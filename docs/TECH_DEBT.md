# Technical Debt & Design Trade-offs

This document records verified design limitations, technical debt, and accepted trade-offs discovered during codebase audits.

---

## 1. Verified Trade-offs & Deliberate Limitations

### TD-1: JSX Text Node Slash Scanning

- **Location**: `src/lib/tokenize.mjs`
- **Context**: JSX text nodes (e.g. `<div>// not a comment</div>`) are scanned as standard JavaScript code rather than XML/HTML text. A literal `//` in JSX prose causes the remainder of that line to be blanked out in `masked` view.
- **Impact**: Masking errs on the side of silence (blanking potential code) rather than generating false positives. It has zero impact on route handler files (`route.ts`) which contain pure TypeScript/JavaScript.
- **Status**: **Accepted Limitation**. Building a full JSX AST parser would violate the zero-runtime-dependency and ultra-fast scanning goals.

### TD-2: Raw SQL Queries Flagging ($queryRaw)

- **Location**: `src/checks/queries-must-be-tenant-scoped.mjs`
- **Context**: Raw SQL query strings (Prisma `$queryRaw`, `$executeRaw`) cannot be reliably checked for tenant WHERE clauses using lightweight regex without full SQL dialect AST parsing.
- **Impact**: Instead of guessing, `rawQueries` is an opt-in boolean option in `commerce-agent-gates.config.json` that flags all raw SQL calls for manual review or explicit exemption.
- **Status**: **Accepted Design**.

### TD-3: Synchronous File I/O

- **Location**: `src/lib/walk.mjs`, `src/lib/config.mjs`
- **Context**: Uses synchronous Node fs methods (`readdirSync`, `readFileSync`, `realpathSync`, `statSync`).
- **Impact**: In small to mid-sized codebases (hundreds of files), synchronous I/O completes in <50ms with zero promise overhead. In massive repos (100,000+ files), worker threads or async streaming would be faster.
- **Status**: **Accepted Design**. Current performance is instant for target Next.js repositories.

---

## 2. Historical Gaps Resolved in v2.0.0

All historical gaps (E1–E11, P1–P7, U1–U3, O1–O3 from `docs/GAP_ANALYSIS.md`) have been fully resolved:

- Replaced naive strip regexes with offset-preserving masking scanner.
- Added strict config validation with typo protection.
- Added 1-based `line:column` positions to all findings.
- Added SARIF 2.1.0, JSON, and GitHub workflow annotations.
- Added POSIX path normalization for Windows support.
- Migrated test runner to native `node:test`.
