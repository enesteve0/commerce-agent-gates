# Data Flow & Execution Lifecycle

This document traces the complete lifecycle of a gate run from user invocation to output and exit code.

---

## Lifecycle Trace

```
1. CLI Entry (`bin/commerce-agent-gates.mjs`)
   └─ Calls `main(process.argv.slice(2), process)` in `src/cli.mjs`.

2. Argument Parsing (`src/cli.mjs:parseArgs`)
   ├─ Evaluates flags (`--format`, `--config`, `--only`, `--skip`, `--list`, `--allow-empty`, `--no-color`, `-v`, `-h`).
   └─ If `--list`, `--help`, or `--version`, writes directly to stdout and exits with code 0.

3. Programmatic Execution (`src/index.mjs:runGates`)
   ├─ Resolves scan roots (defaults to `["."]`).
   ├─ Filters check registry against `--only` and `--skip`. Throws `ConfigError` if selection is empty.
   ├─ For each root:
   │    ├─ `loadConfig(root, explicitPath)`:
   │    │    ├─ Discovers `commerce-agent-gates.config.json`.
   │    │    ├─ Validates top-level keys and check-level options against `meta.defaultOptions`.
   │    │    └─ Merges overrides over defaults.
   │    ├─ `discover(root, { exclude })`:
   │    │    ├─ Traverses filesystem deterministically (sorted).
   │    │    ├─ Normalizes paths to POSIX `/`.
   │    │    ├─ Checks symlink cycles via canonical realpaths.
   │    │    ├─ Emits notices for oversized files (> 1 MiB).
   │    │    └─ Returns `files: Array<{ path, text }>`.
   │    └─ For each selected check:
   │         ├─ Invokes `check.check(files, perCheckOptions)`.
   │         ├─ Formats findings with `ruleId: check.meta.id`, `severity: "error"`, and root prefix.
   │         └─ Tallies check counts into `checksRun`.
   └─ Sorts all findings by location (`file`, `line`, `column`).

4. Formatting & Presentation (`src/lib/report.mjs`)
   ├─ Checks `result.filesScanned`. If 0 and not `--allow-empty`, writes error to stderr and returns exit code 2.
   ├─ If `--format=pretty`, formats ANSI colored report.
   ├─ If `--format=json`, serializes structured summary JSON.
   ├─ If `--format=sarif`, serializes SARIF 2.1.0 log.
   └─ If `--format=github`, outputs workflow command annotations `::error ...`.

5. Exit Code Mapping (`src/cli.mjs`)
   ├─ 0 if `findings.length === 0`.
   ├─ 1 if `findings.length > 0`.
   └─ 2 if `ConfigError` or usage error occurred.
```
