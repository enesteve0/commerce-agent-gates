# Security Policy

## What this tool is

A set of pattern-matching build checks that read source files and report
findings. It runs entirely offline, makes no network requests, executes none
of the code it scans, and has zero runtime dependencies.

## What this tool is not

Not a security product. Passing these gates does not mean code is secure; it
means three specific failure modes are absent from the text that was scanned.
The checks are heuristic by design, and a determined mistake can evade them.
See the README's Limits section for the honest scope.

## Reporting a vulnerability

If you find a vulnerability in the tool itself (for example: a way repository
content could cause resource exhaustion during scanning, or config injection
into regex compilation), open a private security advisory via
[GitHub security advisories](https://github.com/enesteve0/commerce-agent-gates/security/advisories/new)
rather than a public issue.

Please include a minimal reproduction and the version you tested against.

## Supported versions

The latest published major version receives fixes. Node.js runtime support
follows the [Node release schedule](https://nodejs.org/en/about/previous-releases);
the minimum supported Node line is itself a supported LTS release.
