# Token Savings Through Governance: How an AI-Assisted SaaS Team Cuts Cost Without Cutting Corners

**Status:** LinkedIn post approved 2026-08-18 (see "The Post" below). This document adds the detailed backing material — real examples, real numbers, and the honest caveats — for anyone who wants the case study behind the post rather than just the pitch.

---

## The Post (as approved, ~230 words)

**How we cut AI development costs by governing *how* the AI works, not by using it less.**

Most teams treat AI coding assistants as pure spend to minimize. We treat ours as a system to govern — and the two goals turned out to reinforce each other.

A few concrete mechanisms from a production Spring Boot + React SaaS platform we run:

→ **Model-tiered delegation.** Mechanical work (mapping a codebase, summarizing logs) runs on lightweight models; architecture decisions and multi-file refactors get the expensive one. Not every task needs the same horsepower.

→ **Targeted verification over full rebuilds.** During iteration, we run a single test class against a live container instead of a full Docker rebuild + suite. The full protocol is reserved for the pre-merge gate, where it actually needs to catch something.

→ **CI as the actual gate, not a suggestion.** Branch coverage is enforced in CI, not aspirational in a doc — we recently found and fixed a case where the check was silently bound to a Maven phase nothing ever ran.

→ **Security enforced at the database, not just the app layer.** Our multi-tenant data isolation runs on Postgres row-level security — every query is scoped by tenant, invisibly, at the DB. We recently revoked a bypass privilege one service role still held, closing a gap where RLS wasn't actually being enforced for it. That's the kind of fix that's easy to miss in code review and impossible to miss when the governance system requires an explicit audit pass.

The result isn't "AI but cheaper." It's fewer tokens spent re-deriving context, and a paper trail that makes the codebase more auditable than if a human wrote it alone.

---

## The Detailed Case Study

### The problem with treating AI coding assistants as a cost line

The default instinct with AI coding tools is to treat every token as pure spend, and to control cost by using the tool less — fewer requests, shorter sessions, smaller models everywhere. That works, but it optimizes the wrong variable. Cost isn't driven mainly by model choice; it's driven by **how much re-deriving of context happens** — an agent that has to rediscover the same architecture, re-run a full test suite because there's no cheaper option, or silently drift from a standard because nothing enforces it.

Our platform (a Spring Boot 3 / Java 21 backend, React 18 + TypeScript frontend, PostgreSQL on Neon) is built under a documented, role-based operating system for AI-assisted development. It wasn't designed as a cost-control measure — it was designed to keep a fast-moving codebase correct and auditable. The cost savings turned out to be a side effect of doing that well.

### Mechanism 1: Model-tiered delegation

Not every task in a session carries the same judgment weight. Mapping which TypeScript modules exist, summarizing a log file, or doing a mechanical find-and-replace doesn't need the same model as deciding whether to consolidate two duplicate domain classes into one. We explicitly route:

- **Lightweight models** → pure retrieval/summarization fan-out (e.g., "map the TypeScript, Java, and Python portions of this codebase and report back a combined architecture summary" — dispatched as three parallel search agents)
- **Mid-tier models** → day-to-day implementation, targeted debugging, test authoring
- **Top-tier models** → architecture decisions and multi-file refactors where a wrong call is expensive to unwind

This isn't a blanket downgrade. It's matching capability to the actual judgment required, which is where most of the token spend on "exploration" tasks was going.

### Mechanism 2: Targeted verification over full rebuilds — with a hard line on when full is mandatory

The project's testing standards explicitly separate two modes:

- **During red/green TDD iteration**, run a single test class against an already-running database container. No full Docker teardown, no full rebuild, no full suite.
- **Before a PR/merge/deploy**, the full Mandatory Pre-Test Protocol runs: clean Docker volumes, rebuild backend JAR and frontend, rebuild and start the full test environment, wait for health, then run the entire suite. This is non-negotiable and is not shortened even on a late iteration in a session.

The point isn't "skip testing to save tokens" — it's recognizing that a full rebuild proves the same thing ten times over during iteration when a targeted run already proved it once. The expensive path is reserved for the one place it earns its cost: the actual merge gate. On a recent full-protocol run, the complete backend suite reported **902 tests, 0 failures, 0 errors, 0 skipped** — the full-cost verification still happens, just not on every single edit.

### Mechanism 3: CI as the actual gate, not a policy document

A governance rule that isn't enforced by a build is just a comment nobody reads. Two real examples surfaced during this project's own audits:

1. **The coverage gate was silently dead.** `jacoco-maven-plugin`'s `check` execution — the goal that actually enforces the branch-coverage minimum — was bound to Maven's `verify` phase in `pom.xml`. But the CI pipeline (and the Docker test container) only ran `mvn test`, a phase that generates the coverage *report* but never runs the enforcing *check*. Every prior CI run and reviewer sign-off that cited "coverage passed" had been reading a number that was never actually gating anything. The fix: rebind `check` to the `test` phase, so the container's own exit code reflects the real gate. Measured coverage at fix time was 69.49% branch — real headroom above the newly-enforced 65% floor, ratcheting toward an 80% target, not the stale 50.6% previously assumed.
2. **A pre-commit hook that only worked on one machine.** A hook was added to block direct commits to `main`, but `.git/hooks/` isn't version-controlled — so the fix protected exactly the one clone it was made in. GitHub branch-protection rules remain the only layer of the three (branch protection, pre-commit hook, PR review trail) that's guaranteed to apply everywhere, which is now documented explicitly rather than assumed.

Both gaps were found by treating "does the gate actually run" as a thing to verify, not a thing to trust because it's written down.

### Mechanism 4: Security enforced at the database, not just the app layer — including finding what's still open

Multi-tenant data isolation runs on native PostgreSQL row-level security: every query is implicitly scoped to `tenant_id` by the database itself, not by application-layer `WHERE` clauses that a future edit could accidentally drop. That's a stronger guarantee than convention — it holds even if a service method forgets to filter.

The honest part of this story, not just the flattering part: RLS enforcement itself had a real gap. The `freightclub_runtime` database role — the role every application query runs as — held a `BYPASSRLS` privilege, meaning RLS policies were silently not being enforced for any query that role ran, from the start of the project until it was caught and revoked. Once revoked, RLS became genuinely enforced for the first time — which immediately surfaced a **second**, previously-masked gap: several RLS policies had been written strictly (`tenant_id = current tenant`), which is correct for a shipper acting on their own load, but breaks a trucker's legitimate cross-tenant mutation (claiming, picking up, or delivering a shipper's load) now that bypass no longer papers over it. That gap is tracked as open technical debt with a specific fix path (a second session-scoped identifier alongside tenant, mirroring the existing pattern) rather than being silently patched inline or left undocumented.

That's the actual value of the governance system here: not "we're fully secure," but "gaps get written down, tracked, and fixed in priority order instead of disappearing into an unreviewed diff."

### Mechanism 5: Structured escalation instead of silent rework

When any role in the system (implementation, review, design) hits input from an earlier stage that's wrong, incomplete, or impossible to build, the rule is: escalate forward with a written ticket, never quietly go back and change the earlier stage's output. A recent example — a session flagged duplicate-looking class names across an old flat package structure and a newer modular one. Investigation found three genuinely different situations behind that one flat list: a true duplicate with a single consumer (safe to delete), an orphaned class with zero consumers anywhere in the codebase (dead code, safe to delete), and a much larger in-progress architectural migration masquerading as a simple duplicate (correctly left alone and escalated as its own decision rather than rushed). The fix that shipped touched exactly the two safe cases, verified by both a targeted test run and the full pre-merge protocol, with the third case explicitly logged as out of scope rather than silently attempted.

### What this adds up to

None of these mechanisms are exotic. They're the same discipline a well-run engineering team already applies to human contributors — code review, CI gates, a change-ticket process, escalation paths — applied consistently to AI-assisted work instead of treated as optional because "the AI is fast anyway." The token savings come from not re-doing verification that's already been done, and not burning a top-tier model on retrieval work. The security and reliability gains come from the same root cause: gates that are actually enforced, and gaps that get written down instead of quietly worked around.

---

*This document and the post above describe the governance system as of 2026-08-18. Some items referenced (e.g., the trucker cross-tenant write-authorization gap) are open, tracked technical debt at time of writing, not resolved — included deliberately, because an accurate account of what's still open is part of what makes this system worth writing about.*
