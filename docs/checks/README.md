# Checks Registry & Specifications

This section documents the three static analysis checks implemented in `commerce-agent-gates`.

---

## The Three Checks

| ID                                                        | Description                                                                                                              | Primary Failure Mode Addressed                                            | OWASP API Category                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------- |
| [`no-mock-data-in-production`](./NO_MOCK_DATA.md)         | Single authority module resolves demo flags and refuses in production; credentials verified, never recognized by prefix. | Demo mode leakage, mock data reaching customers, unverified credentials.  | API2 (Broken Authentication)             |
| [`mutating-routes-must-be-guarded`](./MUTATING_ROUTES.md) | Every exported `POST`/`PUT`/`PATCH`/`DELETE` in route files must pass through an imported identity guard.                | Unauthenticated write endpoints created by coding agents.                 | API2 / API5 (Broken Function Level Auth) |
| [`queries-must-be-tenant-scoped`](./TENANT_SCOPING.md)    | Database queries inside route handlers must scope to session tenant or carry an exemption with a reason.                 | Confused deputy / BOLA: sourcing tenant id from body rather than session. | API1 (Broken Object Level Auth / BOLA)   |

---

## Philosophy: Selection Over Volume

Each check in this registry earned its place based on real failure modes observed when AI agents write Next.js App Router code:

1. **Mechanically Checkable**: The failure has a clear, deterministic syntactic signature.
2. **High Severity**: Violations cause production data corruption or authentication bypass.
3. **Written Justifications**: Any deviation must be explicitly justified via a configuration entry or inline `// gate-exempt(reason)` directive.
