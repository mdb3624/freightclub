# LinkedIn Series: Token Savings Through Governance

**Status:** Draft, editorial pass applied 2026-08-18. Each entry has a separate short-form post file (for the LinkedIn feed) and a full-length article file (for LinkedIn Articles / a linked "read the full story"). Not yet published.

## Files

See `STRATEGY.md` for the audience, positioning, and success-metrics behind this series.

| # | Topic | Post (short, feed) | Article (full-length) |
|---|-------|---------------------|------------------------|
| 0 | Series intro / teaser | `00-series-intro-post.md` | `00-series-intro.md` |
| 1 | Model-tiered delegation | `01-model-tiered-delegation-post.md` | `01-model-tiered-delegation.md` |
| 2 | Targeted verification vs. full rebuilds | `02-targeted-verification-post.md` | `02-targeted-verification.md` |
| 3 | The coverage gate that had been silently dead | `03-dead-coverage-gate-post.md` | `03-dead-coverage-gate.md` |
| 4 | The database privilege that quietly defeated security | `04-database-security-rls-post.md` | `04-database-security-rls.md` |
| 5 | Stopping one bad assumption from becoming three | `05-escalation-scope-control-post.md` | `05-escalation-scope-control.md` |
| 6 | Series wrap-up | `06-series-wrapup-post.md` | `06-series-wrapup.md` |

## How the pair works

Post to the LinkedIn feed with the short-form `*-post.md` text. Publish the corresponding `*.md` article as a LinkedIn Article (or link out to it) for readers who want the full story. Post text stays feed-length (150-250 words, ends in a discussion question); article text is the expanded, full-depth version of the same material — same underlying facts, more narrative and explanation.

## Sourcing note

Every technical fact across both posts and articles — test counts, coverage percentages, the specific gate and privilege failures — is sourced from this project's own Technical Debt Ledger (`.claude/learnings.md`) and real CI/test-run output, not invented for narrative effect. Where something is still open/unresolved (the cross-tenant write-authorization gap referenced in entry 4), both the post and the article say so explicitly rather than implying it's fixed. One deliberate exception: an editorial suggestion to add an aggregate "~35-40% token savings" figure to Post 0 was **not applied**, since no such measurement exists.

## Publishing mechanics

- Keep links out of post bodies generally — links suppress algorithmic reach. For Post 4 specifically, publish the text directly with no link, and drop the article link (plus any supporting RLS-policy diagram) in the **first comment** instead.
- Each post ends with a direct discussion question — reply to early comments quickly, since early engagement velocity drives reach more than the post itself.
- Recommended cadence: weekly, Tuesday mornings.

**Recommended launch calendar:**
| Week | Entry |
|------|-------|
| 1 | 0 — Series intro |
| 2 | 1 — Model-tiered delegation |
| 3 | 2 — Targeted verification |
| 4 | 3 — Dead coverage gate |
| 5 | 4 — Database security / RLS |
| 6 | 5 — Escalation & scope control |
| 7 | 6 — Series wrap-up |
