import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ConfigError, runGates } from "../src/index.mjs";

describe("runGates programmatic contract", () => {
  it("rejects an empty root list as configuration", () => {
    assert.throws(
      () => runGates({ root: [] }),
      (error) => {
        assert.ok(error instanceof ConfigError);
        assert.match(error.message, /no target directory given/);
        return true;
      },
    );
  });

  it("rejects a selection emptied out by --only/--skip overlap", () => {
    assert.throws(
      () =>
        runGates({
          root: "fixtures/pass",
          only: ["mutating-routes-must-be-guarded"],
          skip: ["mutating-routes-must-be-guarded"],
        }),
      (error) => {
        assert.ok(error instanceof ConfigError);
        assert.match(error.message, /no checks selected/);
        return true;
      },
    );
  });

  it("returns the structured clean-tree result", () => {
    const result = runGates({ root: "fixtures/pass" });
    assert.equal(result.filesScanned, 9);
    assert.deepEqual(result.findings, []);
    assert.equal(result.checksRun.length, 3);
    assert.deepEqual(result.notices, []);
    // A subdirectory of this repository has no config file of its own.
    assert.equal(result.configPath, null);
  });

  it("mirrors the CLI's per-rule tallies on the dirty tree", () => {
    const result = runGates({ root: "fixtures/fail" });
    const counts = Object.fromEntries(result.checksRun.map((e) => [e.id, e.count]));
    assert.equal(counts["no-mock-data-in-production"], 8);
    assert.equal(counts["mutating-routes-must-be-guarded"], 3);
    assert.equal(counts["queries-must-be-tenant-scoped"], 4);
    for (const finding of result.findings) {
      assert.ok(finding.file.length > 0);
      assert.equal(finding.severity, "error");
      assert.ok(Number.isInteger(finding.line) && finding.line >= 1);
      assert.ok(Number.isInteger(finding.column) && finding.column >= 1);
    }
  });
});
