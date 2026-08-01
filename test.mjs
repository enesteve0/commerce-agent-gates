/**
 * Every check must pass the clean tree and fail the dirty one.
 *
 * A check that only ever passes is decoration. This is the test that keeps the
 * checks honest, which is the same relationship the checks have to the agents.
 */
import { sources } from "./checks/lib/walk.mjs";

const CHECKS = [
  "no-mock-data-in-production",
  "mutating-routes-must-be-guarded",
  "queries-must-be-tenant-scoped",
];

let failed = 0;

for (const name of CHECKS) {
  const { check } = await import(`./checks/${name}.mjs`);

  const clean = check(sources("fixtures/pass"));
  const dirty = check(sources("fixtures/fail"));

  if (clean.length > 0) {
    failed += 1;
    console.error(`FAIL  ${name}: flagged the clean tree`);
    for (const line of clean) console.error(`      ${line}`);
  } else if (dirty.length === 0) {
    failed += 1;
    console.error(`FAIL  ${name}: did not catch the dirty tree`);
  } else {
    console.log(`PASS  ${name}  (${dirty.length} caught in fixtures/fail)`);
    for (const line of dirty) console.log(`      ${line}`);
  }
}

process.exit(failed === 0 ? 0 : 1);
