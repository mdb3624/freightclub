# Model-Tiered Delegation: Stop Paying Premium Prices for Grunt Work

*Article 1 of 6 in the series "Token Savings Through Governance." Start with the [series intro](00-series-intro.md) if you're just joining.*

## The habit we didn't notice we'd formed

Early in our AI-assisted development workflow, every task in a coding session ran through the same model — and it was always the most capable one available. "What TypeScript modules exist in this codebase?" got the same model as "should we consolidate these two duplicate domain classes into one?" It felt like the safe default: when in doubt, use the best tool.

It took a while to notice the actual cost of that default. The model doing the most reasoning was spending most of its time on tasks that required none. Mapping a directory structure, summarizing a log file, doing a mechanical find-and-replace across a dozen files — none of that needs architectural judgment. It needs speed and thoroughness, not depth.

## The question that fixed it

We started asking one simple question before dispatching any task: **would a wrong answer here cost us an afternoon, or a week?**

That question sorts almost every task cleanly into one of three tiers:

**Lightweight models — retrieval and fan-out.** Tasks like "map the TypeScript, Java, and Python portions of this codebase and report back a single combined architecture summary" don't require deep reasoning about any one part — they require breadth and accurate summarization. We dispatch these as parallel agents, each handling one slice of the codebase, each running on the cheapest model that can reliably do the job. If one comes back wrong, the fix is "run it again," not "spend a week unwinding a bad architectural decision."

**Mid-tier models — day-to-day implementation.** This is where most actual coding work lives: implementing a feature against an already-agreed design, targeted debugging, writing unit tests, extending an existing pattern. Capable enough to be trusted, fast enough that iteration doesn't feel expensive.

**Top-tier models — architecture and irreversible calls.** Multi-file refactors, domain model changes, decisions about how to consolidate or restructure something that many other things depend on, anything touching a security boundary. These are the calls that are expensive to unwind if they're wrong — so they get the model with the most reasoning depth, deliberately, every single time.

## What this isn't

This isn't "use cheap AI to save money" as a blanket policy — that would just trade cost for quality on the tasks that need quality most. It's the opposite move: reserving the expensive model *for the tasks that actually need it*, so it isn't diluted across everything else. A team that runs every task on the top-tier model isn't being careful. It's being undifferentiated, and paying a premium for that lack of differentiation on tasks that never needed it.

## Where this shows up in practice

A concrete example from our own project: a session needed to understand duplicate-looking class names across an old flat package structure and a newer, modular one before deciding what to do about them. The *investigation* — grepping for every usage, mapping which classes had real callers versus zero — ran as parallel retrieval work on lightweight models. The *decision* about what to actually do with what was found (delete this one, leave that one alone, escalate the third as a separate architectural question) ran on the top-tier model, because getting that call wrong meant either breaking something live or silently absorbing a much bigger migration into what was supposed to be a small cleanup.

Same session, same overall task, two very different cost profiles for the two very different kinds of work inside it.

## The takeaway

Most teams either default to "always use the best model" (safe but wasteful) or "always use the cheapest model" (cheap but risky on the calls that matter). Neither is a strategy — both are the absence of one. The actual lever is routing by judgment weight, explicitly, task by task, rather than defaulting to either extreme.

Next in the series: why we stopped running full Docker rebuilds on every single test iteration — and the one place we still refuse to cut that corner, no matter how deep into a session we are.

**Question for you:** does your team route tasks to different models explicitly, or is "which model" mostly just a default nobody revisits?
