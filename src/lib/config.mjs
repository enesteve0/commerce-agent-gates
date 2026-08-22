/**
 * Configuration: discovery, validation, merging.
 *
 * The tool works with no configuration file at all — the defaults encode the
 * constants that used to live at the top of each check. A
 * commerce-agent-gates.config.json at the target root (or an explicit
 * --config path) overrides individual values without forking anything.
 *
 * Validation is strict on purpose: a typo'd option name would otherwise be
 * silently ignored, and a silently ignored gate setting is exactly the class
 * of quiet failure this tool exists to prevent. Arrays replace defaults
 * wholesale rather than concatenating, because predictable beats clever.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { checks } from "../checks/index.mjs";
import { ConfigError } from "./errors.mjs";

export const CONFIG_FILE_NAME = "commerce-agent-gates.config.json";

const TOP_LEVEL_KEYS = ["exclude", "checks"];

/** Fully-resolved defaults, derived from what each check declares. */
export function defaultConfig() {
  return {
    exclude: [],
    checks: Object.fromEntries(
      checks.map((check) => [check.meta.id, structuredClone(check.meta.defaultOptions)]),
    ),
  };
}

/**
 * Load and validate configuration for a scan root.
 *
 * @param {string} root directory being scanned
 * @param {string|undefined} explicitPath --config value, if given
 * @returns {{ options: object, path: string|null }}
 */
export function loadConfig(root, explicitPath) {
  const fallback = defaultConfig();

  if (!explicitPath && !existsSync(resolve(root, CONFIG_FILE_NAME))) {
    return { options: fallback, path: null };
  }

  const path = explicitPath ? resolve(explicitPath) : resolve(root, CONFIG_FILE_NAME);
  if (!existsSync(path)) {
    throw new ConfigError(`config file not found: ${explicitPath}`);
  }

  let document;
  try {
    document = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new ConfigError(`${path} is not valid JSON: ${error.message}`);
  }

  if (document === null || typeof document !== "object" || Array.isArray(document)) {
    throw new ConfigError(`${path} must contain a JSON object`);
  }

  rejectUnknown(document, TOP_LEVEL_KEYS, `${path}`, "the top level");

  if (document.exclude !== undefined) {
    if (!isStringArray(document.exclude)) {
      throw new ConfigError(`${path}: "exclude" must be an array of glob patterns`);
    }
    fallback.exclude = document.exclude;
  }

  if (document.checks !== undefined) {
    if (
      document.checks === null ||
      typeof document.checks !== "object" ||
      Array.isArray(document.checks)
    ) {
      throw new ConfigError(`${path}: "checks" must be an object keyed by check id`);
    }
    const byId = new Map(checks.map((check) => [check.meta.id, check]));
    rejectUnknown(document.checks, [...byId.keys()], `${path}`, '"checks"');

    for (const [id, userOptions] of Object.entries(document.checks)) {
      const meta = byId.get(id).meta;
      if (userOptions === null || typeof userOptions !== "object" || Array.isArray(userOptions)) {
        throw new ConfigError(`${path}: checks.${id} must be an object of options`);
      }
      const knownOptions = Object.keys(meta.defaultOptions);
      rejectUnknown(userOptions, knownOptions, `${path}`, `checks.${id}`);

      for (const [key, value] of Object.entries(userOptions)) {
        fallback.checks[id][key] = validatedOption(id, key, meta.defaultOptions[key], value, path);
      }
    }
  }

  return { options: fallback, path };
}

function validatedOption(id, key, fallbackValue, value, path) {
  const where = `${path}: checks.${id}.${key}`;

  if (key === "exemptions") {
    if (!Array.isArray(value))
      throw new ConfigError(`${where} must be an array of { path, reason } entries`);
    return value.map((entry, index) => {
      const label = `${where}[${index}]`;
      if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
        throw new ConfigError(`${label} must be an object with "path" and "reason"`);
      }
      rejectUnknown(entry, ["path", "reason"], label, "an exemption");
      if (typeof entry.path !== "string" || entry.path.trim() === "") {
        throw new ConfigError(`${label}.path must be a posix-relative file path`);
      }
      if (typeof entry.reason !== "string" || entry.reason.trim() === "") {
        throw new ConfigError(
          `${label}.reason must state why this file is exempt; a bare path rots into a list nobody agreed to`,
        );
      }
      return { path: normalizeRelPath(entry.path), reason: entry.reason.trim() };
    });
  }

  if (typeof fallbackValue === "string") {
    if (typeof value !== "string") throw new ConfigError(`${where} must be a string`);
    return value;
  }

  if (typeof fallbackValue === "boolean") {
    if (typeof value !== "boolean") throw new ConfigError(`${where} must be true or false`);
    return value;
  }

  if (Array.isArray(fallbackValue)) {
    if (!isStringArray(value)) throw new ConfigError(`${where} must be an array of strings`);
    return value;
  }

  throw new ConfigError(`${where} has an unsupported option type`);
}

function rejectUnknown(object, known, file, where) {
  const allowed = new Set(known);
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) {
      throw new ConfigError(
        `${file}: unknown key "${key}" at ${where}. Expected one of: ${[...allowed].join(", ")}`,
      );
    }
  }
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0);
}

function normalizeRelPath(path) {
  return path.split("\\").join("/").replace(/^\.\//, "");
}
