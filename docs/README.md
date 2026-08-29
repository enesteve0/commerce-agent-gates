# Documentation Index & Knowledge Graph

Welcome to the `commerce-agent-gates` knowledge system. This index serves as the navigation hub for human engineers and AI coding agents.

---

## 1. Documentation Structure

```
docs/
├── README.md                          # Master documentation index & source of truth
├── PROJECT_OVERVIEW.md                # Product identity, purpose, scope, and users
├── GLOSSARY.md                        # Domain concepts, terminology, and definitions
├── TECH_DEBT.md                       # Verified technical debt & deliberate tradeoffs
│
├── agent/                             # AI Agent Operating Layer
│   ├── README.md                      # Agent architecture & maintenance rules
│   ├── START_HERE.md                  # Fast onboarding mental model for agents
│   ├── CONTEXT_MAP.md                 # Task-to-context routing matrix
│   ├── FILE_INVENTORY.md              # 100% complete repository file ledger
│   ├── REPOSITORY_MAP.md              # Semantic directory breakdown & diagrams
│   ├── COMMANDS.md                    # Verified commands reference
│   ├── INVARIANTS.md                  # Non-negotiable repository invariants
│   ├── DEFINITION_OF_DONE.md          # Checklists for completing changes
│   ├── CHANGE_MATRIX.md               # Cross-cutting impact matrix
│   ├── COMMON_TASKS.md                # Step-by-step recipes for developer tasks
│   ├── COMMON_MISTAKES.md             # Known failure modes & correct patterns
│   ├── TROUBLESHOOTING.md             # Common errors and resolutions
│   └── HANDOFF.md                     # Agent session handoff protocol
│
├── architecture/                      # Architecture & Internal Mechanics
│   ├── README.md                      # Architecture overview
│   ├── SYSTEM_OVERVIEW.md             # Pipeline architecture & component breakdown
│   ├── MODULE_BOUNDARIES.md           # Module responsibilities & encapsulation
│   ├── DEPENDENCY_RULES.md            # Allowed and forbidden import directions
│   ├── DATA_FLOW.md                   # Request-to-exit-code lifecycle trace
│   └── SCANNER_INTERNALS.md           # Masking scanner, spans, and offset mapping
│
├── checks/                            # Domain Rules & Check Specifications
│   ├── README.md                      # Philosophy: Selection over volume
│   ├── NO_MOCK_DATA.md                # Check 1: no-mock-data-in-production
│   ├── MUTATING_ROUTES.md             # Check 2: mutating-routes-must-be-guarded
│   └── TENANT_SCOPING.md              # Check 3: queries-must-be-tenant-scoped (OWASP BOLA)
│
├── testing/                           # Quality Assurance & Testing Standards
│   ├── README.md                      # Testing philosophy
│   ├── TESTING_STRATEGY.md            # Multi-tier testing strategy
│   ├── TEST_MATRIX.md                 # Test suite-to-subsystem mapping
│   └── FIXTURES_GUIDE.md              # Clean & dirty fixture contracts & traps
│
├── operations/                        # Build, CI/CD, Packaging & Release
│   ├── README.md                      # Operations overview
│   ├── CI_CD.md                       # GitHub Actions workflow & matrix
│   └── PACKAGING_AND_RELEASE.md       # npm packaging, provenance & release steps
│
└── adr/                               # Architectural Decision Records
    ├── README.md                      # ADR index and template
    ├── 0001-zero-runtime-dependencies.md
    ├── 0002-offset-preserving-masking-scanner.md
    ├── 0003-strict-config-validation-with-mandatory-reasons.md
    ├── 0004-node-22-minimum-and-node-test-runner.md
    └── 0005-unified-multi-format-reporting-sarif-github-json.md
```

---

## 2. Canonical Source-of-Truth Table

| Subject Area                      | Canonical Documentation                                                           | When to Read                              |
| --------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- |
| **Agent Directives & Invariants** | [`AGENTS.md`](../AGENTS.md) / [`docs/agent/INVARIANTS.md`](./agent/INVARIANTS.md) | Before modifying any code                 |
| **Commands to Execute**           | [`docs/agent/COMMANDS.md`](./agent/COMMANDS.md)                                   | When testing, linting, or running CLI     |
| **Pipeline & Engine Design**      | [`docs/architecture/SYSTEM_OVERVIEW.md`](./architecture/SYSTEM_OVERVIEW.md)       | When modifying `src/`                     |
| **Scanner / Tokenizer**           | [`docs/architecture/SCANNER_INTERNALS.md`](./architecture/SCANNER_INTERNALS.md)   | When tuning `src/lib/tokenize.mjs`        |
| **Check Rules & Detection**       | [`docs/checks/`](./checks/)                                                       | When tuning or adding checks              |
| **Testing Contract**              | [`docs/testing/TESTING_STRATEGY.md`](./testing/TESTING_STRATEGY.md)               | When adding or updating tests             |
| **Packaging & CI**                | [`docs/operations/CI_CD.md`](./operations/CI_CD.md)                               | When changing workflows or package config |
| **Architectural Decisions**       | [`docs/adr/`](./adr/)                                                             | When evaluating design choices            |
