# Series Intro: Why We Govern AI Coding the Way We Govern Engineers

Most teams treat AI coding assistants as a cost line to minimize. Fewer requests, shorter sessions, the cheapest model that will still get the job done. It's an understandable instinct — the invoices are real and the temptation to cap them directly is strong.

We went a different direction. We treat our AI-assisted development workflow as a system to *govern* — the same way we'd govern a team of human engineers, with role boundaries, escalation paths, and gates that are actually enforced rather than aspirational. The surprising part wasn't that this improved code quality. It's that it turned out to be *cheaper*, too. Governing how the work happens turned out to control cost more effectively than governing how much work happens.

## The incident that started this series

Six weeks ago, a routine architecture review on our production SaaS platform (Spring Boot 3 / Java 21 backend, React 18 + TypeScript frontend, PostgreSQL on Neon) turned up something uncomfortable. A database role — the one every single application query runs as — held a privilege that let it silently bypass our row-level security policies. Not a bug in application code. A permission, granted early in the project's life, that nobody had thought to audit since.

It had been there since day one. Every row-level security policy we'd written, tested, and trusted had been quietly decorative for the role that mattered most, the whole time.

We caught it. We revoked it. And within minutes of that fix, a *second* problem surfaced — one the first bug had been hiding the entire time. That story is Article 4 in this series, told in full.

## What this series actually is

This isn't a highlight reel of things going well. It's five specific, real mechanisms running on a live production platform, each one framed around an actual incident — a thing that was broken, how we found it, and what changed as a result. Some of it is embarrassing in the way real engineering postmortems usually are. All of it is real, sourced directly from our own project's technical debt ledger and CI output, not smoothed over for the pitch.

The five mechanisms:

**1. Model-tiered delegation** — why running every task through the most expensive available model was quietly wasteful, and the simple rule we use instead to decide which model a task actually deserves.

**2. Targeted verification vs. full rebuilds** — the two-speed testing discipline that stopped us from re-proving the same thing nine times per session, and the one gate we refuse to shortcut no matter how far into a session we are.

**3. The coverage gate that had been silently dead** — a Maven lifecycle mismatch meant our branch-coverage enforcement hadn't actually been running for weeks, while every PR sign-off cited it as passing.

**4. The database privilege that was quietly defeating our security model** — the incident above, told in full, including the second gap it exposed and the honest state of that gap today.

**5. Structured escalation** — the rule that keeps a good-faith mid-task discovery from quietly turning into an unreviewable, scope-creeping rewrite.

## Why this matters beyond our stack

None of these five mechanisms are specific to AI-assisted coding. They're standard engineering discipline — code review, CI gates that actually gate, a change-ticket process, escalation instead of silent rework — the exact things a well-run team already does for its human engineers. What's different is that we apply them *consistently* to AI-assisted work, instead of treating that work as exempt because "the AI is fast anyway."

The cost savings and the quality gains turned out to share a root cause: gates that are actually enforced instead of merely documented, and gaps that get written down the moment they're found instead of quietly worked around. Cheaper and more correct weren't in tension. They were the same discipline, seen from two angles.

## What's next

Over the next several weeks I'll publish one article per mechanism, each with the specific incident, the fix, and the broader lesson. Article 1 — model-tiered delegation — is up next.

**Question for you:** how does your team decide when a task deserves the expensive model versus the cheap one — and is that decision explicit, or just habit?
