#!/bin/bash
# Generate a new story file template
# Usage: ./new-story-template.sh US-XXX [Phase] [Personas: shipper|carrier|administrator]
# Example: ./new-story-template.sh US-501 Phase5 shipper,carrier

if [ -z "$1" ]; then
  echo "Usage: $0 US-XXX [Phase] [Personas]"
  echo "Example: $0 US-501 Phase5 shipper,carrier"
  echo "Personas: shipper, carrier, administrator, backend (comma-separated)"
  exit 1
fi

STORY_ID=$1
PHASE=${2:-"Phase X"}
PERSONAS=${3:-""}
OUTPUT_FILE="docs/business/stories/${STORY_ID}.md"

if [ -f "$OUTPUT_FILE" ]; then
  echo "❌ ERROR: $OUTPUT_FILE already exists."
  exit 1
fi

# Determine if UI section needed
HAS_UI=0
if [[ "$PERSONAS" =~ "shipper" ]] || [[ "$PERSONAS" =~ "carrier" ]] || [[ "$PERSONAS" =~ "administrator" ]]; then
  HAS_UI=1
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

## UI Design (Persona: $PERSONAS)

### High-Glare Mobile Environment Considerations
- [ ] Information salience: prioritize critical fields (e.g., load pay rate, shipper name)
- [ ] Badge color-coding: Green (high-value), Yellow (neutral), Red (low-value)
- [ ] Touch targets: minimum 44x44px for mobile; 8px padding between buttons
- [ ] Font hierarchy: primary action at 16px minimum, secondary at 14px

### Component Structure
```
[Page Layout]
├── Header: [Page title + back button]
├── Content: [Main interactive area]
│   ├── [Section 1]
│   ├── [Section 2]
│   └── [Call-to-Action (CTA)]
└── Footer: [Secondary actions]
```

### States & Transitions
- **Idle:** [Initial state description]
- **Loading:** [Loading state UI feedback]
- **Success:** [Success state with confirmation]
- **Error:** [Error state with remediation path]

### Figma / Wireframe Reference
[Link to design mockup or Figma file, if available]

### Frontend Validation (Zod Schema)
```typescript
const [StoryName]Schema = z.object({
  // field: z.string().min(1, "Required"),
});
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

# Handle persona substitution
PERSONAS_TEXT=$PERSONAS
if [ -z "$PERSONAS_TEXT" ]; then
  # Remove UI section if no personas
  sed -i '/## UI Design (Persona:/,/^## Test Coverage/d' "$OUTPUT_FILE"
  sed -i 's/## UI Design (Persona: $PERSONAS)//' "$OUTPUT_FILE"
else
  # Replace personas placeholder with actual personas
  sed -i "s/\$PERSONAS/$PERSONAS_TEXT/g" "$OUTPUT_FILE"
fi

sed -i "s/\$STORY_ID/$STORY_ID/g" "$OUTPUT_FILE"
sed -i "s/\$PHASE/$PHASE/g" "$OUTPUT_FILE"

echo "✅ Created: $OUTPUT_FILE"
echo ""
if [ "$HAS_UI" -eq 1 ]; then
  echo "✨ UI section included for personas: $PERSONAS"
else
  echo "📋 Backend-only story (no UI section)"
fi
echo ""
echo "Next steps:"
echo "1. Edit the file to fill in implementation details"
echo "2. If persona-aware: coordinate with HFD for UI/UX review"
echo "3. Reference this story in Story_Map.md under the appropriate phase"
echo "4. After implementation, update the Commit hash and Sign-Off section"
