/**
 * Programmatic entry point: run the selected checks against one or more
 * directories and return a structured result. The CLI is a thin wrapper over
 * this function, so embedding consumers get byte-identical behaviour.
 */

import { checks } from "./checks/index.mjs";
import { loadConfig } from "./lib/config.mjs";
import { ConfigError } from "./lib/errors.mjs";
import { discover } from "./lib/walk.mjs";

export { checks, checkIds } from "./checks/index.mjs";
export { ConfigError } from "./lib/errors.mjs";

/**
 * @param {{ root?: string|string[], configPath?: string, only?: string[], skip?: string[] }} [options]
 */
export function runGates(options = {}) {
  const roots = Array.isArray(options.root) ? options.root : [options.root ?? "."];
  if (roots.length === 0) throw new ConfigError("no target directory given");

  const selected = checks
    .filter((check) => !(options.skip ?? []).includes(check.meta.id))
    .filter((check) => (options.only ?? []).length === 0 || options.only.includes(check.meta.id));

  if (selected.length === 0) {
    throw new ConfigError("no checks selected; check --only/--skip against `--list`");
  }

  const result = {
    root: roots.join(", "),
    configPath: null,
    filesScanned: 0,
    notices: [],
    findings: [],
    checksRun: [],
  };

  // Single-root scans report paths relative to that root, which is what CI
  // integrations want; multi-root scans keep findings attributable by prefix.
  const usePrefix = roots.length > 1;

  for (const root of roots) {
    const { options: config, path: configPath } = loadConfig(root, options.configPath);
    // A shared --config applies to every root; remember the first that exists.
    if (result.configPath === null) result.configPath = configPath;

    const { files, notices } = discover(root, { exclude: config.exclude });
    result.filesScanned += files.length;
    result.notices.push(...notices.map((notice) => `${root}: ${notice}`));
    const trimmedRoot = root.replace(/\/+$/, "");
    const prefix = usePrefix && trimmedRoot !== "." ? `${trimmedRoot}/` : "";

    for (const check of selected) {
      const perCheckOptions = config.checks[check.meta.id];
      const found = check
        .check(files, perCheckOptions)
        .map((finding) => ({ ruleId: check.meta.id, severity: "error", ...finding }))
        .map((finding) => ({ ...finding, file: `${prefix}${finding.file}` }));
      result.findings.push(...found);
      tally(result, check, found.length);
    }
  }

  result.findings.sort(byLocation);
  return result;
}

function tally(result, check, count) {
  const existing = result.checksRun.find((entry) => entry.id === check.meta.id);
  if (existing) existing.count += count;
  else result.checksRun.push({ id: check.meta.id, description: check.meta.description, count });
}

function byLocation(a, b) {
  for (const key of ["file", "line", "column"]) {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
  }
  return a.ruleId < b.ruleId ? -1 : a.ruleId > b.ruleId ? 1 : 0;
}
