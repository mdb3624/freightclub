# LinkedIn Post: Token Savings Through Governance

**Status:** Draft approved 2026-08-18. Single continuous post (long-form), not yet published.

---

**How we cut AI development costs by governing *how* the AI works, not by using it less.**

Most teams treat AI coding assistants as pure spend to minimize. We treat ours as a system to govern — and the two goals turned out to reinforce each other.

The default instinct with AI coding tools is to control cost by using them less: fewer requests, shorter sessions, smaller models everywhere. That optimizes the wrong variable. Cost isn't driven mainly by model choice — it's driven by how much re-deriving of context happens. An agent that has to rediscover the same architecture, re-run a full test suite because there's no cheaper option, or silently drift from a standard because nothing enforces it. Our platform (Spring Boot 3 / Java 21, React 18 + TypeScript, PostgreSQL on Neon) runs under a documented, role-based operating system for AI-assisted development. It wasn't built as a cost-control measure — it was built to keep a fast-moving codebase correct and auditable. The cost savings turned out to be a side effect of doing that well. Here's what that looks like in practice:

→ **Model-tiered delegation.** Not every task carries the same judgment weight. Mapping a codebase or summarizing a log doesn't need the same model as deciding whether to consolidate two duplicate domain classes into one. We route pure retrieval/summarization fan-out to lightweight models, day-to-day implementation to a mid-tier model, and architecture decisions — where a wrong call is expensive to unwind — to the top tier. Not a blanket downgrade, just matching capability to the judgment actually required.

→ **Targeted verification over full rebuilds — with a hard line on when full is mandatory.** During iteration, we run a single test class against an already-running database container, not a full Docker teardown and rebuild. Before a merge, the full protocol runs: clean volumes, full rebuild, full suite, no shortcuts. A full rebuild proves the same thing ten times over during iteration when a targeted run already proved it once — the expensive path is reserved for the one place it earns its cost. On a recent full-protocol run, the complete backend suite reported 902 tests, 0 failures, 0 errors, 0 skipped. The full-cost verification still happens — just not on every single edit.

→ **CI as the actual gate, not a policy document.** A governance rule a build doesn't enforce is a comment nobody reads. We found two real examples of that in our own project: a code-coverage check that was silently bound to a Maven phase CI never ran — meaning every prior "coverage passed" sign-off had been reading a number that was never actually gating anything — and a pre-commit hook that only protected the one machine it was installed on, since `.git/hooks/` isn't version-controlled. Both were found by treating "does the gate actually run" as a thing to verify, not a thing to trust because it's written down.

→ **Security enforced at the database, not just the app layer — including finding what's still open.** Our multi-tenant isolation runs on native Postgres row-level security: every query is scoped to a tenant by the database itself, not by an application `WHERE` clause a future edit could drop. The honest part: the database role every query runs as held a bypass privilege that had been silently defeating RLS since day one. Revoking it made RLS enforcement real for the first time — which immediately surfaced a second, previously-masked gap in how strictly some policies were written. That gap is now tracked as open technical debt with a specific fix path, not silently patched or left undocumented. The value here isn't "we're fully secure" — it's that gaps get written down and fixed in priority order instead of disappearing into an unreviewed diff.

→ **Structured escalation instead of silent rework.** When any stage of the process hits input from an earlier stage that's wrong or incomplete, the rule is: escalate forward with a written ticket, never quietly go back and change what came before. We used this recently on a set of duplicate-looking classes that turned out to be three genuinely different situations — one safe delete, one dead code, one much larger migration masquerading as a simple duplicate. Two were fixed; the third was explicitly logged as out of scope rather than rushed.

None of this is exotic. It's the same discipline a well-run team already applies to human contributors — code review, CI gates, a change-ticket process, escalation paths — applied consistently to AI-assisted work instead of treated as optional because "the AI is fast anyway." The token savings come from not re-doing verification that's already been done, and not burning a top-tier model on retrieval work. The security and reliability gains come from the same root cause: gates that are actually enforced, and gaps that get written down instead of quietly worked around.

---

*Describes the governance system as of 2026-08-18. The cross-tenant write-authorization gap referenced above is open, tracked technical debt at time of writing, not resolved — included deliberately, because an accurate account of what's still open is part of what makes this system worth writing about.*
