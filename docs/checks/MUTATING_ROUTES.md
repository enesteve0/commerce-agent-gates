# `mutating-routes-must-be-guarded` Check Specification

- **Check ID**: `mutating-routes-must-be-guarded`
- **Source File**: `src/checks/mutating-routes-must-be-guarded.mjs`
- **Test File**: `test/checks/mutating-routes-must-be-guarded.test.mjs`

---

## 1. Failure Mode

When coding agents generate Next.js App Router API endpoints for write operations (`POST`, `PUT`, `PATCH`, `DELETE`), they frequently omit authentication/session wrappers. Because the route handler logic itself is functional and passes single-user tests, reviewers overlook the missing wrapper in the pull request diff.

---

## 2. The Enforcement Rule

Inside any Next.js App Router route file matching `/(^|\/)route\.[cm]?[jt]sx?$/`:

1. Every exported mutating method (`POST`, `PUT`, `PATCH`, `DELETE`) must be defined as a wrapped `const` export:
   ```ts
   import { withSession } from "@/lib/guards";
   export const POST = withSession(async (session, req) => { ... });
   ```
2. Bare function exports (`export async function POST()`) are rejected.
3. Re-exports (`export { handler as POST }`) are rejected because the wrapper cannot be structurally verified at the export boundary.
4. **Import Resolution**: The wrapping identifier must be genuinely imported from an external module (`import { withSession } from ...` or `import * as guards from ...`). Local shadowing (`const withSession = (h) => h`) is flagged immediately.

---

## 3. Configuration Surface

```json
{
  "checks": {
    "mutating-routes-must-be-guarded": {
      "guards": ["withSession", "withApiKey", "withServiceToken"]
    }
  }
}
```
