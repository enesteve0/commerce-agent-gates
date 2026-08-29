# Masking Scanner Internals (`tokenize.mjs`)

The masking scanner in `src/lib/tokenize.mjs` is the core parsing engine of `commerce-agent-gates`. It replaces naive regular expression stripping with a single-pass lexical scanner that preserves character offsets and newlines.

---

## 1. Why Naive Regex Stripping Failed (The v1 Problem)

In v1, comments and strings were removed with a sequence of regular expressions:

```js
// v1 approach (broken):
text
  .replace(/\/\*[\s\S]*?\*\//g, "") // Broke string literals containing "/*"
  .replace(/\/\/.*/g, ""); // Broke URLs with "//" and destroyed character offsets
```

Failure classes of this approach:

1. **Comment/String Interference**: Stripping block comments before strings mangles string literals containing `/*` (e.g. `const s = "/* not a comment */";`).
2. **URL False Positives**: Stripping line comments on `//` breaks `https://` inside strings or template literals.
3. **Regex vs Division Ambiguity**: A `/` character cannot be disambiguated as a division operator or regex literal without previous token context.
4. **Position Destruction**: Replacing text with shorter strings destroyed character offsets, making it impossible to report accurate `line:column` coordinates.

---

## 2. The Single-Pass Scanner State Machine

`src/lib/tokenize.mjs` walks the character array once with an explicit stack:

- **Context Stack**:
  - `{ kind: "code", depth: number }`: Standard code scanning. `depth` tracks brace depth inside template literal interpolations (`${ ... }`).
  - `{ kind: "template" }`: Inside backtick template literals.
- **Masking (`blankRange`)**:
  - Non-code characters (comments, strings, template text outside `${}`, regex literals) are overwritten with space characters (`' '`), while newline characters (`'\n'`) are left untouched.
- **Span Classification (`spans`)**:
  - Emits `{ kind: "comment" | "string" | "regex", start, end }`.

---

## 3. Disambiguating Regular Expressions vs Division

A forward slash `/` initiates a regex literal if the preceding significant token allows an expression:

- Beginning of file or expression start `([{;,=:!&|?+-*%~^<>`.
- Keywords: `return`, `typeof`, `instanceof`, `in`, `of`, `new`, `delete`, `void`, `throw`, `case`, `do`, `else`, `yield`, `await`.

If the preceding character is an identifier char, closing bracket `)]}`, or quote `'"` , the slash is treated as a division operator and left unmasked in code view.

---

## 4. Position Mapping with `positionAt()`

Because `masked.length === text.length` and all newlines are preserved:

- Any match offset `match.index` found in `masked` directly corresponds to the exact same offset in the original raw `text`.
- `positionAt(text, offset)` counts newlines up to `offset` to return exact 1-based `{ line, column }`.
