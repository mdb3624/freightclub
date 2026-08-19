# What Five Governance Mechanisms Add Up To

*Article 6 of 6 in the series "Token Savings Through Governance." Previously: [Stopping One Bad Assumption From Becoming Three](05-escalation-scope-control.md). Start over from the [series intro](00-series-intro.md).*

## The five, together

Over five articles, on a live Spring Boot + React + PostgreSQL SaaS platform, we walked through five real incidents:

**1. Model-tiered delegation.** Every task in a session used to run through the same top-tier model, regardless of whether it needed architectural judgment or just needed to summarize a directory listing. Routing by judgment weight — cheap models for retrieval and fan-out, mid-tier for day-to-day implementation, top-tier reserved for calls expensive to unwind — stopped the most capable (and most expensive) model from being diluted across work that never needed it.

**2. Targeted verification vs. full rebuilds.** A full Docker teardown-and-rebuild used to run on every single iteration, proving the same thing repeatedly without adding new information. Splitting verification into a fast targeted mode during iteration and a comprehensive, non-negotiable full protocol at the actual merge gate kept both speed and safety, instead of trading one for the other.

**3. The coverage gate that had been silently dead.** A Maven lifecycle mismatch meant our branch-coverage enforcement had never actually been running in CI, for weeks, while every review cited it as passing. Found by asking a simple, unglamorous question — does this gate actually run, or do we just trust it because it's documented — rather than trusting a green status.

**4. The database privilege quietly defeating our security model.** A bypass privilege on the application's runtime database role had been silently defeating our row-level security since the project's earliest days. Revoking it made security enforcement real for the first time, and immediately surfaced a second, previously-hidden gap — which we documented openly as tracked debt rather than quietly patching and moving on.

**5. Structured escalation.** A rule that stops the natural, well-intentioned temptation to bundle "while I'm already in here" fixes into a task's original scope — keeping the audit trail legible enough that anyone can later reconstruct exactly what changed, why it was judged safe, and what was deliberately left alone.

## The pattern underneath all five

None of these five mechanisms are exotic, and none of them are specific to AI-assisted development. They're the standard discipline a well-run engineering team already applies to its human contributors: code review, CI gates that actually gate, a change-ticket process instead of silent rework, escalation paths instead of unilateral decisions. What's different here isn't the discipline itself — it's applying it *consistently* to AI-assisted work, rather than quietly exempting that work because it feels fast enough not to need the same rigor.

That consistency is where the cost savings actually come from. Not from using the tool less, and not from defaulting to cheaper models everywhere. From not re-deriving context that's already been established, from not re-running verification that's already been done, and from not burning the most expensive model on tasks that never needed it. Every one of those is a token-spend reduction that comes as a side effect of doing the underlying work correctly — not as a separate cost-cutting initiative layered on top.

## The honest part

Three of these five incidents describe things that were *broken* — a dead coverage gate, a security bypass, a package-duplication mess that could easily have been rushed. This series wasn't written to claim the system is now perfect. The cross-tenant write-authorization gap surfaced in Article 4 is still open, tracked technical debt as of this writing, not a solved problem being described in the past tense for effect.

That's deliberate, and it's the actual point. The value a governance system provides isn't a guarantee that nothing is ever wrong — no system offers that honestly. It's a guarantee that when something *is* wrong, it gets found, written down, and fixed in priority order, instead of disappearing into a diff nobody reviewed closely enough to catch it. A system that only ever reports good news isn't more secure than one that reports gaps candidly. It's just less honest about the gaps it has.

## Where this leaves us

The result isn't "AI, but cheaper." It's a codebase with a paper trail — every non-trivial decision, every discovered gap, every deliberate scope boundary — that's more auditable than most codebases built by humans alone, at a lower token cost than treating every task as equally deserving of the most expensive available model and the most exhaustive possible verification.

Thanks for following the series. If you're building something similar — or you've hit your own version of one of these five incidents — I'd genuinely like to hear about it.

**Which of these five areas has the most friction in your current engineering workflow right now? Let's discuss below.**
