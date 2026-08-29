# System Architecture Overview

This document details the complete internal system architecture of `commerce-agent-gates`.

---

## 1. System Pipeline

```mermaid
flowchart TD
    subgraph Input
        Args["CLI Arguments / Programmatic Options"]
    end

    subgraph Orchestration ["src/index.mjs & src/cli.mjs"]
        Entry["runGates(options)"]
    end

    subgraph Discovery ["src/lib/walk.mjs"]
        Discover["discover(root, { exclude, maxFileBytes })"]
        Files["files: Array<{ path, text }>\nnotices: string[]"]
    end

    subgraph Config ["src/lib/config.mjs"]
        LoadConfig["loadConfig(root, explicitPath)"]
        ResolvedConfig["Validated Configuration & Options"]
    end

    subgraph CheckExecution ["src/checks/*.mjs"]
        C1["no-mock-data-in-production.check()"]
        C2["mutating-routes-must-be-guarded.check()"]
        C3["queries-must-be-tenant-scoped.check()"]
    end

    subgraph Lexer ["src/lib/tokenize.mjs"]
        Mask["scan(text) -> { masked, spans }"]
        Pos["positionAt(text, offset) -> { line, column }"]
    end

    subgraph Formatting ["src/lib/report.mjs"]
        Pretty["formatPretty()"]
        JSONFormat["formatJson()"]
        SARIF["formatSarif()"]
        GitHub["formatGithub()"]
    end

    subgraph Output
        STDOUT["stdout: Formatted Report"]
        Exit["Exit Code: 0 (clean), 1 (findings), 2 (error)"]
    end

    Args --> Entry
    Entry --> LoadConfig
    Entry --> Discover
    Discover --> Files
    Files --> C1 & C2 & C3
    ResolvedConfig --> C1 & C2 & C3
    C1 & C2 & C3 --> Mask
    C1 & C2 & C3 --> Pos
    C1 & C2 & C3 --> Findings["findings: Array<{ ruleId, file, line, column, severity, message }>"]
    Findings --> Formatting
    Formatting --> Pretty & JSONFormat & SARIF & GitHub
    Pretty & JSONFormat & SARIF & GitHub --> STDOUT
    Findings --> Exit
```

---

## 2. Key Components

### 2.1 The Walker (`src/lib/walk.mjs`)

- Performs sorted recursive traversal starting at `root`.
- Filters ignored directories (`.git`, `.next`, `node_modules`, `dist`, `coverage`, `.turbo`, `.vercel`).
- Normalizes all paths to POSIX `/` separators.
- Canonicalizes directory paths to avoid symlink recursion loops.
- Enforces a 1 MiB size cap producing non-failing notices for skipped oversized files.
- Compiles glob-lite exclude expressions (`compileExclude`).

### 2.2 The Tokenizer (`src/lib/tokenize.mjs`)

- Single-pass offset-preserving lexical scanner.
- Classifies non-code into `comment`, `string`, and `regex` spans.
- Produces `masked` text where all non-code is blanked to spaces, preserving original length and all newlines.
- Maps any character offset back to 1-based `line` and `column` with `positionAt()`.
- Extracts balanced nested arguments with `balancedArgument()`.
- Detects inline directives via `lineHasInlineExemption()`.

### 2.3 Configuration Engine (`src/lib/config.mjs`)

- Resolves default options declared directly on each check (`meta.defaultOptions`).
- Reads `commerce-agent-gates.config.json` or `--config <path>`.
- Validates all keys with typo prevention.
- Validates typed values (strings, booleans, string arrays) and mandatory exemption reasons.

### 2.4 Reporting Engine (`src/lib/report.mjs`)

- Formats structured findings into:
  - `pretty`: High-contrast ANSI colored output for TTY terminals, with `NO_COLOR` support.
  - `json`: Machine-readable JSON object with tool version, summary tallies, notices, and findings.
  - `sarif`: SARIF 2.1.0 JSON format for GitHub Advanced Security code scanning.
  - `github`: GitHub Actions workflow commands (`::error file=...,line=...,col=...,title=...::message`).
