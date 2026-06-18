---
name: start-dashboard
description: Start the Agile Dashboard with one command. Automatically installs dependencies if needed, launches both backend (port 3001) and frontend (port 3000) servers in parallel, and opens the dashboard in your browser. Use this whenever you want to run the dashboard locally — saves time compared to manual npm install + npm run dev in two terminals.
---

# Start Agile Dashboard

Launch the Agile Dashboard backend and frontend servers with a single command. No need to open multiple terminals or remember npm commands.

## How to Use

When you want to run the dashboard, simply execute:

```bash
bash dashboard/scripts/start-dashboard/start.sh
```

Or from the dashboard directory:

```bash
bash scripts/start-dashboard/start.sh
```

## What Happens

1. **Check dependencies** — Verify node_modules exist in `dashboard/backend` and `dashboard/frontend`
2. **Install if needed** — Run `npm install` in either directory if packages are missing
3. **Start servers** — Launch both servers in parallel:
   - Backend: `npm run dev` in `dashboard/backend` (port 3001)
   - Frontend: `npm run dev` in `dashboard/frontend` (port 3000)
4. **Open browser** — Automatically navigate to http://localhost:3000
5. **Show status** — Display both server URLs and a command to stop if needed

## Server Status

After startup, you'll see:

```
✅ Backend server running on http://localhost:3001
✅ Frontend dashboard running on http://localhost:3000
🌐 Opening dashboard in browser...

To stop both servers, run:
  kill <PID1> <PID2>
```

## Stopping the Servers

The script outputs the process IDs (PIDs). To stop:

```bash
kill <PID1> <PID2>
```

Or use standard terminal shortcuts (Ctrl+C).

## File Watcher

The frontend runs in dev mode (via Vite) and watches for file changes. The backend watches Story_Map.md via Chokidar. Both will hot-reload on save — no restart needed.

## Troubleshooting

**"npm not found"**
- Ensure Node.js and npm are installed and in your PATH

**"Port already in use"**
- Another process is using port 3001 or 3000
- Kill the existing process

**Browser didn't open**
- Manually navigate to http://localhost:3000
- The servers are still running regardless
