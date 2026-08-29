# Continuous Integration & Automation (`.github/workflows/ci.yml`)

The CI pipeline runs on every pull request and push to `master` / `main`.

---

## 1. Matrix Strategy

CI tests across supported LTS Node.js lines:

- Node.js 22 (Maintenance LTS)
- Node.js 24 (Active LTS)

---

## 2. Pipeline Stages

1. **Checkout & Setup**: Uses `actions/checkout@v4` and `actions/setup-node@v4` with npm caching.
2. **Clean Install**: `npm ci`.
3. **Linting Gate**: `npm run lint` (`eslint . --max-warnings 0`).
4. **Formatting Gate**: `npm run format` (`prettier --check .`).
5. **Test Suite**: `npm test` (`node --test`).
6. **Self-Dogfooding**: `node bin/commerce-agent-gates.mjs .` (The gates gate their own repository).
7. **Package Hygiene**: `npx publint` validates export map, types, and package structure.
8. **Packed-Tarball Smoke Test**:
   ```bash
   mkdir -p /tmp/gates-smoke
   npm pack --pack-destination /tmp/gates-smoke
   cd /tmp/gates-smoke
   npm init -y > /dev/null
   npm install --no-audit --no-fund ./*.tgz > /dev/null
   npx commerce-agent-gates --list
   npx commerce-agent-gates --version
   npx commerce-agent-gates "$GITHUB_WORKSPACE/fixtures/pass"
   if npx commerce-agent-gates "$GITHUB_WORKSPACE/fixtures/fail"; then
     echo "smoke failure: the dirty fixture tree passed" >&2
     exit 1
   fi
   ```
