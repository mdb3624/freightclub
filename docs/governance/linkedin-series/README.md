# LinkedIn Article Series: Token Savings Through Governance

**Status:** Draft, expanded from the 7-post series into full-length LinkedIn Articles. Not yet published.

Each short post in the original series (`../linkedin-post-token-savings-and-rls.md`) is expanded here into a full-length article — the format LinkedIn Articles support, as opposed to the character-limited main feed post. Post the short version to the feed to drive traffic; link the corresponding article as the "read the full story" follow-up (or publish the article first and tease it with the short post — either order works with the first-comment-link mechanic noted in the parent doc).

## Files

| # | Title | File |
|---|-------|------|
| 0 | Series Intro: Why We Govern AI Coding the Way We Govern Engineers | `00-series-intro.md` |
| 1 | Model-Tiered Delegation: Stop Paying Premium Prices for Grunt Work | `01-model-tiered-delegation.md` |
| 2 | Targeted Verification vs. Full Rebuilds: Where We Draw the Line | `02-targeted-verification.md` |
| 3 | The Coverage Gate That Had Been Silently Dead for Weeks | `03-dead-coverage-gate.md` |
| 4 | The Database Privilege That Was Quietly Defeating Our Security Model | `04-database-security-rls.md` |
| 5 | Stopping One Bad Assumption From Becoming Three | `05-escalation-scope-control.md` |
| 6 | What Five Governance Mechanisms Add Up To | `06-series-wrapup.md` |

## Sourcing note

Every technical fact in this series — test counts, coverage percentages, the specific gate and privilege failures — is sourced from this project's own Technical Debt Ledger (`.claude/learnings.md`) and real CI/test-run output, not invented for narrative effect. Where something is still open/unresolved (the cross-tenant write-authorization gap referenced in Article 4), the articles say so explicitly rather than implying it's fixed.

## Publishing mechanics (carried over from the short-post series doc)

- Keep links out of short-post bodies; for Post 4 specifically, publish the article, then link it from the **first comment** on the short post rather than the post body.
- Recommended cadence: weekly, Tuesday mornings — see the calendar in `../linkedin-post-token-savings-and-rls.md`.
