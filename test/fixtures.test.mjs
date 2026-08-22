/**
 * The tree-level contract the original test.mjs enforced, kept honest under
 * node:test: every check passes the clean tree and fails the dirty one — and
 * fails it for the right reason.
 *
 * A check that only ever passes is decoration. These fixtures are also the
 * false-positive gauntlet: URLs with slashes, decoy comments, aliased
 * imports, non-route modules doing cross-tenant work on purpose.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checks } from "../src/checks/index.mjs";
import { defaultConfig } from "../src/lib/config.mjs";
import { discover } from "../src/lib/walk.mjs";

const cleanTree = discover("fixtures/pass").files;
const dirtyTree = discover("fixtures/fail").files;

/** Which check is expected to catch what in fixtures/fail. */
const EXPECTED_EVIDENCE = {
  "no-mock-data-in-production": [
    /does not refuse in production/,
    /reads demo flag DEMO_MODE directly/, // process.env["DEMO_MODE"]
    /reads demo flag isDemoEnabled directly/,
    /trusts a demo credential by shape/, // token.test(/^demo_/)
  ],
  "mutating-routes-must-be-guarded": [
    /POST is declared as a bare function/, // app/api/orders
    /DELETE is exported without one of/, // app/api/billing
    /POST is declared as a bare function/, // app/api/webhooks/incoming
  ],
  "queries-must-be-tenant-scoped": [
    /db\.order\.update is not scoped to the session tenant/,
    /db\.invoice\.deleteMany is not scoped to the session tenant/,
    /db\.tenant\.count is not scoped to the session tenant/,
  ],
};

describe("fixture contract", () => {
  for (const check of checks) {
    const options = defaultConfig().checks[check.meta.id];

    it(`${check.meta.id} passes the clean tree`, () => {
      const findings = check.check(cleanTree, structuredClone(options));
      assert.deepEqual(
        findings,
        [],
        `${check.meta.id} flagged the clean tree:\n${findings
          .map((f) => `${f.file}:${f.line}: ${f.message}`)
          .join("\n")}`,
      );
    });

    it(`${check.meta.id} catches every planted mistake in the dirty tree`, () => {
      const findings = check.check(dirtyTree, structuredClone(options));
      assert.ok(findings.length > 0, "did not catch anything");
      for (const evidence of EXPECTED_EVIDENCE[check.meta.id]) {
        assert.ok(
          findings.some((f) => evidence.test(f.message)),
          `missing expected finding matching ${evidence}; got:\n${findings
            .map((f) => `- ${f.file}:${f.line} ${f.message}`)
            .join("\n")}`,
        );
      }
    });
  }
});
