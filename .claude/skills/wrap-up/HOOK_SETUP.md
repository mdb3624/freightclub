# Hook Setup for /wrap-up Friction Detection

This file explains how to configure a PostToolUse hook that monitors for friction patterns and suggests running `/wrap-up` at the end of a session.

## Option 1: Simple Suggestion Hook (Recommended)

Add this to `.claude/settings.json` or `.claude/settings.local.json`:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "type": "message",
        "message": "Session ending. Consider running /wrap-up to extract insights and update project rules if you encountered: repeated manual commands, recurring error patterns, or test failures requiring multiple corrections."
      }
    ]
  }
}
```

**Effect**: At the end of each session, Claude will remind you about `/wrap-up` without being intrusive.

---

## Option 2: Error-Count-Based Hook

Add this to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[FRICTION_MONITOR]' >> /tmp/claude_session.log && grep -c 'Error\\|Exception\\|FAILED\\|timeout' /tmp/claude_session.log 2>/dev/null | awk '{if($1>3) print \"⚠️  Friction detected: \" $1 \" errors. Consider /wrap-up.\"}'"
          }
        ]
      }
    ]
  }
}
```

**Effect**: After each tool execution, a counter tracks error keywords. If 3+ errors are seen, the hook suggests `/wrap-up`.

**Limitations**: 
- Requires manual session log file creation at session start
- Resets per session (no persistence across sessions)
- May have false positives (e.g., errors in example code)

---

## Option 3: Custom Session Tracker

Create a file `.claude/scripts/friction_monitor.sh`:

```bash
#!/bin/bash

# Friction Monitor — tracks patterns across a session
SESSION_LOG="/tmp/claude_friction_${RANDOM}.log"

# Initialize on first call
if [ ! -f "$SESSION_LOG" ]; then
  echo "Session started: $(date)" > "$SESSION_LOG"
  echo "Friction patterns:" >> "$SESSION_LOG"
fi

# Count friction signals
ERRORS=$(grep -c 'Error\|Exception\|FAILED' "$SESSION_LOG" 2>/dev/null || echo 0)
REPEATED_CMDS=$(grep -c 'mvn test\|psql.*test\|npm run test' "$SESSION_LOG" 2>/dev/null || echo 0)
CORRECTIONS=$(grep -c 'no\|wrong\|stop\|redo\|that' "$SESSION_LOG" 2>/dev/null || echo 0)

# Friction threshold: (errors > 3) OR (repeated_cmds > 2) OR (corrections > 2)
FRICTION=$((($ERRORS > 3) + ($REPEATED_CMDS > 2) + ($CORRECTIONS > 2)))

if [ "$FRICTION" -gt 0 ]; then
  echo ""
  echo "🔴 FRICTION DETECTED IN THIS SESSION:"
  [ "$ERRORS" -gt 3 ] && echo "   • $ERRORS errors encountered"
  [ "$REPEATED_CMDS" -gt 2 ] && echo "   • Build/test command repeated >2 times"
  [ "$CORRECTIONS" -gt 2 ] && echo "   • User corrections/negations detected"
  echo ""
  echo "💡 Consider running: /wrap-up"
  echo ""
fi
```

Then add to `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "type": "command",
        "command": "bash .claude/scripts/friction_monitor.sh"
      }
    ]
  }
}
```

**Effect**: At session end, a detailed friction report is printed with specific signals detected.

---

## Option 4: No Hook (Manual Only)

Don't configure any hook. Simply invoke `/wrap-up` manually at the end of sessions where you noticed friction or want to distill learnings.

This is the simplest approach and avoids false positives.

---

## How to Enable a Hook

1. Open `.claude/settings.json` (or create it if it doesn't exist)
2. Paste the hook configuration from above (choose Option 1, 2, 3, or 4)
3. Save the file
4. The hook will activate on the next session

To test the hook immediately, end the current session and start a new one.

---

## Friction Signals the Hook Detects

The hooks above look for these signals:

| Signal | Pattern | Indicator |
|--------|---------|-----------|
| Repeated manual command | `mvn test`, `psql`, `npm run` executed 3+ times | Automation candidate |
| Error pattern | `Error`, `Exception`, `FAILED`, `timeout` appearing 3+ times | Debugging friction |
| User correction | "no", "wrong", "stop", "redo", "that's not" | Claude misalignment |
| Long task | Single task taking 15+ minutes and 3+ iterations | Root cause analysis needed |
| Data inefficiency | Large outputs processed in context instead of sandbox | Context waste |

---

## Customizing Friction Thresholds

If the hook is too noisy (suggesting `/wrap-up` too often), adjust the thresholds:

- **Option 2**: Change `if($1>3)` to `if($1>5)` (5+ errors instead of 3+)
- **Option 3**: Change `$ERRORS > 3` to `$ERRORS > 5`, etc.

If the hook is too silent (never suggesting `/wrap-up`), lower the thresholds:

- **Option 2**: Change `if($1>3)` to `if($1>2)` (2+ errors)
- **Option 3**: Change `$ERRORS > 3` to `$ERRORS > 2`, etc.

---

## Troubleshooting

**Q: The hook never fires.**
- Verify the hook is in `.claude/settings.json` (not a typo in the path)
- Check that the command syntax is valid JSON
- Restart Claude Code to reload settings

**Q: The hook fires too often and is annoying.**
- Switch to Option 1 (simple SessionEnd message) which is less intrusive
- Or increase the friction thresholds in the command

**Q: The hook isn't detecting the friction I know happened.**
- Check the patterns in the command—they may not match your specific errors
- Add custom patterns like grep 'RLS\|Hibernate\|auth' for domain-specific friction
- Consider Option 4 (no hook) and just invoke `/wrap-up` manually

**Q: Can I run /wrap-up even if the hook didn't trigger?**
- Yes! Always invoke `/wrap-up` manually whenever you want to distill session learnings, regardless of friction level.

