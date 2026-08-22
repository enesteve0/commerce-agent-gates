/**
 * Output formatting: what humans read in a terminal, what CI annotates on a
 * pull request, and what machines ingest. Same finding objects feed all four,
 * so a violation never looks different depending on who is watching.
 *
 * - pretty  colour-capable terminal output (default)
 * - json    one stable document, suitable for scripting
 * - sarif   SARIF 2.1.0, uploadable to GitHub code scanning
 * - github  workflow-command annotations rendered inline on pull requests
 */

const ANSI = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  dim: "\u001b[2m",
};

const paint = (enabled) => (code, text) => (enabled ? `${code}${text}${ANSI.reset}` : text);

export function formatPretty(result, { color = false } = {}) {
  const c = paint(color);
  const lines = [];

  for (const entry of result.checksRun) {
    const failed = entry.count > 0;
    lines.push(failed ? c(ANSI.red, `FAIL  ${entry.id}`) : c(ANSI.green, `PASS  ${entry.id}`));
    if (failed) {
      const own = result.findings.filter((f) => f.ruleId === entry.id);
      for (const f of own) {
        lines.push(`      ${f.file}:${f.line}:${f.column}  ${c(ANSI.dim, f.message)}`);
      }
    }
  }

  for (const notice of result.notices) lines.push(`${c(ANSI.dim, "note")}  ${notice}`);

  const total = result.findings.length;
  const scanned = `${result.filesScanned} file${result.filesScanned === 1 ? "" : "s"} scanned`;
  const summary =
    total === 0
      ? c(ANSI.green, `✓ ${result.checksRun.length} checks passed`) + ` (${scanned})`
      : c(ANSI.red, `✖ ${total} finding${total === 1 ? "" : "s"}`) +
        ` across ${result.checksRun.filter((e) => e.count > 0).length} check${result.checksRun.filter((e) => e.count > 0).length === 1 ? "" : "s"} (${scanned})`;
  lines.push("");
  lines.push(summary);

  return lines.join("\n");
}

export function formatJson(result, { version = "unknown" } = {}) {
  return JSON.stringify(
    {
      tool: "commerce-agent-gates",
      version,
      root: result.root,
      filesScanned: result.filesScanned,
      notices: result.notices,
      findings: result.findings,
      summary: {
        findings: result.findings.length,
        checks: Object.fromEntries(result.checksRun.map((entry) => [entry.id, entry.count])),
      },
    },
    null,
    2,
  );
}

/** SARIF 2.1.0 — see https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html */
export function formatSarif(result, { version = "unknown", informationUri = "" } = {}) {
  return JSON.stringify(
    {
      $schema:
        "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "commerce-agent-gates",
              version,
              informationUri,
              rules: result.checksRun.map((entry) => ({
                id: entry.id,
                shortDescription: { text: entry.description ?? entry.id },
              })),
            },
          },
          invocations: [{ executionSuccessful: true }],
          results: result.findings.map((f) => ({
            ruleId: f.ruleId,
            level: f.severity,
            message: { text: f.message },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri: f.file },
                  region: { startLine: f.line, startColumn: f.column },
                },
              },
            ],
          })),
        },
      ],
    },
    null,
    2,
  );
}

/**
 * GitHub Actions workflow commands render inline annotations on the PR diff.
 * Property values are escaped per the runner's rules; the message body only
 * needs percent/newline escaping.
 */
export function formatGithub(result) {
  return result.findings
    .map((f) => {
      const title = escapeProperty(`${f.ruleId}: ${f.message}`);
      const props = [
        `file=${escapeProperty(f.file)}`,
        `line=${f.line}`,
        `col=${f.column}`,
        `title=${title}`,
      ];
      return `::error ${props.join(",")}::${escapeData(f.message)}`;
    })
    .join("\n");
}

function escapeProperty(value) {
  return String(value)
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A")
    .replace(/:/g, "%3A")
    .replace(/,/g, "%2C");
}

function escapeData(value) {
  return String(value).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
