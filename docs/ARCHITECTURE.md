# Architecture

This document explains how the tool works internally and what a contributor
(or an agent) needs to know to extend it safely.

## The pipeline

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

`runGates()` in `src/index.mjs` orchestrates one pass per scan root. `src/cli.mjs`
parses arguments, calls `runGates`, prints with the chosen formatter, and maps
the result to an exit code. Everything below the CLI is importable, so
embedding consumers get identical behaviour by construction.

## Discovery (`src/lib/walk.mjs`)

- Traversal is sorted; output order never depends on filesystem internals.
- Paths are normalised to posix separators immediately. On Windows,
  `path.relative()` produces backslashes, which would make every route-file
  regex silently fail, and a gate that passes everything is worse than one that
  crashes.
- Symbolic links resolve once and are tracked by canonical path, so cycles
  cannot recurse forever.
- Oversized files are skipped with an explicit notice rather than read
  unbounded.
- Excludes use a documented glob-lite dialect instead of emulating
  `.gitignore`: half-correct gitignore emulation is worse than an explicit
  contract.

## The masking scanner (`src/lib/tokenize.mjs`)

Every check matches patterns against _code_, not raw text. The v1 approach
(strip comments and strings with chained regexes) had known failure classes:

1. block comments stripped before strings corrupted string literals that
   contained `/*`;
2. `//` line-comment heuristics misfired on URLs;
3. regex literals were indistinguishable from division without token context;
4. findings could not carry positions because offsets were destroyed.

The replacement is a single-pass scanner producing two coordinated views:

- **masked**: same length as the source, non-code regions blanked to spaces,
  newlines preserved. Structural matching runs here, and any index in it maps
  to exact `line:column` through `positionAt()`.
- **spans**: classified non-code regions (comment / string / regex literal).
  Literal-aware rules match raw text and use spans to ignore comments while
  still seeing string contents, which is where interesting literals live.

Handled constructs: line and multi-line block comments; quoted strings with
escapes; template literals with `${…}` interpolated code nested to any depth;
regex literals with character classes, disambiguated from division by the
previous significant token (the standard heuristic: operators and certain
keywords allow a following regex; identifiers, closing brackets, and quotes
imply division).

Known limitation, accepted deliberately: JSX text nodes are scanned as code,
so a literal `//` inside JSX prose blanks the remainder of that line.
Masking errs toward silence, never toward inventing findings.

## The check contract

Each module under `src/checks/` exports:

```js
export const meta = {
  id: "kebab-case-id",
  description: "one sentence shown in SARIF rules and --list",
  defaultOptions: { … },        // becomes the config surface for this check
};

export function check(files, options) {
  // files: [{ path: posixRelative, text }]
  // returns: [{ file, line, column, message }]  (1-based positions)
}
```

The runner attaches `ruleId` and `severity`; checks never repeat them. Options
arrive pre-merged over `defaultOptions`, but every check normalises again at
entry so direct programmatic calls stay safe.

Selection is the product. A fourth check is added only when a failure mode
earns its place: it must be mechanically detectable, common enough to justify
reviewer attention, and expressible as a rule a human would agree to after
reading its rationale. Candidates recorded during research (not built):
webhook endpoints skipping HMAC signature verification; server actions
exported without auth wrapping.

## Configuration (`src/lib/config.mjs`)

Defaults live beside the logic that consumes them (`meta.defaultOptions`) so a
check and its configuration surface cannot drift apart. Validation is strict:
unknown keys anywhere are errors listing valid alternatives, types are
inferred from defaults, exemption entries demand a written reason, and invalid
regexes fail at load time as `ConfigError`, printed without a stack trace,
because a bad config is user input, not a crash.

Inline exemptions complement config-file ones: a `gate-exempt(reason)` marker
on the offending line suppresses that finding. Both mechanisms require a
reason, because a list of bare paths rots into a list nobody remembers
agreeing to.

## Reporting (`src/lib/report.mjs`)

One finding shape feeds four formatters. Pretty output colours only when
stdout is a TTY and honours `NO_COLOR`. SARIF 2.1.0 emits one run with rules
derived from the registry; artifact URIs are relative when a single root is
scanned (multi-root runs prefix paths for attribution). GitHub annotations use
workflow-command escaping for properties and data.

## Testing strategy

- **Lexer tables** (`test/tokenize.test.mjs`): adversarial inputs with exact
  expectations, including the corruption cases that motivated the scanner.
- **Check case tables** (`test/checks/*.test.mjs`): must-catch and must-pass
  snippets per rule, including near-misses designed to tempt false positives.
- **Fixture contract** (`test/fixtures.test.mjs`): tree-level integration:
  every check passes `fixtures/pass` and fails `fixtures/fail` for named
  reasons. This is the contract inherited from v1's `test.mjs`.
- **CLI integration** (`test/cli.test.mjs`): spawned behaviour via `main()`
  against temporary trees: exit codes, formats parse, annotations are
  well-formed, config errors surface cleanly.

CI additionally packs the tarball, installs it into a scratch project, and
runs the published artefact against both fixture trees, plus dogfoods the
gates on this repository itself.

## Conventions

- Zero runtime dependencies is a feature; dev tooling never reaches consumers.
- Node floor is the lowest supported LTS line (22 today); features used must
  be stable there.
- Errors that are the user's fault are `ConfigError` with a clean message;
  anything else fails loudly with a stack.
- No silent failures: unreadable files, skipped oversized files, and empty
  scans all produce explicit notices or errors.
