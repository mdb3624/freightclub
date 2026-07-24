# Run Story

Take a user story or bug report from intake to merged/DONE by driving it through the governed six-role SDLC (`docs/roles/*.md`) defined in `docs/project/RACI.md`. Maximizes autonomy on *mechanical* work; keeps a human or a structurally independent verification gate on every *judgment* call.

**Origin:** Built from the `/roast` council verdict (RESHAPE, 2026-07-23) on running all six roles in one self-reviewing session. The council's core finding, 4/5 independently: a single continuous context role-playing Coder-then-Reviewer-then-Librarian is not independent review — it's the same reasoning re-reading itself with a motive to agree. Fix adopted: BA/ARCH/HFD/CODE run in one continuous session (cheap, reversible, redo-able if wrong); REVIEWER and LIBRARIAN run as **separate, fresh-context agent invocations** that cannot pass/sign-off without attaching real command output. See `docs/project/CHANGELOG.md` and this session's `/roast` transcript for the full reasoning.

## Execution Mode by Role

| Role | Mode | Why |
|---|---|---|
| BA | Same session | Cheap to redo; Gate 1 is the real check |
| ARCH | Same session | Cheap to redo; design mistakes surface at CODE/REV |
| HFD | Same session | Cheap to redo; visual gates re-verified at REV |
| CODE | Same session | Produces the artifact under test — has to be *someone's* work product |
| **REVIEWER** | **Fresh-context Agent, blocking** | Its entire job is to be independent of the author. Same-context self-review measurably underperforms (arxiv 2603.12123, cited in `/roast` transcript). |
| **LIBRARIAN (DONE sign-off)** | **Fresh-context Agent, blocking** | Same reasoning — DONE sign-off is a verification claim, not a mechanical step. |

**Human checkpoints (non-negotiable, do not shrink further — this was the `/roast` council's explicit warning):**
1. **Gate 1** — Director approves the story's Acceptance Criteria before ARCH starts (`docs/roles/BUSINESS_ANALYST.md`).
2. **Tier A** — any financial/compliance ambiguity halts and asks the Director; never auto-decided (`docs/roles/BUSINESS_ANALYST.md` §Autonomous Decision-making Protocol).
3. **Merge** — `gh pr merge` requires explicit user confirmation (global git-safety policy: pushing/merging is a "visible to others" action). Opening the PR is not gated — submitting to Reviewer is a normal, expected, reversible step in this SDLC.
4. **Mid-pipeline CHG decisions** (Option A "finish as-is" vs Option B "pause, rework as vX") are judgment calls, not verification — route to the Director, don't let an in-session "Librarian voice" decide them for the same self-review reason REVIEWER/LIBRARIAN got split out.

---

## Step 0 — Classify the Input

Given the user's story/bug description, determine:

1. **Type:**
   - `NEW_FEATURE` — full BA→ARCH→HFD→CODE→REV→LIB pipeline.
   - `BUG_FIX (regression)` — an existing DONE story's behavior broke. Skip full BA story authoring; instead draft a minimal bug ticket (own `US-###` or `BUG-###` ID for traceability) stating: what broke, which story/AC it regresses, root-cause hypothesis. Still requires the Gate 1-equivalent one-line confirmation below before CODE starts.
   - `BUG_FIX (new)` — no prior story covers this behavior. Treat as `NEW_FEATURE` but AC can be terse (Given/When/Then for the one broken path + the fix).
2. **Scope flag** (per `docs/roles/BUSINESS_ANALYST.md`): `FULL_STACK` / `UI_ONLY` / `BACKEND_ONLY`. `BACKEND_ONLY` skips the HFD phase entirely.

Print the classification and proceed — no confirmation needed for classification itself.

---

## Step 1 — BA Phase (same session)

Load `docs/roles/BUSINESS_ANALYST.md` in full and act as BA.

1. Actor + value statement + Gherkin AC.
2. INVEST self-check (all six boxes, or revise before continuing).
3. Field Contract Table: populate `UI Field` column only; leave ARCH's columns blank.
4. Platform Foundation Mapping (which persona benefits, in what sequence).
5. **Tier A check:** if anything touches fee structures, pricing, payment terms, or real regulatory/legal exposure — **stop immediately**, do not draft further, ask the Director with 2-3 concrete options (not "what should the fee be"). Wait for the answer before continuing.
6. Tier B ambiguity (copy wording, field naming, non-binding defaults): decide autonomously, log the decision in the story file per `docs/roles/BUSINESS_ANALYST.md` §5-6. Do not ask.
7. Jira ticket creation (`FREIG` project) + update `docs/project/Story_ID_to_Jira_Mapping.md`/`.csv`.
8. Catalog in `docs/business/stories/` — do **not** touch `Story_Map.md` yet (Librarian-owned; updated at final sign-off).

**HUMAN STOP — Gate 1 (mandatory, not skippable):** Present the story ID, actor, value statement, and full Gherkin AC to the Director. Use `AskUserQuestion` or a direct confirmation request. Do not proceed to Step 2 until explicit approval is given. This is the floor the `/roast` council said not to erode further.

**Phase Exit Checklist (verify with Read/Glob before advancing — do not mark done from memory of having written it):**
- [ ] `docs/business/stories/US-XXX.md` exists on disk with the full story (actor, AC, INVEST boxes, Field Contract Table, Tier decision log). Narrating the story in chat is not cataloging it — `docs/roles/BUSINESS_ANALYST.md` requires the file.
- [ ] Jira ticket created and its key recorded in the story file — **or**, if skipped, the user's *specific* skip approval is quoted in the story file (not inferred from an unrelated Gate 1 approval). Silently treating "approve AC" as "approve skipping Jira" is a violation — ask separately if it's not explicit.
- [ ] `docs/project/Story_ID_to_Jira_Mapping.md`/`.csv` updated to match (or the same explicit skip note applies here too).
- [ ] Gate 1 approval is quoted/timestamped in the story file.

Any unchecked box blocks Step 2 — fix it or explicitly flag the deviation to the user before proceeding, don't silently continue.

---

## Step 2 — Architect Phase (same session)

Load `docs/roles/ARCHITECT.md` in full and act as Architect.

1. Input Acceptance Gate checklist against the now-locked BA story. If it fails, do not silently proceed — see **Mid-Pipeline Escalation** below.
2. **Platform Reuse Check (mandatory, not optional):** grep `docs/project/Story_Map.md` (all statuses) and existing services/controllers for the same domain logic or user-facing capability, per the US-761/US-820 duplicate-KPI incident this repo has already suffered. If overlap found, reuse/extend — do not design a duplicate.
3. Domain model, DB schema (RLS included), ERD, soft-delete/multi-tenancy rules.
4. Fill Field Contract Table: `API Param` / `DB Column` / `Type` / `Required` for every BA-populated row, plus backend-only rows with `N/A` + justification.
5. For `UI_ONLY` scope: mark all technical columns N/A, skip to Step 4 (no schema work needed).

No human stop here — cheap to redo if wrong; CODE's own Input Acceptance Gate re-validates this before building on it.

**Phase Exit Checklist (verify before advancing):**
- [ ] Platform Reuse Check was run as literal commands (grep against `Story_Map.md` and controllers/services) with their actual output shown — not narrated as "I checked and there's no overlap." No output pasted = not done.
- [ ] `docs/business/stories/US-XXX.md` updated in place with: the completed Field Contract Table (all ARCH columns filled or N/A+justified), the ERD/domain model, and any RLS/multi-tenancy/soft-delete notes — persisted to the same file BA created, not left only in chat.
- [ ] Any duplicate-capability finding (even out-of-scope) is logged as a debt note in the story file, per the Technical Debt Logging Protocol in `docs/roles/LIBRARIAN.md` — not silently dropped.

Any unchecked box blocks Step 3/4 — fix it or flag the deviation before proceeding.

---

## Step 3 — HFD Phase (same session — skip entirely if Scope = `BACKEND_ONLY`)

Load `docs/roles/HUMAN_FACTORS_DESIGNER.md` and the matching persona design system (`docs/standards/{PERSONA}_DESIGN_SYSTEM.md`, `docs/roles/{PERSONA}_HFD_RULES.md`) in full and act as HFD.

1. Style Guide ingestion + citation for every color/font/spacing choice.
2. Field Contract Table validation (row-by-row, per `docs/roles/HUMAN_FACTORS_DESIGNER.md` §Field Contract Table Validation Protocol).
3. Contextual mockup within Shell context (no standalone widget previews).
4. Visual Fidelity Audit + No-Drift Certification.
5. Accessibility verification (contrast, ARIA, keyboard nav).
6. Handoff Manifest complete → sign `READY_FOR_CODER`.

If any Field Contract Table row is incomplete/contradictory and the gap traces to BA or ARCH output: do not invent the missing value — see **Mid-Pipeline Escalation**.

**Phase Exit Checklist (verify before advancing):**
- [ ] Handoff Manifest's four deliverables actually exist as files (`docs/roles/HUMAN_FACTORS_DESIGNER.md` §Handoff Manifest): contextual mockup, design spec, validated Field Contract Table, and the signed No-Drift Certification statement — quoted verbatim, not paraphrased.
- [ ] `docs/business/stories/US-XXX.md` links to or embeds these artifacts.

Any unchecked box blocks Step 4.

---

## Step 4 — Coder Phase (same session)

Load `docs/roles/CODER.md` in full and act as Coder.

**STOP AND VERIFY (literal first tool call — before any Write/Edit, before TDD, before anything else in this phase):** run `git branch -v`. If the current branch is `main`, run `git checkout -b feature/US-XXX-short-description` immediately. Do not proceed to step 1 below until a feature branch is confirmed current. This is a hard precondition, not a step to reach eventually — treat it exactly like the Pre-Implementation Plan Gate. (Incident: this order was violated once on US-861 — TDD started and several files were edited on `main` before the branch check ran, because the branch step was listed after TDD in prose and got read as narrative rather than a sequenced action.)

1. Input Acceptance Gate (BA + ARCH + HFD checklists, per Scope flag's required sign-off chain).
2. **Pre-Implementation Plan Gate** — before the first Write/Edit: existing-tooling check (`git log --follow`, Glob for similar files), current-state verification, prefer platform tools over reimplementation, state the verification plan up front.
3. **Service/Endpoint Reuse Check** — grep Story_Map + `*Controller.java` for capability overlap before adding any new endpoint or service.
4. TDD Red-Green-Refactor per AC (on the feature branch confirmed above — never on `main`).
5. Run tests locally (targeted run during iteration per `.claude/rules/testing_standards.md`; full Pre-Test Protocol before submitting).
6. HFE visual parity self-check against design reference (UI stories only) — do not submit if visual drift exists.
7. External config/secret wiring verification if a new `@Value`/env var was introduced — real curl against the real Docker test endpoint, not mocks, pasted into the story doc.

**Checkpoint (lightweight, not a full Gate):** confirm with the user before `git push` + `gh pr create` — pushing to remote is a "visible to others" action under standing git-safety policy. A one-line confirmation is sufficient; this is not Gate 1 and should not feel like it.

On confirmation: push branch, open PR, note the PR number.

**Phase Exit Checklist (verify before advancing to Step 5):**
- [ ] Currently on a `feature/US-XXX-...` branch — re-confirm with `git branch --show-current`, don't just trust the earlier STOP AND VERIFY ran cleanly.
- [ ] Test run output (`Tests run: N, Failures: 0, Errors: 0`) actually pasted from a real command, for every new/changed test class — not summarized from memory of having run it earlier.
- [ ] Every AC from the story file has at least one corresponding test; cross-check against the story file, don't rely on recollection.
- [ ] PR is open and its number is recorded — Step 5 cannot run without it.

Any unchecked box blocks Step 5.

---

## Step 5 — REVIEWER Phase (fresh-context Agent, blocking — evidence-gated)

**Do not do this in the current session.** Spawn via the `Agent` tool, `subagent_type: general-purpose`, `run_in_background: false` (the pipeline blocks on this result).

**Fresh-Context Contract:** the prompt below is the *entire* context the Reviewer agent receives. Do not paste the current session's reasoning, design discussion, or "why I made this choice" narrative — only artifacts a genuinely independent reviewer would have: the story ID, the AC, the Field Contract Table, the PR number, and file paths. If the Reviewer agent can see why Coder made a choice, it will rationalize the choice instead of verifying it.

```
Prompt template:

You are the Reviewer for FreightClub. Load docs/roles/REVIEWER.md in full and apply its
complete hard-gate checklist to PR #<PR_NUMBER> for story <STORY_ID>.

Story AC: <paste Gherkin AC only>
Field Contract Table: <paste table only>

You have no knowledge of how or why this code was written. Verify it from scratch, as an
adversarial reviewer would. Specifically:

1. Run `gh pr checks <PR_NUMBER>` and paste the literal output. A PASS requires every
   required check green — pending/absent is not evidence of passing.
2. Run the actual test suite yourself (targeted or full per .claude/rules/testing_standards.md)
   and paste literal stdout — do not trust the PR description's claimed coverage number.
3. Check test-results/evidence/ for a screenshot matching <STORY_ID> (UI stories only) and
   confirm it visually matches the HFD design reference — describe what you see.
4. For every UI Field → API Param → DB Column row in the Field Contract Table, trace it in
   the actual diff — confirm the value really flows end-to-end, don't take the table's word
   for it.
5. Apply every hard gate in docs/roles/REVIEWER.md (RLS, soft deletes, cyclomatic complexity,
   touch-target boundingBox assertions, cache annotations if Phase 7+, Sequential Lock
   Protocol violations, PowerShell-only commands).
5a. Run `gh pr view <PR_NUMBER> --json headRefName` and confirm the source branch is not
   `main` — paste the literal output. A PR opened from `main` is an automatic REJECT
   regardless of code quality (incident: US-861's Coder phase edited source directly on
   `main` before this check existed; branch discipline must be independently verified here,
   not just trusted from the Coder session's own claim).
6. If a new external API key/env var was introduced, confirm the story doc contains a real
   pasted curl response against the live Docker test endpoint — a green mocked suite alone
   is not sufficient evidence per the FREIG-116/US-854 incident.

RULE: You may not issue APPROVED without pasting the literal output of every command above.
An APPROVED verdict with no attached command output is invalid — treat it as REJECTED with
a process-violation note instead.

Output format: APPROVED / REJECTED / TECHNICAL DEBT, with every hard-gate row and its
evidence, per docs/roles/REVIEWER.md's Review Verdicts section.
```

---

## Step 6 — Gate Check

- **REJECTED:** do not proceed to Librarian. If the finding is something Coder can fix directly (test gap, missing gate, style violation) — that's a normal fix-and-resubmit loop, not a Sequential Lock violation (Coder fixing its own code isn't "asking BA/ARCH to change inputs"). Fix in the current session, push an update, and **spawn a new fresh-context Reviewer agent** (do not resume/reuse the rejected one — reusing it reintroduces the same anchoring problem this split was built to avoid). Cap at 3 review cycles; on a 3rd rejection, stop and report to the user as `BLOCKED` rather than looping indefinitely.
- **APPROVED or TECHNICAL DEBT (logged):** proceed to Step 7.

---

## Step 7 — Merge (human checkpoint)

Ask the Director: "Reviewer APPROVED PR #<N> for <STORY_ID>. Merge now?" One-line confirmation. On yes: `gh pr merge <PR_NUMBER>` (respect any configured merge strategy). Do not proceed to Step 8 without this confirmation — merging is explicitly a "visible to others" action under standing git-safety policy, separate from the Reviewer's technical PASS.

---

## Step 8 — LIBRARIAN Phase (fresh-context Agent, blocking — evidence-gated)

Spawn a second, separate fresh-context Agent (`subagent_type: general-purpose`, `run_in_background: false`). Same Fresh-Context Contract as Step 5 — no implementation-session reasoning, only artifacts.

```
Prompt template:

You are the Librarian for FreightClub. Load docs/roles/LIBRARIAN.md in full.

Story: <STORY_ID>
PR: #<PR_NUMBER>
Reviewer verdict + evidence: <paste Step 5's full output>

You must independently verify — do not accept "PR merged" or "Reviewer approved" as fact
from anything pasted above without re-checking it yourself:

1. Run `gh pr view <PR_NUMBER> --json state,mergedAt` yourself and confirm state is MERGED.
   Per docs/roles/LIBRARIAN.md's mandatory PR-state-verification rule (added after a real
   incident: a sign-off asserted "merged" from memory of an earlier gh pr merge call, and
   the PR was still OPEN when checked) — never assert merge state without this check.
2. Run `gh pr checks <PR_NUMBER>` yourself and confirm all required checks are green.
3. Verify traceability: Requirements → User Story → Design → Code all link correctly.
4. If Phase 7+ story: verify the cache-behavior checklist in docs/roles/LIBRARIAN.md.

Only after 1-4 independently pass:
- Write docs/project/LIBRARIAN_SIGN_OFF_<STORY_ID>.md using the template in
  docs/roles/LIBRARIAN.md.
- Update docs/project/Sprint_Log.md and docs/project/Story_Map.md to DONE.
- If Jira-tracked, transition the FREIG ticket to Done.

RULE: You may not write DONE anywhere until step 1's gh pr view output literally shows
state: MERGED, pasted in your response. A DONE claim without that pasted evidence is invalid.
```

---

## Mid-Pipeline Escalation (CHG-### protocol)

If BA/ARCH/HFD/CODE hits an input from a previous role that's wrong, incomplete, or impossible (not a Tier A financial/compliance issue — that's Step 1's separate stop):

1. **Do not** ask the previous role to change its output (Sequential Lock — no backward loops).
2. **Do not** let the current session decide Option A/B by role-playing "Librarian" — a CHG decision (finish as-is vs. pause and rework as vX) is a judgment call about scope and cost, not a verification task. Routing it to an in-session persona reintroduces exactly the self-review problem Steps 5/8 exist to avoid, just one level up.
3. Draft the CHG-### ticket using the template in `docs/roles/LIBRARIAN.md`, present it to the Director, and stop. Wait for Option A ("finish as-is, track separately") or Option B ("pause, spin up US-###-v2") before continuing.

---

## Notes

- Doc/role references always point at `docs/roles/*.md` — read the live file each run, don't rely on this skill's paraphrase; those files are the source of truth and are versioned independently (see `docs/standards/Document_Ownership.md`).
- `docs/project/RACI.md` is the map this skill operationalizes — if the two ever diverge, RACI.md and the role docs win.
- Steps 5 and 8 must each be a **new** `Agent` call — never `SendMessage` to resume a prior Reviewer/Librarian agent mid-pipeline. Resuming reintroduces shared context between attempts, which is the same failure mode as same-session self-review.
- If Reviewer or Librarian's spawned agent fails to produce the required pasted command output, treat that as a process violation and re-spawn — do not accept a narrated summary in place of literal output under any circumstance.
- This skill does not shrink Gate 1, Tier A, the merge checkpoint, or CHG-decision routing over time as "trust builds" — per the `/roast` verdict, run it in shadow mode alongside manual review on real stories first if you want evidence before loosening anything, and loosen deliberately, not by drift.
