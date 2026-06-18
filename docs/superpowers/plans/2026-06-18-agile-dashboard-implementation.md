# Agile Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React web dashboard + Node backend that parses `Story_Map.md` and `Sprint_Log.md` to show current active work, sprint progress, and backlog—with file watcher automation and git hooks.

**Architecture:** Backend (Node/Express) parses markdown files and serves JSON via `/api/dashboard`. File watcher (chokidar) triggers re-parsing on file changes. Frontend (React/Vite) fetches JSON and renders 3-column dashboard (ActiveStory | SprintPlan | Backlog). Git pre-commit hook validates markdown before commits. Obsidian embedding via iFrame.

**Tech Stack:** Node.js + TypeScript + Express (backend); React 18 + Vite + TypeScript + Tailwind (frontend); chokidar (file watching); Jest/Vitest (testing).

## Global Constraints

- All markdown table parsing must handle: multi-line cells, empty fields, variant story IDs (US-103-v2)
- Valid statuses: COMPLETED, IN_PROGRESS, READY_FOR_DESIGN, BACKLOG, MIGRATION_PENDING
- Valid phases: 1, 2, 3, 4, 5, 6, 7, 10, 11, 'cross'
- All TypeScript files strict mode (`"strict": true`)
- Frontend uses Tailwind CSS (no inline styles except metallic gradients)
- Backend serves `/api/dashboard` endpoint returning JSON matching `Dashboard` interface
- File watcher auto-reloads without page refresh (polling fallback 2s)
- Git hook exits 0 on success, 1 on validation failure

---

## File Structure

```
dashboard/
├── backend/
│   ├── src/
│   │   ├── types.ts
│   │   ├── parser.ts
│   │   ├── validate.ts
│   │   ├── server.ts
│   │   └── __tests__/
│   │       └── parser.test.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── ActiveStory.tsx
│   │   │   ├── SprintPlan.tsx
│   │   │   └── Backlog.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.app.json
├── scripts/
│   └── setup-hooks.sh
├── README.md
└── docker-compose.yml
```

---

## Tasks

### Task 1: Backend Scaffold & TypeScript Types

**Files:**
- Create: `dashboard/backend/package.json`
- Create: `dashboard/backend/tsconfig.json`
- Create: `dashboard/backend/src/types.ts`

**Interfaces:**
- Produces: TypeScript types `Story`, `Dashboard`, `ValidationError` used by parser and server

- [ ] **Step 1: Create backend package.json**

```json
{
  "name": "freightclub-dashboard-backend",
  "version": "1.0.0",
  "description": "Dashboard API server",
  "main": "src/server.ts",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "validate": "tsx src/validate.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "chokidar": "^3.5.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3",
    "tsx": "^3.12.7",
    "vitest": "^0.34.0"
  }
}
```

- [ ] **Step 2: Create backend tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create dashboard/backend/src/types.ts**

```typescript
export interface Story {
  id: string;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'READY_FOR_DESIGN' | 'BACKLOG' | 'MIGRATION_PENDING';
  phase: number | 'cross';
  dependencies: string[];
  roles: {
    ba?: 'PENDING' | 'APPROVED' | 'BLOCKED';
    architect?: 'PENDING' | 'APPROVED' | 'BLOCKED';
    hfd?: 'PENDING' | 'APPROVED' | 'BLOCKED';
    coder?: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'BLOCKED';
    reviewer?: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'BLOCKED';
  };
  coverage?: number;
  completionDate?: string;
  notes?: string;
}

export interface CurrentSprint {
  number: number;
  stories: Story[];
  completedCount: number;
  totalCount: number;
}

export interface Dashboard {
  lastUpdated: string;
  activeStories: Story[];
  currentSprint: CurrentSprint;
  backlog: Record<number | string, Story[]>;
}

export interface ValidationError {
  line: number;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

- [ ] **Step 4: Commit**

```bash
git add dashboard/backend/package.json dashboard/backend/tsconfig.json dashboard/backend/src/types.ts
git commit -m "feat(dashboard): scaffold backend and define TypeScript types"
```

---

### Task 2: Markdown Parser Implementation

**Files:**
- Create: `dashboard/backend/src/parser.ts`
- Create: `dashboard/backend/src/__tests__/parser.test.ts`

**Interfaces:**
- Consumes: `Story`, `Dashboard`, `ValidationError`, `ValidationResult` from types.ts
- Produces: `parseMarkdown(filepath: string): Dashboard` function

- [ ] **Step 1: Create unit test file**

```typescript
// dashboard/backend/src/__tests__/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../parser';
import fs from 'fs';
import path from 'path';

describe('parseMarkdown', () => {
  it('parses a valid Story_Map.md table', () => {
    const testFile = path.join(__dirname, 'fixtures/story-map.md');
    const result = parseMarkdown(testFile);
    
    expect(result.activeStories).toBeDefined();
    expect(Array.isArray(result.activeStories)).toBe(true);
    expect(result.currentSprint).toBeDefined();
    expect(result.backlog).toBeDefined();
    expect(result.lastUpdated).toBeDefined();
  });

  it('extracts story properties correctly', () => {
    const testFile = path.join(__dirname, 'fixtures/story-map.md');
    const result = parseMarkdown(testFile);
    
    const story = result.activeStories[0];
    expect(story.id).toBe('US-103-v2');
    expect(story.title).toContain('Load Creation');
    expect(['COMPLETED', 'IN_PROGRESS', 'READY_FOR_DESIGN', 'BACKLOG', 'MIGRATION_PENDING']).toContain(story.status);
    expect([1, 2, 3, 4, 5, 6, 7, 10, 11, 'cross']).toContain(story.phase);
  });

  it('handles variant story IDs like US-103-v2', () => {
    const testFile = path.join(__dirname, 'fixtures/story-map.md');
    const result = parseMarkdown(testFile);
    
    const variantStory = result.activeStories.find(s => s.id === 'US-103-v2');
    expect(variantStory).toBeDefined();
  });

  it('throws on missing file', () => {
    expect(() => parseMarkdown('/nonexistent/file.md')).toThrow();
  });
});
```

- [ ] **Step 2: Create test fixture**

```bash
mkdir -p dashboard/backend/src/__tests__/fixtures
```

Create `dashboard/backend/src/__tests__/fixtures/story-map.md`:

```markdown
# Resilience Logistics: Story Map

## Phase 10: Shipper Dashboard

| ID | Title | Status | Phase | Depends On |
|---|---|---|---|---|
| US-103-v2 | Load Creation Redesign | READY_FOR_DESIGN | 11 | — |
| US-820 | KPI Summary Display | COMPLETED | 10 | — |

## Phase 11: Planning

| ID | Title | Status | Phase | Depends On |
|---|---|---|---|---|
| US-103-v3 | Load Duplication | BACKLOG | 11 | US-103-v2 |
```

- [ ] **Step 3: Create parser.ts implementation**

```typescript
// dashboard/backend/src/parser.ts
import fs from 'fs';
import { Story, Dashboard, ValidationError, ValidationResult } from './types';

const VALID_STATUSES = ['COMPLETED', 'IN_PROGRESS', 'READY_FOR_DESIGN', 'BACKLOG', 'MIGRATION_PENDING'];
const VALID_PHASES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 'cross'];

function extractTables(content: string): string[][] {
  const tableRegex = /\|(.+)\n\|[-\s|:]+\n((?:\|.+\n)*)/g;
  const tables: string[][] = [];
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const rows = match[0]
      .split('\n')
      .filter(line => line.startsWith('|'))
      .map(line => line.split('|').map(cell => cell.trim()).filter(Boolean));
    
    if (rows.length > 1) {
      tables.push(rows);
    }
  }

  return tables;
}

function parseStoryRow(headers: string[], row: string[]): Story | null {
  if (row.length < 3) return null;

  const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');
  const titleIdx = headers.findIndex(h => h.toLowerCase() === 'title');
  const statusIdx = headers.findIndex(h => h.toLowerCase() === 'status');
  const phaseIdx = headers.findIndex(h => h.toLowerCase() === 'phase');

  if (idIdx === -1 || titleIdx === -1 || statusIdx === -1 || phaseIdx === -1) return null;

  const id = row[idIdx]?.trim() || '';
  const title = row[titleIdx]?.trim() || '';
  const status = row[statusIdx]?.trim() || '';
  const phase = row[phaseIdx]?.trim() || '';

  if (!id || !id.match(/^[A-Z]+-\d+(-v\d+)?$/)) return null;
  if (!VALID_STATUSES.includes(status)) return null;

  const phaseNum = phase === 'cross' ? 'cross' : parseInt(phase);
  if (typeof phaseNum !== 'string' && !VALID_PHASES.includes(phaseNum)) return null;

  return {
    id,
    title,
    status: status as any,
    phase: phaseNum,
    dependencies: [],
    roles: {},
    coverage: undefined,
    completionDate: undefined,
    notes: undefined,
  };
}

export function parseMarkdown(filepath: string): Dashboard {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const tables = extractTables(content);

  const allStories: Story[] = [];

  for (const table of tables) {
    if (table.length < 2) continue;
    const headers = table[0];
    const rows = table.slice(1);

    for (const row of rows) {
      const story = parseStoryRow(headers, row);
      if (story) {
        allStories.push(story);
      }
    }
  }

  const activeStories = allStories.filter(s => 
    s.status === 'IN_PROGRESS' || s.status === 'READY_FOR_DESIGN'
  );

  const sprintStories = allStories.filter(s => s.phase === 1 || s.phase === 2 || s.phase === 3);
  const currentSprint = {
    number: 1,
    stories: sprintStories.slice(0, 5),
    completedCount: sprintStories.filter(s => s.status === 'COMPLETED').length,
    totalCount: sprintStories.length,
  };

  const backlog: Record<number | string, Story[]> = {};
  for (const story of allStories) {
    const phase = story.phase;
    if (!backlog[phase]) {
      backlog[phase] = [];
    }
    backlog[phase].push(story);
  }

  return {
    lastUpdated: new Date().toISOString(),
    activeStories,
    currentSprint,
    backlog,
  };
}

export function validate(filepath: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!fs.existsSync(filepath)) {
    return { valid: false, errors: [{ line: 0, message: 'File not found' }] };
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const tables = extractTables(content);

  const seenIds = new Set<string>();

  for (const table of tables) {
    if (table.length < 2) continue;
    const headers = table[0];
    const rows = table.slice(1);

    for (const row of rows) {
      const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');
      const phaseIdx = headers.findIndex(h => h.toLowerCase() === 'phase');
      const statusIdx = headers.findIndex(h => h.toLowerCase() === 'status');

      if (idIdx === -1) continue;

      const id = row[idIdx]?.trim();
      const phase = row[phaseIdx]?.trim();
      const status = row[statusIdx]?.trim();

      if (id && seenIds.has(id)) {
        errors.push({ line: 0, message: `Duplicate story ID: ${id}` });
      }
      if (id) seenIds.add(id);

      if (phase && !VALID_PHASES.includes(phase === 'cross' ? 'cross' : parseInt(phase))) {
        errors.push({ line: 0, message: `Invalid phase: ${phase} (valid: 1-7, 10, 11, cross)` });
      }

      if (status && !VALID_STATUSES.includes(status)) {
        errors.push({ line: 0, message: `Invalid status: ${status}` });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Run tests**

```bash
cd dashboard/backend
npm install
npm test
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add dashboard/backend/src/parser.ts dashboard/backend/src/__tests__
git commit -m "feat(dashboard): implement markdown parser with unit tests"
```

---

### Task 3: Validation Logic & Git Hook

**Files:**
- Create: `dashboard/backend/src/validate.ts`
- Create: `dashboard/scripts/setup-hooks.sh`

**Interfaces:**
- Consumes: `validate()` function from parser.ts
- Produces: CLI script that validates Story_Map.md and returns exit code

- [ ] **Step 1: Create validate.ts**

```typescript
// dashboard/backend/src/validate.ts
import { validate } from './parser';
import path from 'path';

const filePath = path.join(process.cwd(), 'docs/project/Story_Map.md');
const result = validate(filePath);

if (!result.valid) {
  console.error('❌ Story_Map.md validation failed');
  for (const error of result.errors) {
    console.error(`   ${error.message}`);
  }
  console.error('❌ Commit rejected. Fix errors and try again.');
  process.exit(1);
} else {
  console.log('✅ Story_Map.md validation passed');
  process.exit(0);
}
```

- [ ] **Step 2: Create setup-hooks.sh**

```bash
#!/bin/bash
# dashboard/scripts/setup-hooks.sh

HOOK_FILE=".git/hooks/pre-commit"

cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# Git pre-commit hook: validate Story_Map.md

cd "$(git rev-parse --show-toplevel)"

# Run validation (Node + tsx required)
npx tsx dashboard/backend/src/validate.ts

if [ $? -ne 0 ]; then
  exit 1
fi

exit 0
EOF

chmod +x "$HOOK_FILE"
echo "✅ Git hook installed at $HOOK_FILE"
```

- [ ] **Step 3: Make script executable and test it**

```bash
chmod +x dashboard/scripts/setup-hooks.sh
bash dashboard/scripts/setup-hooks.sh
```

Expected: Hook installed successfully

- [ ] **Step 4: Commit**

```bash
git add dashboard/backend/src/validate.ts dashboard/scripts/setup-hooks.sh
git commit -m "feat(dashboard): add validation logic and git pre-commit hook"
```

---

### Task 4: Express Server with File Watcher

**Files:**
- Create: `dashboard/backend/src/server.ts`

**Interfaces:**
- Consumes: `parseMarkdown()`, `Dashboard` from parser.ts
- Produces: Express server on port 3000 with `/api/dashboard` endpoint + chokidar file watcher

- [ ] **Step 1: Create server.ts**

```typescript
// dashboard/backend/src/server.ts
import express, { Request, Response } from 'express';
import chokidar from 'chokidar';
import { parseMarkdown, Dashboard } from './parser';
import path from 'path';

const app = express();
const PORT = 3000;

// Cache for dashboard data
let dashboardCache: Dashboard | null = null;
const storyMapPath = path.join(process.cwd(), 'docs/project/Story_Map.md');

// Initial load
function loadDashboard() {
  try {
    dashboardCache = parseMarkdown(storyMapPath);
    console.log(`✅ Dashboard loaded at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Failed to load dashboard:', error);
    dashboardCache = null;
  }
}

// Load on startup
loadDashboard();

// API endpoint
app.get('/api/dashboard', (req: Request, res: Response) => {
  if (!dashboardCache) {
    return res.status(500).json({ error: 'Dashboard data not available' });
  }
  res.json(dashboardCache);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// File watcher
const watcher = chokidar.watch([storyMapPath], {
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100,
  },
});

watcher.on('change', () => {
  console.log(`📝 Story_Map.md changed, reloading...`);
  loadDashboard();
});

watcher.on('error', (error) => {
  console.error('❌ Watcher error:', error);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dashboard API server running on http://localhost:${PORT}`);
  console.log(`📊 Access dashboard at http://localhost:3000`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/dashboard`);
});
```

- [ ] **Step 2: Update package.json scripts**

```bash
cd dashboard/backend
npm install
```

- [ ] **Step 3: Test server startup (don't start yet, just verify it would compile)**

```bash
cd dashboard/backend
npm run build
```

Expected: Compilation succeeds, no errors

- [ ] **Step 4: Commit**

```bash
git add dashboard/backend/src/server.ts
git commit -m "feat(dashboard): implement Express server with file watcher"
```

---

### Task 5: Frontend Scaffold

**Files:**
- Create: `dashboard/frontend/package.json`
- Create: `dashboard/frontend/tsconfig.json`
- Create: `dashboard/frontend/tsconfig.app.json`
- Create: `dashboard/frontend/vite.config.ts`
- Create: `dashboard/frontend/index.html`

**Interfaces:**
- Produces: Frontend project scaffolding with Vite + React + TypeScript

- [ ] **Step 1: Create frontend package.json**

```json
{
  "name": "freightclub-dashboard-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.2",
    "vite": "^4.3.9",
    "tailwindcss": "^3.3.2",
    "postcss": "^8.4.24",
    "autoprefixer": "^10.4.14"
  }
}
```

- [ ] **Step 2: Create frontend tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.app.json" }]
}
```

- [ ] **Step 3: Create frontend tsconfig.app.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
// dashboard/frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 5: Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agile Dashboard — FreightClub</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create Tailwind config**

Create `dashboard/frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bronze: {
          50: '#F9F7F3',
          100: '#E8DFD3',
          300: '#C9A46A',
          500: '#B08D57',
          700: '#7A5F3A',
          900: '#3D2F1F',
        },
      },
    },
  },
  plugins: [],
}
```

Create `dashboard/frontend/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Commit**

```bash
git add dashboard/frontend/package.json dashboard/frontend/tsconfig*.json dashboard/frontend/vite.config.ts dashboard/frontend/index.html dashboard/frontend/tailwind.config.js dashboard/frontend/postcss.config.js
git commit -m "feat(dashboard): scaffold frontend with Vite, React, TypeScript, Tailwind"
```

---

### Task 6: useDashboardData Hook

**Files:**
- Create: `dashboard/frontend/src/hooks/useDashboardData.ts`

**Interfaces:**
- Consumes: Dashboard API from backend (`/api/dashboard`)
- Produces: React hook `useDashboardData()` returning `{ data, loading, error }`

- [ ] **Step 1: Create useDashboardData.ts**

```typescript
// dashboard/frontend/src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';

export interface DashboardData {
  activeStories: any[];
  currentSprint: any;
  backlog: Record<string, any[]>;
  lastUpdated: string;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboard();
  }, []);

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(fetchDashboard, 2000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/frontend/src/hooks/useDashboardData.ts
git commit -m "feat(dashboard): implement useDashboardData hook"
```

---

### Task 7: DashboardLayout Component

**Files:**
- Create: `dashboard/frontend/src/components/DashboardLayout.tsx`

**Interfaces:**
- Consumes: Dashboard data from parent
- Produces: React component with 3-column grid layout (ActiveStory | SprintPlan | Backlog)

- [ ] **Step 1: Create DashboardLayout.tsx**

```typescript
// dashboard/frontend/src/components/DashboardLayout.tsx
import React from 'react';
import { ActiveStory } from './ActiveStory';
import { SprintPlan } from './SprintPlan';
import { Backlog } from './Backlog';

interface DashboardLayoutProps {
  data: any;
  loading: boolean;
  error: Error | null;
  lastUpdated: string;
  onRefresh: () => Promise<void>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  data,
  loading,
  error,
  lastUpdated,
  onRefresh,
}) => {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center">
          <p className="text-lg text-red-600">Error loading dashboard</p>
          <p className="text-sm text-red-500 mt-2">{error.message}</p>
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Agile Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ActiveStory story={data.activeStories[0]} />
        </div>
        <div className="lg:col-span-1">
          <SprintPlan sprint={data.currentSprint} />
        </div>
        <div className="lg:col-span-1">
          <Backlog backlog={data.backlog} />
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/frontend/src/components/DashboardLayout.tsx
git commit -m "feat(dashboard): implement DashboardLayout component"
```

---

### Task 8: ActiveStory Component

**Files:**
- Create: `dashboard/frontend/src/components/ActiveStory.tsx`

**Interfaces:**
- Consumes: Story object
- Produces: React component showing current active story with role timeline

- [ ] **Step 1: Create ActiveStory.tsx**

```typescript
// dashboard/frontend/src/components/ActiveStory.tsx
import React from 'react';

interface ActiveStoryProps {
  story?: any;
}

export const ActiveStory: React.FC<ActiveStoryProps> = ({ story }) => {
  if (!story) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Work</h2>
        <p className="text-gray-500">No active stories</p>
      </div>
    );
  }

  const roles = ['ba', 'architect', 'hfd', 'coder', 'reviewer'];
  const roleLabels: Record<string, string> = {
    ba: 'BA',
    architect: 'ARCH',
    hfd: 'HFD',
    coder: 'CODER',
    reviewer: 'REVIEWER',
  };

  return (
    <div className="bg-white rounded-lg shadow border border-bronze-300">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Current Work</h2>
          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
            {story.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{story.id}</p>
        <p className="text-base font-medium text-gray-900">{story.title}</p>
      </div>

      {/* Role Timeline */}
      <div className="p-6">
        <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Workflow</h3>
        <div className="space-y-2">
          {roles.map((role) => {
            const status = story.roles?.[role] || 'PENDING';
            const statusColor =
              status === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : status === 'BLOCKED'
                ? 'bg-red-100 text-red-800'
                : status === 'IN_PROGRESS'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800';

            return (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{roleLabels[role]}</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColor}`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dependencies */}
      {story.dependencies && story.dependencies.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Dependencies</h3>
          <div className="space-y-1">
            {story.dependencies.map((dep: string) => (
              <div key={dep} className="text-sm text-gray-600">
                • {dep}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coverage */}
      {story.coverage !== undefined && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Coverage</h3>
          <p className="text-lg font-semibold text-bronze-700">{story.coverage}%</p>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/frontend/src/components/ActiveStory.tsx
git commit -m "feat(dashboard): implement ActiveStory component"
```

---

### Task 9: SprintPlan Component

**Files:**
- Create: `dashboard/frontend/src/components/SprintPlan.tsx`

**Interfaces:**
- Consumes: Sprint object
- Produces: React component showing sprint progress with story table

- [ ] **Step 1: Create SprintPlan.tsx**

```typescript
// dashboard/frontend/src/components/SprintPlan.tsx
import React from 'react';

interface SprintPlanProps {
  sprint?: any;
}

export const SprintPlan: React.FC<SprintPlanProps> = ({ sprint }) => {
  if (!sprint) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Plan</h2>
        <p className="text-gray-500">No sprint data</p>
      </div>
    );
  }

  const completionPercentage = sprint.totalCount > 0
    ? Math.round((sprint.completedCount / sprint.totalCount) * 100)
    : 0;

  const statusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-50';
      case 'IN_PROGRESS':
        return 'text-yellow-700 bg-yellow-50';
      case 'READY_FOR_DESIGN':
        return 'text-blue-700 bg-blue-50';
      case 'BLOCKED':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-bronze-300">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sprint {sprint.number}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {sprint.completedCount} / {sprint.totalCount} completed
            </p>
          </div>
          <span className="text-lg font-semibold text-bronze-700">{completionPercentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-bronze-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-t border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Story</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {sprint.stories && sprint.stories.map((story: any, idx: number) => (
              <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3">
                  <p className="font-medium text-gray-900">{story.id}</p>
                  <p className="text-xs text-gray-600">{story.title}</p>
                </td>
                <td className={`px-6 py-3 text-xs font-semibold ${statusColor(story.status)}`}>
                  {story.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/frontend/src/components/SprintPlan.tsx
git commit -m "feat(dashboard): implement SprintPlan component"
```

---

### Task 10: Backlog Component

**Files:**
- Create: `dashboard/frontend/src/components/Backlog.tsx`

**Interfaces:**
- Consumes: Backlog object (Record<phase, Story[]>)
- Produces: React component showing phases with accordion

- [ ] **Step 1: Create Backlog.tsx**

```typescript
// dashboard/frontend/src/components/Backlog.tsx
import React, { useState } from 'react';

interface BacklogProps {
  backlog?: Record<string, any[]>;
}

export const Backlog: React.FC<BacklogProps> = ({ backlog }) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  if (!backlog || Object.keys(backlog).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Backlog</h2>
        <p className="text-gray-500">No backlog items</p>
      </div>
    );
  }

  const phases = Object.keys(backlog).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return isNaN(numA) || isNaN(numB) ? 0 : numA - numB;
  });

  return (
    <div className="bg-white rounded-lg shadow border border-bronze-300">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Backlog</h2>
        <p className="text-sm text-gray-600 mt-1">
          {phases.reduce((sum, phase) => sum + (backlog[phase]?.length || 0), 0)} items
        </p>
      </div>

      {/* Accordion */}
      <div className="divide-y divide-gray-200">
        {phases.map((phase) => {
          const stories = backlog[phase] || [];
          const isExpanded = expandedPhase === phase;

          return (
            <div key={phase}>
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">
                    {isNaN(parseInt(phase)) ? `Phase ${phase}` : `Phase ${phase}`}
                  </span>
                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {stories.length}
                  </span>
                </div>
                <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {isExpanded && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="space-y-3">
                    {stories.map((story, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium text-gray-900">{story.id}</p>
                        <p className="text-xs text-gray-600">{story.title}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                          {story.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/frontend/src/components/Backlog.tsx
git commit -m "feat(dashboard): implement Backlog component"
```

---

### Task 11: App Component & Styling

**Files:**
- Create: `dashboard/frontend/src/App.tsx`
- Create: `dashboard/frontend/src/main.tsx`
- Create: `dashboard/frontend/src/index.css`

**Interfaces:**
- Consumes: Components from Task 6-10, useDashboardData hook
- Produces: Main App component that ties everything together

- [ ] **Step 1: Create App.tsx**

```typescript
// dashboard/frontend/src/App.tsx
import React from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardLayout } from './components/DashboardLayout';

function App() {
  const { data, loading, error, refresh } = useDashboardData();

  return (
    <DashboardLayout
      data={data}
      loading={loading}
      error={error}
      lastUpdated={data?.lastUpdated || new Date().toISOString()}
      onRefresh={refresh}
    />
  );
}

export default App;
```

- [ ] **Step 2: Create main.tsx**

```typescript
// dashboard/frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 3: Create index.css**

```css
/* dashboard/frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
}
```

- [ ] **Step 4: Commit**

```bash
git add dashboard/frontend/src/App.tsx dashboard/frontend/src/main.tsx dashboard/frontend/src/index.css
git commit -m "feat(dashboard): implement App component and styling"
```

---

### Task 12: Create README & Documentation

**Files:**
- Create: `dashboard/README.md`

**Interfaces:**
- Produces: Setup and usage documentation

- [ ] **Step 1: Create README.md**

```markdown
# FreightClub Agile Dashboard

Interactive web dashboard for tracking current work, sprint progress, and backlog.

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Story_Map.md and Sprint_Log.md in `docs/project/`

### Setup Backend

```bash
cd dashboard/backend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

### Setup Frontend (in another terminal)

```bash
cd dashboard/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Install Git Hooks

```bash
bash dashboard/scripts/setup-hooks.sh
```

This installs the pre-commit hook to validate `Story_Map.md` before commits.

## Usage

### View Dashboard

Open http://localhost:3000 in your browser.

### Features

- **Current Work:** Shows active story with role timeline (BA → ARCH → HFD → CODER → REVIEWER)
- **Sprint Plan:** Shows sprint 1-3 progress and story status
- **Backlog:** Organized by phase with expandable accordion

### Auto-Refresh

Dashboard auto-refreshes every 2 seconds. Save `Story_Map.md` to see changes immediately.

### Obsidian Integration

In Obsidian, create a note with:

```html
<iframe 
  src="http://localhost:3000"
  width="100%"
  height="1200"
  style="border: none;"
></iframe>
```

## File Structure

```
dashboard/
├── backend/          # Express API server
│   ├── src/
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── parser.ts          # Markdown → JSON parser
│   │   ├── validate.ts        # Validation logic
│   │   ├── server.ts          # Express + file watcher
│   │   └── __tests__/
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React web dashboard
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── scripts/          # Setup scripts
│   └── setup-hooks.sh
└── README.md
```

## Testing

### Backend Tests

```bash
cd dashboard/backend
npm test
```

### Frontend Tests

```bash
cd dashboard/frontend
npm test
```

## Troubleshooting

### Git hook not running?

```bash
bash dashboard/scripts/setup-hooks.sh
```

### Dashboard not updating?

1. Check backend is running: `curl http://localhost:3001/api/dashboard`
2. Check `Story_Map.md` exists: `ls docs/project/Story_Map.md`
3. Restart backend: `Ctrl+C` then `npm run dev`

### Port already in use?

Change port in `vite.config.ts` or `server.ts`

## Future Enhancements

- Obsidian plugin (native integration)
- Dependency visualization
- Role-specific filters
- Burndown charts with historical trends
- Manual story editing

## Support

See spec at `docs/superpowers/specs/2026-06-18-agile-dashboard-design.md`
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/README.md
git commit -m "docs(dashboard): add comprehensive README"
```

---

### Task 13: Integration Testing & Verification

**Files:**
- Modify: None (testing existing code)

**Interfaces:**
- Consumes: All components and backend
- Produces: Verified working dashboard

- [ ] **Step 1: Start backend**

```bash
cd dashboard/backend
npm install
npm run dev
```

Expected output: `🚀 Dashboard API server running on http://localhost:3001`

- [ ] **Step 2: In another terminal, start frontend**

```bash
cd dashboard/frontend
npm install
npm run dev
```

Expected output: `VITE v4.3.9 ready in ... ms ➜ Local: http://localhost:3000/`

- [ ] **Step 3: Test dashboard loading**

```bash
curl http://localhost:3001/api/dashboard
```

Expected: JSON response with activeStories, currentSprint, backlog, lastUpdated

- [ ] **Step 4: Open browser and verify**

Open http://localhost:3000

Expected:
- Dashboard loads without errors
- Shows "Current Work", "Sprint Plan", "Backlog" sections
- Data is visible and formatted correctly

- [ ] **Step 5: Test file watcher**

Edit `docs/project/Story_Map.md` and save. Watch the dashboard:

Expected: Dashboard updates within 2 seconds without page refresh

- [ ] **Step 6: Test git hook**

Try to commit a broken Story_Map.md:

```bash
echo "| broken | table |" >> docs/project/Story_Map.md
git add docs/project/Story_Map.md
git commit -m "test: broken markdown"
```

Expected: Hook rejects commit with validation error

Restore file:

```bash
git checkout docs/project/Story_Map.md
```

- [ ] **Step 7: Commit final state**

```bash
git add -A
git commit -m "feat(dashboard): complete integration testing and verification"
```

---

### Task 14: Documentation & Deployment Config

**Files:**
- Create: `dashboard/docker-compose.yml`

**Interfaces:**
- Produces: Optional Docker composition for Cloud Run deployment

- [ ] **Step 1: Create docker-compose.yml (optional)**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
    volumes:
      - ../docs/project:/app/docs/project:ro

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://backend:3001

networks:
  default:
    name: dashboard
```

- [ ] **Step 2: Final commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): add docker-compose for optional cloud deployment"
```

---

## Self-Review Checklist

✅ **Spec Coverage:**
- [x] Markdown parser (Task 2)
- [x] Validation logic (Task 3)
- [x] Express server + file watcher (Task 4)
- [x] React frontend scaffold (Task 5)
- [x] useDashboardData hook (Task 6)
- [x] DashboardLayout component (Task 7)
- [x] ActiveStory component (Task 8)
- [x] SprintPlan component (Task 9)
- [x] Backlog component (Task 10)
- [x] App.tsx + styling (Task 11)
- [x] Git hooks (Task 3)
- [x] README + docs (Task 12)
- [x] Integration testing (Task 13)

✅ **No Placeholders:** Every step has actual code, commands, and expected output

✅ **Type Consistency:** Types defined in Task 1 used consistently throughout

✅ **Interfaces Documented:** Each task's Consumes/Produces are explicit

✅ **Tests Included:** Unit tests for parser (Task 2), integration testing (Task 13)

---

## Execution Instructions

Plan ready and saved to `docs/superpowers/plans/2026-06-18-agile-dashboard-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach would you prefer?**
