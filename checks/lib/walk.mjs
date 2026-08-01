import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const IGNORED_DIRECTORIES = new Set(["node_modules", ".next", ".git", "dist", "build", "coverage"]);

export function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      return IGNORED_DIRECTORIES.has(entry.name) ? [] : walk(absolute);
    }
    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [absolute] : [];
  });
}

export function sources(root) {
  return walk(root).map((absolute) => ({
    path: relative(root, absolute),
    text: readFileSync(absolute, "utf8"),
  }));
}

/**
 * Strip comments and string literals before pattern matching.
 *
 * Without this every check is defeated by a comment that happens to contain
 * the pattern, and produces false failures on documentation. Agents write a
 * lot of comments.
 */
export function stripCommentsAndStrings(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/`(?:\\.|[^`\\])*`/g, "``")
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""');
}

export function report(name, failures) {
  if (failures.length === 0) {
    console.log(`PASS  ${name}`);
    return 0;
  }
  console.error(`FAIL  ${name}`);
  for (const failure of failures) console.error(`      ${failure}`);
  return 1;
}

/** Run the check only when this file is the entry point, so tests can import it. */
export function runAsScript(moduleUrl, name, check) {
  if (moduleUrl !== pathToFileURL(process.argv[1]).href) return;
  const target = process.argv[2];
  if (!target) {
    console.error(`usage: node checks/${name}.mjs <directory>`);
    process.exit(2);
  }
  process.exit(report(name, check(sources(target))));
}
