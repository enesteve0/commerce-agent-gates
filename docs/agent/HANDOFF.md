# Agent Session Handoff Protocol

When handing off an ongoing or multi-step engineering mission to a subsequent AI coding agent session, summarize state using this standardized template.

---

## Session Handoff Template

```markdown
# Agent Session Handoff

- **Date / Timestamp**: YYYY-MM-DDTHH:MM:SSZ
- **Branch**: master
- **Current Commit / Head**: <commit-hash>
- **Objective / Task**: <Brief summary of what was being worked on>

### Completed Work

- [x] <List completed items>

### Files Modified / Created

- `src/...`: <summary of change>
- `test/...`: <summary of tests added>
- `docs/...`: <summary of documentation updated>

### Architectural Decisions & Rationale

- <Any key trade-offs or decisions made during this session>

### Verification Results

- `npm test`: PASS (116/116)
- `npm run lint`: PASS (0 warnings)
- `npm run format`: PASS
- `node bin/commerce-agent-gates.mjs .`: PASS (Exit 0)

### Remaining Work & Next Actions

1. <Exact next action for the incoming agent>
2. <Any open questions or edge cases to investigate>

### Blockers or Caveats

- <None or specific external constraints>
```
