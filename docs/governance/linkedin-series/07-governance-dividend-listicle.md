# The Cheapest Way to Run AI Coding Agents Isn't Using Them Less. It's Treating Them Like Employees.

*A listicle synthesis of the "Token Savings Through Governance" series ([start here](00-series-intro.md)) — five counter-intuitive takeaways for a general engineering audience, distilled from the full five-article run.*

---

Most teams treat AI coding assistants as a line item to shrink: fewer requests, shorter sessions, the cheapest model that'll still limp across the finish line. It's an understandable instinct. The invoices are real.

We tried something else. We started governing our AI-assisted development the way we'd govern a team of human engineers — role boundaries, escalation paths, gates that are actually enforced instead of just documented. We expected better code. What we didn't expect was for it to also be *cheaper* — and for the two to turn out to be the same discipline, seen from two angles.

Along the way we found a database privilege that had been quietly defeating our entire security model since day one, a coverage gate that had been mathematically incapable of failing for weeks, and a habit that nearly turned a two-line cleanup into an unreviewable rewrite. Here's what surprised us.

## 1. The Cost-Cutting Move That Wasn't About Cutting Costs

Here's the counter-intuitive part: we never set out to spend less. We set out to stop trusting things that hadn't actually been verified — a gate that claimed to run, a policy that claimed to protect, a fix that claimed to be small. The savings showed up as a side effect.

Every one of the incidents below is really the same story: something looked fine because nobody had recently checked whether it actually was. Re-deriving context that had already been established, re-running verification that had already passed, burning the most expensive AI model on tasks that never needed it — every one of those turned out to be waste with the exact same root cause as the correctness gaps. Fixing the gaps fixed the waste for free.

> Governing how the work happens turned out to control cost more effectively than governing how much work happens.

## 2. A Green Checkmark Lied for Weeks

For weeks, every code review cited passing test coverage as settled fact. It wasn't. The tooling had two pieces: one that calculated the coverage percentage, and one that actually enforced a floor by failing the build. The enforcing piece was bound to a build phase nothing in the pipeline ever ran.

The percentage kept calculating. The build kept passing. A ten-point coverage regression would have shown `BUILD SUCCESS` with a real, correctly-rendered report sitting right next to it — because in a narrow technical sense, the report *was* accurate. It just wasn't gating anything.

**Status: Fixed** — rebound to the phase CI actually runs; real coverage measured at 69.49%.

> A governance rule that isn't enforced by something that actually runs is a comment nobody reads, no matter how confidently it's documented or how official the language sounds.

The unsettling part isn't the specific bug. It's that a working gate and a broken-but-silent one produce the identical "all green" signal. You cannot tell them apart by watching the output. You can only find out by occasionally asking whether the mechanism itself still runs.

## 3. One Database Privilege, Two Hidden Bugs

The platform is multi-tenant — many customers, one database, one set of tables. The isolation between them was built on row-level security: policies enforced by Postgres itself, holding even if a query forgot to filter by tenant. On paper, close to bulletproof.

Except the one database role every application query actually ran as held a privilege called `BYPASSRLS` — granted early, for bootstrapping convenience, never revoked once bootstrapping ended.

> It doesn't matter how correctly a policy is written, how thoroughly it's unit-tested, or how many times it's been reviewed — a role with BYPASSRLS walks straight past all of it, every time, silently.

Every policy was correct. Every policy was tested. None of it mattered for the one role actually running production traffic. Revoking the privilege made row-level security real for the first time — and within minutes, exposed a second problem the first one had been quietly absorbing all along: some policies, read literally, couldn't distinguish a stranger touching your data from a trucker legitimately claiming a shipper's load, which is the core transaction the platform exists to facilitate.

**Status: privilege revoked. Second gap: open, tracked.**

Nobody quietly patched it inline and moved on. It got written down as open, tracked debt, with a proposed fix, left visible for the next person auditing the project — still open as of this writing. That's the part worth sitting with: the goal was never "we're fully secure." It was making sure that when something isn't, the gap gets found and tracked instead of quietly smoothed back over.

## 4. The Most Dangerous Phrase in Code Review Is "While I'm In Here"

A review flagged duplicate-looking class names in two places — an old flat package structure and a newer modular one. The obvious move: delete the old ones, move on. Investigating instead of assuming turned up three different situations wearing the same disguise:

- **1 true duplicate** — retargeted and deleted.
- **1 orphaned class, zero callers** — deleted outright.
- **1 real migration** wearing the same disguise — escalated, left untouched.

Two were genuinely safe same-day fixes. The third only looked like a duplicate from a distance — underneath it was a much larger, still-in-progress architectural migration that several other things depended on. Bundling it into the day's cleanup under "well, we're already in here" would have made a consequential call by accident, under cover of a task nobody sized for it.

> Scope creep rarely arrives as a decision. It arrives as a series of individually reasonable "while I'm in here" moments that nobody ever explicitly chose to bundle together.

The rule that catches this: escalate forward with a written ticket, never quietly rework what came before, never silently expand what you were asked to do. It's not about any single fix being right or wrong — it's that anyone auditing the project later can reconstruct exactly what changed, why it was judged safe, and what was deliberately left alone.

## 5. Stop Paying Architect Prices for Data Entry

Early on, every task in a session ran through the same model — and it was always the most capable one available. Mapping a directory structure got the same model as deciding whether to consolidate two domain classes. It felt like the safe default. It was actually just undifferentiated.

The fix was one question, asked before dispatching any task: **would a wrong answer here cost an afternoon, or a week?**

- **Lightweight** — retrieval and fan-out: mapping a codebase, summarizing logs. Wrong answer costs a re-run, not a rebuild.
- **Mid-tier** — day-to-day implementation: features against an agreed design, targeted debugging, unit tests.
- **Top-tier** — multi-file refactors, domain model changes, anything touching a security boundary. Expensive to unwind if wrong — so it gets the deepest reasoning, deliberately, every time.

> A team that runs every task on the top-tier model isn't being careful. It's being undifferentiated, and paying a premium for that lack of differentiation on tasks that never needed it.

---

## The Takeaway

None of these five mechanisms are exotic, and none are unique to AI-assisted coding. They're the standard discipline a well-run team already applies to its human engineers — code review, gates that actually gate, a ticket instead of silent rework. What changed wasn't the discipline. It was refusing to quietly exempt AI-assisted work from it because the work felt fast enough not to need the same rigor.

The honest caveat: the cross-tenant policy gap from point three is still open as of this writing. That's not a loose end left in for effect — it's the actual point. A governance system's job was never to claim nothing is wrong. It's to make sure that when something is, it gets written down instead of disappearing into a diff nobody looked at closely enough.

**What's currently sitting in your own pipeline, passing, that nobody has actually checked still runs?**
