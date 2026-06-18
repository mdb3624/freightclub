# FreightClub Agile Dashboard

Interactive web dashboard for tracking current work, sprint progress, and backlog in real-time.

## Prerequisites

- **Node.js** 16+ and npm
- **Story_Map.md** and **Sprint_Log.md** in `docs/project/` directory (source of truth)
- Git (for hooks setup)

## Setup Instructions

### 1. Backend Setup

```bash
cd dashboard/backend
npm install
npm run dev
```

Backend runs on **http://localhost:3001**

### 2. Frontend Setup (in a new terminal)

```bash
cd dashboard/frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

### 3. Git Hooks Setup (Optional)

Enable automatic dashboard updates on file changes:

```bash
bash dashboard/scripts/setup-hooks.sh
```

This configures Git hooks to trigger dashboard refresh when Story_Map.md or Sprint_Log.md are modified.

## Usage

### Dashboard URL

Open your browser to **http://localhost:3000**

### Features

- **Current Work** — Display active stories in progress with real-time status updates
- **Sprint Plan** — Visual sprint timeline with story distribution and velocity tracking
- **Backlog** — Organized view of upcoming work prioritized by phase and complexity
- **Auto-Refresh** — Dashboard automatically polls for file changes every 5 seconds (configurable)

### Auto-Refresh Behavior

The dashboard monitors `docs/project/Story_Map.md` and `docs/project/Sprint_Log.md` for changes. When either file is updated (via git commit or direct edit), the frontend automatically refreshes the data within 5 seconds without requiring a manual page reload.

## Obsidian Integration

Embed the dashboard in your Obsidian vault using an iframe:

```markdown
## Dashboard

<iframe 
  src="http://localhost:3000" 
  width="100%" 
  height="900px" 
  style="border: 1px solid #ddd; border-radius: 4px;">
</iframe>
```

Add this to any Obsidian note to view the dashboard alongside your documentation.

## File Structure

```
dashboard/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express server (port 3001)
│   │   ├── parser.ts           # Story_Map & Sprint_Log parser
│   │   ├── validate.ts         # Input validation
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── __tests__/
│   │       └── parser.test.ts  # Parser tests
│   ├── package.json
│   ├── tsconfig.json
│   └── dist/                   # Compiled output (generated)
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx            # React app entry
│   │   ├── App.tsx             # Main component
│   │   ├── components/
│   │   │   ├── CurrentWork.tsx # Active stories display
│   │   │   ├── SprintPlan.tsx  # Sprint visualization
│   │   │   ├── Backlog.tsx     # Backlog view
│   │   │   └── common/         # Shared UI components
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts  # API data fetching
│   │   └── styles/
│   │       └── index.css       # Tailwind styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── scripts/
│   └── setup-hooks.sh          # Git hooks installer
│
└── README.md                   # This file
```

## Testing

### Backend Tests

```bash
cd dashboard/backend
npm test
```

Runs Vitest suite covering:
- Story_Map.md parsing and validation
- Sprint_Log.md data extraction
- Error handling for malformed input

### Frontend Tests

```bash
cd dashboard/frontend
npm test
```

Runs unit tests for React components:
- CurrentWork display logic
- SprintPlan data visualization
- Backlog filtering and sorting

## Troubleshooting

### Git Hook Not Running?

**Problem:** Dashboard doesn't refresh after committing changes.

**Solution:**
```bash
# Re-run setup script
bash dashboard/scripts/setup-hooks.sh

# Verify hooks are installed
ls -la .git/hooks/ | grep -E 'post-commit|post-merge'
```

### Dashboard Not Updating?

**Problem:** Frontend shows stale data.

**Solution:**
1. Check backend is running: `curl http://localhost:3001/api/dashboard`
2. Verify Story_Map.md exists: `ls docs/project/Story_Map.md`
3. Refresh browser manually (Ctrl+R or Cmd+R)
4. Check browser console for errors (F12 → Console tab)

### Port Already in Use?

**Problem:** "Error: listen EADDRINUSE"

**Solution:**
```powershell
# Find process on port 3000 or 3001
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process by PID (replace <PID>)
taskkill //F //PID <PID>

# Or change port in source:
# Backend: src/server.ts line ~50
# Frontend: vite.config.ts port setting
```

### Files Not Being Recognized?

**Problem:** Parser error about missing Story_Map.md.

**Solution:**
- Ensure you're running commands from project root (where `docs/` folder exists)
- Check file paths:
  ```bash
  ls docs/project/Story_Map.md
  ls docs/project/Sprint_Log.md
  ```
- If files don't exist, create empty templates:
  ```bash
  touch docs/project/Story_Map.md
  echo "# Sprint Log" > docs/project/Sprint_Log.md
  ```

## Future Enhancements

1. **Phase Tracking** — Visualize phase completion across all active stories
2. **Team Capacity** — Display resource allocation and availability by role
3. **Risk Dashboard** — Highlight blocked stories and dependency chains
4. **Performance Analytics** — Track velocity trends, cycle time, and burndown
5. **Notification Center** — Alert on critical blockers and phase completions
6. **Export Reports** — Generate PDF sprint reports and retrospective summaries
7. **Dark Mode** — Theme toggle for reduced eye strain during late-night sprints
8. **Mobile Responsive** — Optimized layouts for tablet/mobile viewing

## Support

For issues, questions, or feature requests, see:
- **Dashboard Specification:** `docs/project/AGILE_DASHBOARD_SPEC.md`
- **Architecture:** Hexagonal architecture with Express (backend) and React (frontend)
- **Source of Truth:** `docs/project/Story_Map.md` (all stories), `docs/project/Sprint_Log.md` (sprint status)

---

**Status:** Production ready  
**Last Updated:** 2026-06-18  
**Maintainer:** FreightClub Engineering Team
