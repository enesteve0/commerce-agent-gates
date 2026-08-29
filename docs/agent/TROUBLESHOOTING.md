# Troubleshooting & Problem Resolution

This document contains solutions to verified development, testing, formatting, and packaging issues encountered in `commerce-agent-gates`.

---

## 1. Prettier Formatting Failures on New Markdown Files

- **Symptom**: `npm run format` fails with `[warn] Code style issues found in <file>.md`.
- **Cause**: Prettier checks all files in the repository unless excluded in `.prettierignore`.
- **Fix**: Run `npm run format:fix` to automatically format the markdown file, or add the file to `.prettierignore` if it is an external prompt or raw template.

---

## 2. Test Suite Assertion Failures in `fixtures.test.mjs`

- **Symptom**: `fixtures.test.mjs` fails with `flagged the clean tree` or `missing expected finding matching ...`.
- **Cause**:
  1. If `fixtures/pass` failed: A check is over-matching on legitimate code or a decoy pattern (like a URL with `//` or a comment). Ensure the check runs over `maskNonCode()` or uses `matchOutsideComments()`.
  2. If `fixtures/fail` failed: A planted violation was missed by a modified check. Check the regex in `src/checks/*.mjs` and the expected regex in `test/fixtures.test.mjs`.

---

## 3. `ConfigError` vs Stack Trace in CLI Tests

- **Symptom**: `test/cli.test.mjs` fails assertion `stack frames leaked into stderr`.
- **Cause**: An error thrown in `src/lib/config.mjs` was thrown as `new Error(...)` rather than `new ConfigError(...)`.
- **Fix**: Import `ConfigError` from `./errors.mjs` and throw `ConfigError`.

---

## 4. Packed Tarball Smoke Test Fails

- **Symptom**: `npx commerce-agent-gates --list` fails in a scratch directory after `npm pack`.
- **Cause**: A necessary runtime file was omitted from `"files"` in `package.json` (e.g. `bin/`, `src/`).
- **Fix**: Verify `"files"` in `package.json` includes `bin/`, `src/`, `README.md`, `CHANGELOG.md`, and `LICENSE`. Run `npx publint` to detect packaging flaws.
