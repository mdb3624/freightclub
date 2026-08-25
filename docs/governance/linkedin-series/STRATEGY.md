# LinkedIn Strategy — Governance Series

Companion to `README.md` (file map, pairing mechanics, launch calendar). This file covers the *why* and *who for*; README covers the *how*.

## Goal

Establish a narrow, credible position: **AI-coding governance specialist**, evidenced by a real system running on a real (if young) production platform — not a general dev-productivity or PM thought-leadership account. The series is the proof artifact for that positioning, not a lead-gen funnel on its own.

Primary objective: inbound conversations with engineering leaders who are already worried about ungoverned AI-assisted development (cost, security, or quality) and want to see a working model before they'll take a call.

Secondary objective: a citable, linkable body of work — each article should stand alone if someone finds it via search or a shared link months later.

## Audience

- Engineering managers / staff+ engineers at small-to-mid teams adopting AI coding assistants without a governance model yet.
- Security/compliance-adjacent technical leads who care about the RLS/privilege story (Article 4) specifically.
- NOT: general "AI productivity" audience, non-technical founders, or recruiters. Don't optimize for broad reach at the cost of specificity — the credibility comes from precision, not volume.

## Positioning guardrails

- **Narrow specialist, not bundled generalist.** Governance of AI-assisted coding only — do not fold in general project-management, Agile-coaching, or "AI transformation consulting" framing. [[feedback_no_pm_in_governance_pitch]] confirmed this via /roast: narrow positioning beats bundled claims.
- **Honest about platform maturity.** FreightClub is recently launched, not a long-running production system with months of live customer traffic. Frame incidents as "on our production platform" — true — never imply sustained live-traffic history that doesn't exist. [[project_freightclub_recently_launched]]
- **No fabricated metrics.** Every number (test counts, coverage %, specific failures) must trace to the Technical Debt Ledger or real CI output. The deliberate omission of an unsupported "~35-40% token savings" claim in Post 0 is the model to follow — if a rollup stat isn't measured, don't publish it, even when it would read well.
- **Unresolved issues stay unresolved in the copy.** Article 4 openly states the cross-tenant write-authorization gap is still open. Don't let future editorial passes quietly imply it's fixed before it is.

## Content pillars

1. **Incident-driven mechanism posts** (the current 7-part series) — one real failure, the mechanism that caught or prevented it, the durable rule that resulted.
2. **Mechanism deep-dives as linked articles** — the short post drives the discussion; the article is the credibility artifact for anyone who clicks through.
3. **(Future pipeline, not yet written)** — candidates for a second wave once the first series completes, each still tied to a real, sourced incident:
   - Reviewer hard-gate rejections that caught real regressions before merge.
   - The Sequential Lock Protocol / forward-only escalation in practice (a CHG-### ticket that changed an outcome).
   - Coverage ratchet-up story once branch coverage moves meaningfully past 69.49%.
   - Do not pre-write these — they get sourced from the ledger as they actually happen, same as the current series.

## Cadence & mechanics

See `README.md` for the launch calendar, post/article pairing, and per-post publishing notes (link placement, comment-first for Article 4, reply velocity). This file does not duplicate that detail — check README before scheduling.

## Success metrics

- Qualitative: do comments/DMs come from the target ICP (eng leads, not general engagement farmers)?
- Article click-through from post — indicates the short post is doing its job of driving to depth rather than being read as the whole story.
- Inbound conversations referencing a specific article (e.g., "the RLS one") as the reason for reaching out — the signal that the specificity strategy is working over a generic-authority approach.
- Explicitly not tracked as success: raw impression/like counts. Reach without ICP relevance doesn't serve the positioning goal.

## Traffic tactics

Reach optimization here means ICP-relevant engagement, not raw impressions — see Success Metrics above. In priority order:

1. **Pre-seed replies.** DM 3-5 relevant contacts (eng leads, security folks) ahead of publish with a heads-up and the discussion question, asking for a real take rather than a generic "great post." Early comment *quality* in the first 60-90 minutes drives algorithmic reach far more than like counts — this beats any generic engagement-pod approach.
2. **Reply to every comment within the first hour.** Already noted in the publishing-mechanics section below as a per-post rule; treat it as non-negotiable, not aspirational.
3. **No link in the post body, ever.** Already the rule for Article 4 specifically — extend it to all posts. A link in the primary post measurably suppresses native reach; put it in the first comment instead.
4. **Consistent posting slot.** Tuesday-Thursday, 7-9am in the target audience's timezone, same time every week. Consistency trains the *people* likely to convert to expect it — this matters more than any specific "best" day/time.
5. **Tag sparingly.** Only when genuinely relevant (e.g., a tool/framework maintainer referenced in a technical detail). Irrelevant tagging reads as spam and can suppress reach rather than extend it.
6. **Article/post timing: same day, article first.** Publish the LinkedIn Article an hour or so before the native post, so the link target already exists when the first comment references it. Then publish the post at the fixed weekly slot (rule 4 above), with the article link only in that first comment — never in the body. Don't stagger article and post across different days: a LinkedIn Article gets negligible native distribution on its own, so its traffic comes almost entirely from the post's first-comment link, not independent discovery — splitting them across days just splits attention across two moments for no benefit.

Tradeoff to expect: optimizing for ICP-relevant engagement over impressions means view/like counts will look modest next to viral-format LinkedIn posts. That's expected under the Success Metrics above, not a sign the strategy is underperforming.

## Review checkpoint

Before publishing each entry, re-check against the Sourcing Note in `README.md` and this file's positioning guardrails — treat both as a two-item pre-publish gate, not optional context.
