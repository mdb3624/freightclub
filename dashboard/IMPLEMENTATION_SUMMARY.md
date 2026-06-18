# Agile Dashboard — Implementation Summary

## Project Overview

The FreightClub Agile Dashboard is an interactive real-time web application for tracking sprint progress, backlog prioritization, and active work across the Resilience Logistics Platform. It provides a centralized view for engineering teams to monitor story status, phase completion, and project velocity without requiring constant context-switching between documentation files.

Built as a standalone Node.js + React application, the dashboard parses and visualizes `Story_Map.md` and `Sprint_Log.md` from the main project repository, enabling live updates whenever these files change.

## Architecture

**Frontend:** React 18 (TypeScript) + Vite + Tailwind CSS  
**Backend:** Express.js (TypeScript) + Node.js 16+  
**Data Source:** Git-tracked markdown files (`docs/project/Story_Map.md`, `docs/project/Sprint_Log.md`)  
**Communication:** REST API over HTTP  
**Polling Strategy:** 5-second auto-refresh interval for file change detection  

The dashboard follows a hexagonal architecture pattern:
- **Backend** handles file parsing, validation, and API routes
- **Frontend** consumes the API and renders interactive components
- **Git Hooks** (optional) trigger dashboard refresh on file commits

## File Structure

```
dashboard/
├── backend/
│   ├── src/
│   │   ├── server.ts                 # Express server (port 3001)
│   │   ├── parser.ts                 # Markdown parser for Story_Map & Sprint_Log
│   │   ├── validate.ts               # Input validation logic
│   │   ├── types.ts                  # TypeScript interfaces
│   │   └── __tests__/
│   │       └── parser.test.ts        # Parser unit tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile                    # (Future) Container image
│   └── dist/                         # Compiled output
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                  # React app entry
│   │   ├── App.tsx                   # Main component
│   │   ├── components/
│   │   │   ├── CurrentWork.tsx       # Active stories view
│   │   │   ├── SprintPlan.tsx        # Sprint timeline
│   │   │   ├── Backlog.tsx           # Backlog prioritization
│   │   │   └── common/               # Shared UI components
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts   # API integration hook
│   │   └── styles/
│   │       └── index.css             # Tailwind styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── scripts/
│   └── setup-hooks.sh                # Git hooks auto-installer
│
├── docker-compose.yml                # (Optional) Containerized deployment
├── README.md                         # User guide & troubleshooting
├── IMPLEMENTATION_SUMMARY.md         # This file
└── TESTING_SUMMARY.md                # Test results & coverage
```

## How to Run Locally

### Prerequisites
- Node.js 16+ and npm
- `docs/project/Story_Map.md` and `docs/project/Sprint_Log.md` (source files)
- Git (optional, for hooks setup)

### Backend Startup

```powershell
cd dashboard/backend
npm install
npm run dev
# Server runs on http://localhost:3001
```

### Frontend Startup (new terminal)

```powershell
cd dashboard/frontend
npm install
npm run dev
# Dashboard runs on http://localhost:3000
```

### Optional: Git Hooks (auto-refresh)

```bash
bash dashboard/scripts/setup-hooks.sh
```

Enables automatic dashboard refresh when `Story_Map.md` or `Sprint_Log.md` are committed.

## Testing Status

### Backend Tests
```powershell
cd dashboard/backend
npm test
```
- **Coverage:** Parser validation, error handling, markdown format compliance
- **Framework:** Vitest
- **Status:** All tests passing (as of 2026-06-18)

### Frontend Tests
```powershell
cd dashboard/frontend
npm test
```
- **Coverage:** Component rendering, data binding, state management
- **Framework:** Vitest + React Testing Library
- **Status:** All tests passing (as of 2026-06-18)

### Integration Testing
Verified:
- Backend API responds correctly to `/api/dashboard` requests
- Frontend fetches and renders data without errors
- Auto-refresh mechanism polls Story_Map.md at 5-second intervals
- Manual refresh works via browser reload

## Known Limitations

### 1. Story_Map.md Formatting
The parser is sensitive to markdown heading structure. Required format:
```markdown
# Phase X: Phase Name

## Story: US-XXX — Story Title
- Status: [status]
- ...
```

**Issue:** Inconsistent formatting (extra spaces, missing hyphens, typos) causes parse errors.  
**Workaround:** Use the `docs/project/Story_Map.md` template as reference when adding stories.

### 2. Sprint_Log.md Date Parsing
Sprint log entries must follow the format:
```
## [YYYY-MM-DD] — Sprint Name
```

Missing or malformed dates cause entries to be skipped.

### 3. Real-Time Sync Latency
File changes are polled every 5 seconds. Expect up to 5-second delay between file commit and dashboard update.

### 4. No Multi-Tenant Support
Dashboard is single-project only. To track multiple projects, run separate instances on different ports.

### 5. No Authentication
Dashboard is designed for internal team use only. Restrict access to private networks or VPNs.

## Future Enhancements

1. **Phase Completion Metrics** — Calculate percentage of phase completion based on story status distribution
2. **Team Capacity Planning** — Display resource allocation by role (ARCHITECT, CODER, REVIEWER, BA, HFD, LIBRARIAN)
3. **Risk & Blockers Dashboard** — Highlight CHG-### change requests and blocker dependencies
4. **Velocity Analytics** — Track sprint velocity trends and cycle time per story
5. **Notification System** — Alerts on critical blockers, phase completions, and team comments
6. **PDF Export** — Generate sprint reports and retrospective summaries
7. **Dark Mode** — Theme toggle for accessibility
8. **Mobile Responsive Design** — Tablet/mobile optimizations for on-the-go monitoring
9. **Database Persistence** — Archive historical sprint data for trend analysis
10. **Slack Integration** — Post dashboard updates to team channels

## Docker Deployment (Future)

A `docker-compose.yml` is provided for containerized deployment to Cloud Run:

```bash
docker-compose up --build
```

Services:
- **Backend:** Runs on port 3001 inside container, mounts `docs/project/` read-only
- **Frontend:** Runs on port 3000, connects to backend via internal network

**Note:** Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile`) are not yet created — this is a template for future deployment work.

## Support

- **Setup Questions:** See [README.md](./README.md) Troubleshooting section
- **Dashboard Spec:** [docs/project/AGILE_DASHBOARD_SPEC.md](../docs/project/AGILE_DASHBOARD_SPEC.md)
- **Story Tracking:** [docs/project/Story_Map.md](../docs/project/Story_Map.md) — source of truth
- **Sprint Status:** [docs/project/Sprint_Log.md](../docs/project/Sprint_Log.md) — current phase updates

---

**Status:** Production Ready  
**Last Updated:** 2026-06-18  
**Maintainer:** FreightClub Engineering Team  
**Git Repo:** https://github.com/freight-club/freightclub
