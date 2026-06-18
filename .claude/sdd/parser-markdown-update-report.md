# Story Map Parser — Markdown Formatting Support

**Status:** ✅ COMPLETE  
**Date:** 2026-06-18  
**Branch:** feature/US-103-v2-load-creation-redesign

## Summary

Updated the Story Map parser to accept markdown-formatted values (**bold**, emoji) while maintaining strict validation logic. Story_Map.md can now use formatting for readability without rejection by the validator.

## Changes Made

### 1. Created `dashboard/backend/src/parser.ts`
- **cleanMarkdownValue()** helper function:
  - Removes `**text**` markdown → `text`
  - Strips emoji: ✅, ❌, ⚠️, 🔗, 📊, 🚀, 🔄 and all other Unicode emoji (1F300-1F9FF range)
  - Removes [DEBT:AUTO] markers
  - Trims whitespace and dashes
- **parseStoryRow()**: Cleans values before validation
- **validate()**: Cleans values before validation
- **parseAndValidate()**: Parses markdown tables and returns story array + errors

### 2. Created `dashboard/backend/src/validate.ts`
CLI script to validate Story_Map.md:
```bash
npm run validate
```

### 3. Created `dashboard/backend/src/parser.test.ts`
10 test cases covering:
- Bold markdown removal
- Emoji stripping
- Combined formatting
- Whitespace/dash trimming
- Status validation
- Phase validation
- Multi-row parsing
- Error reporting

### 4. Created Supporting Files
- `package.json` — Dependencies (csv-parse, jest, typescript, tsx)
- `tsconfig.json` — TypeScript configuration
- `jest.config.js` — Jest test configuration
- `README.md` — Documentation and usage guide

## Test Results

```
PASS src/parser.test.ts
  Parser - Markdown Formatting Support
    cleanMarkdownValue helper
      ✓ should remove bold markdown formatting
      ✓ should remove emoji characters
      ✓ should handle combined bold and emoji
      ✓ should trim whitespace and dashes
    validate function
      ✓ should accept clean values without errors
      ✓ should clean and validate formatted values
      ✓ should reject invalid status after cleaning
      ✓ should reject invalid phase after cleaning
    parseAndValidate integration
      ✓ should parse multiple formatted stories
      ✓ should report validation errors while accepting formatted text

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

## Valid Values

**Statuses:**
- READY_FOR_DESIGN, READY_FOR_IMPLEMENTATION, IN_PROGRESS, COMPLETED, PAUSED, BLOCKED, BACKLOG

**Phases:**
- 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, B, C

## Usage Examples

### Formatted Story_Map.md
```markdown
| Story | Title | Status | Phase |
|-------|-------|--------|-------|
| ✅ **US-101** | **Load Board** | **COMPLETED** | **1** |
| 🔄 **US-102** | **Payments** 📊 | **IN_PROGRESS** | **2** |
```

### Validate from CLI
```bash
cd dashboard/backend
npm install
npm run validate
# Exit 0 if valid, exit 1 if errors
```

### Use in Code
```typescript
import { parseAndValidate, validate } from './parser';

const { stories, errors } = parseAndValidate('./Story_Map.md');
// stories: StoryRow[], errors: string[]

const error = validate({
  id: '**US-101**',
  title: '**Load Board**',
  status: '✅ COMPLETED',
  phase: '1',
  raw: []
});
// Returns null (valid after cleaning)
```

## Files Created

- `dashboard/backend/src/parser.ts` — Core parser with cleanMarkdownValue()
- `dashboard/backend/src/validate.ts` — CLI validator script
- `dashboard/backend/src/parser.test.ts` — 10 test cases (all passing)
- `dashboard/backend/package.json` — Dependencies
- `dashboard/backend/tsconfig.json` — TypeScript config
- `dashboard/backend/jest.config.js` — Jest config
- `dashboard/backend/README.md` — Documentation

## Key Implementation Details

### Markdown Table Parsing
- Splits content by newlines
- Identifies pipe-delimited table rows (`|...|`)
- Skips separator rows (`|---|---|...`)
- Extracts headers from first row
- Parses remaining rows as data

### Value Cleaning
- Bold: `**text**` → `text` (regex: `/\*\*(.+?)\*\*/g`)
- Emoji: Unicode range `[\u{1F300}-\u{1F9FF}]` (covers all emoji)
- Whitespace: `trim()` + regex cleanup

### Validation
- Validates cleaned values against VALID_STATUSES and VALID_PHASES
- Returns descriptive error messages per row
- Accumulates all errors before returning (no short-circuit)

## Integration Points

The parser is ready to be integrated into:
1. **Git hook** — Validate Story_Map.md before commits
2. **CI/CD** — Validate in automated builds
3. **Dashboard** — Validate when Story_Map.md is updated
4. **Story sync** — Ensure consistency across documentation

## Next Steps

1. Integrate `npm run validate` into git pre-commit hook
2. Add to CI/CD pipeline as a validation gate
3. Use parser in dashboard backend to read/parse Story_Map.md
4. Consider auto-formatting Story_Map.md from database source

---

**Commit:** `feat(dashboard): Story Map parser with markdown formatting support`  
**Co-authored-by:** Claude Haiku 4.5 <noreply@anthropic.com>
