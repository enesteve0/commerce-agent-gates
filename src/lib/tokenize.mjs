/**
 * Offset-preserving masking scanner for JavaScript and TypeScript source.
 *
 * Every check matches patterns against code, not raw text. The naive
 * approach (strip comments and strings with a chain of regexes) has known
 * failure classes: stripping block comments before strings corrupts string
 * literals that contain "/*", line-comment heuristics misfire on URLs and on
 * "//" inside template literals, and a regex literal is indistinguishable
 * from division without token context.
 *
 * This scanner walks the source once and produces two coordinated views:
 *
 * - `masked`: a string of identical length in which non-code regions are
 *   blanked to spaces while newlines are preserved. Structural matching runs
 *   here, and offsets map back to exact line/column positions through
 *   positionAt().
 * - `spans`: the non-code regions, classified as comment, string, or regex
 *   literal. Literal-aware rules (a demo credential recognised by its prefix,
 *   an environment variable read dynamically) match against raw text and use
 *   the spans to ignore anything living inside a comment while still seeing
 *   string contents, which is exactly where the interesting literals live.
 *
 * Handled constructs: line comments; multi-line block comments; quoted
 * strings with escapes; template literals with ${ … } interpolated code
 * nested to any depth; regex literals with […] classes, disambiguated from
 * division by the previous significant token.
 *
 * Known limitation, accepted deliberately: JSX text nodes are scanned as
 * code, so a literal "//" inside JSX prose blanks the rest of that line.
 * Masking errs toward silence, never toward inventing findings.
 */

/** Keywords after which a `/` begins a regex literal rather than division. */
const REGEX_PRECEDING_KEYWORDS = new Set([
  "return",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "throw",
  "case",
  "do",
  "else",
  "yield",
  "await",
]);

const IDENTIFIER_CHAR = /[A-Za-z0-9_$]/;

const isSpace = (ch) =>
  ch === " " || ch === "\t" || ch === "\r" || ch === "\n" || ch === "\f" || ch === "\v";

/**
 * Scan `text` into a masked code view plus classified non-code spans.
 *
 * @returns {{ masked: string, spans: { kind: "comment"|"string"|"regex", start: number, end: number }[] }}
 */
export function scan(text) {
  const out = text.split("");
  const len = text.length;
  /** Context stack: { kind: "code", depth } | { kind: "template" }.
   *  depth >= 0 marks an interpolation whose closing brace we owe. */
  const stack = [{ kind: "code", depth: -1 }];
  const spans = [];
  let open = null;

  let prevChar = "";
  let prevWord = "";

  const note = (ch) => {
    if (isSpace(ch)) return;
    if (IDENTIFIER_CHAR.test(ch)) {
      prevWord = IDENTIFIER_CHAR.test(prevChar) ? prevWord + ch : ch;
    } else {
      prevWord = "";
    }
    prevChar = ch;
  };

  const blank = (index) => {
    if (index < len && out[index] !== "\n") out[index] = " ";
  };
  const begin = (kind, at) => {
    open = { kind, start: at };
  };
  const finish = (at) => {
    if (open) {
      spans.push({ kind: open.kind, start: open.start, end: Math.min(at, len) });
      open = null;
    }
  };
  const blankRange = (from, to) => {
    finish(to);
    for (let k = Math.max(0, from); k < Math.min(len, to); k += 1) blank(k);
  };

  let i = 0;
  while (i < len) {
    const top = stack[stack.length - 1];
    const ch = text[i];

    if (top.kind === "template") {
      if (!open) begin("string", i);
      if (ch === "\\") {
        blank(i);
        blank(i + 1);
        i += 2;
        continue;
      }
      if (ch === "`") {
        blankRange(i, i + 1);
        prevChar = "`";
        prevWord = "";
        stack.pop();
        i += 1;
        continue;
      }
      if (ch === "$" && text[i + 1] === "{") {
        blankRange(i, i + 2);
        finish(i);
        stack.push({ kind: "code", depth: 0 });
        i += 2;
        continue;
      }
      blank(i);
      i += 1;
      continue;
    }

    if (ch === "/" && text[i + 1] === "/") {
      let end = i;
      while (end < len && text[end] !== "\n") end += 1;
      begin("comment", i);
      blankRange(i, end);
      i = end;
      continue;
    }

    if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      const stop = end === -1 ? len : end + 2;
      begin("comment", i);
      blankRange(i, stop);
      i = stop;
      continue;
    }

    if (ch === '"' || ch === "'") {
      begin("string", i);
      let j = i + 1;
      let closed = false;
      while (j < len) {
        if (text[j] === "\\") {
          j += 2;
          continue;
        }
        if (text[j] === ch) {
          closed = true;
          break;
        }
        if (text[j] === "\n") break;
        j += 1;
      }
      const stop = closed ? j + 1 : Math.min(j, len);
      blankRange(i, stop);
      prevChar = ch;
      prevWord = "";
      i = stop;
      continue;
    }

    if (ch === "`") {
      blankRange(i, i + 1);
      stack.push({ kind: "template" });
      i += 1;
      continue;
    }

    if (ch === "/" && startsRegex(prevChar, prevWord)) {
      begin("regex", i);
      let j = i + 1;
      let inClass = false;
      while (j < len) {
        const c = text[j];
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) {
          j += 1;
          while (j < len && /[a-z]/i.test(text[j])) j += 1;
          break;
        } else if (c === "\n") break;
        j += 1;
      }
      blankRange(i, Math.min(j, len));
      prevChar = "/";
      prevWord = "";
      i = Math.min(j, len);
      continue;
    }

    if (ch === "{") {
      if (top.depth >= 0) top.depth += 1;
      note(ch);
      i += 1;
      continue;
    }

    if (ch === "}") {
      if (top.depth === 0) {
        blankRange(i, i + 1);
        stack.pop();
        i += 1;
        continue;
      }
      if (top.depth > 0) top.depth -= 1;
      note(ch);
      i += 1;
      continue;
    }

    note(ch);
    i += 1;
  }

  finish(len);
  return { masked: out.join(""), spans };
}

function startsRegex(prevChar, prevWord) {
  if (prevChar === "") return true;
  if ("([{;,=:!&|?+-*%~^<>".includes(prevChar)) return true;
  if (")]}`\"'".includes(prevChar)) return false;
  return REGEX_PRECEDING_KEYWORDS.has(prevWord);
}

/** Convenience wrapper when only the masked view is needed. */
export function maskNonCode(text) {
  return scan(text).masked;
}

/**
 * Run a global regex over raw text, keeping only matches that are not part
 * of a comment. String contents count: a demo credential compared by prefix
 * lives inside a string, and that is precisely what the prefix-trust rules
 * look for. Matches starting inside a comment are documentation, not code.
 */
export function matchOutsideComments(text, regexp) {
  const { spans } = scan(text);
  const comments = spans.filter((span) => span.kind === "comment");
  const insideComment = (index) => comments.some((span) => index >= span.start && index < span.end);

  const source = regexp.flags.includes("g")
    ? regexp
    : new RegExp(regexp.source, `${regexp.flags}g`);
  source.lastIndex = 0;
  const results = [];
  let m;
  while ((m = source.exec(text)) !== null) {
    if (!insideComment(m.index)) results.push({ index: m.index, match: m });
    if (m[0] === "") source.lastIndex += 1;
  }
  return results;
}

/**
 * Map an offset in `text` to a 1-based { line, column } position.
 * Columns count characters from the line start, matching editor convention.
 */
export function positionAt(text, offset) {
  const clamped = Math.max(0, Math.min(offset, text.length));
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < clamped; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      lineStart = i + 1;
    }
  }
  return { line, column: clamped - lineStart + 1 };
}

/**
 * True when the line containing `offset` carries an inline exemption
 * directive: a `gate-exempt(` marker with a written reason next to it.
 */
export function lineHasInlineExemption(text, offset) {
  const lineStart = text.lastIndexOf("\n", offset - 1) + 1;
  let end = text.indexOf("\n", offset);
  if (end === -1) end = text.length;
  return /(^|[^\w-])gate-exempt\s*\(/.test(text.slice(lineStart, end));
}

/**
 * Read outward from an opening parenthesis to its balancing close in masked
 * text, so nested calls and objects do not truncate the argument. Strings
 * are blanked by then, making the counting safe. Returns null when unbalanced.
 */
export function balancedArgument(maskedText, openParenIndex) {
  let depth = 0;
  for (let i = openParenIndex; i < maskedText.length; i += 1) {
    const ch = maskedText[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) return maskedText.slice(openParenIndex + 1, i);
    }
  }
  return null;
}
