# commerce-agent-gates

Three build checks that encode mistakes coding agents make and careful humans don't.

I build a commerce platform where most of the construction is done by coding agents running against written specs. That works, but only because nothing merges until it clears a set of repository invariants we wrote ourselves. These are three of them, generalised out of our codebase into a shape any Next.js App Router project can use.

The interesting part isn't the code. It's the selection. Each check exists because of a specific way an agent produces something that looks right, passes review, and is wrong.

## The checks

### `no-mock-data-in-production`

**The failure:** you ask an agent to make a page work before the backend exists. It writes a mock, gates it behind a flag, and the feature works. Months later the flag is read in nine files, one of them ships, and a customer sees invented orders.

The mistake is never the mock. It's that reading the flag spread out. So the rule isn't "don't use mocks", it's that exactly one module may decide whether mocks are on, and that module must refuse in production. Everything else asks it.

The check also fails any code that recognises a demo credential by its prefix — `startsWith("demo_")`, a `/^demo_/` regex, `includes`, a `RegExp` constructor call. A token gets verified or it gets rejected. Nothing is trusted because of how it looks.

### `mutating-routes-must-be-guarded`

**The failure:** every exported `POST`, `PUT`, `PATCH` and `DELETE` must go through a wrapper that establishes who is calling.

Agents are good at reproducing the shape of a route and bad at remembering why the shape exists. Ask for "an endpoint to cancel an order" and you get a working handler that looks exactly like the twelve authenticated ones next to it, minus the wrapper, because the wrapper wasn't the part you asked about.

Human reviewers miss it for the same reason: the diff looks like the file above it. A machine that only ever asks "is the export wrapped" does not get bored on the fortieth route.

The check resolves imports before believing a wrapper: an aliased import (`withSession as auth`) counts, a namespace usage (`guards.withSession(...)`) counts, and a locally defined function that merely shares the guard's name does not.

### `queries-must-be-tenant-scoped`

**The failure:** the confused deputy, and the one that actually scares me.

An authenticated request arrives. The handler is correctly wrapped. The caller is who they say they are. And the query still reads every tenant's rows, because the tenant id came from the request body instead of the session.

Nothing about it looks wrong. It passes tests, because the test fixture has one tenant in it. It gets caught in production by the customer who sees someone else's orders. So the rule is mechanical: inside a route handler, a query either scopes to the session's tenant or it sits on an exemption list with a written reason next to it. A list of bare paths rots into a list nobody remembers agreeing to.

This is OWASP API Security Top 10 API1 — Broken Object Level Authorization — the single most commonly exploited API flaw. The guarded-routes check covers API2/API5 the same way. The gates don't claim to be a security product; they just happen to make the boring mechanical parts of those categories un-skippable.

## Running them

No runtime dependencies. Node 22 or newer.

```bash
# in a project you want to gate
npx commerce-agent-gates            # scan the current directory
npx commerce-agent-gates src app    # scan specific roots

# or as a devDependency with a script
npm install --save-dev commerce-agent-gates
```

```json
{
  "scripts": {
    "gates": "commerce-agent-gates"
  }
}
```

Exit codes: `0` clean, `1` findings reported, `2` usage or configuration error — including scanning a directory that contains no source files, because a gate that silently passed nothing checked nothing. (`--allow-empty` opts out for monorepo corners.)

Findings print with `file:line:column` so you can jump straight to the code:

```
FAIL  queries-must-be-tenant-scoped
      app/api/orders/route.ts:3:31  db.order.update is not scoped to the session tenant

✖ 1 finding across 1 check (41 files scanned)
```

## Configuration

Zero configuration works when your conventions match the defaults: guards named `withSession` / `withApiKey` / `withServiceToken`, a Prisma-style `db` client scoping on `tenantId: session.tenantId`, and `lib/demo-mode.ts` owning the demo flag. Otherwise drop a `commerce-agent-gates.config.json` next to your `package.json`:

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

Every key is optional; arrays replace defaults wholesale rather than merging. Unknown keys, unknown option names, and exemption entries without a written reason are hard errors — a typo'd setting that silently did nothing would be exactly the kind of quiet failure these gates exist to prevent.

Single lines can carry their own exemption where the exception lives:

```ts
await db.metrics.findMany({}); // gate-exempt(platform metrics, no tenant rows)
```

## Output formats

| Format | Flag              | Use                   |
| ------ | ----------------- | --------------------- |
| pretty | _(default)_       | humans, terminals     |
| json   | `--format json`   | scripts, dashboards   |
| sarif  | `--format sarif`  | GitHub code scanning  |
| github | `--format github` | inline PR annotations |

GitHub Actions recipe — annotations on the diff plus code-scanning alerts:

```yaml
- name: agent gates
  run: npx commerce-agent-gates --format github .

- name: upload results to code scanning
  if: always()
  run: npx commerce-agent-gates --format sarif . > gates.sarif
- uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: gates.sarif
```

`--only <checkId>` / `--skip <checkId>` select checks; `--list` enumerates them; `--help` explains everything. The whole engine is also importable: `import { runGates } from "commerce-agent-gates"` returns the structured result the CLI prints.

## What these are not

Not a security product, and not a substitute for authentication, authorisation, or review. They're pattern matchers over source text, and a determined mistake gets past all three. What they buy is that the specific mistakes above never reach a reviewer's attention budget, which means the budget goes somewhere useful.

They're also opinionated about naming, because that's the cost of checking anything mechanically. Unlike v1, though, you no longer fork to rename things — the config file above is the intended surface.

If you need dataflow analysis, taint tracking, or rules across dozens of languages, graduate to [Semgrep](https://semgrep.dev) or [ast-grep](https://ast-grep.github.io); they're excellent and this tool doesn't try to be them. If you want three specific agent-shaped holes in your Next.js repo closed cheaply, this is yours.

## Fixtures and tests

`fixtures/pass` is a small clean tree. `fixtures/fail` is the same tree with the three mistakes made on purpose — plus decoys: URLs containing slashes, comments describing violations, non-route modules doing cross-tenant work legitimately.

```bash
npm test
```

Every check has to pass the clean tree and fail the dirty one, for named reasons per violation. A check that only ever passes is decoration, and the test is what keeps the checks honest. It's the same relationship the checks have to the agents.

This repository also runs the gates on itself in CI — including its own source, which is why `src/checks/no-mock-data-in-production.mjs` carries a `gate-exempt` comment explaining why the rule must name its own subjects there.

## Migrating from v1

v1 shipped copy-in scripts you edited by hand:

```bash
node checks/no-mock-data-in-production.mjs path/to/src   # v1
npx commerce-agent-gates path/to/src                     # v2
```

Constants became config keys (see the table above); the hardcoded exemption map became config exemptions and inline directives; findings now carry line/column and machine-readable formats exist. Node 18 and 20 have reached end-of-life upstream, so v2 requires Node 22+.

## Documentation

Detailed architecture, check specifications, invariants, and agent operating instructions live in the [`docs/`](./docs) directory:

- [**Documentation Hub & Index**](./docs/README.md) — Master navigation map and source of truth.
- [**Agent Onboarding (`docs/agent/START_HERE.md`)**](./docs/agent/START_HERE.md) — Fast mental model and context routing for AI coding agents.
- [**Architecture & Scanner Internals**](./docs/architecture/SYSTEM_OVERVIEW.md) — Pipeline diagrams, module boundaries, and lexer mechanics.
- [**Check Specifications**](./docs/checks/README.md) — Detailed domain rules and failure modes for each check.
- [**Testing & Fixtures Strategy**](./docs/testing/TESTING_STRATEGY.md) — Multi-tier testing, case tables, and fixture contracts.
- [**Architecture Decision Records (ADRs)**](./docs/adr/README.md) — Historical architectural decisions (0001–0005).

## Licence

MIT.

---

Written while building [FaStart](https://fastart.co).
