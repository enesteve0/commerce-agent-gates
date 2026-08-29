# Testing Strategy & Methodology

`commerce-agent-gates` utilizes a zero-dependency, multi-tiered testing architecture powered entirely by Node.js built-in `node:test` and `node:assert/strict`.

---

## 1. Multi-Tiered Testing Pyramid

```
                ┌─────────────────────────────────┐
                │   CI Packed-Tarball Smoke Test   │  (npx install & run in clean tmpdir)
                ├─────────────────────────────────┤
                │      Self-Dogfooding Gate       │  (commerce-agent-gates scans itself)
                ├─────────────────────────────────┤
                │     Tree Fixtures Contract      │  (fixtures/pass vs fixtures/fail)
                ├─────────────────────────────────┤
                │     CLI & Programmatic API      │  (cli.test.mjs, index.test.mjs)
                ├─────────────────────────────────┤
                │  Check Case Tables (Must-Catch) │  (test/checks/*.test.mjs)
                ├─────────────────────────────────┤
                │   Lexer Adversarial Tables      │  (test/tokenize.test.mjs)
                └─────────────────────────────────┘
```

---

## 2. Test Suites Overview

1. **Lexer Tables (`test/tokenize.test.mjs`)**: Adversarial test inputs ensuring comment masking, escape handling, nested template literals, and regex-vs-division heuristics preserve exact character lengths and line offsets.
2. **Per-Check Case Tables (`test/checks/*.test.mjs`)**: Isolated string snippet assertions verifying must-catch and must-pass conditions, line number precision, and false-positive resilience.
3. **Configuration Suite (`test/config.test.mjs`)**: Validates discovery, merging, and strict error rejection on typos and missing exemption reasons.
4. **Walker Suite (`test/walk.test.mjs`)**: Validates sorted traversal, symlink cycles, size caps, BOM stripping, and glob-lite excludes.
5. **Fixture Contract (`test/fixtures.test.mjs`)**: End-to-end tree integration proving that `fixtures/pass` triggers 0 findings and `fixtures/fail` catches all planted violations with verified evidence regexes.
6. **CLI Integration (`test/cli.test.mjs`)**: Tests all CLI flags, output formats (JSON, SARIF, GitHub annotations, pretty), exit codes (0, 1, 2), and TTY/NO_COLOR handling using mock IO.
