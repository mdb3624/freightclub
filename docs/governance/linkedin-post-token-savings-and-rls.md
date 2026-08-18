# LinkedIn Post Series: Token Savings Through Governance

**Status:** Draft approved 2026-08-18. 7-post series (intro + 5 mechanisms + closer), punched up for depth/engagement per user feedback ("not enough detail to keep someone interested"). Not yet published.

**Posting order:** Post 0 (teaser/intro) → Posts 1-5 (one mechanism each, weekly cadence recommended) → Post 6 (closer/wrap-up).

---

## Post 0 — Teaser / Intro

**Most teams treat AI coding assistants as pure spend to minimize. We treat ours as a system to govern — and it turns out the two goals reinforce each other.**

Six weeks ago, a routine architecture review on our platform turned up something uncomfortable: a database role that had been silently bypassing our row-level security since the project started. Not a bug in the code — a permission nobody had audited. It got caught, fixed, and it immediately exposed a *second* problem the first one had been hiding. That's the story I'm going to tell in this series, along with four others just like it.

Over the next few weeks I'll walk through five specific mechanisms running on a production SaaS platform (Spring Boot 3 / Java 21, React 18 + TypeScript, PostgreSQL) that cut AI development costs — not by using the tool less, but by governing *how* it works. Each post is one real incident, with real numbers and the actual gap it exposed. No "AI transformed our workflow" hand-waving.

1️⃣ Model-tiered delegation — why we stopped paying premium-model prices for grunt work
2️⃣ Targeted verification vs. full rebuilds — and the one moment we refuse to shortcut
3️⃣ The coverage gate that had been silently dead for weeks — and nobody knew
4️⃣ The database privilege that was quietly defeating our own security model
5️⃣ How we stop one bad assumption from becoming three bad decisions downstream

The throughline: cost control and quality control turned out to be the same discipline, not a tradeoff. Post 1 next week.

---

## Post 1 — Model-Tiered Delegation

Early on, every task in a coding session — from "what modules exist in this codebase" to "should we merge these two duplicate classes" — ran through the same expensive model. It felt safe. It was also wasteful in a specific, measurable way: the model doing the *most* thinking was spending most of its time on tasks that needed the *least* of it.

The fix wasn't "use cheaper AI." It was matching model cost to the actual judgment a task requires:

→ **Retrieval and summarization** — "map the TypeScript, Java, and Python portions of this codebase, report back one combined architecture summary" — now runs as parallel fan-out on a lightweight model. Three agents, one question each, no architecture decisions involved.

→ **Day-to-day implementation, targeted debugging, test authoring** — the bulk of actual coding work — runs on a mid-tier model. Fast enough, capable enough, and it's where most work should live.

→ **Architecture decisions and multi-file refactors** — the calls that are expensive to unwind if wrong — get the top-tier model, deliberately, every time.

The test we apply: would a wrong answer here cost us an afternoon, or a week? Grunt work gets the cheap model. Judgment calls get the expensive one. It sounds obvious once you say it out loud — but "just use the best model for everything" is the default nobody questions until someone runs the numbers.

Next: the point where we stopped running full builds during iteration — and the one place we refuse to cut that corner, no matter how far into a session we are.

---

## Post 2 — Targeted Verification vs. Full Rebuilds

For a while, every code change triggered the same ritual: tear down the Docker environment, rebuild the backend JAR and frontend from scratch, spin the whole test stack back up, wait for health checks, then run the full suite. Every time. Even for a one-line fix inside a single method.

It wasn't caution — it was habit. And it was expensive in a way that compounds: minutes of wall-clock time and a full re-verification of hundreds of tests that hadn't changed, on every iteration of a TDD loop that might run a dozen times in one session.

We split it into two explicit modes instead:

→ **During red/green iteration**, run *one* test class against an already-running database container. No teardown, no rebuild, no full suite. It proves the one thing that changed, and nothing else needed proving again.

→ **Before a merge**, the full Mandatory Pre-Test Protocol runs, no exceptions: clean volumes, full rebuild of backend and frontend, full test environment restart, health check, entire suite. This is the one place we don't shortcut — not on a Friday afternoon, not on commit 40 of a long session. On a recent full run: 902 tests, 0 failures, 0 errors, 0 skipped.

The insight that took longer than it should have to land: a full rebuild during iteration doesn't buy more confidence than the targeted run already gave you — it just re-proves the same thing nine extra times. Save the expensive path for the one moment it can actually catch something new.

Next: what happens when the "gate" everyone's been trusting turns out to have been switched off the whole time.

---

## Post 3 — The Coverage Gate That Had Been Silently Dead

Here's an uncomfortable one. For weeks, every code review on this project cited a passing coverage check as part of sign-off. "JaCoCo passed" appeared in review after review, treated as settled fact.

It wasn't checking anything.

The Maven goal that actually *enforces* our branch-coverage minimum — the one that fails the build if coverage drops — was bound to the `verify` lifecycle phase. Our CI pipeline, and the Docker test container both ran on, only executed `test`. That phase generates the coverage *report* — the pretty HTML page with the percentage on it — but never runs the enforcing check. Every green build for weeks had been reading a number nobody was actually gating against. A coverage regression could have shipped clean.

We found it by asking a simple, unglamorous question: does this gate *actually run*, or do we just trust it because it's written down? Rebinding the check to the phase CI actually executes turned it from decoration into enforcement. Real measured coverage came in at 69.49% branch — genuine headroom above the floor we then set, not the stale assumption everyone had been operating on.

A second finding from the same audit: a pre-commit hook meant to block direct commits to `main` only worked on the one machine it was installed on, because `.git/hooks/` isn't version-controlled. It looked like protection. It was protection for exactly one laptop.

Next: the database privilege that had been doing something eerily similar to our security model.

---

## Post 4 — The Privilege That Was Quietly Defeating Our Security Model

Our multi-tenant isolation is built on native PostgreSQL row-level security — every query automatically scoped to the correct tenant by the database itself, not by an application `WHERE` clause a future edit could forget. On paper, that's a strong guarantee. It holds even if a service method has a bug.

Except it wasn't holding. The database role every single application query runs as had been granted a bypass privilege — since the start of the project. RLS policies existed, were correctly written, were even tested. None of it mattered, because the role running the queries had permission to walk straight past all of it. Nobody had audited the role's own grants; everyone had audited the policies.

We caught it, revoked the privilege, and RLS became genuinely enforced for the first time in the project's life. That's when the second problem showed up: with bypass gone, several policies that had looked correct — written strictly around "your own tenant's data only" — started rejecting a legitimate action: a trucker fulfilling a shipper's order, which is a *deliberate* cross-tenant interaction, not a violation. The bypass privilege had been silently absorbing that mismatch the whole time.

We didn't patch it quietly. It's now a tracked, open item with a specific fix path, visible to anyone auditing the project. That's the actual point of governance here — not "we're fully secure," but "nothing gets to hide."

Next: how we make sure a discovery like this doesn't turn into three more silent problems on the way to being fixed.

---

## Post 5 — Stopping One Bad Assumption From Becoming Three

Discoveries like the ones in the last two posts create a specific temptation: someone finds a problem mid-task and just... fixes the thing they were originally asked to fix, plus whatever else looks broken nearby, because they're already in there. It feels efficient. It's how scope quietly doubles and a clean fix turns into an uncontrolled rewrite.

Our rule: when any stage of the process hits something wrong, incomplete, or impossible to build cleanly, it escalates *forward* with a written ticket. It never goes back and silently reworks what came before, and it never silently expands what it was asked to do.

A recent case: a review flagged what looked like simple duplicate class names — an old package structure and a newer one, same-looking classes in both. Investigation found three different problems wearing the same disguise: a genuine duplicate with exactly one caller (safe to delete), an orphaned class with zero callers anywhere in the codebase (dead code, safe to delete), and a much bigger in-progress architecture migration that only *looked* like a simple duplicate from the outside.

We fixed the two safe cases immediately — verified by both a targeted test and the full pre-merge protocol. The third got logged, explicitly, as its own decision for later. Not rushed, not ignored, not silently absorbed into an unrelated PR.

Final post in the series next: what all five of these add up to, and why the pattern matters more than any individual fix.

---

## Post 6 — Closer / Wrap-Up

Five posts, five real incidents, no abstractions:

1️⃣ A model routing rule that stopped premium-model spend on grunt work
2️⃣ A test protocol that draws a hard line between "prove this one thing" and "prove everything, no shortcuts"
3️⃣ A coverage gate that had been silently dead for weeks, caught by asking if it actually ran
4️⃣ A database privilege that had been defeating our own security model since day one — found, revoked, and the second gap it was hiding, tracked openly
5️⃣ A rule that stops a good-faith fix from quietly becoming an uncontrolled rewrite

None of this is exotic. It's the same discipline a well-run engineering team already applies to human contributors — code review, CI gates, a change-ticket process, escalation paths — applied consistently to AI-assisted work instead of treated as optional because "the AI is fast anyway."

The token savings come from not re-doing verification that's already been done, and not burning a top-tier model on retrieval work. The security and reliability gains come from the exact same root cause: gates that are actually enforced, and gaps that get written down the moment they're found instead of quietly worked around.

The result isn't "AI but cheaper." It's fewer tokens spent re-deriving context, and a paper trail that makes the codebase more auditable than if a human had written it alone, start to finish.

---

*Describes the governance system as of 2026-08-18. The cross-tenant write-authorization gap referenced in Post 4 is open, tracked technical debt at time of writing, not resolved — included deliberately, because an accurate account of what's still open is part of what makes this system worth writing about.*
