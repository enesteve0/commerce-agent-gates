import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { check, meta } from "../../src/checks/no-mock-data-in-production.mjs";

const AUTHORITY_GUARDED = {
  "lib/demo-mode.ts": [
    "// The only module allowed to decide whether demo data is on.",
    "export function demoMode(): boolean {",
    '  if (process.env.NODE_ENV === "production") return false;',
    '  return process.env.DEMO_MODE === "1";',
    "}",
  ].join("\n"),
};

const defaults = meta.defaultOptions;
const run = (files, overrides = {}) => check(toFiles(files), { ...defaults, ...overrides });

function toFiles(map) {
  return Object.entries(map).map(([path, text]) => ({ path, text }));
}

describe("no-mock-data-in-production", () => {
  it("passes a tree where only the authority touches the flag", () => {
    assert.deepEqual(
      run({ ...AUTHORITY_GUARDED, "app/page.tsx": "export default () => null;\n" }),
      [],
    );
  });

  it("fails when the authority module does not exist", () => {
    const findings = run({ "app/page.tsx": "" });
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /is missing: no module owns the demo flag/);
    assert.equal(findings[0].file, "lib/demo-mode.ts");
  });

  it("fails when the authority never refuses production", () => {
    const findings = run({
      "lib/demo-mode.ts": 'export const demoMode = process.env.DEMO_MODE === "1";\n',
    });
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /does not refuse in production/);
  });

  it("accepts every legitimate refusal idiom", () => {
    for (const refusal of [
      'if (process.env.NODE_ENV === "production") return false;',
      "if (process.env.NODE_ENV !== 'development') throw new Error('no');",
      'if (process.env.VERCEL_ENV === "production") return false;',
      "if (!import.meta.env.PROD) enable();",
    ]) {
      const findings = run({
        "lib/demo-mode.ts": `export function demoMode() {\n  ${refusal}\n  return process.env.DEMO_MODE === "1";\n}\n`,
      });
      assert.deepEqual(findings, [], `refusal rejected: ${refusal}`);
    }
  });

  it("flags direct flag reads outside the authority, with position", () => {
    const findings = run({
      ...AUTHORITY_GUARDED,
      "app/api/orders/route.ts": 'const useMocks = process.env.DEMO_MODE === "1";\n',
    });
    assert.equal(findings.length, 1);
    assert.equal(findings[0].file, "app/api/orders/route.ts");
    assert.equal(findings[0].line, 1);
    assert.match(findings[0].message, /reads demo flag DEMO_MODE directly/);
  });

  it("catches dynamic member access and destructured env reads", () => {
    const findings = run({
      ...AUTHORITY_GUARDED,
      "a.ts": 'const v = process.env["DEMO_MODE"];\n',
      "b.ts": "const { isDemoEnabled } = process.env;\n",
    });
    assert.equal(findings.length, 2);
  });

  it("ignores flag mentions inside comments", () => {
    const findings = run({
      ...AUTHORITY_GUARDED,
      "a.ts": "// DEMO_MODE is handled elsewhere\n/* TODO: remove isDemoEnabled */\nexport {};\n",
    });
    assert.deepEqual(findings, []);
  });

  it("lets an inline gate-exempt directive carry a written reason", () => {
    const findings = run({
      ...AUTHORITY_GUARDED,
      "a.ts":
        'export const legacy = process.env.DEMO_MODE === "1"; // gate-exempt(removed next sprint)\n',
    });
    assert.deepEqual(findings, []);
  });

  it("catches prefix trust in every common shape", () => {
    const shapes = [
      'token.startsWith("demo_")',
      "token.startsWith(`demo-`)",
      'token.includes("demo_")',
      "token.test(/^demo_/)",
      "token.match(/^demo-/)",
      'new RegExp("^sandbox_").test(token)',
    ];
    for (const shape of shapes) {
      const findings = run({ ...AUTHORITY_GUARDED, "a.ts": `if (${shape}) return null;\n` });
      assert.equal(findings.length, 1, `missed shape: ${shape}`);
      assert.match(findings[0].message, /trusts a demo credential by shape/);
    }
  });

  it("does not confuse ordinary verification with prefix trust", () => {
    const findings = run({
      ...AUTHORITY_GUARDED,
      "a.ts":
        'const user = await verify(token); if (!user || token.startsWith("expired_")) deny();\n',
    });
    assert.deepEqual(findings, []);
  });

  it("honours option overrides", () => {
    const findings = run(
      {
        "lib/mock-mode.ts":
          'export function m(){ if (process.env.NODE_ENV === "production") return false; return process.env.USE_MOCKS; }\n',
        "app/x.ts": "const q = process.env.USE_MOCKS;\n",
        "app/y.ts": 'if (t.startsWith("test_")) {}\n',
      },
      {
        flagAuthority: "lib/mock-mode.ts",
        flagNames: ["USE_MOCKS"],
        credentialPrefixes: ["test_"],
      },
    );
    assert.equal(findings.length, 2);
    assert.ok(findings.some((f) => /USE_MOCKS/.test(f.message)));
    assert.ok(findings.some((f) => /trusts a demo credential by shape/.test(f.message)));
  });
});
