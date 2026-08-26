# Stopping One Bad Assumption From Becoming Three

*Article 5 of 6 in the series "Token Savings Through Governance." Previously: [The Database Privilege That Was Quietly Defeating Our Security Model](04-database-security-rls.md).*

## The temptation that creates the most damage

Finding a real problem in the middle of an unrelated task creates a specific, familiar temptation: *while I'm already in this file, let me just fix this other thing I noticed, clean up this adjacent mess, rewrite this helper that's clearly wrong too.* It feels efficient in the moment — you're already there, the context is loaded, why make someone come back later?

It's also how a clean, reviewable, one-purpose change quietly becomes an unreviewable rewrite that touches things nobody asked it to touch. Scope creep rarely arrives as a decision. It arrives as a series of individually reasonable "while I'm in here" moments that nobody ever explicitly chose to bundle together.

## The rule we apply instead

When any stage of our development process — implementation, review, design — hits input from an earlier stage that turns out to be wrong, incomplete, or impossible to build cleanly as specified, the rule is: **escalate forward, with a written ticket. Never quietly rework what came before, and never silently expand what you were asked to do.**

Forward-only matters as much as the written-ticket part. It would be just as damaging to go backward — unilaterally deciding an earlier decision was wrong and reworking it without anyone signing off — as it is to silently expand scope in the moment. Both failure modes share the same root cause: someone deciding, in the middle of doing one thing, to also do a second thing that nobody explicitly agreed they should be doing right now.

## A real example

A recent code review flagged something that looked simple on the surface: duplicate-looking class names showing up in two different places in the codebase — an older, flat package structure, and a newer, modular one that had been introduced as part of an ongoing architectural migration. The obvious move would have been to just delete the old ones and move on.

Investigation instead of assumption turned up three genuinely different situations hiding behind what looked like one uniform problem:

1. **A true duplicate with exactly one remaining caller.** The old and new versions were near-identical; one service still imported the old one. Safe to retarget that one import and delete the old class.
2. **An orphaned class with zero callers anywhere in the codebase.** Fully-formed code that had been written at some point but never actually wired into anything — a controller, a service, a repository — nowhere. Dead code, safe to delete outright.
3. **A much larger, still-in-progress architectural migration wearing the same disguise as the first two.** The class names looked like simple duplicates from the outside, but consolidating them meant rewriting a legacy stack that several other things still actively depended on — a decision with real blast radius, not a cleanup.

## What we actually did

We fixed the first two immediately — verified by both a targeted test run during the fix and the full pre-merge protocol before it shipped. Low risk, single caller or zero callers, nothing else in the system depended on the outcome being anything other than "delete the old one."

The third, we did not touch. It got logged explicitly as its own open item, flagged for a dedicated architectural decision later, rather than being rushed through under the momentum of "well, we're already cleaning up duplicates today." Attempting it in the same pass would have meant making a consequential call about a much bigger migration under the informal justification of a small debt-cleanup task — exactly the kind of scope expansion the escalation rule exists to prevent.

## Why this matters more than any single fix

The value of this rule isn't really about any one decision being right or wrong in isolation. It's that the *process itself* stays legible. Anyone auditing this project later can look at exactly what was fixed, why it was judged safe, and what was deliberately left alone and why — instead of trying to reverse-engineer intent from a diff that quietly did five different things under one commit message.

That legibility is what makes the other four mechanisms in this series actually trustworthy. A team that runs full verification before every merge, catches dead CI gates, and audits database privileges — but lets scope silently creep on every fix — still ends up with a codebase nobody can fully account for. This rule is what keeps the other four honest.

## The takeaway

The most efficient-feeling move in the moment — "I'm already here, let me just fix this too" — is very often the move that costs the most later, because it's invisible at the time it happens. A rule that forces a written pause before scope expands doesn't slow down the fixes that are genuinely safe. It slows down exactly the fixes that shouldn't have been rushed in the first place.

Final article in the series next: what all five of these mechanisms add up to, together.

**Question for you:** what's the last "while I'm in here" fix on your team that quietly grew into something bigger than anyone planned?
