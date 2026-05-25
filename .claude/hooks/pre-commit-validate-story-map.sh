#!/bin/bash
# Pre-commit hook: Validate Story_Map.md phase references match folder structure
# Install: cp .claude/hooks/pre-commit-validate-story-map.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

STORY_MAP="docs/project/Story_Map.md"

if [ ! -f "$STORY_MAP" ]; then
  exit 0
fi

# Extract all "Phase X.Y" references (banned pattern)
INVALID_PHASES=$(grep -o 'Phase [0-9]\+\.[0-9]\+' "$STORY_MAP" 2>/dev/null | sort -u)

if [ -n "$INVALID_PHASES" ]; then
  echo "❌ ERROR: Story_Map.md contains orphaned phase references (banned pattern 'Phase X.Y'):"
  echo "$INVALID_PHASES" | sed 's/^/   - /'
  echo ""
  echo "✅ REMEDIATION: Replace inline phase refs with story IDs (US-XXX)"
  echo "   Example: 'Phase 3.5' → 'US-305' (or reference the actual phase)"
  echo ""
  exit 1
fi

# Validate referenced phases (Phase 1-9) exist or are documented
REFERENCED_PHASES=$(grep -oE 'Phase [0-9]+\b' "$STORY_MAP" 2>/dev/null | grep -oE '[0-9]+' | sort -u)

for PHASE_NUM in $REFERENCED_PHASES; do
  # Check if phase folder exists in docs/project/
  if [ ! -d "docs/project/Phase_$PHASE_NUM" ] && [ "$PHASE_NUM" -gt 9 ]; then
    echo "⚠️  WARNING: Story_Map references Phase $PHASE_NUM but docs/project/Phase_$PHASE_NUM does not exist."
    echo "   If this is intentional, update this hook or document the phase structure."
  fi
done

exit 0
