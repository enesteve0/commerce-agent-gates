# commerce-agent-gates

Three build checks that encode mistakes coding agents make and careful humans don't.

I build a commerce platform where most of the construction is done by coding agents running against written specs. That works, but only because nothing merges until it clears a set of repository invariants we wrote ourselves. These are three of them, generalised out of our codebase into a shape any Next.js App Router project can use.

The interesting part isn't the code. It's the selection. Each check exists because of a specific way an agent produces something that looks right, passes review, and is wrong.

## The checks

### `no-mock-data-in-production`

**The failure:** you ask an agent to make a page work before the backend exists. It writes a mock, gates it behind a flag, and the feature works. Months later the flag is read in nine files, one of them ships, and a customer sees invented orders.

The mistake is never the mock. It's that reading the flag spread out. So the rule isn't "don't use mocks", it's that exactly one module may decide whether mocks are on, and that module must refuse in production. Everything else asks it.

The check also fails any code that recognises a demo credential by its prefix. A token gets verified or it gets rejected. Nothing is trusted because of how it looks.

### `mutating-routes-must-be-guarded`

**The failure:** every exported `POST`, `PUT`, `PATCH` and `DELETE` must go through a wrapper that establishes who is calling.

Agents are good at reproducing the shape of a route and bad at remembering why the shape exists. Ask for "an endpoint to cancel an order" and you get a working handler that looks exactly like the twelve authenticated ones next to it, minus the wrapper, because the wrapper wasn't the part you asked about.

Human reviewers miss it for the same reason: the diff looks like the file above it. A machine that only ever asks "is the export wrapped" does not get bored on the fortieth route.

### `queries-must-be-tenant-scoped`

**The failure:** the confused deputy, and the one that actually scares me.

An authenticated request arrives. The handler is correctly wrapped. The caller is who they say they are. And the query still reads every tenant's rows, because the tenant id came from the request body instead of the session.

Nothing about it looks wrong. It passes tests, because the test fixture has one tenant in it. It gets caught in production by the customer who sees someone else's orders. So the rule is mechanical: inside a route handler, a query either scopes to the session's tenant or it sits on an exemption list with a written reason next to it. A list of bare paths rots into a list nobody remembers agreeing to.

## Running them

No dependencies. Node 18 or newer.

```
node checks/no-mock-data-in-production.mjs      path/to/src
node checks/mutating-routes-must-be-guarded.mjs path/to/src
node checks/queries-must-be-tenant-scoped.mjs   path/to/src
```

Each prints its failures and exits non-zero, so it drops into a pre-merge script as-is.

## Fixtures

`fixtures/pass` is a small clean tree. `fixtures/fail` is the same tree with the three mistakes made on purpose.

```
node test.mjs
```

Every check has to pass the clean tree and fail the dirty one. A check that only ever passes is decoration, and the test is what keeps the checks honest. It's the same relationship the checks have to the agents.

## What these are not

Not a security product, and not a substitute for authentication, authorisation, or review. They're pattern matchers over source text, and a determined mistake gets past all three. What they buy is that the specific mistakes below never reach a reviewer's attention budget, which means the budget goes somewhere useful.

They're also opinionated about naming, because that's the cost of checking anything mechanically. `withSession`, `db.order.findMany`, `session.tenantId`. Change the constants at the top of each file to match your codebase.

## Licence

MIT.

---

Written while building [FaStart](https://fastart.co).
