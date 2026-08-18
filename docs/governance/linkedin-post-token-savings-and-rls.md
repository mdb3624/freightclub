# LinkedIn Post Series: Token Savings Through Governance

**Status:** Draft approved 2026-08-18. 7-post series, editorial pass applied 2026-08-18 (tightened copy, engagement questions, posting calendar, first-comment strategy). Not yet published.

**Note on the editorial pass:** the suggested aggregate metric for Post 0 ("cut monthly token spend by ~35-40%") was **not applied** — it isn't a number this project has actually measured, and every other figure in this series (902 tests, 69.49% branch coverage, the specific gate/privilege findings) is traceable to real project artifacts (`.claude/learnings.md`, actual test-run output). Inventing an aggregate to give executives a bigger anchor would break that standard. If a real token-spend comparison becomes available, add it here.

**Posting order:** Post 0 (teaser/intro) → Posts 1-5 (one mechanism each, weekly cadence) → Post 6 (closer/wrap-up).

**LinkedIn mechanics:**
- Keep links out of the main post body (links in-text suppress reach); for Post 4, post the core text directly and drop any supporting diagram/policy snippet in the **first comment** instead.
- Each post below ends with a direct question — reply to early comments quickly, since early engagement velocity drives algorithmic reach more than the post itself.

**Recommended launch calendar** (Tuesday 9:00 AM CST, weekly):
| Week | Post |
|------|------|
| 1 | Post 0 — Series intro |
| 2 | Post 1 — Model-tiered delegation |
| 3 | Post 2 — Targeted verification |
| 4 | Post 3 — Dead coverage gate |
| 5 | Post 4 — Database security / RLS |
| 6 | Post 5 — Escalation & scope control |
| 7 | Post 6 — Series wrap-up |

---

## Post 0 — Teaser / Intro

Most teams treat AI coding assistants as pure spend to minimize. We treat ours as a system to govern — and it turns out the two goals reinforce each other.

Six weeks ago, a routine architecture review on our SaaS platform turned up something uncomfortable: a database role that had been silently bypassing our row-level security since day one.

Not a bug in the code — a permission nobody had audited. It got caught, fixed, and immediately exposed a second problem the first one had been hiding.

Over the next few weeks, I'm sharing five specific mechanisms running on our production **Spring Boot 3 / React / Postgres** platform that cut AI development costs — not by using AI less, but by governing how it works:

1️⃣ Model-tiered delegation — matching model cost to actual judgment weight
2️⃣ Targeted verification vs. full rebuilds — and the non-negotiable pre-merge gate
3️⃣ The coverage gate that had been silently dead for weeks
4️⃣ The database privilege quietly defeating our security model
5️⃣ Escalating forward: stopping one bad assumption from causing three bad rewrites

Cost control and quality control turned out to be the exact same discipline.

Post 1 drops next week. **How is your team balancing AI token budgets against code quality?**

---

## Post 1 — Model-Tiered Delegation

Early on, every task in a coding session — from "what modules exist here?" to "should we merge these duplicate domain classes?" — ran through the exact same top-tier model.

It felt safe. It was also wasteful: our highest-reasoning model was spending most of its context window on tasks that required no reasoning at all.

We stopped paying top-tier prices for grunt work by explicitly routing by judgment weight:

- **Lightweight models (retrieval & fan-out):** mapping module structures, parsing logs, generating architecture summaries. Parallel execution, zero architectural calls.
- **Mid-tier models (implementation):** day-to-day coding, targeted debugging, unit test authoring. Fast, capable, and where most execution lives.
- **Top-tier models (architecture):** multi-file refactors, domain model changes, security boundary updates. Reserved for calls that are expensive to unwind if wrong.

The rule: would a wrong answer here cost us an afternoon, or a week?

Grunt work gets the lightweight model. Judgment calls get the top model.

Next week: why we stopped running full Docker builds during active TDD — and the one moment we refuse to cut that corner. **What's your team's rule of thumb for when a task deserves the expensive model?**

---

## Post 2 — Targeted Verification vs. Full Rebuilds

For a while, every small code change triggered the same heavy ritual: tear down Docker volumes, rebuild backend JARs and frontend assets from scratch, restart the stack, wait for health checks, and run the complete test suite.

Even for a one-line fix inside a single service method.

It wasn't rigor — it was habit. And it compounded into lost hours. We split verification into two explicit modes:

→ **Red/green iteration:** run a single test class against an already-running database container. No teardown, no full rebuild. It proves the immediate edit in seconds, not minutes.

→ **Mandatory pre-merge protocol:** before a PR merges, the full protocol runs without exception — clean volumes, cold rebuild, stack restart, health check, full suite run (902 tests, 0 failures, 0 errors on our last pass).

A full rebuild during active TDD doesn't buy more confidence than a targeted run already gave you — it just re-proves the same thing nine extra times. Save the expensive path for the actual merge gate.

Next week: what happens when the coverage gate everyone trusted turned out to be completely switched off. **Where does your team draw the line between "fast enough to iterate" and "thorough enough to trust"?**

---

## Post 3 — The Coverage Gate That Had Been Silently Dead

For weeks, every code review on our project cited passing test coverage as settled fact. "JaCoCo passed" appeared in PR sign-offs like clockwork.

It wasn't checking anything.

The `jacoco-maven-plugin` `check` goal — the execution that actually enforces branch coverage floors — was bound to Maven's `verify` phase. But our CI pipeline and test containers only ran `mvn test`.

That phase generated the pretty HTML coverage report, but never ran the enforcing check. Every green build had been reading a report nobody was actually gating against.

We found it by asking one unglamorous question: does this gate actually run, or do we just trust it because it's written in a doc?

Rebinding the check to the `test` phase turned it from decoration into enforcement. Real measured coverage landed at 69.49% branch coverage — genuine headroom above our floor, but a wake-up call on pipeline trust.

Bonus finding from the same audit: a pre-commit hook blocking direct commits to `main` only lived in one developer's local `.git/hooks/` directory. It protected exactly one laptop.

Next week: the single database grant that was quietly neutralizing our multi-tenant security model. **Has your team ever discovered a "passing" gate that wasn't actually running?**

---

## Post 4 — The Privilege That Quietly Defeated Security

*(Post the core text below directly — no link in the body. Drop a supporting RLS-policy diagram or snippet in the first comment instead.)*

Our multi-tenant data isolation relies on native PostgreSQL row-level security (RLS). Every query is automatically scoped to `tenant_id` by Postgres itself, rather than relying on application-layer `WHERE` clauses that an engineer might forget.

On paper, it was bulletproof. In reality? It wasn't running.

The application's database runtime role held a `BYPASSRLS` privilege — granted early in setup and never revoked. The RLS policies existed, were correctly written, and passed isolated unit tests. But in production, the application role was walking straight past them.

We revoked the privilege. RLS took effect instantly — and immediately surfaced a second issue: strict policies began blocking legitimate cross-tenant actions (e.g., a trucker fulfilling a shipper's load across tenant boundaries).

The bypass privilege had been silently masking that architectural mismatch the whole time.

Rather than quietly patching it inline or re-granting permissions, we documented it as tracked, open technical debt with a dedicated fix path.

That is the actual goal of system governance: not pretending code is perfect, but ensuring gaps are documented and tracked rather than hidden behind silent overrides.

Next week: how we keep a mid-task discovery from turning into an uncontrolled codebase rewrite. **How does your team catch privilege/permission drift before it becomes a production incident?**

---

## Post 5 — Stopping One Bad Assumption From Becoming Three

Finding a hidden bug mid-task creates a dangerous temptation: "While I'm in this file, I'll just fix this second thing, clean up this package, and rewrite this helper."

It feels efficient. It's actually how scope quietly doubles and clean PRs turn into unreviewable rewrites.

Our rule: when any stage of the development loop hits something broken, incomplete, or incorrectly assumed from an earlier step, it escalates forward with a written ticket. It never quietly reworks prior output or expands its own scope inline.

A recent example: a code audit flagged duplicate class names across an old package structure and a new modular one. Investigation revealed three distinct situations:

1. A true duplicate with one caller → safe to delete.
2. An orphaned class with zero callers → dead code, safe to delete.
3. An in-progress architectural migration masquerading as a simple duplicate → high risk.

We fixed items 1 and 2 immediately, validated via targeted tests and the full pre-merge protocol. Item 3 was logged as its own explicit architectural decision.

Resist the urge to bundle fixes. Small, isolated changes keep your audit trail clean and your models focused.

Final post next week: what these five mechanisms add up to overall. **What's the last "while I'm in here" fix that quietly grew into something bigger than planned?**

---

## Post 6 — Closer / Wrap-Up

Over the past five posts, we've walked through real operational mechanisms on a live Spring Boot + React SaaS platform:

1️⃣ Model routing that eliminated top-tier spend on retrieval tasks
2️⃣ A test protocol separating rapid local TDD from non-negotiable pre-merge gates
3️⃣ A dead CI coverage gate exposed by auditing execution phases
4️⃣ A revoked database privilege that exposed hidden cross-tenant technical debt
5️⃣ An escalation rule that prevents small fixes from becoming uncontrolled rewrites

None of this is exotic. It's the standard engineering discipline top teams apply to human devs — code review, enforced gates, explicit escalation — applied consistently to AI-assisted workflows.

Token savings don't come from using AI tools less. They come from not re-deriving context, not re-running unnecessary test suites, and not burning high-tier models on grunt work.

The result isn't just "AI, but cheaper." It's a tighter feedback loop, explicit technical debt tracking, and an audit trail far stronger than if a human wrote it alone.

**Which of these five areas has the most friction in your current engineering workflow? Let's discuss below.**

---

*Describes the governance system as of 2026-08-18. The cross-tenant write-authorization gap referenced in Post 4 is open, tracked technical debt at time of writing, not resolved — included deliberately, because an accurate account of what's still open is part of what makes this system worth writing about.*
