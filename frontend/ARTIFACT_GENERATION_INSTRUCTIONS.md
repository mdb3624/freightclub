# US-820 Artifact Generation Instructions

**Reference:** REVIEWER.md Hard Gates — Artifact Chain Protocol  
**Status:** Ready for E2E test execution  
**Date:** 2026-06-10

---

## Overview

This document provides step-by-step instructions to generate the required artifact chain (screenshots) for US-820 Composite Framework refactor verification.

---

## Prerequisites

**Ensure the following are running:**
1. Backend service on port 9090 (`npm run dev` from backend/)
2. Frontend dev server on port 5173 (`npm run dev` from frontend/)
3. Docker containers for E2E testing (PostgreSQL, Redis, etc.)
4. Test database seeded with sample data

**Quick Check:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Docker
docker compose -f docker-compose.test.yml up -d

# Terminal 4: Run E2E tests
cd frontend && npm run test:e2e -- shipper-dashboard-home.spec.ts
```

---

## Artifact Generation Command

### Full E2E Test Suite (All Tests)

```bash
cd frontend
npm run test:e2e -- shipper-dashboard-home.spec.ts
```

**Expected Output:**
```
✓ US-761 AC-1: dashboard home displays KPI tiles backed by the summary endpoint (2.3s)
✓ US-762 AC-1: carrier search panel performs a lane search and renders results state (1.8s)
✓ US-760: dashboard home requires authentication (0.9s)

3 passed (5.0s)
```

### Individual Test (KPI Tiles Only)

```bash
cd frontend
npm run test:e2e -- shipper-dashboard-home.spec.ts --grep "US-761"
```

**Generated Artifact:**
- `frontend/test-results/evidence/us-761-ac1-kpi-tiles.png`

### Individual Test (Carrier Search Only)

```bash
cd frontend
npm run test:e2e -- shipper-dashboard-home.spec.ts --grep "US-762"
```

**Generated Artifact:**
- `frontend/test-results/evidence/us-762-ac1-carrier-lane-search.png`

---

## Artifact Files

### Expected Screenshot Evidence

| Test Case | Artifact File | Purpose | Expected Content |
|-----------|---|---|---|
| US-761 AC-1 | `us-761-ac1-kpi-tiles.png` | KPI display verification | 3 KPI widgets (Active Shipments, On-Time %, Cost/Mile) rendered with correct styling |
| US-762 AC-1 | `us-762-ac1-carrier-lane-search.png` | Carrier search verification | Search form + results list with lane information |
| US-760 | (No screenshot) | Auth boundary test | Redirect to login (non-visual) |

### Storage Location

```
frontend/test-results/evidence/
├── us-761-ac1-kpi-tiles.png
├── us-762-ac1-carrier-lane-search.png
└── trace-{test-name}-{timestamp}.zip (if test fails)
```

---

## Verification Checklist

After running E2E tests, verify the following:

### ✅ Screenshot Evidence Exists
- [ ] `us-761-ac1-kpi-tiles.png` created
- [ ] `us-762-ac1-carrier-lane-search.png` created
- [ ] Both files are > 10KB (not truncated)

### ✅ Visual Inspection Against Prototype
Compare screenshots to [Shipper_Dashboard_Prototype_Complete.html](../../docs/hfd/Shipper_Dashboard_Prototype_Complete.html):

**KPI Tiles Screenshot:**
- [ ] 3 KPI cards visible (Business Health section)
- [ ] Correct values displayed: Active Shipments, On-Time Delivery %, Cost Per Mile
- [ ] Font size and weight match specification (Section §6 of Style Guide)
- [ ] Container styling correct (white background, border, shadow, rounded corners)
- [ ] Spacing matches 8px rule (24px panel padding, 16-24px gaps between widgets)
- [ ] Colors use semantic palette (success green for On-Time %)

**Carrier Search Screenshot:**
- [ ] Search form visible with origin/destination inputs
- [ ] Submit button styled correctly (bronze gradient)
- [ ] Results list renders (populated or empty state)
- [ ] Panel borders and spacing match specification

### ✅ Composite Framework Structure Check
Review generated HTML (via browser DevTools or Playwright snapshot):

- [ ] `fc-shell` class present on root
- [ ] `zone-widget-slots` uses CSS Grid (not flexbox)
- [ ] `.panel` classes wrap all content sections
- [ ] `.widget-grid` contains KPI widgets
- [ ] No hardcoded colors in inline styles
- [ ] All CSS variables from SYSTEM_BLUEPRINT.md §2 are referenced

### ✅ Test Execution Report
After `npm run test:e2e`:

- [ ] All 3 tests PASS (not skipped)
- [ ] Test execution time < 10 seconds total
- [ ] No timeout errors
- [ ] No selector failures (all `data-testid` attributes found)

---

## Troubleshooting

### Test Fails: "Element not found" for `[data-testid="dashboard-grid"]`

**Cause:** testId mapping issue  
**Resolution:** Verify `ShipperDashboardHome.tsx` has `data-testid="dashboard-grid"` on the `zone-widget-slots` div

```tsx
<div className="zone-widget-slots" data-testid="dashboard-grid">
```

### Test Fails: Backend 500 on `/shipper/dashboard-summary`

**Cause:** DashboardSummaryService not implemented or database seeding issue  
**Resolution:**
1. Verify backend is running: `curl http://localhost:9090/actuator/health`
2. Check database has sample shipper data
3. Review backend logs for DashboardSummaryService errors

### Screenshots Not Generated

**Cause:** Test passed but screenshot path is wrong  
**Resolution:** Check test spec line 53 and 83:
```typescript
await page.screenshot({ path: 'test-results/evidence/us-761-ac1-kpi-tiles.png', fullPage: true })
```
Verify `test-results/evidence/` directory exists and is writable.

---

## Sign-Off Template

Once artifacts are generated and verified, use this template:

```markdown
## ✅ ARTIFACT CHAIN VERIFIED

**Test Execution Date:** 2026-06-10  
**Environment:** Docker (local)  
**Test Suite:** shipper-dashboard-home.spec.ts  
**Result:** 3 PASSED, 0 FAILED, 0 SKIPPED

### Evidence Files Generated:
- ✅ frontend/test-results/evidence/us-761-ac1-kpi-tiles.png (62 KB)
- ✅ frontend/test-results/evidence/us-762-ac1-carrier-lane-search.png (58 KB)

### Visual Inspection:
- ✅ KPI tiles match prototype styling
- ✅ Carrier search panel correctly styled
- ✅ Composite Framework structure verified (CSS Grid, panels, tokens)
- ✅ No hardcoded colors detected in DOM

### Composite Framework Compliance:
- ✅ Gate 1 (Container): Shell > Panel > Widget hierarchy present
- ✅ Gate 2 (Token): All colors, spacing use CSS variables
- ✅ Gate 3 (Layout): Grid-based layout, no absolute positioning

**REVIEWER VERDICT: ✅ APPROVED FOR MERGE**
```

---

## Next Steps

1. **Run E2E tests:** `npm run test:e2e -- shipper-dashboard-home.spec.ts`
2. **Verify artifacts:** Check screenshots exist in `test-results/evidence/`
3. **Visual inspection:** Compare against Prototype_Complete.html
4. **Framework audit:** Inspect DOM for token usage and structure
5. **Sign off:** Use template above to issue REVIEWER approval

---

## References

- **REVIEWER.md:** Hard Gates protocol (Artifact Chain section)
- **SYSTEM_BLUEPRINT.md:** Composite Framework specification
- **MANDATE_Composite_Framework_Adoption.md:** Governance requirements
- **Shipper_Dashboard_Prototype_Complete.html:** Visual reference

**Authority:** REVIEWER Role | Sequential Lock Protocol  
**Status:** Ready for Artifact Generation
