# commerce-agent-gates

Three checks for Next.js App Router projects that catch mistakes coding agents make over and over.

We're building [FaStart](https://fastart.co), an online store platform, and a lot of our code is written by coding agents working from specs. They're fast. They also repeat a few specific mistakes that look right, pass review and are wrong. We wrote our own checks for those mistakes, and these are three of them, pulled out of our codebase so any App Router project can run them.

## Try it

You need Node 22 or newer. From the root of your project:

```bash
npx github:enesteve0/commerce-agent-gates
```

It scans the current directory, or the folders you pass it, and every finding comes with `file:line:column`. On this repo's `fixtures/fail` folder, the tenant check prints:

```
FAIL  queries-must-be-tenant-scoped
      app/api/billing/route.ts:6:9  db.invoice.deleteMany is not scoped to the session tenant
      app/api/health/route.ts:3:63  db.tenant.count is not scoped to the session tenant
      app/api/orders/route.ts:6:23  db.order.update is not scoped to the session tenant
      app/api/webhooks/incoming/route.ts:8:9  db.webhookEvent.create is not scoped to the session tenant

✖ 4 findings across 1 check (10 files scanned)
```

To keep it in a project:

```bash
npm install --save-dev github:enesteve0/commerce-agent-gates
```

```json
{
  "scripts": {
    "gates": "commerce-agent-gates"
  }
}
```

Exit codes: `0` clean, `1` findings, `2` a usage or config error. Scanning a folder with no source files is also a `2`, because a check that passed nothing checked nothing. `--allow-empty` turns that off for monorepo corners.

## The three checks

### no-mock-data-in-production

You ask an agent to make a page work before the backend exists. It writes a mock, puts it behind a flag, and the page works. Months later nine files read that flag, one of them ships, and a customer sees orders that don't exist.

Mocks are fine. The rule is about who decides: exactly one module may say whether mocks are on, and it has to refuse in production. Everything else asks that module.

```ts
// lib/demo-mode.ts, the only module allowed to decide
export function demoMode(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.DEMO_MODE === "1";
}
```

The check also fails code that trusts a demo credential by its shape, like `startsWith("demo_")` or a `/^demo_/` regex. A token gets verified or rejected. Nothing is trusted because of how it looks.

### mutating-routes-must-be-guarded

Every exported `POST`, `PUT`, `PATCH` and `DELETE` has to go through a wrapper that establishes who is calling.

```ts
export const POST = withSession(async (session, request) => {
  // ...
});
```

Agents copy the shape of a route well and forget why the shape is there. Ask for "an endpoint to cancel an order" and you get a working handler that looks just like the twelve authenticated ones next to it, minus the wrapper, because the wrapper wasn't what you asked about. Reviewers miss it for the same reason. A machine that only asks "is the export wrapped?" doesn't get bored on the fortieth route.

The check resolves imports before it believes a wrapper. An aliased import (`withSession as auth`) counts, and so does `guards.withSession(...)`, but a local function that only shares the guard's name doesn't.

### queries-must-be-tenant-scoped

This is the one that scares me. A signed-in request arrives, the handler is wrapped, the caller is who they say they are, and the query still reads every tenant's rows, because the tenant id came from the request body instead of the session.

```ts
// flagged: the tenant comes from the request body
await db.order.update({ where: { id: body.id, tenantId: body.tenantId }, data });

// passes: the tenant comes from the session
await db.order.findMany({ where: { tenantId: session.tenantId } });
```

It passes tests, because the test data has one tenant. It gets caught in production by the customer who sees someone else's orders. So inside a route handler, a query either scopes to the session's tenant or sits on an exemption list with a written reason. A list of bare paths rots into a list nobody remembers agreeing to.

This is API1 in the OWASP API Security Top 10, broken object level authorization. The guarded-routes check covers part of API2 and API5 the same way.

## Configuration

No config is needed if your names match the defaults: guards called `withSession`, `withApiKey` or `withServiceToken`, a Prisma-style `db` client scoped with `tenantId: session.tenantId`, and `lib/demo-mode.ts` owning the demo flag. If they don't, put a `commerce-agent-gates.config.json` next to your `package.json`:

```json
{
  "exclude": ["generated", "**/vendor/**"],
  "checks": {
    "no-mock-data-in-production": {
      "flagAuthority": "src/lib/mock-mode.ts",
      "flagNames": ["USE_MOCKS"],
      "credentialPrefixes": ["test_", "playground_"]
    },
    "mutating-routes-must-be-guarded": {
      "guards": ["requireUser", "withServiceAuth"]
    },
    "queries-must-be-tenant-scoped": {
      "clients": ["prisma", "db"],
      "scopePattern": "organizationId\\s*:\\s*session[\\w$?.]*organizationId",
      "rawQueries": true,
      "exemptions": [
        { "path": "app/api/health/route.ts", "reason": "liveness only, aggregate count" }
      ]
    }
  }
}
```

Every key is optional, and an array replaces the default instead of merging with it. Unknown keys, unknown options and exemptions without a reason are errors, since a typo that quietly did nothing is exactly what these checks exist to stop.

A single line can carry its own exemption:

```ts
await db.metrics.findMany({}); // gate-exempt(platform metrics, no tenant rows)
```

## Output and CI

`--format` takes `pretty` (the default), `json`, `sarif` for GitHub code scanning, or `github` for annotations on a pull request's diff:

```yaml
- name: agent gates
  run: npx github:enesteve0/commerce-agent-gates --format github .
```

`--only` and `--skip` pick checks, `--list` lists them and `--help` shows every flag. The engine can be imported too: `import { runGates } from "commerce-agent-gates"` returns the result the CLI prints.

## Limits

These are pattern matchers over source text, not a security product. They don't replace authentication, authorization or code review, and a determined mistake can get past all three of them. They're also opinionated about naming, which is the price of checking anything mechanically; the config file is how you adapt them. If you need dataflow analysis or rules for many languages, use [Semgrep](https://semgrep.dev) or [ast-grep](https://ast-grep.github.io).

## Tests

`fixtures/pass` is a small clean app. `fixtures/fail` is the same app with the three mistakes made on purpose, plus decoys: URLs with slashes in them, comments that describe a violation, and modules outside route handlers that legitimately work across tenants. Every check has to pass the clean tree and fail the dirty one, for a named reason per violation.

```bash
npm install
npm test
```

The repo also runs its own gates on itself (`node bin/commerce-agent-gates.mjs .`). That's why `src/checks/no-mock-data-in-production.mjs` carries a `gate-exempt` comment: the rule has to name the things it looks for.

More detail: [how each check works](docs/checks/README.md), [architecture](docs/ARCHITECTURE.md) and [design decisions](docs/adr/README.md).

## License

MIT
