# LinkedIn Post Series: Token Savings Through Governance

**Status:** Draft approved 2026-08-18. Split into a 7-post series (intro + 5 mechanisms + closer) for sequential posting over a few weeks, not yet published.

**Posting order:** Post 0 (teaser/intro) → Posts 1-5 (one mechanism each, any order, weekly cadence recommended) → Post 6 (closer/wrap-up).

---

## Post 0 — Teaser / Intro

**Most teams treat AI coding assistants as pure spend to minimize. We treat ours as a system to govern — and it turns out the two goals reinforce each other.**

Over the next few weeks I'm going to walk through five specific mechanisms we run on a production SaaS platform (Spring Boot 3 / Java 21, React 18 + TypeScript, PostgreSQL) that cut AI development costs — not by using the tool less, but by governing *how* it works.

Each post is one real mechanism, with real numbers, including the gaps it exposed along the way. No abstractions, no "AI transformed our workflow" hand-waving — actual before/after from our own audits:

1️⃣ Model-tiered delegation — matching model cost to the judgment a task actually requires
2️⃣ Targeted verification vs. full rebuilds — and the hard line on when "full" is non-negotiable
3️⃣ CI as the real gate — including a coverage check that had been silently dead for weeks
4️⃣ Database-enforced security — and the privilege we found and revoked mid-project
5️⃣ Structured escalation — how we stop bad decisions from compounding silently

The throughline: cost control and quality control turned out to be the same discipline, not a tradeoff. First one drops next week.

---

## Post 1 — Model-Tiered Delegation

Not every task in an AI coding session carries the same judgment weight. Mapping which modules exist in a codebase or summarizing a log file doesn't need the same model as deciding whether to consolidate two duplicate domain classes into one — but it's tempting to just run everything on the expensive model because it's "easier."

We route explicitly instead:

→ Lightweight models handle pure retrieval/summarization fan-out — e.g., "map the TypeScript, Java, and Python portions of this codebase, report back a combined architecture summary," dispatched as parallel search agents.

→ A mid-tier model handles day-to-day implementation, targeted debugging, and test authoring.

→ The top-tier model is reserved for architecture decisions and multi-file refactors, where a wrong call is expensive to unwind.

This isn't a blanket downgrade — it's matching capability to the judgment actually required. Most of the token spend on "exploration" work was going to a model that didn't need to be doing it.

Next: why we stopped running full builds during iteration — and where we drew a hard line on when we don't.

---

## Post 2 — Targeted Verification vs. Full Rebuilds

Our testing standards explicitly separate two modes, and mixing them up was costing us both time and tokens.

**During iteration** (red/green TDD): run a single test class against an already-running database container. No full Docker teardown, no full rebuild, no full suite. It proves the one thing that changed.

**Before a merge**: the full Mandatory Pre-Test Protocol runs — clean volumes, rebuild backend and frontend from scratch, rebuild the full test environment, wait for health, run everything. Non-negotiable, no shortcuts, not even late in a long session.

The insight isn't "test less to save money." It's that a full rebuild proves the same thing ten times over during iteration when a targeted run already proved it once — so we reserve the expensive path for the one place it actually earns its cost: the real merge gate. On a recent full-protocol run, the complete backend suite reported 902 tests, 0 failures, 0 errors, 0 skipped. Full-cost verification still happens — just not on every single edit.

Next: what happens when the "gate" you're trusting turns out to have been dead the whole time.

---

## Post 3 — CI as the Actual Gate, Not a Policy Document

A governance rule that isn't enforced by a build is just a comment nobody reads. We found two real examples of that in our own project.

**The coverage gate was silently dead.** The Maven goal that actually *enforces* our branch-coverage minimum was bound to the `verify` phase — but CI only ran `test`, a phase that generates the coverage report but never runs the enforcing check. Every prior sign-off citing "coverage passed" had been reading a number that was never actually gating anything. Once we rebound the check to run where CI actually looks, real coverage measured 69.49% branch — genuine headroom above our now-enforced floor, not the stale number everyone had been trusting.

**A pre-commit hook only worked on one machine.** It correctly blocked direct commits to `main` — but `.git/hooks/` isn't version-controlled, so the fix protected exactly the one clone it was installed in. GitHub's own branch protection is now documented as the only layer guaranteed to apply everywhere.

Both were found the same way: by treating "does this actually run" as something to verify, not something to trust because it's written down.

Next: the database privilege that had been quietly defeating our security model since day one.

---

## Post 4 — Security Enforced at the Database, Not Just the App Layer

Our multi-tenant isolation runs on native PostgreSQL row-level security — every query scoped to a tenant by the database itself, not by an application `WHERE` clause a future edit could accidentally drop. That's a stronger guarantee than convention: it holds even if a service method forgets to filter.

Here's the part that isn't just the flattering half of the story. The database role every application query runs as had held a bypass privilege since the start of the project — meaning RLS policies were silently not being enforced at all for any query that role ran. Once we caught it and revoked the privilege, RLS became genuinely enforced for the first time. That immediately surfaced a *second*, previously-masked gap: some policies had been written strictly enough to work for a user acting on their own data, but broke a legitimate cross-tenant action (like a trucker fulfilling a shipper's order) now that bypass no longer papered over it.

That gap is now tracked as open technical debt with a specific fix path — not silently patched, not left undocumented. The real value of a governance system isn't "we're fully secure." It's that gaps get written down and fixed in priority order instead of disappearing into an unreviewed diff.

Next: how we keep one bad assumption from silently becoming three bad decisions downstream.

---

## Post 5 — Structured Escalation Instead of Silent Rework

When any stage of our process hits input from an earlier stage that's wrong, incomplete, or impossible to build, the rule is simple: escalate forward with a written ticket. Never quietly go back and change what came before.

A recent example: a review flagged what looked like duplicate class names across an old package structure and a newer one. On investigation, it was three genuinely different situations hiding behind one flat list — a true duplicate with a single consumer (safe to delete), an orphaned class with zero consumers anywhere (dead code, safe to delete), and a much larger in-progress architectural migration masquerading as a simple duplicate.

We fixed the two safe cases immediately, verified by both a targeted test run and the full pre-merge protocol. The third case — the one that looked simple but wasn't — got logged explicitly as its own decision, out of scope for that change, instead of being rushed through.

That's the pattern: the fast, safe fixes ship immediately. The ones that need real judgment get a paper trail instead of a guess.

Last post in the series: what all five of these add up to.

---

## Post 6 — Closer / Wrap-Up

Five posts, five real mechanisms, no abstractions:

1️⃣ Model-tiered delegation
2️⃣ Targeted verification, with a hard line on when full verification is mandatory
3️⃣ CI gates we verified actually run, not just documented
4️⃣ Database-enforced tenant isolation, including a real privilege gap we found and fixed
5️⃣ Structured escalation that stops bad assumptions from compounding silently

None of this is exotic. It's the same discipline a well-run engineering team already applies to human contributors — code review, CI gates, a change-ticket process, escalation paths — applied consistently to AI-assisted work instead of treated as optional because "the AI is fast anyway."

The token savings come from not re-doing verification that's already been done, and not burning a top-tier model on retrieval work. The security and reliability gains come from the same root cause: gates that are actually enforced, and gaps that get written down instead of quietly worked around.

The result isn't "AI but cheaper." It's fewer tokens spent re-deriving context, and a paper trail that makes the codebase more auditable than if a human had written it alone.

---

*Describes the governance system as of 2026-08-18. The cross-tenant write-authorization gap referenced in Post 4 is open, tracked technical debt at time of writing, not resolved — included deliberately, because an accurate account of what's still open is part of what makes this system worth writing about.*
