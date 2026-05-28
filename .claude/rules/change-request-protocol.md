# [AUTOMATION] Change Request (CHG-###) Protocol

## Trigger
When any role (CODER, ARCHITECT, HFD) discovers that input from a previous role is incorrect, incomplete, or impossible to implement mid-work.

## Mandatory Action

**Step 1: ESCALATE (Not Backward)**
```
CODER discovers issue
  ❌ DO NOT: Ask BA to change AC
  ❌ DO NOT: Ask ARCH to redesign
  ✅ DO: Escalate to LIBRARIAN immediately
```

**Step 2: DOCUMENT Change Request**

Create a CHG ticket with this structure:
```markdown
## CHG-###: [Issue Title]

**Original Story:** US-###  
**Discovered By:** [Role] on [date]  
**Root Cause:** [Why input is wrong/incomplete]  
**Technical Blocker:** [How it blocks implementation]  

**Options:**
1. [Option A: quickest fix]
2. [Option B: long-term solution]

**Recommendation:** [Which option]

**Next Steps:**
1. [Role] reworks inputs
2. [Role] reviews changes
3. New story (US-###-v2) created for implementation

**Status:** CHG-### OPEN (awaiting decision)
**Assign to:** LIBRARIAN
```

**Step 3: DECISION**

LIBRARIAN reviews and chooses:

- **OPTION A:** "Finish current story with current inputs"
  - CODER completes implementation
  - PR includes note: "CHG-### tracked separately"
  - Story completes (not blocked)
  - CHG-### becomes backlog item for next cycle

- **OPTION B:** "Create new story for rework"
  - Current story marked PAUSED (not DONE)
  - CHG-### escalated to BA
  - BA creates new story (US-###-v2) with reworked inputs
  - ARCH/HFD review new story
  - CODER implements US-###-v2 (fresh start)

**Step 4: TRACK**

Add CHG-### to `.claude/learnings.md` under Technical Debt Ledger:
```
| Feature | Blocker | Severity | Status | Linked Story |
|---------|---------|----------|--------|---|
| US-### | AC impossible (Stripe latency) | MEDIUM | CHG-### OPEN | US-###-v2 |
```

---

## Conflict Resolution

**If LIBRARIAN is unavailable:**
- Current role marks story status as "BLOCKED: CHG-###"
- Creates CHG ticket with "Awaiting LIBRARIAN decision"
- Does NOT proceed with implementation or rework
- Does NOT ask previous role to change inputs directly

---

## Anti-Pattern (What NOT to Do)

| Anti-Pattern | Why It's Wrong | Correct Approach |
|---|---|---|
| CODER asks BA to rewrite AC | Circular loop | CODER escalates to LIBRARIAN |
| CODER rewrites AC themselves | Violates role boundary | LIBRARIAN handles change decision |
| ARCH redesigns without LIBRARIAN approval | Breaks sequential lock | ARCH escalates, waits for LIBRARIAN |
| Story reworked mid-implementation | Indefinite rework cycle | New story created via CHG process |
| Multiple feedback loops | Timeline explodes | One escalation, one CHG ticket |

---

## Metrics

Track these to prevent abuse of CHG protocol:

```
✅ Stories completing without CHG: [target: 85%]
⚠️ Stories with 1 CHG request: [target: 12%]
❌ Stories with 2+ CHG requests: [target: <3%]
⏱️ Time from CHG creation to LIBRARIAN decision: [target: <1 day]
```

---

## Examples

### Example 1: Quick Fix (Option A)

```markdown
## CHG-501: Stripe API Latency

**Original Story:** US-500 (Quick Pay)
**Discovered By:** CODER on 2026-05-30
**Root Cause:** BA assumed <1min payout; Stripe API has 5-min latency
**Blocker:** AC#1 impossible as written

**Options:**
1. Accept 5-min latency in AC#1
2. Use different payment provider
3. Async notification system (complex)

**Recommendation:** Option 1 (BA can accept in AC notes)

**Decision:** LIBRARIAN: "Finish US-500 with Option 1 noted"

Result: CODER completes US-500, PR references CHG-501
```

### Example 2: Rework Required (Option B)

```markdown
## CHG-502: Schema Design Conflict

**Original Story:** US-501 (Load Claiming)
**Discovered By:** CODER on 2026-05-31
**Root Cause:** ARCH FK constraint conflicts with multi-tenancy rules
**Blocker:** Cannot implement RLS policy as designed

**Options:**
1. Rework ARCH schema design (affects other stories)
2. Add intermediate lookup table (added complexity)
3. Defer feature to Phase 8

**Recommendation:** Option 1 (but impacts timeline)

**Decision:** LIBRARIAN: "Create CHG-502, pause US-501, create US-501-v2"

Result: US-501 paused, CHG-502 goes to ARCH, US-501-v2 created after rework
```

---

## Enforcement

- LIBRARIAN must acknowledge CHG within 1 business day
- Every CHG decision is logged in Sprint_Log.md
- CHG protocol violations result in rejected PRs (see REVIEWER.md)
- CODER making backward requests (instead of escalating) = code review failure

---

**Authority:** CLAUDE.md Sequential Lock Protocol  
**Status:** MANDATORY  
**Last Updated:** 2026-05-25
