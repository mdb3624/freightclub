# Dashboard Backend — Story Map Parser

Parser and validator for FreightClub Story_Map.md with markdown formatting support.

## Features

- ✅ Parses pipe-delimited CSV tables from markdown files
- ✅ Automatically strips **bold** markdown formatting (**text** → text)
- ✅ Removes emoji (✅, ❌, ⚠️, 🔗, 📊, 🚀) from values
- ✅ Validates story IDs, statuses, and phases
- ✅ Provides detailed error reporting

## Installation

```bash
npm install
```

## Usage

### Validate Story_Map.md

```bash
npm run validate
```

This runs the validator against `../../Story_Map.md` and reports:
- Number of valid stories parsed
- Any formatting/validation errors
- Exit code 0 on success, 1 on errors

### Run Tests

```bash
npm test
```

Tests cover:
- Bold markdown removal (**US-101** → US-101)
- Emoji stripping (✅ → removed)
- Combined formatting (✅ **US-102** → US-102)
- Whitespace/dash trimming
- Status validation
- Phase validation

### Import in Code

```typescript
import { parseAndValidate, validate } from './parser';

const { stories, errors } = parseAndValidate('./Story_Map.md');

// Validate individual story
const error = validate({
  id: 'US-101',
  title: 'My Story',
  status: 'COMPLETED',
  phase: '1',
  raw: []
});
```

## API

### parseAndValidate(filePath: string)

Parses a markdown file containing a CSV table and validates all rows.

**Returns:**
```typescript
{
  stories: StoryRow[],
  errors: string[]
}
```

### validate(story: StoryRow)

Validates a single story object, cleaning markdown first.

**Returns:** `string | null` (error message or null)

### cleanMarkdownValue(value: string)

Removes bold markdown and emoji from a string.

**Returns:** Cleaned string

## Valid Values

**Statuses:**
- READY_FOR_DESIGN
- READY_FOR_IMPLEMENTATION
- IN_PROGRESS
- COMPLETED
- PAUSED
- BLOCKED
- BACKLOG

**Phases:**
- 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 (numbered phases)
- B, C (backlog phases)

## Example: Story_Map.md with Formatting

```markdown
# Story Map

| Story | Title | Status | Phase |
|-------|-------|--------|-------|
| ✅ **US-101** | **Load Board** | **COMPLETED** | **1** |
| 🔄 **US-102** | **Driver Profile** 📊 | **IN_PROGRESS** | **2** |
| ⚠️ **US-103** | **Payments** | **PAUSED** | **3** |
```

All formatting is automatically cleaned during parsing and validation.

## Exit Codes

- `0`: All stories valid
- `1`: Validation errors found
