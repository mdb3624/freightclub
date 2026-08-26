# Post 1 — Model-Tiered Delegation

*Short-form LinkedIn post companion to the article: [01-model-tiered-delegation.md](01-model-tiered-delegation.md).*

*Published as a LinkedIn Article: [Model-Tiered Delegation: Stop Paying Premium Prices for Grunt Work](https://www.linkedin.com/pulse/model-tiered-delegation-stop-paying-premium-prices-grunt-mike-barnes-hhloc/).*

---

Early on, every task in a coding session — from "what modules exist here?" to "should we merge these duplicate domain classes?" — ran through the exact same top-tier model.

It felt safe. It was also wasteful: our highest-reasoning model was spending most of its context window on tasks that required no reasoning at all.

We stopped paying top-tier prices for grunt work by explicitly routing by judgment weight:

- **Lightweight models (retrieval & fan-out):** mapping module structures, parsing logs, generating architecture summaries. Parallel execution, zero architectural calls.
- **Mid-tier models (implementation):** day-to-day coding, targeted debugging, unit test authoring. Fast, capable, and where most execution lives.
- **Top-tier models (architecture):** multi-file refactors, domain model changes, security boundary updates. Reserved for calls that are expensive to unwind if wrong.

The rule: would a wrong answer here cost us an afternoon, or a week?

Grunt work gets the lightweight model. Judgment calls get the top model.

Full writeup in the article below. Next week: why we stopped running full Docker builds during active TDD — and the one moment we refuse to cut that corner. **What's your team's rule of thumb for when a task deserves the expensive model?**

**Article:** https://www.linkedin.com/pulse/model-tiered-delegation-stop-paying-premium-prices-grunt-mike-barnes-hhloc/
