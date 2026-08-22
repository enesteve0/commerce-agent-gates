/**
 * Agent failure mode: the unauthenticated write.
 *
 * Agents are good at reproducing the shape of a route and bad at remembering
 * why the shape exists. Ask for "an endpoint to cancel an order" and you get
 * a working POST handler that looks exactly like the twelve authenticated
 * handlers next to it, minus the wrapper, because the wrapper wasn't the part
 * you asked about.
 *
 * Human reviewers miss it for the same reason: the diff looks like the file
 * above it. A machine that only ever asks "is this export wrapped" does not
 * get bored on the fortieth route.
 *
 * The check verifies more than the wrapper's name. The wrapping identifier
 * must actually be imported, because a locally defined stub of the same name
 * would otherwise satisfy the gate while establishing nothing. Aliased
 * imports resolve correctly, and namespace usage (guards.withSession) is
 * recognised.
 */
import { maskNonCode, positionAt } from "../lib/tokenize.mjs";

export const meta = {
  id: "mutating-routes-must-be-guarded",
  description:
    "Every exported POST/PUT/PATCH/DELETE in an App Router route file must pass through an identity-establishing wrapper that is genuinely imported.",
  defaultOptions: {
    /** Wrappers that establish caller identity before the handler runs. */
    guards: ["withSession", "withApiKey", "withServiceToken"],
  },
};

const MUTATING = ["POST", "PUT", "PATCH", "DELETE"];
const ROUTE_FILE = /(^|\/)route\.[cm]?[jt]sx?$/;
const IDENTIFIER = "[A-Za-z_$][\\w$]*";

export function check(files, userOptions) {
  const options = { ...meta.defaultOptions, ...userOptions };
  const findings = [];

  for (const file of files) {
    if (!ROUTE_FILE.test(file.path)) continue;
    const masked = maskNonCode(file.text);
    const locals = importedGuardLocals(masked, options.guards);
    const namespaces = namespaceImports(masked);

    findings.push(...inspectExports(file, masked, options.guards, locals, namespaces));
  }

  return findings;
}

/**
 * Local identifiers through which one of the configured guards was imported,
 * including aliasing ("import { withSession as auth }" registers "auth").
 */
export function importedGuardLocals(masked, guards) {
  const locals = new Set();
  const guardSet = new Set(guards);

  const named = /\bimport\s*\{([^}]*)\}/g;
  let m;
  while ((m = named.exec(masked)) !== null) {
    for (const rawSpecifier of m[1].split(",")) {
      const parts = rawSpecifier.trim().split(/\s+as\s+/);
      if (parts.length === 0 || parts[0] === "") continue;
      const imported = parts[0];
      const local = parts.length === 2 ? parts[1] : imported;
      if (guardSet.has(imported)) locals.add(local);
    }
  }

  const defaults = new RegExp(`\\bimport\\s+(${IDENTIFIER})\\s+from\\b`, "g");
  while ((m = defaults.exec(masked)) !== null) {
    if (guardSet.has(m[1])) locals.add(m[1]);
  }

  return locals;
}

/** Names bound by namespace imports ("import * as guards from …"). */
export function namespaceImports(masked) {
  const namespaces = new Set();
  const pattern = new RegExp(`\\bimport\\s*\\*\\s*as\\s+(${IDENTIFIER})`, "g");
  let m;
  while ((m = pattern.exec(masked)) !== null) namespaces.add(m[1]);
  return namespaces;
}

function inspectExports(file, masked, guards, locals, namespaces) {
  const findings = [];
  const guardList = guards.join(", ");

  const constForm = new RegExp(
    `export\\s+const\\s+(${MUTATING.join("|")})\\s*=\\s*(async\\s+)?`,
    "g",
  );
  let m;
  while ((m = constForm.exec(masked)) !== null) {
    const rest = masked.slice(m.index + m[0].length);
    const position = positionAt(file.text, m.index);

    // Namespace usage: guards.withSession(…)
    const namespaced = new RegExp(`^(${IDENTIFIER})\\.(${IDENTIFIER})`).exec(rest);
    if (
      namespaced &&
      namespaces.has(namespaced[1]) &&
      guards.includes(namespaced[2]) &&
      isCallBeginning(rest, namespaced[0])
    ) {
      continue;
    }

    const direct = new RegExp(`^(${IDENTIFIER})`).exec(rest);
    if (!direct) {
      // Arrow function or arbitrary expression: identity cannot be established.
      findings.push({
        file: file.path,
        line: position.line,
        column: position.column,
        message: `${m[1]} is exported without one of ${guardList}; wrap the handler so identity is established before the body runs`,
      });
      continue;
    }

    if (locals.has(direct[1])) continue;
    if (guards.includes(direct[1])) {
      findings.push({
        file: file.path,
        line: position.line,
        column: position.column,
        message: `${m[1]} is wrapped in ${direct[1]} but never imports it; a local definition satisfies nothing`,
      });
      continue;
    }
    findings.push({
      file: file.path,
      line: position.line,
      column: position.column,
      message: `${m[1]} is exported without one of ${guardList}; wrap the handler so identity is established before the body runs`,
    });
  }

  const functionForm = new RegExp(
    `export\\s+(?:async\\s+)?function\\s+(${MUTATING.join("|")})\\b`,
    "g",
  );
  while ((m = functionForm.exec(masked)) !== null) {
    const position = positionAt(file.text, m.index);
    findings.push({
      file: file.path,
      line: position.line,
      column: position.column,
      message: `${m[1]} is declared as a bare function; use the wrapper form instead (export const ${m[1]} = ${guards[0]}(…))`,
    });
  }

  // Re-exports (`export { handler as POST }`) hide the wrapping decision in
  // another module, which is exactly how an unguarded write slips past
  // review. The canonical shape is checkable; this one is not, so it fails.
  const reexportForm = new RegExp(`export\\s*\\{[^}]*\\bas\\s+(${MUTATING.join("|")})\\b`, "g");
  while ((m = reexportForm.exec(masked)) !== null) {
    const position = positionAt(file.text, m.index);
    findings.push({
      file: file.path,
      line: position.line,
      column: position.column,
      message: `${m[1]} arrives through a re-export, so this gate cannot see whether it is wrapped; export it here instead (export const ${m[1]} = ${guards[0]}(…))`,
    });
  }

  return findings;
}

/** True when the identifier occurrence at the start of `rest` opens a call. */
function isCallBeginning(rest, identifier) {
  return new RegExp(`^${identifier.replace(/\./g, "\\.")}\\s*\\(`).test(rest);
}
