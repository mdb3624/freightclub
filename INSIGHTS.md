# Claude Code Insights

**27 sessions total · 23 analyzed · 218 messages · 73h · 3 commits**
2026-03-10 to 2026-03-28

---

## At a Glance

**What's working:** You've built a solid rhythm using Claude as a full-stack operations partner — managing your FreightClub app lifecycle, debugging cross-stack issues, and even creatively applying it to organize and analyze your medical records. Your disciplined approach to feature work (reverting messy changes, branching cleanly, researching before coding) shows a mature workflow that gets real value from Claude's multi-file editing and debugging strengths.

**What's hindering you:** On Claude's side, it frequently chases complex explanations (deep auth logic, CORS rabbit holes) before checking the obvious stuff like a wrong port number or missing config entry — costing you real time. On your side, the Windows/bash environment creates recurring startup pain that Claude has to re-discover every session, and tasks sometimes hit tool limitations (PDF reading, localhost access) that could be caught upfront.

**Quick wins to try:** Create a custom skill that encodes your exact FreightClub startup and restart sequence — you're already halfway there with /restart, but a comprehensive one covering the known Windows gotchas (JAVA_HOME, port conflicts, locked JARs) would eliminate your most common friction. Also try headless mode for your documentation updates and summaries, which are routine enough to run non-interactively.

**Ambitious workflows:** As models get more capable, imagine a self-healing startup agent that autonomously detects and fixes port conflicts, stale processes, and config issues before you even start working — eliminating your biggest time sink. Beyond that, parallel sub-agents could turn multi-session features like trucker load management into a single coordinated push, with separate agents handling backend, frontend, and tests simultaneously.

---

## Project Areas

| Area | Sessions |
|------|----------|
| FreightClub Application Development | 10 |
| Application Stack Management & Debugging | 7 |
| Documentation & Project Planning | 5 |
| Medical Records Organization & Analysis | 3 |
| Tailscale & Infrastructure Setup | 2 |

### FreightClub Application Development (10 sessions)
Building out features for a trucking load-board web application using Java backend and TypeScript/React frontend. Work included implementing shipper load management, trucker landing pages, account/profile features, security fixes (Phase 1.2), CORS resolution, and UI changes like dimension fields and dark theming.

### Application Stack Management & Debugging (7 sessions)
Starting, restarting, and troubleshooting the FreightClub development stack. Recurring friction included Windows/bash shell incompatibilities, port conflicts, locked JAR files, Vite proxy misconfigurations, and schema validation errors.

### Documentation & Project Planning (5 sessions)
Creating and updating project documentation including CLAUDE.md, FEATURES.md, gap analyses, and skill documentation. Claude also researched best practices for shipper load management and generated PDFs from markdown files.

### Medical Records Organization & Analysis (3 sessions)
Inventorying and organizing personal medical files into a structured hierarchy, summarizing medical records, and analyzing patterns related to a frozen shoulder condition.

### Tailscale & Infrastructure Setup (2 sessions)
Installing and configuring Tailscale Funnel to expose the local FreightClub app publicly. Debugging involved proxy port mismatches, IPv4/IPv6 issues, and Vite allowedHosts configuration.

---

## How You Work

You use Claude Code primarily as an **operations and debugging partner** for your FreightClub trucking application, frequently asking it to start services, fix login issues, and troubleshoot environment problems. Your interaction style is **hands-on and iterative** — you tend to give high-level goals like "start the app" or "fix login" and let Claude investigate, but you're working in a **challenging Windows/bash environment** that generates significant friction.

19 instances of Claude taking the wrong approach suggest you often have to wait through multiple failed attempts before reaching a solution — like when Claude spent time investigating DB auth logic before finding a simple Vite proxy port mismatch, or when it tried Edge headless for PDF generation before switching to md-to-pdf.

**Tool usage:** Bash dominated at 295 calls vs Edit at 88, confirming that most time is spent on environment wrangling and debugging rather than shipping features.

---

## Impressive Things You Did

### Full-Stack App Operations Management
You've built a strong workflow around managing your entire FreightClub stack through Claude Code — from killing processes and rebuilding backends to fixing CORS, proxy configs, and Tailscale exposure. You persistently work through startup issues and have developed repeatable patterns like the /restart skill.

### Methodical Feature Development Process
You take a disciplined approach to feature work — reverting incomplete changes, creating clean feature branches, researching best practices before coding, and maintaining thorough documentation with gap analyses and FEATURES.md updates. Your Phase 1.2 security work showed a mature development cycle with all 109 tests passing.

### Medical Records Organization & Analysis
You creatively used Claude Code beyond software development to inventory, organize, and analyze your personal medical files into structured folder hierarchies, then identify health patterns and explore treatment options for your frozen shoulder.

---

## Where Things Go Wrong

### Repeated Backend Startup Failures on Windows
You hit the same Windows/shell compatibility issues across many sessions — JAVA_HOME problems, PowerShell execution policy, mvnw wrapper failures, locked JAR files, and port conflicts.

**Examples:**
- Backend failed to start across multiple sessions due to JAVA_HOME, PowerShell policy, and shell compatibility issues on Windows
- Claude could not kill a locked Java process from its shell, forcing you to manually intervene

### Wrong Debugging Direction Before Finding Simple Root Causes
Claude frequently investigated complex possibilities (DB auth logic, CORS deep-dives) before discovering the actual issue was something straightforward like a wrong port number or a missing config entry.

**Examples:**
- Claude spent time investigating DB users and auth logic before finding the real issue was a misconfigured Vite proxy port (8081 vs 9090)
- Multiple rounds of SSH troubleshooting occurred before Claude suggested HTTPS, which was already mentioned in the original error message

### Tool and Environment Capability Mismatches
Tasks occasionally hit dead ends when Claude is asked to read certain file formats, access localhost URLs, or interact with running GUI applications.

**Examples:**
- Claude couldn't read an echocardiogram PDF due to missing poppler dependency — and the file wasn't an echocardiogram anyway (it was a B12 lab result)
- PDF generation failed silently with Edge headless, then had page-break clipping issues, requiring multiple tool switches before settling on md-to-pdf

---

## Suggestions

### CLAUDE.md Additions

**1. FreightClub Stack Startup**
```markdown
## FreightClub Stack Startup
- Backend runs on port 9090 (not 8081). Vite proxy must target http://localhost:9090.
- Always add `allowedHosts` in `vite.config.ts` when exposing via Tailscale or other tunnels.
- Before starting services, check if ports 9090 and 8080 are in use with `netstat -ano | findstr :9090`
- A 401 response from the backend means it IS running (Spring Security is active)
```

**2. Windows Environment**
```markdown
## Windows Environment
- Shell is Git Bash; mvnw wrapper often fails — use system Maven at /c/tools/apache-maven-3.9.9/bin/mvn
- JAVA_HOME must be set; verify before Maven builds
- Cannot kill locked JAR processes from bash — advise user to kill java.exe from Task Manager
- Use HTTPS for git remotes (not SSH) unless user confirms SSH keys are configured
```

**3. Debugging Approach**
```markdown
## Debugging Approach
- For login/auth failures: check proxy config FIRST (vite.config.ts target port), then CORS, then actual credentials
- A 401 on /actuator/health means the server IS running — don't troubleshoot it as a connectivity issue
- For blank screen: verify backend is running before investigating frontend issues
```

### Features to Try

**Custom `/start` Skill** — You're already halfway there with /restart, but a comprehensive skill covering Windows gotchas (JAVA_HOME, port conflicts, locked JARs) would eliminate your most common friction.

**Post-Edit Type Check Hook** — Auto-run type checks after edits to catch missing imports immediately.
```json
{
  "hooks": {
    "postToolUse": [
      {
        "matcher": "(Edit|Write)",
        "command": "cd frontend && npx tsc --noEmit 2>&1 | head -20"
      }
    ]
  }
}
```

**Headless Mode for Docs** — Use `claude -p "..."` for documentation updates and summaries rather than interactive sessions.

### Copyable Prompts

**Debug proxy before auth:**
> Login is failing. Before investigating auth or CORS, first check vite.config.ts proxy target port matches the actual backend port (9090), and check that allowedHosts includes any external hostnames I'm using.

**Pre-flight backend startup:**
> Start the backend but first: 1) verify JAVA_HOME is set, 2) check nothing is on port 9090, 3) use the system Maven at /c/tools/apache-maven-3.9.9/bin/mvn since we're on Windows Git Bash.

---

## On the Horizon

### Self-Healing Application Startup
Nearly half your sessions involved starting the FreightClub stack and debugging port conflicts, CORS issues, or stale processes. An autonomous workflow could launch both services, run health checks, diagnose failures, and self-heal common issues without intervention.

> Read CLAUDE.md for the FreightClub startup runbook. Start the backend and frontend services. After each starts, verify health by hitting their endpoints. If any service fails, diagnose the root cause (port conflicts, stale processes, missing env vars, schema mismatches) and fix it automatically. Retry up to 3 times. Report final status of all services with URLs.

### Parallel Agents for Feature Development
Your feature work spanned multiple sessions. Launch parallel sub-agents — one writing backend Java code, one handling TypeScript frontend components, one running the test suite — so a full feature lands in a single session.

> I want to implement a new feature for FreightClub. Use sub-agents in parallel: Agent 1: Create the Java backend — entity, repository, service, controller, and tests. Agent 2: Create the TypeScript frontend — list view, create form, and API service. Agent 3: Continuously run the full test suite after each change, reporting failures back. Iterate until all tests pass. Then update FEATURES.md and commit.

### Self-Healing Windows Environment
> Before doing anything else, audit my development environment for FreightClub compatibility. Check: 1) JAVA_HOME is set and points to a valid JDK 21, 2) system Maven is accessible at /c/tools/apache-maven-3.9.9/bin/mvn, 3) node/npm versions match package.json engines, 4) ports 8080 and 9090 are free. Fix every issue you find. Then append an 'Environment Status' section to CLAUDE.md with the verified configuration.

---

## Fun Fact

**User asked Claude to summarize their echocardiogram — turns out the file was actually a B12 lab result.**

During a medical file review session, Claude couldn't read what the user called their "echocardiogram PDF" due to a missing poppler dependency. But it didn't matter anyway — the file wasn't an echocardiogram at all. A small reminder that organizing your medical files might be the real first step.
