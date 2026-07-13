#!/bin/bash
# PreToolUse guard on Write: blocks creating a NEW deploy*.ps1 / deploy*.sh file
# at project root when one already exists, unless the new file replaces an
# existing one (i.e. an edit, not a fresh create).
#
# Why: FREIG-115 — an untracked, historyless deploy-production.ps1 was
# fabricated instead of using the existing deploy-prod.ps1, silently creating
# decoy Cloud Run services and masking 3+ weeks of stale production.

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

if [ -z "$file_path" ]; then
  echo '{}'
  exit 0
fi

base=$(basename "$file_path")
dir=$(dirname "$file_path")

if echo "$base" | grep -qiE '^deploy.*\.(ps1|sh)$' && [ ! -f "$file_path" ]; then
  existing=$(find "$dir" -maxdepth 1 \( -iname 'deploy*.ps1' -o -iname 'deploy*.sh' \) 2>/dev/null)
  if [ -n "$existing" ]; then
    existing_list=$(echo "$existing" | tr '\n' ' ')
    reason="Existing deploy script(s) already present: ${existing_list}. Run 'git log --follow -- <path>' on each before creating a new one — an untracked/historyless duplicate script caused a real production incident (FREIG-115)."
    jq -n --arg reason "$reason" '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
    exit 0
  fi
fi

echo '{}'
