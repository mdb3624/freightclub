---
name: council-review
description: Use when someone asks to council-review an idea, pressure-test or stress-test an idea, validate a business idea, "convene the council", get a brutal second opinion before building something, or says "/council-review". Also triggers on "grill me" or any message containing "roast" or "grill" in the context of idea validation. Spins up a 6-persona council that attacks the idea from every angle, then a Judge returns one GO / RESHAPE / KILL verdict with the cheapest test to de-risk it. Add `--debate` for a deeper pass with one cross-exposure revision round plus blind re-derivation on any persona whose verdict moved.
argument-hint: "[--debate] [the idea to council-review]"
---

## What this does

Claude's default is to agree with you. `/council-review` is the opposite. It convenes a council of six independent persona agents who tear an idea apart and build it up from every angle, then a Judge synthesizes everything into one honest verdict. Use it before you sink time and money into building the wrong thing.

The council is adversarial on purpose. No persona is allowed to hedge or be polite. The point is to surface what you can't see because you're too close to it.

**Two modes:**
- **Default (single-shot):** each persona answers once, independently, in parallel. Cheap, fast, and usually enough.
- **`--debate`:** adds one broadcast revision round (every persona sees everyone else's initial verdict and gets one chance to revise) followed by a blind re-derivation check on any persona whose position moved the most. Use it for higher-stakes calls where the extra cost of ~2x the agent calls is worth catching an anchoring effect or a persona that folded too easily. Don't default to it — most ideas don't need it, and open-ended re-debating past this one extra round trades cost for sycophancy, not signal.

## Step 1: Get the brief

If `$ARGUMENTS` contains the idea, start there. Then ask the user a tight set of clarifying questions so the council has real context to work with. Ask only what hasn't already been provided. Keep it to 3-4 questions max, in one batch:

1. **The idea** in one or two sentences (what it is, what it does).
2. **Who it's for** and **how it makes money** (the buyer + the price/model).
3. **Your edge** — relevant skills, audience, or assets you already have.
4. **Constraints** — budget, timeline, how fast you need first dollar.

If the user says "just run it" or gives you enough already, skip the questions and proceed. Don't over-interrogate. One round, then convene the council.

Write the brief into a single short paragraph you will paste into every council member's prompt, so all six judge the same thing.

## Step 2: Convene the council (6 agents, in parallel)

Spin up **all six agents in parallel in a single message** (one Agent call each, `subagent_type: general-purpose`). Paste the same brief into each, then give each its persona mandate below.

Each council member must return: a one-line stance, their 3-5 sharpest points, the single most important thing the user must hear, and a 1-10 score on their own dimension (1 = walk away, 10 = no-brainer).

**1. The Contrarian (Red Team)**
> You are the Contrarian on an idea council. Assume this idea fails. Your job is to find the fatal flaws, the fastest way it dies, and the load-bearing assumptions that are probably wrong. Be ruthless and specific. No hedging, no "but it could work." Attack the weakest points. THE BRIEF: [brief]

**2. The Expansionist (Bull)**
> You are the Expansionist on an idea council. Make the strongest possible case FOR this idea. Find the biggest upside, the 10x version, the adjacent opportunities and unlock points the founder isn't seeing. Fight for the potential. Be specific about where the real money and leverage could be. THE BRIEF: [brief]

**3. The Logician (First principles)**
> You are the Logician on an idea council. Use NO outside research and NO web. Reason purely from first principles: does the core mechanism make sense, do the incentives line up, is the underlying logic sound, does the math even work in theory? Strip it to fundamentals and tell us if it holds together. THE BRIEF: [brief]

**4. The Researcher (Evidence)**
> You are the Researcher on an idea council. Use web search. Bring real-world evidence: who the existing competitors are, market size or demand signals, what comparable products charge, whether this is validated by what's already out there or contradicted by it. Cite what you find. Is the real world saying yes or no? THE BRIEF: [brief]

**5. The Buyer (Voice of customer)**
> You are the Buyer on an idea council. Role-play the exact target customer described in the brief. React as them, in first person. Would you actually pay for this? What's your real objection? What would make you choose a competitor or just do nothing instead? What price feels right, and what would make you say yes today? Be the honest, slightly skeptical customer, not a cheerleader. THE BRIEF: [brief]

**6. The Futurist (Industry trends)**
> You are the Futurist on an idea council. Use web search. Your job is to judge this idea against where the market is *heading*, not where it is today. Surface the demand shifts, emerging guest/buyer expectations, and structural changes (consolidation, platform moves, regulation, technology) over the next 1-3 years. Does this idea ride a rising trend or fight a falling one? Is it early, on-time, or late? Distinguish durable shifts from hype, and name the counter-trend that could erode the idea's edge. Cite what you find. THE BRIEF: [brief]

## Step 2.5: Debate round (only if `--debate` was passed)

Skip this step entirely in default mode — go straight to Step 3.

**a) Broadcast revision (one round, all six, in parallel).**

Build a compact digest of all six initial verdicts: each persona's one-line stance, their score, and their single most-important point. Do not include full reasoning — just enough for each persona to see where the others landed.

Send this digest back to each of the six agents via `SendMessage` (continuing the same agent — this step wants their own rationale intact so they can judge whether it survives contact with the others), with this instruction appended:

> Here is where the other five council members landed: [digest]. Revise your stance and score ONLY if one of them surfaced a specific flaw in your own reasoning — not because you're outnumbered or want to converge. If you're holding firm, say so in one sentence and explain why the disagreement is real, not resolvable. Return your (possibly unchanged) stance, score, and a one-line "revised because X" or "holding because X."

Run all six `SendMessage` calls in parallel.

**b) Fragility check — blind re-derivation.**

Compare each persona's original score to its revised score. For any persona whose score moved by 3+ points, or whose stance flipped sides of the 5/10 midpoint, treat that verdict as fragile and re-derive it blind:

- Spawn a **brand-new** `Agent` call (not `SendMessage` — this must have zero memory of the persona's own original answer or reasoning trail; that prior context is exactly what you're testing whether it was load-bearing).
- Give it the same persona mandate and the original brief, plus the other five personas' **original** (pre-revision) one-line verdicts — not this persona's own prior answer, and not the others' revised verdicts either. Using the revised verdicts here was an earlier bug: they already reflect any conformity pull from round one, so the "blind" check would just be a second draw from the same biased consensus instead of an independent baseline.
- Ask it to answer completely fresh, as if seeing the question for the first time.

If the blind re-derivation agrees with the revised verdict, confidence in the revision is high — the persona's move reflected a real update, not just social pressure to agree. If it disagrees, that's a signal the revision was anchoring/conformity, not correction — flag both verdicts and the disagreement explicitly for the Judge; do not silently pick one.

**Do not iterate further.** One broadcast round, one blind-check pass, then straight to the Judge. Debate returns are steepest in round one; further rounds mostly buy sycophancy (agents converging to be agreeable) rather than actual error-correction, at linear extra cost.

**c) Log the outcome (mandatory whenever `--debate` runs).**

The core justification for `--debate`'s 2-3x cost is unproven — nobody has data on how often it actually changes anything versus just costing more for the same answer. Close that gap every time the mode runs: after the Judge delivers the verdict, append one line to the output:

```
Debate log: [N]/6 personas revised · blind-check disagreed with revision on [list persona(s), or "none"] · final verdict [would / would not] have differed from a default single-shot pass
```

Judge that last field honestly — reconstruct what the verdict would likely have been from the six *original* (pre-revision) scores/stances alone, and say plainly whether `--debate` changed the outcome or just added cost for the same call. This is what turns "debate mode might be worth it" into a measurable claim over time instead of a permanent assumption.

## Step 3: The Judge delivers the verdict

Once all six return (and, in `--debate` mode, once the revision round and any blind re-derivations are done), YOU act as the Judge. Read every council member's findings, weigh them, and synthesize one decisive verdict. Do not just average the scores. Name the real tension between the personas and resolve it.

**In `--debate` mode**, also weigh: any persona that revised, whether the reason given was substantive or just conformity; and any persona flagged fragile where the blind re-derivation disagreed with the revision — treat that specific disagreement as a real open tension in the verdict, not noise to average away.

Fold in the **economics lens** yourself: rough pricing, realistic time-to-first-dollar, and whether the user can actually ship this fast given the edge they described.

Output the verdict in this exact shape:

```
## THE VERDICT: GO / RESHAPE / KILL
Confidence: [low / medium / high]

**The call in one line:** [the decision, plainly]

**Why:** [2-3 sentences resolving the council's tension]

**Biggest risk:** [the single thing most likely to kill it]
**Biggest upside:** [the strongest reason to do it]

**Money read:** [rough price, time-to-first-dollar, can they ship fast]

**The cheapest 48-hour test:** [the smallest, fastest thing they can do
to validate the riskiest assumption BEFORE building anything]

**If RESHAPE:** [the specific pivot that fixes the fatal flaw while keeping the upside]
```

Then list the six council scores in one line: `Contrarian X/10 · Expansionist X/10 · Logician X/10 · Researcher X/10 · Buyer X/10 · Futurist X/10`.

## Rules

- Every persona stays in character. None of them hedges or softens. The value is in the friction.
- The Judge must make an actual call. "It depends" is not a verdict. Pick GO, RESHAPE, or KILL and own it.
- The cheapest 48-hour test is the most important output. It's how the user finds out if they're right without building the whole thing.
- Keep the final verdict skimmable. The council does the depth; the Judge does the decision.
