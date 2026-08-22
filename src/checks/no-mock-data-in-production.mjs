/**
 * Agent failure mode: the demo escape hatch reaches production.
 *
 * You ask an agent to make a page work without a backend. It writes a mock,
 * gates it behind a flag, and the feature works. Months later the flag is
 * read in nine files, one of them ships, and a customer sees invented orders.
 *
 * The mistake is never the mock. It's that reading the flag spread out. So
 * the rule is not "don't use mocks" — it's that exactly one module is allowed
 * to decide whether mocks are on, and it must refuse in production. The same
 * instinct covers credentials: a demo token gets verified like any other, or
 * rejected. Nothing is trusted because of how it looks.
 */
import { lineHasInlineExemption, matchOutsideComments, positionAt } from "../lib/tokenize.mjs";

export const meta = {
  id: "no-mock-data-in-production",
  description:
    "Exactly one module resolves the demo/mock flag and refuses in production; demo credentials are verified, never recognised by prefix.",
  defaultOptions: {
    /** Posix-relative path of the only module allowed to read the flag. */
    flagAuthority: "lib/demo-mode.ts",
    /** Flag identifiers that must appear nowhere outside the authority. */
    flagNames: ["DEMO_MODE", "isDemoEnabled"], // gate-exempt(the rule names its own subjects here by necessity)
    /** Credential prefixes that must never be trusted by shape. */
    credentialPrefixes: ["demo_", "demo-", "sandbox_"],
  },
};

/** Idioms by which an authority module can refuse to serve mocks in production. */
const PRODUCTION_REFUSALS = [
  /NODE_ENV\s*===+\s*["'`]production["'`]/,
  /NODE_ENV\s*!==+\s*["'`]development["'`]/,
  /VERCEL_ENV\s*===+\s*["'`]production["'`]/,
  /import\.meta\.env\.PROD\b/,
];

/**
 * Shapes by which code recognises a credential instead of verifying it.
 * Matched against raw text so string contents are visible; comment spans are
 * filtered out by matchOutsideComments.
 */
function prefixTrustPattern(prefixes) {
  const alternatives = prefixes.map(escapeRegExp).join("|");
  const source = [
    `\\.startsWith\\s*\\(\\s*["'\`](?:${alternatives})`,
    `\\.includes\\s*\\(\\s*["'\`](?:${alternatives})`,
    `\\.(?:test|match|exec)\\s*\\(\\s*\\/\\^?(?:${alternatives})`,
    `new\\s+RegExp\\s*\\(\\s*["'\`]?\\^?["'\`]?(?:${alternatives})`,
  ].join("|");
  return new RegExp(source, "g");
}

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function check(files, userOptions) {
  const options = { ...meta.defaultOptions, ...userOptions };
  const findings = [];
  const authorityPath = options.flagAuthority;
  const authority = files.find((file) => file.path === authorityPath);

  if (!authority) {
    findings.push({
      file: authorityPath,
      line: 1,
      column: 1,
      message: `${authorityPath} is missing: no module owns the demo flag`,
    });
  } else if (!PRODUCTION_REFUSALS.some((pattern) => pattern.test(authority.text))) {
    const position = positionAt(authority.text, authority.text.search(/\S/));
    findings.push({
      file: authority.path,
      line: position.line,
      column: position.column,
      message: `${authorityPath} does not refuse in production (expected a NODE_ENV, VERCEL_ENV, or import.meta.env.PROD guard)`,
    });
  }

  for (const file of files) {
    const isAuthority = file.path === authorityPath;

    for (const name of options.flagNames) {
      const pattern = new RegExp(`\\b${escapeRegExp(name)}\\b`, "g");
      for (const hit of matchOutsideComments(file.text, pattern)) {
        // The authority may read its own flag; nobody else may.
        if (isAuthority) break;
        if (lineHasInlineExemption(file.text, hit.index)) continue;
        const position = positionAt(file.text, hit.index);
        findings.push({
          file: file.path,
          line: position.line,
          column: position.column,
          message: `reads demo flag ${name} directly; resolve it through ${authorityPath}`,
        });
      }
    }

    for (const hit of matchOutsideComments(
      file.text,
      prefixTrustPattern(options.credentialPrefixes),
    )) {
      if (lineHasInlineExemption(file.text, hit.index)) continue;
      const position = positionAt(file.text, hit.index);
      findings.push({
        file: file.path,
        line: position.line,
        column: position.column,
        message: "trusts a demo credential by shape instead of verifying it",
      });
    }
  }

  return findings;
}
