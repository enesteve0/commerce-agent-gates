/**
 * Deterministic source discovery.
 *
 * The walker is the foundation every check stands on, so it is deliberately
 * strict about the things that quietly corrupt gate results:
 *
 * - Traversal is sorted, so output order never depends on filesystem
 *   internals.
 * - Paths are normalised to posix separators immediately. On Windows,
 *   path.relative() produces backslashes, which would make every route-file
 *   regex silently fail and pass the entire tree.
 * - Symbolic links are resolved once and tracked by canonical path, so a
 *   cycle cannot recurse forever and linked trees are scanned once.
 * - Oversized files are skipped with an explicit notice rather than being
 *   read into memory unbounded.
 * - Excludes use a small documented glob dialect instead of emulating
 *   .gitignore, because half-correct gitignore emulation is worse than an
 *   explicit contract.
 */

import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts"]);

export const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  ".cache",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
]);

export const DEFAULT_MAX_FILE_BYTES = 1024 * 1024;

/**
 * Discover readable source files under `root`.
 *
 * @param {string} root absolute or cwd-relative directory
 * @param {{ exclude?: string[], ignoredDirectories?: Set<string>, maxFileBytes?: number }} [options]
 * @returns {{ files: { path: string, text: string }[], notices: string[] }}
 */
export function discover(root, options = {}) {
  const {
    exclude = [],
    ignoredDirectories = IGNORED_DIRECTORIES,
    maxFileBytes = DEFAULT_MAX_FILE_BYTES,
  } = options;

  const base = resolve(root);
  const excludeMatchers = exclude.map(compileExclude);
  const visitedDirectories = new Set([safeRealpath(base)]);
  const files = [];
  const notices = [];

  visit(base);

  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return { files, notices };

  function visit(directory) {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      notices.push(`${relativePath(directory)}: unreadable (${error.code ?? error.message})`);
      return;
    }

    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    for (const entry of entries) {
      const absolute = join(directory, entry.name);

      // Dirents describe the link itself, not its target; resolve symlinks so
      // linked files are read and linked directories recurse exactly once.
      let isDirectory = entry.isDirectory();
      let isFile = entry.isFile();
      if (entry.isSymbolicLink()) {
        let stats;
        try {
          stats = statSync(absolute);
        } catch {
          notices.push(`${relativePath(absolute)}: broken symlink skipped`);
          continue;
        }
        isDirectory = stats.isDirectory();
        isFile = stats.isFile();
        if (!isDirectory && !isFile) continue;
      }

      if (isDirectory) {
        if (ignoredDirectories.has(entry.name)) continue;
        const canonical = safeRealpath(absolute);
        if (visitedDirectories.has(canonical)) continue;
        visitedDirectories.add(canonical);
        visit(absolute);
        continue;
      }

      if (!isFile) continue;
      if (!SOURCE_EXTENSIONS.has(extname(entry.name))) continue;

      const rel = relativePath(absolute);
      if (excludeMatchers.some((matcher) => matcher.test(rel))) continue;

      let text;
      try {
        if (statSync(absolute).size > maxFileBytes) {
          notices.push(`${rel}: skipped, larger than ${maxFileBytes} bytes`);
          continue;
        }
        text = readFileSync(absolute, "utf8").replace(/^\uFEFF/, "");
      } catch (error) {
        notices.push(`${rel}: unreadable (${error.code ?? error.message})`);
        continue;
      }
      files.push({ path: rel, text });
    }
  }

  function relativePath(absolute) {
    return relative(base, absolute).split(sep).join("/");
  }
}

function safeRealpath(path) {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

/**
 * Glob-lite dialect for exclude patterns, matched against posix-relative
 * paths: a single star matches within one segment; a double star matches
 * across segments; a double star followed by a slash matches zero or more
 * leading directories; a question mark matches one character. A bare name
 * excludes that file or directory subtree ("generated" behaves like
 * "generated" plus everything beneath it).
 */
export function compileExclude(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  // One pass: later alternatives must never see the text earlier ones emit.
  const body = escaped.replace(/\*\*\/|\*\*|\*|\?/g, (token) => {
    if (token === "**/") return "(?:.*/)?";
    if (token === "**") return ".*";
    if (token === "*") return "[^/]*";
    return "[^/]";
  });
  return new RegExp(`^${body}(?:/.*)?$`);
}
