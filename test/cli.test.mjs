import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import { main } from "../src/cli.mjs";

const roots = [];

function project(files) {
  const root = mkdtempSync(join(tmpdir(), "gates-cli-"));
  roots.push(root);
  for (const [path, text] of Object.entries(files)) {
    const absolute = join(root, path);
    mkdirSync(join(absolute, ".."), { recursive: true });
    writeFileSync(absolute, text);
  }
  return root;
}

function capture(argv, io = fakeIo()) {
  const code = main(argv, io);
  return { code, out: io.stdout.written.join(""), err: io.stderr.written.join("") };
}

function fakeIo() {
  return {
    env: {},
    stdout: {
      isTTY: false,
      written: [],
      write(chunk) {
        this.written.push(chunk);
      },
    },
    stderr: {
      isTTY: false,
      written: [],
      write(chunk) {
        this.written.push(chunk);
      },
    },
  };
}

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop(), { recursive: true, force: true });
});

const CLEAN_AUTHORITY =
  'export function demoMode(){ if (process.env.NODE_ENV === "production") return false; return process.env.DEMO_MODE === "1"; }\n';

describe("cli", () => {
  it("exits 0 with pretty output on a clean tree", () => {
    const dir = project({
      "lib/demo-mode.ts": CLEAN_AUTHORITY,
      "app/page.tsx": "export default () => null;\n",
    });
    const { code, out } = capture([dir]);
    assert.equal(code, 0);
    assert.match(out, /PASS {2}no-mock-data-in-production/);
    assert.match(out, /✓ 3 checks passed/);
    assert.match(out, /2 files scanned/);
  });

  it("exits 1 and prints located findings on a dirty tree", () => {
    const dir = project({
      "lib/demo-mode.ts": CLEAN_AUTHORITY,
      "app/api/orders/route.ts": "export const POST = async () => new Response(null);\n",
    });
    const { code, out } = capture([dir]);
    assert.equal(code, 1);
    assert.match(out, /app\/api\/orders\/route\.ts:1:1/);
    assert.match(out, /POST is exported without one of/);
  });

  it("errors with exit 2 when a directory holds no source files", () => {
    const dir = project({ "README.md": "# empty of code\n" });
    const { code, err } = capture([dir]);
    assert.equal(code, 2);
    assert.match(err, /no source files found/);
  });

  it("allows an explicitly empty scan with --allow-empty", () => {
    const dir = project({ "README.md": "# nothing\n" });
    const { code, out } = capture([dir, "--allow-empty"]);
    assert.equal(code, 0);
    assert.match(out, /nothing to check/);
  });

  it("emits parseable JSON", () => {
    const dir = project({
      "lib/demo-mode.ts": CLEAN_AUTHORITY,
      "app/api/orders/route.ts": "export const POST = async () => new Response(null);\n",
    });
    const { code, out } = capture([dir, "--format=json"]);
    assert.equal(code, 1);
    const document = JSON.parse(out);
    assert.equal(document.tool, "commerce-agent-gates");
    assert.equal(document.findings.length, 1);
    assert.equal(document.findings[0].ruleId, "mutating-routes-must-be-guarded");
    assert.equal(document.filesScanned, 2);
  });

  it("emits SARIF 2.1.0 with rules and positioned results", () => {
    const dir = project({
      "lib/demo-mode.ts": CLEAN_AUTHORITY,
      "app/api/orders/route.ts": "export async function POST(){ await db.order.findMany({}); }\n",
    });
    const { out } = capture([dir, "--format=sarif"]);
    const sarif = JSON.parse(out);
    assert.equal(sarif.version, "2.1.0");
    const driver = sarif.runs[0].tool.driver;
    assert.equal(driver.name, "commerce-agent-gates");
    assert.equal(driver.rules.length, 3);
    const result = sarif.runs[0].results[0];
    assert.equal(result.level, "error");
    assert.equal(result.locations[0].physicalLocation.region.startLine, 1);
    assert.equal(
      result.locations[0].physicalLocation.artifactLocation.uri,
      "app/api/orders/route.ts",
    );
  });

  it("emits GitHub annotation commands", () => {
    const dir = project({
      "lib/demo-mode.ts": CLEAN_AUTHORITY,
      "app/api/orders/route.ts": "export const DELETE = async () => new Response(null);\n",
    });
    const { out } = capture([dir, "--format=github"]);
    assert.match(
      out,
      /^::error file=app\/api\/orders\/route\.ts,line=1,col=1,title=[^:]*::DELETE is exported/,
    );
  });

  it("--only and --skip select checks", () => {
    const dir = project({
      "lib/demo-mode.ts": 'export const demoMode = process.env.DEMO_MODE === "1";\n',
    });
    const onlyRun = capture([dir, "--only", "no-mock-data-in-production"]);
    assert.equal(onlyRun.code, 1);

    const skipRun = capture([dir, "--skip=no-mock-data-in-production"]);
    assert.equal(skipRun.code, 0);
  });

  it("--list prints check ids", () => {
    const { code, out } = capture(["--list"]);
    assert.equal(code, 0);
    assert.match(out, /no-mock-data-in-production/);
    assert.match(out, /mutating-routes-must-be-guarded/);
    assert.match(out, /queries-must-be-tenant-scoped/);
  });

  it("--help prints usage; unknown flags exit 2", () => {
    assert.match(capture(["--help"]).out, /Usage:/);
    const bad = capture(["--bogus"]);
    assert.equal(bad.code, 2);
    assert.match(bad.err, /unknown option "--bogus"/);
  });

  it("--version prints a semver", () => {
    assert.match(capture(["--version"]).out.trim(), /^\d+\.\d+\.\d+$/);
  });

  it("reports configuration errors as exit 2 without stack traces", () => {
    const dir = project({ "commerce-agent-gates.config.json": '{"checks":{"nonsense":{}}}' });
    const { code, err } = capture([dir]);
    assert.equal(code, 2);
    assert.match(err, /unknown key "nonsense"/);
    assert.ok(!/\n\s+at /.test(err), "stack frames leaked into stderr");
  });

  it("scans multiple roots and prefixes findings per root", () => {
    const first = project({ "a/route.ts": "export const POST = async () => null;\n" });
    const second = project({ "b/route.ts": "export const POST = async () => null;\n" });
    const { code, out } = capture([first, second, "--only=mutating-routes-must-be-guarded"]);
    assert.equal(code, 1);
    assert.ok(out.includes(first));
    assert.ok(out.includes(second));
  });
});
