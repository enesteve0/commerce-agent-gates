# Add a New Static Analysis Check

Follow this workflow to create a new check in `commerce-agent-gates`:

1. **Verify Justification**: Read [`docs/checks/README.md`](../../docs/checks/README.md). Ensure the failure mode represents a common, high-severity agent mistake with a clear mechanical syntactic rule.
2. **Define Configuration First**:
   - Create `src/checks/<new-check-id>.mjs`.
   - Export `meta = { id, description, defaultOptions }`.
3. **Implement Check Logic**:
   - Export `function check(files, userOptions)`.
   - Merge options: `const options = { ...meta.defaultOptions, ...userOptions }`.
   - Scan files using `maskNonCode(file.text)` or `matchOutsideComments(file.text, pattern)`.
   - Derive finding coordinates with `positionAt(file.text, match.index)`.
   - Support inline exemptions with `lineHasInlineExemption(file.text, match.index)`.
4. **Register the Check**:
   - Add to `src/checks/index.mjs` in the `checks` array.
5. **Write Comprehensive Case Table Tests**:
   - Create `test/checks/<new-check-id>.test.mjs`.
   - Add must-catch cases, must-pass cases, custom options tests, and at least 2 adversarial near-misses.
6. **Update Fixture Trees**:
   - Add passing code to `fixtures/pass/`.
   - Add failing violation to `fixtures/fail/`.
   - Add evidence regex to `test/fixtures.test.mjs`.
7. **Document the Check**:
   - Create `docs/checks/<NEW_CHECK>.md`.
   - Update `README.md` and `AGENTS.md`.
8. **Verify**:
   - Run `npm test && npm run lint && npm run format && node bin/commerce-agent-gates.mjs .`.
