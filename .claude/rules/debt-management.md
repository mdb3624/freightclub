# [AUTOMATION] Technical Debt Logging Protocol

## Trigger
Whenever a file is read or code is proposed, if the code violates standards in `ARCHITECTURE.md`, `postgres-native.md`, or `ui-standards.md`.

## Mandatory Action
Before providing the final answer, the **LIBRARIAN** must:
1. Append a new row to the **Technical Debt Ledger** in `.claude/learnings.md`.
2. Format: `| Feature/File | Violation | Severity | Remediation Plan |`
3. Use the tag `[DEBT:AUTO]` in the log entry.

## Conflict Resolution
If the AI is 95% sure it found debt but isn't working on that specific feature, it must log it silently in the background and continue with the current task.