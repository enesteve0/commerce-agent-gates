/**
 * Agent failure mode: the confused deputy.
 *
 * This is the one that scares people. An authenticated request arrives, the
 * handler is correctly wrapped, the caller is who they say they are, and the
 * query still reads every tenant's rows, because the id came from the request
 * body instead of the session.
 *
 * Nothing about it looks wrong. It passes tests, because the test fixture has
 * one tenant in it. It is caught in production by the customer who sees
 * someone else's orders. So the rule is mechanical: inside a route handler, a
 * query either scopes to the session's tenant or carries a written reason
 * beside it. This maps to OWASP API Security Top 10 API1 (Broken Object Level
 * Authorization), the most commonly exploited API flaw there is.
 */
import { ConfigError } from "../lib/errors.mjs";
import {
  balancedArgument,
  lineHasInlineExemption,
  maskNonCode,
  positionAt,
} from "../lib/tokenize.mjs";

export const meta = {
  id: "queries-must-be-tenant-scoped",
  description:
    "Inside route handlers, database reads and writes must scope to the session tenant (OWASP API1: BOLA) or carry an explicit exemption with a reason.",
  defaultOptions: {
    /** Database client identifiers whose calls are inspected. */
    clients: ["db"],
    /** Client model operations that must be scoped. */
    operations: [
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
      "groupBy",
    ],
    /** What an acceptable scoping looks like inside the call arguments. */
    scopePattern: "tenantId\\s*:\\s*session[\\w$?.]*tenantId",
    /** Flag $queryRaw/$executeRaw for manual review instead of trusting them. */
    rawQueries: false,
    /** Whole-file exemptions; each entry demands its reason up front. */
    exemptions: [],
  },
};

const ROUTE_FILE = /(^|\/)route\.[cm]?[jt]sx?$/;
const RAW_QUERY = /\$(?:queryRaw|executeRaw)(?:Unsafe)?\b/g;

export function check(files, userOptions) {
  const options = { ...meta.defaultOptions, ...userOptions };
  const findings = [];
  const scope = compileScope(options.scopePattern);
  const exemptPaths = new Set(options.exemptions.map((entry) => entry.path));

  for (const file of files) {
    if (!ROUTE_FILE.test(file.path)) continue;
    if (exemptPaths.has(file.path)) continue;

    const masked = maskNonCode(file.text);
    findings.push(...inspectQueries(file, masked, options, scope));
    if (options.rawQueries) findings.push(...inspectRawQueries(file, masked));
  }

  return findings;
}

function compileScope(pattern) {
  try {
    return new RegExp(pattern);
  } catch (error) {
    throw new ConfigError(
      `queries-must-be-tenant-scoped.scopePattern is not a valid regular expression: ${error.message}`,
    );
  }
}

function inspectQueries(file, masked, options, scope) {
  const findings = [];
  const clients = options.clients.map(escapeRegExp).join("|");
  const operations = options.operations.map(escapeRegExp).join("|");
  const query = new RegExp(`\\b(${clients})\\.([A-Za-z_$][\\w$]*)\\.(${operations})\\s*\\(`, "g");

  let m;
  while ((m = query.exec(masked)) !== null) {
    if (lineHasInlineExemption(file.text, m.index)) continue;
    const position = positionAt(file.text, m.index);
    const call = `${m[1]}.${m[2]}.${m[3]}`;

    const argument = balancedArgument(masked, m.index + m[0].length - 1);
    if (argument === null) {
      findings.push({
        file: file.path,
        line: position.line,
        column: position.column,
        message: `could not parse the arguments to ${call}`,
      });
      continue;
    }

    scope.lastIndex = 0;
    if (!scope.test(argument)) {
      findings.push({
        file: file.path,
        line: position.line,
        column: position.column,
        message: `${call} is not scoped to the session tenant`,
      });
    }
  }

  return findings;
}

function inspectRawQueries(file, masked) {
  const findings = [];
  RAW_QUERY.lastIndex = 0;
  let m;
  while ((m = RAW_QUERY.exec(masked)) !== null) {
    if (lineHasInlineExemption(file.text, m.index)) continue;
    const position = positionAt(file.text, m.index);
    findings.push({
      file: file.path,
      line: position.line,
      column: position.column,
      message: `${m[0]} bypasses query-level tenant scoping; move it behind a reviewed helper or exempt it with a reason`,
    });
  }
  return findings;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
