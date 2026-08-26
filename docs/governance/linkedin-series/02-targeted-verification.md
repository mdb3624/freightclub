# Targeted Verification vs. Full Rebuilds: Where We Draw the Line

*Article 2 of 6 in the series "Token Savings Through Governance." Previously: [Model-Tiered Delegation](01-model-tiered-delegation.md).*

## The ritual nobody questioned

For a stretch of this project, every code change — no matter how small — triggered the same sequence: tear down the Docker test environment and its volumes, rebuild the backend JAR from scratch, rebuild the frontend, spin the full test stack back up, wait for health checks to pass, then run the entire test suite from front to back.

Even for a one-line fix inside a single service method.

Nobody had decided this was the right level of rigor for every change. It was just the default, repeated because it had worked the first time and nobody stopped to ask whether it needed to run in full every time after. That's a specific, common failure mode: a safety practice that made sense once becomes a habit that's never re-evaluated, and the cost compounds silently — minutes of wall-clock time per iteration, multiplied by a dozen iterations in a single TDD session, multiplied by every session.

## Splitting verification into two honest modes

The fix wasn't "test less." It was recognizing that "prove this specific change is correct" and "prove the whole system is still correct" are different questions that don't need the same answer every time.

**Mode 1 — red/green iteration.** While actively writing or fixing a single piece of behavior, using test-driven development's red-green-refactor loop, we run *one* targeted test class against an already-running database container. No teardown. No rebuild. No full suite. It answers exactly the question being asked at that moment — "does this change make the failing test pass without breaking the tests right next to it" — in seconds rather than minutes.

**Mode 2 — the mandatory pre-merge protocol.** Before anything reaches a pull request, merge, or deploy, the full protocol runs with zero exceptions: clean Docker volumes, a cold rebuild of both backend and frontend, a full restart of the test environment, a health check, and the complete test suite. This is the one place we do not shortcut, regardless of how late in a session it is or how confident the targeted runs made us feel along the way. On a recent full run: 902 tests, 0 failures, 0 errors, 0 skipped. That's the actual proof point — not the targeted runs during iteration, which exist to keep iteration fast, but this one, which exists to catch what only shows up when everything runs together.

## Why the full rebuild during iteration didn't actually buy anything

The insight that took longer than it should have to land: running a full rebuild in the middle of an iteration loop doesn't give you more confidence than the targeted run already gave you. It just re-proves the same thing — that the rest of the system still works — nine extra times in a session where nothing in the rest of the system changed. The full suite earns its cost exactly once per merge, when it's actually checking something that could plausibly be different: the accumulated effect of everything changed since the last full run.

Treating every iteration like a merge doesn't make the codebase safer. It just makes iteration slower without adding new information.

## The discipline this requires

This only works if the two modes stay genuinely separate — if "I'll just skip the full protocol this once, I'm confident" becomes a habit, the whole model collapses back into either "always full" (slow) or "never full" (risky). The rule has to be mechanical and non-negotiable at the merge boundary specifically, precisely because that's the one place where "I'm pretty sure it's fine" isn't a substitute for actually knowing.

## The takeaway

The lever isn't testing more or testing less. It's matching the *scope* of verification to the *scope* of the question actually being asked at that moment in the workflow — a targeted question during iteration, and a comprehensive one at the point where code is about to become permanent. Most teams either always run the heavy suite (safe, slow) or informally skip it under time pressure (fast, risky). Making the two-speed split explicit and mechanical is what keeps both properties — fast iteration and real safety — without trading one for the other.

Next in the series: what happens when the gate everyone trusted for weeks turns out to have been switched off the entire time.

**Question for you:** where does your team draw the line between "fast enough to keep momentum" and "thorough enough to actually trust"?
