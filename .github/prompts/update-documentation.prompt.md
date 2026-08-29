# Update Documentation Synchronization

Follow this checklist whenever modifying codebase features, checks, options, or commands:

1. **Check Options or Registry Change**:
   - Update `docs/checks/<CHECK_NAME>.md`.
   - Update `README.md` § Configuration.
   - Update `docs/agent/INVARIANTS.md` if invariant rules were modified.
2. **CLI Flags or Formatter Change**:
   - Update `docs/agent/COMMANDS.md`.
   - Update `README.md` § Output formats.
   - Update `docs/architecture/DATA_FLOW.md`.
3. **Lexer / Scanner Modifications**:
   - Update `docs/architecture/SCANNER_INTERNALS.md`.
   - Update `docs/adr/0002-offset-preserving-masking-scanner.md` if fundamental heuristics evolved.
4. **File Inventory**:
   - If files were added, deleted, or renamed, update `docs/agent/FILE_INVENTORY.md`.
5. **Run Formatting**:
   - `npm run format:fix`
   - `npm run format`
