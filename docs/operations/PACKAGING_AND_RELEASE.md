# Packaging, Provenance & Release Guide

This document defines how `commerce-agent-gates` is packaged for npm distribution and published securely with npm provenance.

---

## 1. Package Specification (`package.json`)

- **Name**: `commerce-agent-gates`
- **Type**: `module` (ESM native)
- **Engines**: `"node": ">=22"`
- **Bin**: `"commerce-agent-gates": "bin/commerce-agent-gates.mjs"`
- **Exports Map**:
  - `"."`: `"./src/index.mjs"`
  - `"./package.json"`: `"./package.json"`
- **Included Files (`files`)**:
  - `bin/`
  - `src/`
  - `README.md`
  - `CHANGELOG.md`
  - `LICENSE`
- **Side Effects**: `false`

---

## 2. Release Workflow (`.github/workflows/release.yml`)

Publishing to npm is automated via tag pushes (`v*`):

1. Developer updates `CHANGELOG.md` and bumps `version` in `package.json`.
2. Developer creates and pushes a tag: `git tag v2.1.0 && git push origin v2.1.0`.
3. GitHub Actions triggers `release.yml`:
   - Runs full test suite on Node 22.
   - Sets `id-token: write` permission to generate Sigstore provenance attestation.
   - Runs `npm publish --provenance` with `NODE_AUTH_TOKEN`.
