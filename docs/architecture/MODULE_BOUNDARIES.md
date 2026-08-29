# Module Boundaries & Responsibilities

This document defines the responsibilities and public interfaces of each module within `commerce-agent-gates`.

---

## 1. Module Responsibilities

| Module                         | Responsibility                                  | Public Interface                                                                                                                                                                | Consumed By                                                                                          |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `bin/commerce-agent-gates.mjs` | Executable entry point                          | Process exit code                                                                                                                                                               | CLI users, npm package `bin`                                                                         |
| `src/cli.mjs`                  | Command line argument parsing and orchestration | `main(argv, io)`                                                                                                                                                                | `bin/commerce-agent-gates.mjs`, CLI tests                                                            |
| `src/index.mjs`                | Programmatic API                                | `runGates(options)`, `checks`, `checkIds`, `ConfigError`                                                                                                                        | Embedding consumers, `src/cli.mjs`                                                                   |
| `src/lib/walk.mjs`             | File discovery and path normalization           | `discover(root, options)`, `compileExclude(pattern)`                                                                                                                            | `src/index.mjs`, tests                                                                               |
| `src/lib/tokenize.mjs`         | Masking scanner and lexical span classifier     | `scan(text)`, `maskNonCode(text)`, `matchOutsideComments(text, regexp)`, `positionAt(text, offset)`, `lineHasInlineExemption(text, offset)`, `balancedArgument(masked, offset)` | `src/checks/*.mjs`, tests                                                                            |
| `src/lib/config.mjs`           | Configuration loader and validator              | `loadConfig(root, explicitPath)`, `defaultConfig()`                                                                                                                             | `src/index.mjs`, tests                                                                               |
| `src/lib/report.mjs`           | Finding formatters                              | `formatPretty(result, opts)`, `formatJson(result, opts)`, `formatSarif(result, opts)`, `formatGithub(result)`                                                                   | `src/cli.mjs`, tests                                                                                 |
| `src/lib/errors.mjs`           | User-facing error class                         | `class ConfigError extends Error`                                                                                                                                               | `src/lib/config.mjs`, `src/index.mjs`, `src/cli.mjs`, `src/checks/queries-must-be-tenant-scoped.mjs` |
| `src/checks/index.mjs`         | Checks registry                                 | `checks: Array<CheckModule>`, `checkIds: string[]`                                                                                                                              | `src/index.mjs`, `src/cli.mjs`, `src/lib/config.mjs`                                                 |
| `src/checks/*.mjs`             | Individual rule implementations                 | `meta: { id, description, defaultOptions }`, `check(files, options)`                                                                                                            | `src/checks/index.mjs`                                                                               |

---

## 2. Check Contract

Every check module in `src/checks/` must satisfy this strict contract:

```js
export const meta = {
  id: "kebab-case-identifier",
  description: "One clear sentence explaining the rule for --list and SARIF",
  defaultOptions: {
    // Declarative defaults; becomes the configuration surface
  },
};

export function check(files, options) {
  // files: Array<{ path: string, text: string }> (path is posix-relative)
  // options: Object merged over meta.defaultOptions
  // returns: Array<{ file: string, line: number, column: number, message: string }>
}
```

The runner in `src/index.mjs` attaches `ruleId: check.meta.id` and `severity: "error"` automatically.
