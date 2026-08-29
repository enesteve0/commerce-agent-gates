# `queries-must-be-tenant-scoped` Check Specification

- **Check ID**: `queries-must-be-tenant-scoped`
- **Source File**: `src/checks/queries-must-be-tenant-scoped.mjs`
- **Test File**: `test/checks/queries-must-be-tenant-scoped.test.mjs`

---

## 1. Failure Mode (OWASP API1 / BOLA)

The confused deputy flaw is the most catastrophic failure mode in multi-tenant SaaS applications:

1. An incoming request is authenticated.
2. The user is logged in.
3. The database query uses an ID or `tenantId` extracted directly from the request body or URL parameters (`req.json().tenantId`) instead of the authenticated session object (`session.tenantId`).
4. The caller can modify or view any other tenant's data simply by guessing their ID.

---

## 2. The Enforcement Rule

Inside route handler files (`route.ts` / `route.js`):

1. Every database client operation on configured clients (default: `db`) for standard operations (`findMany`, `findFirst`, `findUnique`, `findUniqueOrThrow`, `create`, `update`, `upsert`, `delete`, `count`, `aggregate`, `groupBy`) must contain arguments matching `scopePattern` (default: `tenantId\s*:\s*session[\w$?.]*tenantId`).
2. Arguments are parsed using `balancedArgument()` to ensure nested objects and calls are inspected accurately.
3. **Exemption Mechanisms**:
   - Configuration Exemption: Whole-file exemption in config requiring a written `reason`.
   - Inline Exemption: Line-level `// gate-exempt(<reason>)` directive.
4. **Raw Queries**: If `rawQueries: true` is enabled in config, `$queryRaw` and `$executeRaw` calls are flagged for manual review.

---

## 3. Configuration Surface

```json
{
  "checks": {
    "queries-must-be-tenant-scoped": {
      "clients": ["db", "prisma"],
      "operations": [
        "findMany",
        "findFirst",
        "findUnique",
        "findUniqueOrThrow",
        "findFirstOrThrow",
        "create",
        "createMany",
        "update",
        "updateMany",
        "upsert",
        "delete",
        "deleteMany",
        "count",
        "aggregate",
        "groupBy"
      ],
      "scopePattern": "tenantId\\s*:\\s*session[\\w$?.]*tenantId",
      "rawQueries": false,
      "exemptions": [
        {
          "path": "app/api/health/route.ts",
          "reason": "liveness probe performing aggregate count only"
        }
      ]
    }
  }
}
```
