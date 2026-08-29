# `no-mock-data-in-production` Check Specification

- **Check ID**: `no-mock-data-in-production`
- **Source File**: `src/checks/no-mock-data-in-production.mjs`
- **Test File**: `test/checks/no-mock-data-in-production.test.mjs`

---

## 1. Failure Mode

When coding agents are asked to build a UI before the backend or external API exists, they write mock data behind an environment variable flag (e.g. `process.env.DEMO_MODE`). Over time, direct reads of this flag spread into multiple routes, utility libraries, and UI components. Eventually, a code path ships to production where the flag is enabled or default-true, showing customers fake orders or test data.

Similarly, agents often recognize test credentials using string shape matching:

```ts
if (apiKey.startsWith("demo_") || /^demo_/.test(apiKey)) {
  // bypass verification
}
```

This allows unauthorized callers to bypass authentication by prefixing their strings.

---

## 2. The Enforcement Rule

1. **Single Authority Module**: Exactly one designated module (default: `lib/demo-mode.ts`) is permitted to read demo flags.
2. **Production Refusal Required**: The authority module must contain an explicit refusal guard preventing execution in production (`NODE_ENV === "production"`, `NODE_ENV !== "development"`, `VERCEL_ENV === "production"`, or `import.meta.env.PROD`).
3. **No Direct Flag Reads Outside Authority**: Direct member access (`process.env.DEMO_MODE`), dynamic index access (`process.env["DEMO_MODE"]`), or destructuring (`const { isDemoEnabled } = process.env`) is forbidden outside the authority module.
4. **No Prefix-Based Credential Trust**: Credential recognition via `startsWith`, `includes`, `/^prefix/` regexes, or `new RegExp` is banned.

---

## 3. Configuration Surface

```json
{
  "checks": {
    "no-mock-data-in-production": {
      "flagAuthority": "lib/demo-mode.ts",
      "flagNames": ["DEMO_MODE", "isDemoEnabled"],
      "credentialPrefixes": ["demo_", "demo-", "sandbox_"]
    }
  }
}
```
