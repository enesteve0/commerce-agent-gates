# Investigate a Gate Failure or Test Defect

Follow this systematic procedure to diagnose and resolve gate findings or test failures:

1. **Inspect Finding Coordinates**:
   - Run the gates with pretty output: `node bin/commerce-agent-gates.mjs <target-dir>`.
   - Jump directly to the file, line, and column reported in the finding.
2. **Determine the Violated Check**:
   - Consult the check documentation in `docs/checks/` for full rationale and expected code shapes.
3. **Verify if Exemption is Justified**:
   - If the code is intentionally exempted (e.g. A system-wide aggregate query in a health route), add an inline `// gate-exempt(<mandatory-reason>)` directive or a config entry `{ "path": "...", "reason": "..." }`.
   - Never add a bare-path exemption without a written reason.
4. **Fix the Underlying Code**:
   - Wrap mutating handlers with an imported session guard.
   - Route demo flag checks through the single authority module (`lib/demo-mode.ts`).
   - Scope database queries to `tenantId: session.tenantId`.
5. **Run Verification**:
   - `npm test && npm run lint && npm run format && node bin/commerce-agent-gates.mjs .`
