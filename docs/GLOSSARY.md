# Domain Glossary & Concepts

This glossary defines technical terminology used throughout the `commerce-agent-gates` codebase and documentation.

---

## Terminology

### Authority Module

The single source-of-truth file designated by configuration (default: `lib/demo-mode.ts`) permitted to read demo/mock environment flags. All other modules must import and invoke the authority rather than accessing environment variables directly.

### Balanced Argument Parser

A utility in `src/lib/tokenize.mjs` (`balancedArgument`) that reads outward from an opening parenthesis `(` to its matching closing parenthesis `)` across masked text, safely handling nested object literals and function calls.

### BOLA (Broken Object Level Authorization)

OWASP API Security Top 10 category API1. A vulnerability where an API endpoint accepts an object or tenant identifier from user input (e.g. `request.json()`) without validating that the authenticated session owns that object.

### Confused Deputy

An agent or system failure mode where an endpoint performs an authorized action on behalf of an authenticated caller, but uses an unverified client parameter (e.g. `tenantId` from body) instead of the session's verified tenant context.

### Inline Gate Exemption

A code comment directive matching the pattern `// gate-exempt(<written-reason>)` located on the same line as a flagged violation. It suppresses the finding while demanding a mandatory reason string.

### Masked Code (`masked`)

A string produced by `src/lib/tokenize.mjs` that is character-for-character identical in length to the original source file, but where comments, string contents, and regex literals are replaced with whitespace while all newlines (`\n`) are preserved.

### Non-Code Spans (`spans`)

An array of classified non-code ranges `{ kind: "comment" | "string" | "regex", start, end }` generated during lexical scanning to differentiate string literals from comments.

### Prefix Trust

The unsafe practice of granting access or bypass based on string shapes (e.g. `token.startsWith("demo_")` or `/^demo_/.test(token)`) rather than cryptographic signature verification.

### Refusal Idiom

A code pattern inside an authority module that explicitly prevents mock data execution in production environments (e.g. `process.env.NODE_ENV === "production"`, `process.env.VERCEL_ENV === "production"`, or `import.meta.env.PROD`).
