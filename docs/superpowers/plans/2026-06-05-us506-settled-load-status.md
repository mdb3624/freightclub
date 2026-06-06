# US-506: SETTLED Load Status & Workflow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shipper-driven SETTLED/DISPUTED transitions after DELIVERED — shipper confirms or disputes delivery, load moves to the appropriate final status, trucker is notified via existing event system.

**Architecture:** Two new PATCH endpoints (`/settle`, `/dispute`) follow the existing verb-per-action pattern from US-105 (`/pickup`, `/deliver`). Service methods use `findByIdAndTenantIdAndDeletedAtIsNull` + status guard. `LoadDetailPage` (shipper-only route) shows confirm/dispute UI when `status === 'DELIVERED'`. Events follow the `record` pattern in `com.freightclub.service`.

**Tech Stack:** Spring Boot 3.x / Java 21, Spring Data JPA, PostgreSQL (Neon), Flyway, React 18 + TypeScript, React Query, Tailwind CSS

---

## File Map

| Action | File |
|--------|------|
| Create | `backend/src/main/resources/db/migration/V20260605_1400__AddLoadSettledDisputedFields.sql` |
| Modify | `backend/src/main/java/com/freightclub/domain/LoadStatus.java` |
| Modify | `backend/src/main/java/com/freightclub/domain/Load.java` |
| Modify | `backend/src/main/java/com/freightclub/dto/LoadResponse.java` |
| Create | `backend/src/main/java/com/freightclub/dto/DisputeRequest.java` |
| Create | `backend/src/main/java/com/freightclub/service/LoadSettledEvent.java` |
| Create | `backend/src/main/java/com/freightclub/service/LoadDisputedEvent.java` |
| Modify | `backend/src/main/java/com/freightclub/service/LoadService.java` |
| Modify | `backend/src/main/java/com/freightclub/controller/LoadController.java` |
| Create | `backend/src/test/java/com/freightclub/service/LoadServiceSettleDisputeTest.java` |
| Create | `frontend/src/features/loads/hooks/useSettleLoad.ts` |
| Create | `frontend/src/features/loads/hooks/useDisputeLoad.ts` |
| Modify | `frontend/src/pages/LoadDetailPage.tsx` |

---

## Task 1: Flyway Migration

**Files:**
- Create: `backend/src/main/resources/db/migration/V20260605_1400__AddLoadSettledDisputedFields.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- US-506: Add settled_at, disputed_at, dispute_reason to loads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'loads' AND column_name = 'settled_at'
    ) THEN
        ALTER TABLE loads ADD COLUMN settled_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'loads' AND column_name = 'disputed_at'
    ) THEN
        ALTER TABLE loads ADD COLUMN disputed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'loads' AND column_name = 'dispute_reason'
    ) THEN
        ALTER TABLE loads ADD COLUMN dispute_reason TEXT;
    END IF;
END $$;
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/resources/db/migration/V20260605_1400__AddLoadSettledDisputedFields.sql
git commit -m "feat(US-506): add settled_at, disputed_at, dispute_reason columns to loads"
```

---

## Task 2: Domain Updates

**Files:**
- Modify: `backend/src/main/java/com/freightclub/domain/LoadStatus.java`
- Modify: `backend/src/main/java/com/freightclub/domain/Load.java`

- [ ] **Step 1: Add DISPUTED to LoadStatus enum**

`LoadStatus.java` currently ends with `SETTLED, CANCELLED`. Add `DISPUTED` between them:

```java
public enum LoadStatus {
    DRAFT,
    OPEN,
    CLAIMED,
    IN_TRANSIT,
    DELIVERED,
    SETTLED,
    DISPUTED,
    CANCELLED
}
```

- [ ] **Step 2: Add three fields to Load.java**

After the `deliveredAt` field (around line 128), add:

```java
@Column(name = "settled_at")
private LocalDateTime settledAt;

@Column(name = "disputed_at")
private LocalDateTime disputedAt;

@Column(name = "dispute_reason", columnDefinition = "TEXT")
private String disputeReason;
```

- [ ] **Step 3: Add getters and setters to Load.java**

After the `getDeliveredAt` / `setDeliveredAt` pair, add:

```java
public LocalDateTime getSettledAt() { return settledAt; }
public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }

public LocalDateTime getDisputedAt() { return disputedAt; }
public void setDisputedAt(LocalDateTime disputedAt) { this.disputedAt = disputedAt; }

public String getDisputeReason() { return disputeReason; }
public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/freightclub/domain/LoadStatus.java
git add backend/src/main/java/com/freightclub/domain/Load.java
git commit -m "feat(US-506): add DISPUTED to LoadStatus and settled/disputed fields to Load"
```

---

## Task 3: DTO Updates

**Files:**
- Modify: `backend/src/main/java/com/freightclub/dto/LoadResponse.java`
- Create: `backend/src/main/java/com/freightclub/dto/DisputeRequest.java`

- [ ] **Step 1: Add three fields to the LoadResponse record**

`LoadResponse` is a Java record. Add these three fields after `cancelReason` (line ~46):

```java
        String cancelReason,
        LocalDateTime settledAt,
        LocalDateTime disputedAt,
        String disputeReason,
        LocalDateTime createdAt,
```

- [ ] **Step 2: Update the from() factory method**

In the `from(Load load, User shipper, User trucker)` method, add the three new values after `load.getCancelReason()`:

```java
                load.getCancelReason(),
                load.getSettledAt(),
                load.getDisputedAt(),
                load.getDisputeReason(),
                load.getCreatedAt(),
```

- [ ] **Step 3: Create DisputeRequest DTO**

Create `backend/src/main/java/com/freightclub/dto/DisputeRequest.java`:

```java
package com.freightclub.dto;

import jakarta.validation.constraints.NotBlank;

public record DisputeRequest(
        @NotBlank(message = "Dispute reason is required")
        String reason
) {}
```

- [ ] **Step 4: Verify compilation**

```
cd backend && C:\tools\apache-maven-3.9.9\bin\mvn.cmd compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/freightclub/dto/LoadResponse.java
git add backend/src/main/java/com/freightclub/dto/DisputeRequest.java
git commit -m "feat(US-506): add settledAt/disputedAt/disputeReason to LoadResponse; add DisputeRequest"
```

---

## Task 4: Event Classes

**Files:**
- Create: `backend/src/main/java/com/freightclub/service/LoadSettledEvent.java`
- Create: `backend/src/main/java/com/freightclub/service/LoadDisputedEvent.java`

- [ ] **Step 1: Create LoadSettledEvent**

Following the pattern of `LoadDeliveredEvent` (`record LoadDeliveredEvent(Load load, String truckerId) {}`):

```java
package com.freightclub.service;

import com.freightclub.domain.Load;

public record LoadSettledEvent(Load load, String shipperId) {}
```

- [ ] **Step 2: Create LoadDisputedEvent**

```java
package com.freightclub.service;

import com.freightclub.domain.Load;

public record LoadDisputedEvent(Load load, String shipperId) {}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/freightclub/service/LoadSettledEvent.java
git add backend/src/main/java/com/freightclub/service/LoadDisputedEvent.java
git commit -m "feat(US-506): add LoadSettledEvent and LoadDisputedEvent records"
```

---

## Task 5: Service Layer (TDD)

**Files:**
- Create: `backend/src/test/java/com/freightclub/service/LoadServiceSettleDisputeTest.java`
- Modify: `backend/src/main/java/com/freightclub/service/LoadService.java`

- [ ] **Step 1: Find an existing LoadService integration test and note its Load fixture pattern**

```
Get-ChildItem -Recurse backend/src/test -Filter "*LoadService*"
```

Open the found file and identify: how a `Load` is constructed with all required fields for test purposes. You will mirror this fixture in the next step.

- [ ] **Step 2: Write the failing test class**

Create `backend/src/test/java/com/freightclub/service/LoadServiceSettleDisputeTest.java`.

Required fields on Load (from entity): `tenantId`, `shipperId`, `truckerId`, `status`, `originCity`, `originState`, `originZip`, `originAddress1`, `destinationCity`, `destinationState`, `destinationZip`, `destinationAddress1`, `pickupFrom`, `pickupTo`, `deliveryFrom`, `deliveryTo`, `commodity`, `weightLbs`, `equipmentType`, `payRate`, `payRateType`.

```java
package com.freightclub.service;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.PayRateType;
import com.freightclub.dto.LoadResponse;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.LoadStatusTransitionException;
import com.freightclub.repository.LoadRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LoadServiceSettleDisputeTest {

    @Autowired private LoadService loadService;
    @Autowired private LoadRepository loadRepository;

    private static final String TENANT_ID = "tenant-settle-test";
    private static final String SHIPPER_ID = "shipper-settle-test";
    private static final String TRUCKER_ID = "trucker-settle-test";

    @BeforeEach
    void setUp() {
        TenantContextHolder.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    private Load deliveredLoad() {
        Load load = new Load();
        load.setTenantId(TENANT_ID);
        load.setShipperId(SHIPPER_ID);
        load.setTruckerId(TRUCKER_ID);
        load.setStatus(LoadStatus.DELIVERED);
        load.setOriginCity("Atlanta"); load.setOriginState("GA");
        load.setOriginZip("30301"); load.setOriginAddress1("1 Peachtree St");
        load.setDestinationCity("Nashville"); load.setDestinationState("TN");
        load.setDestinationZip("37201"); load.setDestinationAddress1("1 Broadway");
        load.setPickupFrom(LocalDateTime.now().plusDays(1));
        load.setPickupTo(LocalDateTime.now().plusDays(1).plusHours(4));
        load.setDeliveryFrom(LocalDateTime.now().plusDays(2));
        load.setDeliveryTo(LocalDateTime.now().plusDays(2).plusHours(4));
        load.setCommodity("General Freight");
        load.setWeightLbs(BigDecimal.valueOf(10000));
        load.setEquipmentType(EquipmentType.DRY_VAN);
        load.setPayRate(BigDecimal.valueOf(1500));
        load.setPayRateType(PayRateType.FLAT);
        return loadRepository.save(load);
    }

    @Test
    void settleLoad_succeeds_from_delivered() {
        Load load = deliveredLoad();
        LoadResponse response = loadService.settleLoad(load.getId(), SHIPPER_ID);
        assertThat(response.status()).isEqualTo(LoadStatus.SETTLED);
        assertThat(response.settledAt()).isNotNull();
    }

    @Test
    void settleLoad_throws_when_not_delivered() {
        Load load = deliveredLoad();
        load.setStatus(LoadStatus.IN_TRANSIT);
        loadRepository.save(load);
        assertThatThrownBy(() -> loadService.settleLoad(load.getId(), SHIPPER_ID))
                .isInstanceOf(LoadStatusTransitionException.class)
                .hasMessageContaining("DELIVERED");
    }

    @Test
    void settleLoad_throws_for_wrong_tenant() {
        Load load = deliveredLoad();
        TenantContextHolder.setTenantId("other-tenant");
        assertThatThrownBy(() -> loadService.settleLoad(load.getId(), SHIPPER_ID))
                .isInstanceOf(LoadNotFoundException.class);
    }

    @Test
    void disputeLoad_succeeds_from_delivered() {
        Load load = deliveredLoad();
        LoadResponse response = loadService.disputeLoad(load.getId(), SHIPPER_ID, "Damaged goods");
        assertThat(response.status()).isEqualTo(LoadStatus.DISPUTED);
        assertThat(response.disputedAt()).isNotNull();
        assertThat(response.disputeReason()).isEqualTo("Damaged goods");
    }

    @Test
    void disputeLoad_throws_when_not_delivered() {
        Load load = deliveredLoad();
        load.setStatus(LoadStatus.CLAIMED);
        loadRepository.save(load);
        assertThatThrownBy(() -> loadService.disputeLoad(load.getId(), SHIPPER_ID, "reason"))
                .isInstanceOf(LoadStatusTransitionException.class)
                .hasMessageContaining("DELIVERED");
    }

    @Test
    void disputeLoad_throws_for_wrong_tenant() {
        Load load = deliveredLoad();
        TenantContextHolder.setTenantId("other-tenant");
        assertThatThrownBy(() -> loadService.disputeLoad(load.getId(), SHIPPER_ID, "reason"))
                .isInstanceOf(LoadNotFoundException.class);
    }
}
```

**Note:** If the existing service tests use a different fixture approach (e.g., a shared test util class), adopt that pattern instead of the inline fixture above.

- [ ] **Step 3: Run tests to verify they fail**

```
cd backend && C:\tools\apache-maven-3.9.9\bin\mvn.cmd test -Dtest=LoadServiceSettleDisputeTest -q 2>&1 | Select-String -Pattern "ERROR|FAIL|settleLoad|disputeLoad"
```

Expected: Compilation error — `settleLoad` and `disputeLoad` not defined on `LoadService`.

- [ ] **Step 4: Implement settleLoad in LoadService.java**

Add these two methods after `markDelivered`. Also add imports for `LoadSettledEvent` and `LoadDisputedEvent` at the top of the file.

```java
public LoadResponse settleLoad(String id, String shipperId) {
    Load load = loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(
                    id, TenantContextHolder.getTenantId())
            .orElseThrow(() -> new LoadNotFoundException(id));
    if (load.getStatus() != LoadStatus.SETTLED && load.getStatus() != LoadStatus.DELIVERED) {
        // guard: only DELIVERED → SETTLED is valid
    }
    if (load.getStatus() != LoadStatus.DELIVERED) {
        throw new LoadStatusTransitionException("Load must be DELIVERED to settle");
    }
    load.setStatus(LoadStatus.SETTLED);
    load.setSettledAt(LocalDateTime.now());
    Load saved = loadRepository.save(load);
    writeEvent(saved, "SETTLED", shipperId);
    eventPublisher.publishEvent(new LoadSettledEvent(saved, shipperId));
    return buildResponse(saved);
}

public LoadResponse disputeLoad(String id, String shipperId, String reason) {
    Load load = loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(
                    id, TenantContextHolder.getTenantId())
            .orElseThrow(() -> new LoadNotFoundException(id));
    if (load.getStatus() != LoadStatus.DELIVERED) {
        throw new LoadStatusTransitionException("Load must be DELIVERED to dispute");
    }
    load.setStatus(LoadStatus.DISPUTED);
    load.setDisputedAt(LocalDateTime.now());
    load.setDisputeReason(reason);
    Load saved = loadRepository.save(load);
    writeEvent(saved, "DISPUTED", shipperId);
    eventPublisher.publishEvent(new LoadDisputedEvent(saved, shipperId));
    return buildResponse(saved);
}
```

**Note:** Remove the dead `if` block in `settleLoad` above — that was a drafting artifact. The final method should only have the single `if (load.getStatus() != LoadStatus.DELIVERED)` guard.

- [ ] **Step 5: Run tests — verify they pass**

```
cd backend && C:\tools\apache-maven-3.9.9\bin\mvn.cmd test -Dtest=LoadServiceSettleDisputeTest -q
```

Expected: 6 tests PASS, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/freightclub/service/LoadService.java
git add backend/src/test/java/com/freightclub/service/LoadServiceSettleDisputeTest.java
git commit -m "feat(US-506): implement settleLoad and disputeLoad (TDD, 6 tests green)"
```

---

## Task 6: Controller Endpoints

**Files:**
- Modify: `backend/src/main/java/com/freightclub/controller/LoadController.java`

- [ ] **Step 1: Add /settle and /dispute endpoints**

After the existing `markDelivered` method in `LoadController.java`, add:

```java
@PatchMapping("/{id}/settle")
@PreAuthorize("hasRole('SHIPPER')")
@CacheEvict(cacheNames = "loads", allEntries = true)
public LoadResponse settleLoad(@PathVariable String id,
                               @AuthenticationPrincipal String userId) {
    return loadService.settleLoad(id, userId);
}

@PatchMapping("/{id}/dispute")
@PreAuthorize("hasRole('SHIPPER')")
@CacheEvict(cacheNames = "loads", allEntries = true)
public LoadResponse disputeLoad(@PathVariable String id,
                                @AuthenticationPrincipal String userId,
                                @Valid @RequestBody DisputeRequest request) {
    return loadService.disputeLoad(id, userId, request.reason());
}
```

Add these imports at the top of the file if not already present:
```java
import com.freightclub.dto.DisputeRequest;
import jakarta.validation.Valid;
```

- [ ] **Step 2: Run full backend test suite**

```
cd backend && C:\tools\apache-maven-3.9.9\bin\mvn.cmd test -q
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/freightclub/controller/LoadController.java
git commit -m "feat(US-506): add /settle and /dispute PATCH endpoints to LoadController"
```

---

## Task 7: Frontend Hooks

**Files:**
- Create: `frontend/src/features/loads/hooks/useSettleLoad.ts`
- Create: `frontend/src/features/loads/hooks/useDisputeLoad.ts`

Check an existing mutation hook (e.g., `frontend/src/features/loads/hooks/useCancelLoad.ts`) to confirm the exact `apiClient` import path and `useQueryClient` pattern used in this project before writing.

- [ ] **Step 1: Create useSettleLoad.ts**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useSettleLoad(loadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.patch(`/loads/${loadId}/settle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load', loadId] })
      queryClient.invalidateQueries({ queryKey: ['loads'] })
    },
  })
}
```

- [ ] **Step 2: Create useDisputeLoad.ts**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

interface DisputePayload {
  reason: string
}

export function useDisputeLoad(loadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DisputePayload) =>
      apiClient.patch(`/loads/${loadId}/dispute`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load', loadId] })
      queryClient.invalidateQueries({ queryKey: ['loads'] })
    },
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/loads/hooks/useSettleLoad.ts
git add frontend/src/features/loads/hooks/useDisputeLoad.ts
git commit -m "feat(US-506): add useSettleLoad and useDisputeLoad React Query hooks"
```

---

## Task 8: Frontend UI

**Files:**
- Modify: `frontend/src/pages/LoadDetailPage.tsx`

`LoadDetailPage` is a shipper-only route — no role check needed. Just gate on `load.status === 'DELIVERED'`.

- [ ] **Step 1: Add imports and state**

At the top of `LoadDetailPage.tsx`, add:
```typescript
import { useSettleLoad } from '@/features/loads/hooks/useSettleLoad'
import { useDisputeLoad } from '@/features/loads/hooks/useDisputeLoad'
```

Inside the `LoadDetailPage` function body, after the existing `useCancelLoad` line, add:
```typescript
const [showDisputeForm, setShowDisputeForm] = useState(false)
const [disputeReason, setDisputeReason] = useState('')
const { mutate: settleLoad, isPending: isSettling } = useSettleLoad(id ?? '')
const { mutate: disputeLoad, isPending: isDisputing } = useDisputeLoad(id ?? '')
```

- [ ] **Step 2: Add the confirm/dispute block to the JSX**

In the return statement, after the `{showCancelModal && ...}` block and before the `{load && ratingStatuses.has(...)}` block, add:

```tsx
{load.status === 'DELIVERED' && (
  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
    <p className="mb-4 text-sm font-medium text-gray-700">Delivery Confirmation</p>
    {!showDisputeForm ? (
      <div className="flex gap-3">
        <Button
          data-testid="confirm-delivery-btn"
          onClick={() => settleLoad()}
          disabled={isSettling}
        >
          {isSettling ? 'Confirming...' : 'Confirm Delivery'}
        </Button>
        <Button
          data-testid="dispute-delivery-btn"
          variant="secondary"
          className="text-red-600 border-red-300 hover:bg-red-50"
          onClick={() => setShowDisputeForm(true)}
        >
          Dispute Delivery
        </Button>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        <textarea
          data-testid="dispute-reason-input"
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the issue with this delivery..."
          rows={3}
          value={disputeReason}
          onChange={e => setDisputeReason(e.target.value)}
        />
        <div className="flex gap-3">
          <Button
            data-testid="submit-dispute-btn"
            variant="secondary"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => disputeLoad({ reason: disputeReason })}
            disabled={!disputeReason.trim() || isDisputing}
          >
            {isDisputing ? 'Submitting...' : 'Submit Dispute'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => { setShowDisputeForm(false); setDisputeReason('') }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 3: Run TypeScript build**

```
cd frontend && npm run build
```

Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LoadDetailPage.tsx
git commit -m "feat(US-506): add confirm/dispute delivery UI to LoadDetailPage"
```

---

## Task 9: Full Verification

- [ ] **Step 1: Run backend with coverage**

```
cd backend && C:\tools\apache-maven-3.9.9\bin\mvn.cmd verify -q
```

Expected: All tests PASS. JaCoCo ≥ 70% branch coverage.

- [ ] **Step 2: Run frontend unit tests**

```
cd frontend && npm run test
```

Expected: All tests PASS, no regressions.

- [ ] **Step 3: Create US-506 story file**

Create `docs/business/stories/US-506.md` with:
- User story, ACs matching the spec, sign-off section
- Reference spec: `docs/superpowers/specs/2026-06-05-us506-settled-load-status-design.md`

- [ ] **Step 4: Update Story_Map.md**

Change US-506 status from `MIGRATION_PENDING` to `IN_PROGRESS` (or `COMPLETED` once verified).

- [ ] **Step 5: Final commit**

```bash
git add docs/business/stories/US-506.md docs/project/Story_Map.md
git commit -m "docs(US-506): add story file and update Story_Map status"
```
