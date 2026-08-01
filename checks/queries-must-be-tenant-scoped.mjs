/**
 * Agent failure mode: the confused deputy.
 *
 * This is the one that scares me. An authenticated request arrives, the handler
 * is correctly wrapped, the caller is who they say they are, and the query still
 * reads every tenant's rows because the id came from the request body instead of
 * the session.
 *
 * Nothing about it looks wrong. It passes tests, because the test fixture has one
 * tenant in it. It is caught in production by the customer who sees someone else's
 * orders. So the rule is mechanical: inside a route handler, a query either scopes
 * to the session's tenant or it is on a list with a human-written reason.
 */
import { runAsScript, stripCommentsAndStrings } from "./lib/walk.mjs";

const ROUTE_FILE = /(^|\/)route\.tsx?$/;
const QUERY = /\bdb\.[a-zA-Z]+\.(findMany|findFirst|update|updateMany|delete|deleteMany|count)\s*\(/g;

/** Scoping must come from the session, never from caller-supplied input. */
const SESSION_SCOPED = /\btenantId:\s*session\.[a-zA-Z.]*\btenantId\b/;

/**
 * Exemptions carry a reason in the same line. A list of bare paths rots into a
 * list nobody remembers agreeing to.
 */
const EXEMPT = new Map([
  ["app/api/health/route.ts", "no tenant data, liveness only"],
]);

export function check(files) {
  const failures = [];

  for (const file of files) {
    if (!ROUTE_FILE.test(file.path)) continue;
    if (EXEMPT.has(file.path)) continue;

    const code = stripCommentsAndStrings(file.text);
    const queries = [...code.matchAll(QUERY)];
    if (queries.length === 0) continue;

    for (const query of queries) {
      const argument = balancedArgument(code, query.index + query[0].length - 1);
      if (argument === null) {
        failures.push(`${file.path}: could not parse the argument to ${query[0].slice(0, -1)}`);
        continue;
      }
      if (!SESSION_SCOPED.test(argument)) {
        failures.push(`${file.path}: ${query[0].slice(0, -1)} is not scoped to session.tenantId`);
      }
    }
  }

  return failures;
}

/** Read from an opening paren to its match, so nested objects don't truncate. */
function balancedArgument(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return text.slice(openIndex + 1, i);
    }
  }
  return null;
}

runAsScript(import.meta.url, "queries-must-be-tenant-scoped", check);
