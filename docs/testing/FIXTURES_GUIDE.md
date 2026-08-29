# Test Fixtures Guide: Clean vs Dirty Trees

The `fixtures/` directory provides two synthetic Next.js App Router projects that test the entire static analysis engine end-to-end.

---

## 1. Clean Tree (`fixtures/pass/`)

- **Role**: Validates that standard Next.js App Router patterns, edge middleware, health probes, and valid guarded routes produce **0 findings**.
- **Key Files**:
  - `fixtures/pass/lib/demo-mode.ts`: Canonical authority module with valid production refusal.
  - `fixtures/pass/app/api/orders/route.ts`: Clean `GET` and `POST` handlers wrapped in `withSession` with queries scoped to `tenantId: session.tenantId`.
  - `fixtures/pass/app/api/health/route.ts`: Health route using an inline `// gate-exempt(...)` comment for a non-tenant count query.
  - `fixtures/pass/app/api/billing/route.ts`: Clean wrapped handlers.

---

## 2. Dirty Tree (`fixtures/fail/`)

- **Role**: Contains deliberate violations of all 3 checks, alongside intentional false-positive decoy traps.
- **Planted Violations**:
  1. `fixtures/fail/lib/demo-mode.ts`: Missing production refusal.
  2. `fixtures/fail/app/page.tsx`: Direct read of `process.env["DEMO_MODE"]`.
  3. `fixtures/fail/lib/orders-client.ts`: Token prefix trust `token.test(/^demo_/)`.
  4. `fixtures/fail/app/api/orders/route.ts`: Bare `POST` function without wrapper + BOLA query using `body.tenantId`.
  5. `fixtures/fail/app/api/billing/route.ts`: Unguarded `DELETE` export.
  6. `fixtures/fail/app/api/health/route.ts`: Unscoped `tenant.count` query without an exemption directive.
  7. `fixtures/fail/app/api/webhooks/incoming/route.ts`: Bare `POST` function.
- **Decoys**:
  - Comments containing SQL/Prisma snippets (e.g. `// db.order.findMany()`).
  - URLs containing `//` slashes to test scanner masking.
  - Legitimate cross-tenant server helpers outside `app/api/` that should remain unflagged.
