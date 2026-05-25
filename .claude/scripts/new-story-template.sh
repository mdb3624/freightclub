#!/bin/bash
# Generate a new story file template
# Usage: ./new-story-template.sh US-XXX [Phase]

if [ -z "$1" ]; then
  echo "Usage: $0 US-XXX [Phase]"
  echo "Example: $0 US-501 Phase5"
  exit 1
fi

STORY_ID=$1
PHASE=${2:-"Phase X"}
OUTPUT_FILE="docs/business/stories/${STORY_ID}.md"

if [ -f "$OUTPUT_FILE" ]; then
  echo "❌ ERROR: $OUTPUT_FILE already exists."
  exit 1
fi

cat > "$OUTPUT_FILE" << 'EOF'
# User Story: $STORY_ID — [Feature Name]

**Phase:** $PHASE
**Status:** PENDING
**Depends On:** [US-XXX]
**Blocks:** [US-XXX]

---

## Overview

[1-2 sentence summary of the user-facing value and problem being solved]

---

## Acceptance Criteria

**AC-$STORY_ID-1:** [Criterion 1]
- **When:** [Context]
- **Then:** [Expected behavior]
- **Verify:** [Test approach]

**AC-$STORY_ID-2:** [Criterion 2]
- **When:** [Context]
- **Then:** [Expected behavior]
- **Verify:** [Test approach]

---

## Implementation Notes

### Database Schema (Flyway Migration)
```sql
-- V[YYYYMMDD]_HHmm__[Description].sql
CREATE TABLE [table_name] (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  -- columns
  deleted_at TIMESTAMPTZ,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  ENABLE ROW LEVEL SECURITY
);
```

### API Endpoints
- `[METHOD] /api/v1/[resource]` — [Description]

### Response Model
```json
{
  "field": "value"
}
```

---

## Test Coverage

- `[ServiceName]Test` — Unit tests for business logic
- `[ControllerName]Test` — API contract validation
- Integration test — Multi-tenant isolation, RLS verification

**JaCoCo Coverage:** ≥80% (branch coverage)

---

## Implementation Commit

**Commit:** [hash]
**Date:** [YYYY-MM-DD]
**Author:** [Name]
**Message:** `feat([phase]): [description]`

---

## Sign-Off

**Reviewer:** [Status: PENDING]
**Librarian:** [Status: PENDING]
**Status:** ⏳ PENDING

EOF

sed -i "s/\$STORY_ID/$STORY_ID/g" "$OUTPUT_FILE"
sed -i "s/\$PHASE/$PHASE/g" "$OUTPUT_FILE"

echo "✅ Created: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "1. Edit the file to fill in implementation details"
echo "2. Reference this story in Story_Map.md under the appropriate phase"
echo "3. After implementation, update the Commit hash and Sign-Off section"
