import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  balancedArgument,
  lineHasInlineExemption,
  maskNonCode,
  matchOutsideComments,
  positionAt,
  scan,
} from "../src/lib/tokenize.mjs";

describe("maskNonCode", () => {
  it("preserves length and newlines exactly", () => {
    const source = "const a = 1;\n// note\nconst b = 2;\n";
    const masked = maskNonCode(source);
    assert.equal(masked.length, source.length);
    for (let i = 0; i < source.length; i += 1) {
      if (source[i] === "\n") assert.equal(masked[i], "\n", `newline lost at ${i}`);
    }
  });

  it("masks line comments but keeps code on other lines", () => {
    const masked = maskNonCode("// db.order.findMany() decoy\nexport const x = 1;\n");
    assert.ok(!masked.includes("findMany"), "comment content leaked into code view");
    assert.ok(masked.includes("export const x"));
  });

  it("masks multi-line block comments and preserves interior newlines", () => {
    const source = "a;\n/* one\n two db.order.findMany()\n three */\nb;";
    const masked = maskNonCode(source);
    assert.ok(!masked.includes("findMany"));
    assert.equal([...masked].filter((c) => c === "\n").length, 4, "interior newlines must survive");
  });

  it("does not corrupt strings that contain block-comment markers", () => {
    // The v1 stripper ate from /* onward inside this string.
    const masked = maskNonCode('const s = "/* not a comment */";\nconst t = 1;');
    assert.ok(masked.includes("const s"), "statement before string vanished");
    assert.ok(masked.includes("const t"), "statement after string vanished");
    assert.ok(!masked.includes("not a comment"));
  });

  it("treats // inside a string as content, not a comment", () => {
    const masked = maskNonCode('fetch("https://example.com/a");\nnext();');
    assert.ok(masked.includes("next"), "line was swallowed by URL slashes");
  });

  it("handles escaped quotes in strings", () => {
    const masked = maskNonCode(`const s = 'it\\'s fine'; value();`);
    assert.ok(masked.includes("value"));
    assert.ok(!masked.includes("it's") || !masked.includes("s fine"));
  });

  it("masks template literal text including ${} interpolations' delimiters", () => {
    const masked = maskNonCode("const m = `hello ${name} world`;");
    assert.ok(masked.includes("const m"));
    assert.ok(masked.includes("name"), "interpolated code must stay visible");
    assert.ok(!masked.includes("hello"));
  });

  it("supports nested templates inside interpolations", () => {
    const source = "const q = `outer ${ `inner-${x}` } end`;";
    const masked = maskNonCode(source);
    assert.ok(masked.includes("x"), "deeply interpolated code visible");
    assert.ok(!masked.includes("inner-"), "nested template text masked");
    assert.ok(!masked.includes("outer"));
  });

  it("classifies regex literals after operators and keywords", () => {
    const cases = [
      ["const re = /ab+c/gi;", "ab+c"],
      ["return /x/.test(s);", "/x/"],
      ["foo.replace(/a[^b]/g, '');", "a[^b]"],
      ["case /y/: break;", "/y/"],
      ["typeof /z/ === 'object';", "/z/"],
    ];
    for (const [source, literal] of cases) {
      const { spans } = scan(source);
      const regexSpan = spans.find((s) => s.kind === "regex");
      assert.ok(regexSpan, `no regex span for: ${source}`);
      assert.ok(
        source.slice(regexSpan.start, regexSpan.end).includes(literal),
        `wrong span for: ${source}`,
      );
    }
  });

  it("keeps division unmasked so surrounding code stays visible", () => {
    const cases = [
      "const half = total / count;",
      "(a + b) / 2;",
      "a.b / a.c;",
      "first / second / third;",
    ];
    for (const source of cases) {
      const masked = maskNonCode(source);
      assert.ok(masked.includes("/") || masked.trim().length > 4, `over-masked: ${source}`);
      assert.equal(
        scan(source).spans.filter((s) => s.kind === "regex").length,
        0,
        `false regex: ${source}`,
      );
    }
  });

  it("handles character classes containing slashes in regex literals", () => {
    const { spans } = scan("const cls = /a[/]b/.source;");
    const span = spans.find((s) => s.kind === "regex");
    assert.ok(span, "regex with class slash not detected");
    assert.ok(scan("const cls = /a[/]b/.source;").masked.includes(".source"));
  });
});

describe("matchOutsideComments", () => {
  it("finds matches in code and skips matches inside comments", () => {
    const source = [
      "const flag = process.env.DEMO_MODE;",
      "// process.env.DEMO_MODE mentioned in prose",
      "/* process.env.DEMO_MODE */",
    ].join("\n");
    const hits = matchOutsideComments(source, /\bprocess\.env\.DEMO_MODE\b/g);
    assert.equal(hits.length, 1);
  });

  it("sees string contents, where interesting literals live", () => {
    const source = 'if (token.startsWith("demo_")) {}';
    const hits = matchOutsideComments(source, /\.startsWith\(\s*["'`]demo[_-]/g);
    assert.equal(hits.length, 1);
  });

  it("ignores commented-out violations", () => {
    const source = '// token.startsWith("demo_") would be wrong';
    const hits = matchOutsideComments(source, /\.startsWith\(\s*["'`]demo[_-]/g);
    assert.equal(hits.length, 0);
  });
});

describe("positionAt", () => {
  it("returns 1-based line and column", () => {
    const source = "alpha\nbeta\ngamma";
    assert.deepEqual(positionAt(source, 0), { line: 1, column: 1 });
    assert.deepEqual(positionAt(source, 6), { line: 2, column: 1 });
    assert.deepEqual(positionAt(source, 8), { line: 2, column: 3 });
    assert.deepEqual(positionAt(source, 11), { line: 3, column: 1 });
  });

  it("clamps out-of-range offsets", () => {
    assert.deepEqual(positionAt("abc", 99), { line: 1, column: 4 });
  });

  it("maps offsets found in masked text back to original positions", () => {
    const source = "const a = 1;\n// decoy\nconst b = db.order.findMany();";
    const masked = maskNonCode(source);
    const index = masked.indexOf("findMany");
    assert.ok(index > -1);
    const pos = positionAt(source, index);
    assert.equal(pos.line, 3);
    assert.equal(source.slice(index, index + 8), "findMany");
  });
});

describe("lineHasInlineExemption", () => {
  const text =
    "const a = 1;\nawait db.order.findMany({}); // gate-exempt(liveness only)\nconst b = 2;";
  it("recognises the directive on the flagged line", () => {
    assert.equal(lineHasInlineExemption(text, text.indexOf("findMany")), true);
  });
  it("rejects lines without the directive", () => {
    assert.equal(lineHasInlineExemption(text, text.indexOf("const b")), false);
  });
  it("requires the parenthesis form with a reason slot", () => {
    assert.equal(lineHasInlineExemption("x(); // gate-exempt no reason", 0), false);
    assert.equal(lineHasInlineExemption("x(); // gate-exempt(because)", 0), true);
  });
});

describe("balancedArgument", () => {
  it("reads through nested calls and objects", () => {
    const masked = maskNonCode('db.order.findMany({ where: { id: f(1, "x)") }, take: 2 });');
    const open = masked.indexOf("(");
    const argument = balancedArgument(masked, open);
    assert.ok(argument.startsWith("{"));
    assert.ok(argument.includes("take: 2"));
  });

  it("returns null when unbalanced", () => {
    assert.equal(balancedArgument("f(g(1, 2);", 0), null);
  });
});
