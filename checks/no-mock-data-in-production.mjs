/**
 * Agent failure mode: the demo escape hatch reaches production.
 *
 * You ask an agent to make a page work without a backend. It writes a mock,
 * gates it behind a flag, and the feature works. Months later the flag is read
 * in nine files, one of them ships, and a customer sees invented orders.
 *
 * The mistake is never the mock. It's that reading the flag spread out. So the
 * rule is not "don't use mocks", it's "exactly one module is allowed to decide
 * whether mocks are on, and it must refuse in production".
 */
import { runAsScript, stripCommentsAndStrings } from "./lib/walk.mjs";

const FLAG = /\bDEMO_MODE\b|\bisDemoEnabled\b/;

/** The only module permitted to resolve the demo flag. Everything else asks it. */
const FLAG_AUTHORITY = "lib/demo-mode.ts";

/** A demo credential must be verified, never recognised by how it looks. */
const PREFIX_TRUST = /\.startsWith\(\s*["'`]demo[_-]/;

export function check(files) {
  const failures = [];
  const authority = files.find((file) => file.path === FLAG_AUTHORITY);

  if (!authority) {
    failures.push(`${FLAG_AUTHORITY} is missing: no module owns the demo flag`);
  } else if (!/NODE_ENV\s*===?\s*["'`]production["'`]/.test(authority.text)) {
    failures.push(`${FLAG_AUTHORITY} does not refuse in production`);
  }

  for (const file of files) {
    if (file.path === FLAG_AUTHORITY) continue;
    const code = stripCommentsAndStrings(file.text);

    if (FLAG.test(code)) {
      failures.push(`${file.path}: reads the demo flag directly, import from ${FLAG_AUTHORITY}`);
    }
    if (PREFIX_TRUST.test(code)) {
      failures.push(`${file.path}: trusts a demo credential by prefix instead of verifying it`);
    }
  }

  return failures;
}

runAsScript(import.meta.url, "no-mock-data-in-production", check);
