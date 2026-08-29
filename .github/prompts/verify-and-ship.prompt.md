# Verify and Ship Release

Follow this checklist before pushing releases or concluding major milestones:

1. **Clean Baseline Check**:
   - `npm run lint` (0 warnings).
   - `npm run format` (Prettier clean).
   - `npm test` (All 14 test suites pass).
   - `node bin/commerce-agent-gates.mjs .` (Self-dogfooding exit code 0).
2. **Package Hygiene Check**:
   - `npx publint`
3. **Reproduce CI Packed-Tarball Smoke Test**:
   ```bash
   mkdir -p /tmp/gates-smoke && cd /tmp/gates-smoke \
     && npm init -y >/dev/null \
     && npm pack /Users/enesteve/Desktop/Coding/repos/commerce-agent-gates --pack-destination /tmp/gates-smoke \
     && npm install --no-audit --no-fund ./*.tgz >/dev/null \
     && npx commerce-agent-gates --list \
     && npx commerce-agent-gates --version \
     && npx commerce-agent-gates /Users/enesteve/Desktop/Coding/repos/commerce-agent-gates/fixtures/pass
   ```
4. **Update Changelog**:
   - Move items from `[Unreleased]` to new version header in `CHANGELOG.md`.
5. **Tag & Publish**:
   - Bump `"version"` in `package.json`.
   - Create and push tag `v<version>`.
