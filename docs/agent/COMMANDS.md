# Verified Commands Reference

This reference documents all working commands in `commerce-agent-gates`. Every command here has been verified against the repository's configuration and runtime environment.

---

## 1. Development & Quality Gate Commands

Run these commands from the repository root:

| Command                               | Purpose                                          | Prerequisites | Expected Result                                     |
| ------------------------------------- | ------------------------------------------------ | ------------- | --------------------------------------------------- |
| `npm test`                            | Run full test suite across all 14 test suites    | Node >=22     | All 116+ tests pass with 0 failures                 |
| `npm run test:coverage`               | Run full test suite with V8 code coverage report | Node >=22     | Test run completes with line coverage report (~98%) |
| `npm run lint`                        | Run ESLint across all repository files           | `npm install` | Clean output with 0 errors and 0 warnings           |
| `npm run format`                      | Check formatting across all files with Prettier  | `npm install` | Prettier check passes with 0 style issues           |
| `npm run format:fix`                  | Automatically fix formatting on all files        | `npm install` | Prettier formats any unformatted files              |
| `node bin/commerce-agent-gates.mjs .` | Dogfood the gates against this repository        | Node >=22     | Exit code `0` (`PASS` on all checks)                |

---

## 2. CLI Execution Commands

When using or testing the CLI locally:

```bash
# Basic scan of the current directory (pretty format)
node bin/commerce-agent-gates.mjs .

# Scan specific subdirectories
node bin/commerce-agent-gates.mjs fixtures/pass
node bin/commerce-agent-gates.mjs fixtures/fail

# Output format options
node bin/commerce-agent-gates.mjs --format=json fixtures/pass
node bin/commerce-agent-gates.mjs --format=sarif fixtures/fail
node bin/commerce-agent-gates.mjs --format=github fixtures/fail

# Run only specific checks
node bin/commerce-agent-gates.mjs --only=no-mock-data-in-production .
node bin/commerce-agent-gates.mjs --only=mutating-routes-must-be-guarded .
node bin/commerce-agent-gates.mjs --only=queries-must-be-tenant-scoped .

# Skip specific checks
node bin/commerce-agent-gates.mjs --skip=no-mock-data-in-production .

# List all available checks
node bin/commerce-agent-gates.mjs --list

# Display help and version
node bin/commerce-agent-gates.mjs --help
node bin/commerce-agent-gates.mjs --version

# Use a custom configuration file
node bin/commerce-agent-gates.mjs --config=my-custom-config.json .

# Allow empty scans (e.g. In monorepo directories with no source files)
node bin/commerce-agent-gates.mjs --allow-empty empty-dir/
```

---

## 3. Targeted Test Commands

To run individual test suites during development:

```bash
# Run lexer table tests
node --test test/tokenize.test.mjs

# Run check case table tests
node --test test/checks/no-mock-data-in-production.test.mjs
node --test test/checks/mutating-routes-must-be-guarded.test.mjs
node --test test/checks/queries-must-be-tenant-scoped.test.mjs

# Run discovery & walker tests
node --test test/walk.test.mjs

# Run config validation tests
node --test test/config.test.mjs

# Run CLI integration tests
node --test test/cli.test.mjs

# Run clean/dirty fixture contract tests
node --test test/fixtures.test.mjs

# Run programmatic API tests
node --test test/index.test.mjs
```

---

## 4. Packaging & Smoke Verification Commands

Before publishing or concluding major changes, reproduce the CI packaging smoke test:

```bash
# Verify package hygiene with publint
npx publint

# Pack and install into a clean temporary directory
mkdir -p /tmp/gates-pack && cd /tmp/gates-pack \
  && npm init -y >/dev/null \
  && npm pack /Users/enesteve/Desktop/Coding/repos/commerce-agent-gates --pack-destination /tmp/gates-pack \
  && npm install --no-audit --no-fund ./*.tgz >/dev/null \
  && npx commerce-agent-gates --list \
  && npx commerce-agent-gates --version
```

---

## 5. Exit Code Semantics

The CLI guarantees deterministic exit codes for CI environments:

- `0`: **Clean** — No findings were reported; all scanned files passed.
- `1`: **Findings** — Violations were detected and printed in the requested format.
- `2`: **Usage or Configuration Error** — Invalid flags, malformed JSON config, unknown config keys, exemption missing reason, or directory with zero source files without `--allow-empty`.
