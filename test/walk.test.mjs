import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import { compileExclude, discover } from "../src/lib/walk.mjs";

const directories = [];

function makeTree() {
  const root = mkdtempSync(join(tmpdir(), "gates-walk-"));
  directories.push(root);
  return root;
}

afterEach(() => {
  while (directories.length > 0) {
    rmSync(directories.pop(), { recursive: true, force: true });
  }
});

describe("discover", () => {
  it("finds supported source files and nothing else", () => {
    const root = makeTree();
    writeFileSync(join(root, "route.ts"), "export {};\n");
    writeFileSync(join(root, "component.tsx"), "export {};\n");
    writeFileSync(join(root, "lib.mjs"), "export {};\n");
    writeFileSync(join(root, "styles.css"), "body{}");
    writeFileSync(join(root, "README.md"), "# hi");
    const { files } = discover(root);
    assert.deepEqual(files.map((f) => f.path).sort(), ["component.tsx", "lib.mjs", "route.ts"]);
  });

  it("skips ignored directories entirely", () => {
    const root = makeTree();
    mkdirSync(join(root, "node_modules", "pkg"), { recursive: true });
    mkdirSync(join(root, ".next"), { recursive: true });
    mkdirSync(join(root, "app", "api"), { recursive: true });
    writeFileSync(join(root, "node_modules", "pkg", "index.js"), "module.exports=1;");
    writeFileSync(join(root, ".next", "trace.js"), "");
    writeFileSync(join(root, "app", "api", "route.ts"), "export {};\n");
    const { files } = discover(root);
    assert.deepEqual(
      files.map((f) => f.path),
      ["app/api/route.ts"],
    );
  });

  it("returns deterministic sorted order across runs", () => {
    const root = makeTree();
    for (const name of ["c.ts", "a.ts", "b.ts"]) writeFileSync(join(root, name), "");
    const first = discover(root).files.map((f) => f.path);
    const second = discover(root).files.map((f) => f.path);
    assert.deepEqual(first, ["a.ts", "b.ts", "c.ts"]);
    assert.deepEqual(first, second);
  });

  it("uses posix separators in relative paths", () => {
    const root = makeTree();
    mkdirSync(join(root, "app", "api", "orders"), { recursive: true });
    writeFileSync(join(root, "app", "api", "orders", "route.ts"), "");
    const { files } = discover(root);
    assert.equal(files[0].path, "app/api/orders/route.ts");
    assert.ok(!files[0].path.includes("\\"));
  });

  it("honours glob-lite excludes", () => {
    const root = makeTree();
    mkdirSync(join(root, "generated"), { recursive: true });
    mkdirSync(join(root, "packages", "vendor", "deep"), { recursive: true });
    writeFileSync(join(root, "schema.gen.ts"), "");
    writeFileSync(join(root, "keep.ts"), "");
    writeFileSync(join(root, "generated", "client.ts"), "");
    writeFileSync(join(root, "packages", "vendor", "deep", "lib.js"), "");
    const { files } = discover(root, { exclude: ["*.gen.ts", "generated", "**/vendor/**"] });
    assert.deepEqual(
      files.map((f) => f.path),
      ["keep.ts"],
    );
  });

  it("survives directory symlink cycles via canonical tracking", () => {
    const root = makeTree();
    mkdirSync(join(root, "inside"), { recursive: true });
    writeFileSync(join(root, "inside", "leaf.ts"), "");
    symlinkSync(root, join(root, "inside", "loop"));
    const { files } = discover(root);
    assert.deepEqual(
      files.map((f) => f.path),
      ["inside/leaf.ts"],
    );
  });

  it("follows symlinks to individual files instead of skipping them", () => {
    const root = makeTree();
    mkdirSync(join(root, "shared"), { recursive: true });
    writeFileSync(join(root, "shared", "route.ts"), "export {};\n");
    mkdirSync(join(root, "app", "api", "orders"), { recursive: true });
    symlinkSync(join(root, "shared", "route.ts"), join(root, "app", "api", "orders", "route.ts"));
    const { files } = discover(root);
    assert.deepEqual(files.map((f) => f.path).sort(), [
      "app/api/orders/route.ts",
      "shared/route.ts",
    ]);
  });

  it("reports broken symlinks as notices without failing", () => {
    const root = makeTree();
    symlinkSync(join(root, "does-not-exist"), join(root, "dangling"));
    writeFileSync(join(root, "ok.ts"), "");
    const { files, notices } = discover(root);
    assert.deepEqual(
      files.map((f) => f.path),
      ["ok.ts"],
    );
    assert.equal(notices.length, 1);
    assert.match(notices[0], /broken symlink/);
  });

  it("skips oversized files with an explicit notice", () => {
    const root = makeTree();
    writeFileSync(join(root, "big.ts"), "//" + "x".repeat(100) + "\n");
    writeFileSync(join(root, "small.ts"), "");
    const { files, notices } = discover(root, { maxFileBytes: 50 });
    assert.deepEqual(
      files.map((f) => f.path),
      ["small.ts"],
    );
    assert.match(notices.join("\n"), /big\.ts: skipped/);
  });

  it("strips a leading BOM from file contents", () => {
    const root = makeTree();
    writeFileSync(join(root, "bom.ts"), "\uFEFFexport {};");
    const { files } = discover(root);
    assert.equal(files[0].text, "export {};");
  });

  it("reports an empty tree as empty rather than throwing", () => {
    const root = makeTree();
    assert.deepEqual(discover(root).files, []);
  });
});

describe("compileExclude", () => {
  const cases = [
    ["generated", "generated/client.ts", true],
    ["generated", "src/generated/x.ts", false],
    ["**/generated/**", "src/generated/x.ts", true],
    ["**/vendor/**", "packages/vendor/deep/lib.js", true],
    ["*.gen.ts", "schema.gen.ts", true],
    ["*.gen.ts", "a/schema.gen.ts", false],
    ["src/*.test.ts", "src/a.test.ts", true],
    ["src/*.test.ts", "src/deep/a.test.ts", false],
    ["?.ts", "x.ts", true],
    ["?.ts", "xy.ts", false],
  ];
  for (const [pattern, candidate, expected] of cases) {
    it(`${pattern} ${expected ? "matches" : "rejects"} ${candidate}`, () => {
      assert.equal(compileExclude(pattern).test(candidate), expected);
    });
  }
});
