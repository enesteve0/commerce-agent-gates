# Common Developer & Agent Tasks

Step-by-step recipes for recurring development and maintenance tasks in `commerce-agent-gates`.

---

## Recipe 1: Extending an Existing Check with a New Pattern

**Example**: Adding a new Prisma operation to `queries-must-be-tenant-scoped`.

1. **Update `meta.defaultOptions`**:
   Open `src/checks/queries-must-be-tenant-scoped.mjs` and add the operation name (e.g. `"updateManyAndReturn"`) to `meta.defaultOptions.operations`.
2. **Verify Regex Compilation**:
   Ensure `inspectQueries()` includes the operation name in its dynamic RegExp.
3. **Add Adversarial Case Table Tests**:
   Open `test/checks/queries-must-be-tenant-scoped.test.mjs`. Add tests asserting:
   - The new operation without tenant scoping is flagged with exact line number.
   - The new operation WITH session tenant scoping passes without findings.
   - A near-miss (e.g. A custom method with a similar name) is not falsely flagged.
4. **Update Fixtures**:
   If appropriate, add an example in `fixtures/fail/` and ensure `test/fixtures.test.mjs` passes.
5. **Update Documentation**:
   Update `docs/checks/TENANT_SCOPING.md` and `README.md`.
6. **Verify**:
   Run `npm test && npm run lint && npm run format && node bin/commerce-agent-gates.mjs .`.

---

## Recipe 2: Adding a New Refusal Idiom to `no-mock-data-in-production`

**Example**: Supporting a custom production environment variable like `process.env.APP_ENV === "prod"`.

1. **Update Check Logic**:
   Open `src/checks/no-mock-data-in-production.mjs` and add the pattern to `PRODUCTION_REFUSALS` or make it configurable via `meta.defaultOptions`.
2. **Add Unit Test Cases**:
   Open `test/checks/no-mock-data-in-production.test.mjs` and add the refusal idiom to the `"accepts every legitimate refusal idiom"` test loop.
3. **Document**:
   Update `docs/checks/NO_MOCK_DATA.md`.
4. **Verify**:
   Run `npm test && npm run lint`.

---

## Recipe 3: Adding a Lexer Tokenizer Feature

**Example**: Enhancing string or template literal handling.

1. **Add Unit Tests First**:
   Open `test/tokenize.test.mjs` and add both positive (should mask) and negative (should not mask) test assertions.
2. **Modify State Machine**:
   Open `src/lib/tokenize.mjs` and update `scan()` logic.
3. **Verify Offsets & Newlines**:
   Ensure `masked.length === text.length` and newline count remains identical.
4. **Run Full Test Suite**:
   Run `npm test` across all 14 suites to guarantee no check suffered collateral damage.

---

## Recipe 4: Preparing a Release

1. **Update Changelog**:
   Open `CHANGELOG.md` and move items from `[Unreleased]` to a new version header `[2.x.x] — YYYY-MM-DD`.
2. **Bump `package.json`**:
   Update `"version": "2.x.x"`.
3. **Run Pre-flight Checks**:
   ```bash
   npm run lint
   npm run format
   npm test
   npx publint
   node bin/commerce-agent-gates.mjs .
   ```
4. **Run Packed Smoke Test**:
   ```bash
   mkdir -p /tmp/gates-pack && cd /tmp/gates-pack \
     && npm init -y >/dev/null \
     && npm pack /Users/enesteve/Desktop/Coding/repos/commerce-agent-gates --pack-destination /tmp/gates-pack \
     && npm install --no-audit --no-fund ./*.tgz >/dev/null \
     && npx commerce-agent-gates --list
   ```
