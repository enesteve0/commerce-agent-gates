/**
 * Agent failure mode: the unauthenticated write.
 *
 * Agents are good at reproducing the shape of a route and bad at remembering
 * why the shape exists. Ask for "an endpoint to cancel an order" and you get a
 * working POST handler. It will look exactly like the twelve authenticated
 * handlers next to it, minus the wrapper, because the wrapper wasn't the part
 * you asked about.
 *
 * Reviewers miss this for the same reason: the diff looks like the file above it.
 * A machine that only asks "is the export wrapped" does not get bored.
 */
import { runAsScript, stripCommentsAndStrings } from "./lib/walk.mjs";

const MUTATING = ["POST", "PUT", "PATCH", "DELETE"];

/** Wrappers that establish a caller identity before the handler body runs. */
const GUARDS = ["withSession", "withApiKey", "withServiceToken"];

const ROUTE_FILE = /(^|\/)route\.tsx?$/;

export function check(files) {
  const failures = [];

  for (const file of files) {
    if (!ROUTE_FILE.test(file.path)) continue;
    const code = stripCommentsAndStrings(file.text);

    for (const method of MUTATING) {
      const exported = new RegExp(`export\\s+(?:async\\s+)?(?:function\\s+${method}\\b|const\\s+${method}\\s*=)`);
      if (!exported.test(code)) continue;

      const guarded = GUARDS.some((guard) =>
        new RegExp(`export\\s+const\\s+${method}\\s*=\\s*${guard}\\s*\\(`).test(code),
      );

      if (!guarded) {
        failures.push(`${file.path}: ${method} is exported without one of ${GUARDS.join(", ")}`);
      }
    }
  }

  return failures;
}

runAsScript(import.meta.url, "mutating-routes-must-be-guarded", check);
