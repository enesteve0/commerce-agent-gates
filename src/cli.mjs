/**
 * The command line. Thin by design: parse arguments, run gates through the
 * programmatic API, print with the requested formatter, translate the result
 * into an exit code CI can gate on.
 *
 * Exit codes:
 *   0  clean — no findings
 *   1  findings reported
 *   2  usage or configuration error (including scanning a directory that
 *      contains no source files; see --allow-empty)
 */

import { createRequire } from "node:module";

import { checkIds, checks as registry } from "./checks/index.mjs";
import { ConfigError } from "./lib/errors.mjs";
import { formatGithub, formatJson, formatPretty, formatSarif } from "./lib/report.mjs";
import { runGates } from "./index.mjs";

const FORMATS = ["pretty", "json", "sarif", "github"];

const USAGE = `commerce-agent-gates — three build checks encoding mistakes coding agents make

Usage:
  commerce-agent-gates [options] [paths...]

Paths default to the current directory. A commerce-agent-gates.config.json in
each scanned root is picked up automatically.

Options:
  --config <file>     read configuration from this file instead of discovery
  --format <format>   pretty | json | sarif | github        (default: pretty)
  --only <checkId>    run just these checks                 (repeatable)
  --skip <checkId>    run everything except these checks    (repeatable)
  --list              list available checks and exit
  --allow-empty      exit 0 when no source files are found instead of erroring
  --no-color          disable coloured output even on a TTY
  -v, --version       print the version and exit
  -h, --help          show this help and exit

Check ids:
${checkIds.map((id) => `  ${id}`).join("\n")}

Exit codes: 0 clean, 1 findings, 2 usage/configuration error.`;

export function main(argv, io = process) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    io.stderr.write(`error: ${error.message}\n\n${USAGE}\n`);
    return 2;
  }

  if (parsed.help) {
    io.stdout.write(`${USAGE}\n`);
    return 0;
  }
  if (parsed.version) {
    io.stdout.write(`${packageVersion()}\n`);
    return 0;
  }
  if (parsed.list) {
    const widths = checkIds.map((id) => id.length);
    const pad = Math.max(...widths);
    for (const id of checkIds) {
      const meta = runMeta(id);
      io.stdout.write(meta ? `${id.padEnd(pad)}  ${meta.description}\n` : `${id}\n`);
    }
    return 0;
  }

  try {
    const result = runGates({
      root: parsed.paths.length > 0 ? parsed.paths : ["."],
      configPath: parsed.config,
      only: parsed.only,
      skip: parsed.skip,
    });

    if (result.filesScanned === 0) {
      // Nothing was scanned, so no formatter will ever run and these notices
      // would vanish. A skipped-oversized-file or unreadable-directory notice
      // is exactly the explanation the user needs alongside the outcome.
      const sink = parsed.allowEmpty ? io.stdout : io.stderr;
      for (const notice of result.notices) sink.write(`note: ${notice}\n`);
      if (!parsed.allowEmpty) {
        io.stderr.write(
          `error: no source files found under ${result.root}. Point at a directory containing source, or pass --allow-empty if that is expected.\n`,
        );
        return 2;
      }
      sink.write(`no source files under ${result.root}; nothing to check\n`);
      return 0;
    }

    switch (parsed.format) {
      case "json":
        io.stdout.write(`${formatJson(result, { version: packageVersion() })}\n`);
        break;
      case "sarif":
        io.stdout.write(
          `${formatSarif(result, {
            version: packageVersion(),
            informationUri: repositoryUrl(),
          })}\n`,
        );
        break;
      case "github":
        io.stdout.write(`${formatGithub(result)}\n`);
        break;
      default:
        io.stdout.write(`${formatPretty(result, { color: useColor(io, parsed) })}\n`);
    }

    return result.findings.length > 0 ? 1 : 0;
  } catch (error) {
    if (error instanceof ConfigError) {
      io.stderr.write(`error: ${error.message}\n`);
      return 2;
    }
    io.stderr.write(error?.stack ?? String(error));
    io.stderr.write("\n");
    return 2;
  }
}

function parseArgs(argv) {
  const parsed = {
    paths: [],
    config: undefined,
    format: "pretty",
    only: [],
    skip: [],
    list: false,
    allowEmpty: false,
    help: false,
    version: false,
    noColor: false,
  };

  const missingValue = (flag) => {
    throw new Error(`${flag} requires a value`);
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const inlineValue = (name) => {
      const prefix = `--${name}=`;
      return arg.startsWith(prefix) ? arg.slice(prefix.length) : undefined;
    };

    switch (true) {
      case arg === "--help" || arg === "-h":
        parsed.help = true;
        break;
      case arg === "--version" || arg === "-v":
        parsed.version = true;
        break;
      case arg === "--list":
        parsed.list = true;
        break;
      case arg === "--allow-empty":
        parsed.allowEmpty = true;
        break;
      case arg === "--no-color":
        parsed.noColor = true;
        break;
      case arg === "--config":
      case arg.startsWith("--config="): {
        const value = arg === "--config" ? argv[i + 1] : inlineValue("config");
        if (!value) missingValue("--config");
        parsed.config = value;
        if (arg === "--config") i += 1;
        break;
      }
      case arg === "--format":
      case arg.startsWith("--format="): {
        const value = arg === "--format" ? argv[i + 1] : inlineValue("format");
        if (!value) missingValue("--format");
        if (!FORMATS.includes(value)) {
          throw new Error(`unknown format "${value}" (expected one of ${FORMATS.join(", ")})`);
        }
        parsed.format = value;
        if (arg === "--format") i += 1;
        break;
      }
      case arg === "--only":
      case arg.startsWith("--only="): {
        const value = arg === "--only" ? argv[i + 1] : inlineValue("only");
        if (!value) missingValue("--only");
        parsed.only.push(value);
        if (arg === "--only") i += 1;
        break;
      }
      case arg === "--skip":
      case arg.startsWith("--skip="): {
        const value = arg === "--skip" ? argv[i + 1] : inlineValue("skip");
        if (!value) missingValue("--skip");
        parsed.skip.push(value);
        if (arg === "--skip") i += 1;
        break;
      }
      case arg === "--":
        parsed.paths.push(...argv.slice(i + 1));
        return parsed;
      case arg.startsWith("-"):
        throw new Error(`unknown option "${arg}"`);
      default:
        parsed.paths.push(arg);
    }
  }

  return parsed;
}

function useColor(io, parsed) {
  if (parsed.noColor) return false;
  // NO_COLOR disables colour when present, regardless of value.
  if (io.env?.NO_COLOR !== undefined) return false;
  return Boolean(io.stdout?.isTTY);
}

let cachedPackage;
function readPackageJson() {
  if (cachedPackage === undefined) {
    try {
      cachedPackage = createRequire(import.meta.url)("../package.json");
    } catch {
      cachedPackage = null;
    }
  }
  return cachedPackage;
}

function packageVersion() {
  return readPackageJson()?.version ?? "unknown";
}

function repositoryUrl() {
  const url = readPackageJson()?.repository?.url ?? "";
  return url.replace(/^git\+/, "").replace(/\.git$/, "");
}

/** Look up a check's metadata by id for --list output. */
function runMeta(id) {
  return registry.find((check) => check.meta.id === id)?.meta;
}
