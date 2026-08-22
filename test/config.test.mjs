import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import { CONFIG_FILE_NAME, defaultConfig, loadConfig } from "../src/lib/config.mjs";
import { ConfigError } from "../src/lib/errors.mjs";

const roots = [];

function rootWith(configJson) {
  const root = mkdtempSync(join(tmpdir(), "gates-config-"));
  roots.push(root);
  if (configJson !== undefined) writeFileSync(join(root, CONFIG_FILE_NAME), configJson);
  return root;
}

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop(), { recursive: true, force: true });
});

describe("loadConfig", () => {
  it("returns pure defaults when no config file exists", () => {
    const { options, path } = loadConfig(rootWith(), undefined);
    assert.equal(path, null);
    assert.deepEqual(options, defaultConfig());
  });

  it("discovers the config file at the scan root", () => {
    const { options, path } = loadConfig(
      rootWith(JSON.stringify({ exclude: ["generated"] })),
      undefined,
    );
    assert.match(path, /commerce-agent-gates\.config\.json$/);
    assert.deepEqual(options.exclude, ["generated"]);
    // Untouched defaults survive beside the override.
    assert.deepEqual(options.checks["mutating-routes-must-be-guarded"].guards, [
      "withSession",
      "withApiKey",
      "withServiceToken",
    ]);
  });

  it("honours an explicit --config path", () => {
    const dir = mkdtempSync(join(tmpdir(), "gates-config-explicit-"));
    roots.push(dir);
    const elsewhere = join(dir, "custom.json");
    writeFileSync(
      elsewhere,
      JSON.stringify({ checks: { "queries-must-be-tenant-scoped": { rawQueries: true } } }),
    );
    const { options, path } = loadConfig(rootWith(), elsewhere);
    assert.equal(path, elsewhere);
    assert.equal(options.checks["queries-must-be-tenant-scoped"].rawQueries, true);
  });

  it("fails loudly when an explicit config is missing", () => {
    assert.throws(() => loadConfig(rootWith(), "nope.json"), ConfigError);
  });

  it("reports malformed JSON with the file name", () => {
    assert.throws(
      () => loadConfig(rootWith("{ not json"), undefined),
      (error) => {
        assert.ok(error instanceof ConfigError);
        assert.match(error.message, /not valid JSON/);
        return true;
      },
    );
  });

  it("rejects non-object documents", () => {
    for (const body of ["[]", '"text"', "null", "3"]) {
      assert.throws(() => loadConfig(rootWith(body), undefined), ConfigError, body);
    }
  });

  it("rejects unknown keys with the valid alternatives listed", () => {
    assert.throws(
      () => loadConfig(rootWith('{"excluded": []}'), undefined),
      (error) => {
        assert.match(error.message, /unknown key "excluded"/);
        assert.match(error.message, /exclude, checks/);
        return true;
      },
    );
  });

  it("rejects unknown check ids and unknown options", () => {
    assert.throws(
      () => loadConfig(rootWith('{"checks": {"no-such-check": {}}}'), undefined),
      /no-such-check/,
    );
    assert.throws(
      () =>
        loadConfig(
          rootWith('{"checks": {"no-mock-data-in-production": {"flagAuthoraty": "x"}}}'),
          undefined,
        ),
      /flagAuthoraty/,
    );
  });

  it("demands a reason for every exemption entry", () => {
    assert.throws(
      () =>
        loadConfig(
          rootWith(
            JSON.stringify({
              checks: {
                "queries-must-be-tenant-scoped": {
                  exemptions: [{ path: "app/api/health/route.ts" }],
                },
              },
            }),
          ),
          undefined,
        ),
      /reason must state why this file is exempt/,
    );
  });

  it("normalises exemption paths to posix-relative form", () => {
    const { options } = loadConfig(
      rootWith(
        JSON.stringify({
          checks: {
            "queries-must-be-tenant-scoped": {
              exemptions: [{ path: "./app\\api/health/route.ts", reason: "liveness only" }],
            },
          },
        }),
      ),
      undefined,
    );
    assert.deepEqual(options.checks["queries-must-be-tenant-scoped"].exemptions, [
      { path: "app/api/health/route.ts", reason: "liveness only" },
    ]);
  });

  it("replaces arrays wholesale and validates element types", () => {
    const { options } = loadConfig(
      rootWith(
        JSON.stringify({ checks: { "mutating-routes-must-be-guarded": { guards: ["auth"] } } }),
      ),
      undefined,
    );
    assert.deepEqual(options.checks["mutating-routes-must-be-guarded"].guards, ["auth"]);

    assert.throws(
      () =>
        loadConfig(
          rootWith('{"checks": {"mutating-routes-must-be-guarded": {"guards": [""]}}}'),
          undefined,
        ),
      /array of strings/,
    );
  });

  it("enforces boolean and string option types", () => {
    assert.throws(
      () =>
        loadConfig(
          rootWith('{"checks": {"queries-must-be-tenant-scoped": {"rawQueries": "yes"}}}'),
          undefined,
        ),
      /must be true or false/,
    );
    assert.throws(
      () =>
        loadConfig(
          rootWith('{"checks": {"no-mock-data-in-production": {"flagAuthority": 7}}}'),
          undefined,
        ),
      /must be a string/,
    );
  });
});
