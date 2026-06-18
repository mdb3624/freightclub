# Agile Dashboard Design Specification

**Date:** 2026-06-18  
**Author:** Claude  
**Status:** APPROVED  
**Scope:** Personal tracking + team coordination + executive visibility  
**Primary Goal:** Single unified view of current work, sprint plan, and backlog—no manual data entry

---

## 1. Overview

An interactive web dashboard that parses `Story_Map.md` and `Sprint_Log.md` to visualize:
- **Current active story** with assigned roles and workflow stage
- **Sprint progress** (sprints 01-03) with burndown and dependencies
- **Backlog** organized by phase (4-11+) with filtering and search

Embedded in Obsidian via iFrame and available as standalone web app (localhost or Cloud Run). Automated file watcher + git pre-commit hook eliminate manual updates.

---

## 2. Data Model

### Story Object (parsed from Story_Map.md)

```typescript
interface Story {
  id: string;                    // US-101, US-103-v2, etc.
  title: string;                 // "Load CRUD"
  status: 'COMPLETED' | 'IN_PROGRESS' | 'READY_FOR_DESIGN' | 'BACKLOG' | 'MIGRATION_PENDING';
  phase: number;                 // 1, 2, 3, 4, 5, 6, 7, 10, 11, or 'cross'
  dependencies: string[];        // ["US-101", "US-103"]
  roles: {
    ba?: 'PENDING' | 'APPROVED' | 'BLOCKED';
    architect?: 'PENDING' | 'APPROVED' | 'BLOCKED';
    hfd?: 'PENDING' | 'APPROVED' | 'BLOCKED';
    coder?: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'BLOCKED';
    reviewer?: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'BLOCKED';
  };
  coverage?: number;             // 85, 91.4, etc.
  completionDate?: string;       // "2026-06-16"
  notes?: string;                // "CHG-501 tracked separately"
}

interface Dashboard {
  lastUpdated: string;           // ISO timestamp
  activeStories: Story[];        // status = IN_PROGRESS or READY_FOR_DESIGN
  currentSprint: {
    number: number;              // 1, 2, 3
    stories: Story[];
    completedCount: number;
    totalCount: number;
  };
  backlog: {
    [phase: number]: Story[];    // Phase → story list
  };
}
```

---

## 3. Architecture

### Data Flow

```
Story_Map.md (source of truth)
    ↓ (file watcher triggers)
Parser (Node backend: parser.ts)
  • Extract markdown tables
  • Build story objects
  • Resolve dependencies
  • Validate phase/status values
    ↓
JSON cache (in-memory + optional disk)
    ↓ (HTTP GET /api/dashboard)
React Frontend (useDashboardData hook)
    ↓
Render: ActiveStory | SprintPlan | Backlog
    ↓
Display: Web (localhost:3000) + Obsidian iFrame
```

### Backend (Node + Express)

**`server.ts`** — Express app serving `/api/dashboard`
- `GET /api/dashboard` — Returns current dashboard state (JSON)
- Hot-reload on file change (chokidar watcher)
- Validation errors logged to stderr

**`parser.ts`** — Markdown → JSON
- Parse `Story_Map.md` table syntax
- Extract: ID, title, status, phase, dependencies, roles, coverage
- Handle edge cases: multi-line cells, empty fields, variant stories (US-103-v2)
- Return typed `Dashboard` object

**`validate.ts`** — Git hook validation
- Check markdown table structure
- Verify unique story IDs
- Validate phase ∈ [1, 2, 3, 4, 5, 6, 7, 10, 11, 'cross']
- Validate status ∈ [COMPLETED, IN_PROGRESS, READY_FOR_DESIGN, BACKLOG, MIGRATION_PENDING]
- Called by pre-commit hook; exit(1) if validation fails

### Frontend (React + Vite)

**`useDashboardData.ts`** — Custom hook
```typescript
const { data, loading, error } = useDashboardData();
// Polls /api/dashboard every 2s (or subscribes to SSE)
// Returns: { activeStories, currentSprint, backlog }
```

**Components:**

1. **`ActiveStory.tsx`** — Current work widget
   - Story card: ID, title, phase, estimated completion
   - Role timeline: BA → ARCH → HFD → CODER → REVIEWER (show current blocker in red)
   - Dependencies: list of blocking stories
   - Click to expand: full AC, coverage, linked files

2. **`SprintPlan.tsx`** — Sprint 01/02/03 progress
   - Three tabs (one per sprint)
   - Stories table: ID, title, status, % complete
   - Mini burndown chart (stories completed vs. remaining)
   - Highlight blocked stories in red

3. **`Backlog.tsx`** — Phase-organized backlog
   - Accordion by phase: Phase 1, Phase 2, …, Phase 11+
   - Per phase: story count, completion %, critical blockers
   - Expandable: click phase to show all stories in that phase
   - Filter bar: by status (COMPLETED, BACKLOG, MIGRATION_PENDING)

4. **`App.tsx`** — Layout container
   - 3-column grid: ActiveStory | SprintPlan | Backlog
   - Responsive: stack on mobile, side-by-side on desktop
   - Refresh button (manual) + auto-refresh indicator
   - Last updated timestamp

**Styling:** Tailwind CSS, matches FreightClub design system (Sora fonts, bronze accents).

---

## 4. Automation

### File Watcher (Primary)

**Tool:** `chokidar` (Node package)

**Trigger:** Save `Story_Map.md` or `Sprint_Log.md`

**Action:**
1. `parser.ts` re-parses markdown → JSON
2. In-memory cache updated
3. Validation runs (report errors to console, don't break server)
4. React frontend hot-reloads (WebSocket or SSE notification)
5. Dashboard refreshes without page reload

**Implementation:** `server.ts` includes:
```typescript
const watcher = chokidar.watch(['Story_Map.md', 'Sprint_Log.md']);
watcher.on('change', () => {
  cache = parseMarkdown();
  notifyClients(); // WebSocket/SSE broadcast
});
```

### Git Pre-Commit Hook

**File:** `.git/hooks/pre-commit`

**Trigger:** Before `git commit`

**Action:**
1. Run `validate.ts` against staged `Story_Map.md`
2. Check:
   - Markdown table structure valid
   - All story IDs unique
   - Phase values valid
   - Status values valid
3. Exit code 0 → commit proceeds
4. Exit code 1 → commit blocked, show error message

**Example error message:**
```
❌ Story_Map.md validation failed
   Line 23: Invalid phase value "8" (valid: 1-7, 10, 11, cross)
   Line 45: Duplicate story ID "US-103"
❌ Commit rejected. Fix errors and try again.
```

**Setup (one-time):**
```bash
# Create hook from dashboard/backend
cp dashboard/backend/validate.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 5. Obsidian Integration

### Option A: iFrame Embed (Recommended)

Embed dashboard in Obsidian note:
```markdown
# My Dashboard

<iframe 
  src="http://localhost:3000"
  width="100%"
  height="1200"
  style="border: none;"
></iframe>
```

**Pros:**
- No Obsidian plugin needed
- Works immediately after dashboard service starts
- Updates live as you edit Story_Map.md

**Cons:**
- Requires dashboard backend running locally
- Obsidian note refresh might lag

### Option B: Obsidian Plugin (Future)

If desired later:
- Create Obsidian plugin using `obsidian` package
- Command: `/Dashboard` opens modal with dashboard UI
- Plugin calls same `localhost:3000` API
- (Deferred to Phase 11+)

---

## 6. File Structure

```
freightclub/
├── dashboard/                                [NEW DIRECTORY]
│   ├── backend/
│   │   ├── src/
│   │   │   ├── server.ts                     (Express + watcher)
│   │   │   ├── parser.ts                     (Markdown parser)
│   │   │   ├── validate.ts                   (Validation logic)
│   │   │   └── types.ts                      (TypeScript interfaces)
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ActiveStory.tsx
│   │   │   │   ├── SprintPlan.tsx
│   │   │   │   ├── Backlog.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboardData.ts
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── scripts/
│   │   └── setup-hooks.sh                   (Git hook setup)
│   ├── README.md                            (Quick start guide)
│   └── docker-compose.yml                   (Optional Cloud Run deployment)
│
├── .git/hooks/
│   └── pre-commit                           (Symlink to dashboard/scripts)
│
└── docs/superpowers/specs/
    └── 2026-06-18-agile-dashboard-design.md [THIS FILE]
```

---

## 7. Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Backend | Node.js + TypeScript + Express | Lightweight, type-safe, markdown-friendly |
| Frontend | React 18 + Vite + TypeScript | Reuses FreightClub stack, fast HMR |
| Styling | Tailwind CSS | Matches design system |
| File Watching | chokidar | Cross-platform, reliable |
| API | Express REST | Simple, no dependencies |
| Deployment | Local dev + optional Cloud Run | Flexible (local first, scale later) |

---

## 8. Implementation Phases

### Phase 1: Core Parser + Server (1-2 days)
- [x] Markdown parser (Story_Map.md → JSON)
- [x] Express server + `/api/dashboard` endpoint
- [x] File watcher integration
- [x] Validation logic

### Phase 2: React Frontend (1-2 days)
- [x] `useDashboardData` hook
- [x] ActiveStory, SprintPlan, Backlog components
- [x] DashboardLayout grid + styling
- [x] Responsive design (desktop/mobile)

### Phase 3: Automation + Testing (0.5-1 day)
- [x] Git pre-commit hook setup
- [x] Hook validation script
- [x] Unit tests for parser
- [x] E2E test: save markdown → dashboard updates

### Phase 4: Obsidian Embedding (0.5 day)
- [x] iFrame embedding in Obsidian note
- [x] Optional: Obsidian plugin (deferred)

### Phase 5: Documentation + Deployment (0.5 day)
- [x] README (quickstart)
- [x] Hook setup script
- [x] Optional: Cloud Run deployment config

---

## 9. Success Criteria

### Must Have ✅
- Parse `Story_Map.md` without manual intervention
- Display active stories with role timeline
- Show sprint 01/02/03 progress
- Show backlog organized by phase
- File watcher auto-updates on save
- Git hook validates before commit
- Works in Obsidian as iFrame

### Nice to Have 🎁
- Click story → expand full details (AC, coverage, files)
- Dependency visualization (story A blocks B)
- Role-specific filter (show only BA stories)
- Burndown chart with historical trends
- Obsidian plugin (native integration)

### Out of Scope (Phase 11+)
- Manual story editing via dashboard
- Multi-tenant dashboard sharing
- Advanced analytics (velocity, cycle time)

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Markdown parser fragile (table format changes) | Use regex + unit tests; validate early |
| File watcher misses changes | Use chokidar + polling fallback; debounce |
| Git hook blocks commits (false positive) | Clear error messages; easy bypass with `--no-verify` |
| Obsidian iFrame sandbox restrictions | Test cross-origin requests early; fallback to static export |
| Frontend polling stale data | Use WebSocket/SSE for real-time; 2s polling fallback |

---

## 11. Open Questions Resolved

**Q: How to handle variant stories (US-103-v2)?**
A: Parser treats `-v2` as part of ID; same logic applies.

**Q: What if Story_Map.md is malformed?**
A: Watcher logs error, serves last-good cache, git hook rejects commit.

**Q: Can this work offline?**
A: Yes—file watcher works offline; dashboard serves from local cache.

**Q: How to share dashboard with team?**
A: Deploy backend to Cloud Run; embed same iFrame in shared note. (Future: auth layer)

---

## 12. References

- **Existing files:** `docs/project/Story_Map.md`, `docs/project/Sprint_Log.md`
- **Design system:** Shipper & Administrator Style Guide (Tailwind, Sora fonts)
- **FreightClub stack:** React 18, Vite, Tailwind, TypeScript
- **Related skill:** `writing-plans` (next step for implementation planning)

---

**Status:** ✅ APPROVED BY USER (2026-06-18)  
**Next Step:** Invoke `writing-plans` skill to create detailed implementation plan
