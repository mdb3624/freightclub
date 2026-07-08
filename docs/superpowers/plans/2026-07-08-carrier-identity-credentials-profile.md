# US-730h Carrier Identity & Credentials Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated, no-scroll, 4-tab `/carrier/profile` screen (Identity/Equipment/Creds/Lanes) for Owner-Operator carriers, replacing the generic `/profile` page as the Settings entry point for this persona.

**Architecture:** Purely additive on the backend — 10 new nullable columns on the existing `users` table, extending the existing `GET/PUT /api/v1/profile` endpoint and its DTOs (no new controller, no new table). The existing `/api/v1/profile/lanes` CRUD endpoints are reused unchanged (they're load-bearing for shipper-side lane search, US-762 — must not be touched). Frontend is a new page following the exact dark-theme inline-style convention established by `CostProfilePage.tsx`/`CostProfileWizard.tsx` (not the older Tailwind `usePersonaTheme()` convention used by the generic `/profile` page), since this is a dedicated Carrier screen matching `carrier-profile.html` pixel-for-pixel.

**Tech Stack:** Spring Boot (Java 21, no-Lombok), Flyway, React 18 + TypeScript + Vite, React Query, Zod, Playwright.

## Global Constraints

- **No new table, no new controller.** All backend changes extend `users`/`ProfileController`/`ProfileService`/`ProfileResponse`/`UpdateProfileRequest`. `carrier_lanes`/`CarrierLaneEntity`/`CarrierLaneDTO`/`/profile/lanes` endpoints are used exactly as they exist today — zero backend changes for lanes.
- **No-Lombok:** hand-written getters/setters on `User.java`, matching its existing style exactly.
- **RLS:** `users` table already has RLS from prior hardening — new columns inherit it automatically (row-scoped, not column-scoped). No new migration needed for RLS.
- **Migration naming:** `VYYYYMMDD_HHmm__Description.sql` — use `V20260708_1500__CarrierIdentityCredentials_US730h.sql`.
- **Gloved-hand UX (Carrier persona, mobile-first):** all tap targets ≥56px, primary CTAs ≥64px, text inputs/selects 52px, tab bar 48px, body text 16px minimum. Primary viewport iPhone 375–390px.
- **Colors (from `carrier-profile.html`, verbatim — no deviation, no invented values):**
  - Page/phone background `#0a0a0a` / `#121212`
  - Header `#1A1A1A`, border `#2A2A2A`
  - Input background `#161616`, border `#2A2A2A`, focus border `#C9A876`
  - Primary CTA gradient `linear-gradient(180deg,#C9A46A 0%,#B08D57 45%,#8C6D3F 100%)`, border `#7A5F3A`
  - Ghost button: transparent, border `#3A3A3A`, text `#C9A876`
  - Expiry ok `#27AE60`, warn `#F59E0B`, critical/expired `#E74C3C`
  - Muted text `#636E72`, `#4A5568`
- **data-testid required on every new interactive element** — reviewer-checklist §4 mandates a `boundingBox()` touch-target sweep at every tab, not just page load (CHG-US730-001 precedent: a sweep that only covers some elements misses violations).
- **No design changes during implementation** — any infeasibility found while implementing escalates to LIBRARIAN via CHG, not back to ARCH/HFD.

---

### Task 1: Backend — migration, `CdlClass` enum, `User` entity fields

**Files:**
- Create: `backend/src/main/resources/db/migration/V20260708_1500__CarrierIdentityCredentials_US730h.sql`
- Create: `backend/src/main/java/com/freightclub/domain/CdlClass.java`
- Modify: `backend/src/main/java/com/freightclub/domain/User.java`
- Test: `backend/src/test/java/com/freightclub/domain/UserTest.java` (create if it doesn't exist, otherwise add to it)

**Interfaces:**
- Produces: `User.getEquipmentYear()/setEquipmentYear(String)`, `getEquipmentMake()/setEquipmentMake(String)`, `getEquipmentModel()/setEquipmentModel(String)`, `getLicensePlate()/setLicensePlate(String)`, `getVin()/setVin(String)`, `getCdlClass()/setCdlClass(CdlClass)`, `getCdlExpiry()/setCdlExpiry(LocalDate)`, `getInsuranceCarrier()/setInsuranceCarrier(String)`, `getInsuranceExpiry()/setInsuranceExpiry(LocalDate)`, `getMedCardExpiry()/setMedCardExpiry(LocalDate)` — all consumed by Task 2.
- Produces: `CdlClass` enum with values `CLASS_A`, `CLASS_B`, `CLASS_C`.

- [ ] **Step 1: Check for a stale Maven `target/` directory before starting (known environment gotcha)**

Run: `docker compose -f docker-compose.test.yml down` (from repo root) then `cd backend && rm -rf target`

- [ ] **Step 2: Write the migration**

```sql
-- backend/src/main/resources/db/migration/V20260708_1500__CarrierIdentityCredentials_US730h.sql
-- US-730h (CHG-US730-008): additive-only credentials/equipment-detail columns
-- on users. Confirmed via ARCH Platform Reuse Check that equipment_type,
-- mc_number, dot_number already exist and are reused as-is — this migration
-- only adds the NEW fields the Carrier Profile screen needs.

ALTER TABLE freightclub.users
  ADD COLUMN equipment_year VARCHAR(4),
  ADD COLUMN equipment_make VARCHAR(50),
  ADD COLUMN equipment_model VARCHAR(50),
  ADD COLUMN license_plate VARCHAR(20),
  ADD COLUMN vin VARCHAR(17),
  ADD COLUMN cdl_class VARCHAR(10),
  ADD COLUMN cdl_expiry DATE,
  ADD COLUMN insurance_carrier VARCHAR(100),
  ADD COLUMN insurance_expiry DATE,
  ADD COLUMN med_card_expiry DATE;

ALTER TABLE freightclub.users
  ADD CONSTRAINT chk_cdl_class
  CHECK (cdl_class IS NULL OR cdl_class IN ('CLASS_A', 'CLASS_B', 'CLASS_C'));
```

- [ ] **Step 3: Write the `CdlClass` enum**

```java
// backend/src/main/java/com/freightclub/domain/CdlClass.java
package com.freightclub.domain;

public enum CdlClass {
    CLASS_A,
    CLASS_B,
    CLASS_C
}
```

- [ ] **Step 4: Add the 10 new fields to `User.java`**

Insert after the existing `equipmentType` field (`backend/src/main/java/com/freightclub/domain/User.java:89-91`), before `monthlyFixedCosts`:

```java
    @Column(name = "equipment_year", length = 4)
    private String equipmentYear;

    @Column(name = "equipment_make", length = 50)
    private String equipmentMake;

    @Column(name = "equipment_model", length = 50)
    private String equipmentModel;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @Column(name = "vin", length = 17)
    private String vin;

    @Enumerated(EnumType.STRING)
    @Column(name = "cdl_class", columnDefinition = "VARCHAR(10)")
    private CdlClass cdlClass;

    @Column(name = "cdl_expiry")
    private java.time.LocalDate cdlExpiry;

    @Column(name = "insurance_carrier", length = 100)
    private String insuranceCarrier;

    @Column(name = "insurance_expiry")
    private java.time.LocalDate insuranceExpiry;

    @Column(name = "med_card_expiry")
    private java.time.LocalDate medCardExpiry;
```

Add the matching getters/setters after `getEquipmentType()/setEquipmentType()` (`User.java:197-198`):

```java
    public String getEquipmentYear() { return equipmentYear; }
    public void setEquipmentYear(String equipmentYear) { this.equipmentYear = equipmentYear; }
    public String getEquipmentMake() { return equipmentMake; }
    public void setEquipmentMake(String equipmentMake) { this.equipmentMake = equipmentMake; }
    public String getEquipmentModel() { return equipmentModel; }
    public void setEquipmentModel(String equipmentModel) { this.equipmentModel = equipmentModel; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }
    public CdlClass getCdlClass() { return cdlClass; }
    public void setCdlClass(CdlClass cdlClass) { this.cdlClass = cdlClass; }
    public java.time.LocalDate getCdlExpiry() { return cdlExpiry; }
    public void setCdlExpiry(java.time.LocalDate cdlExpiry) { this.cdlExpiry = cdlExpiry; }
    public String getInsuranceCarrier() { return insuranceCarrier; }
    public void setInsuranceCarrier(String insuranceCarrier) { this.insuranceCarrier = insuranceCarrier; }
    public java.time.LocalDate getInsuranceExpiry() { return insuranceExpiry; }
    public void setInsuranceExpiry(java.time.LocalDate insuranceExpiry) { this.insuranceExpiry = insuranceExpiry; }
    public java.time.LocalDate getMedCardExpiry() { return medCardExpiry; }
    public void setMedCardExpiry(java.time.LocalDate medCardExpiry) { this.medCardExpiry = medCardExpiry; }
```

- [ ] **Step 5: Write a compile-level test asserting the new fields round-trip**

```java
// backend/src/test/java/com/freightclub/domain/UserTest.java
package com.freightclub.domain;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    void carrierIdentityCredentialsFields_roundTrip() {
        User user = new User("user-1");
        user.setEquipmentYear("2019");
        user.setEquipmentMake("Freightliner");
        user.setEquipmentModel("Cascadia");
        user.setLicensePlate("TX-4821");
        user.setVin("1FUJA6CV12LM12345");
        user.setCdlClass(CdlClass.CLASS_A);
        user.setCdlExpiry(LocalDate.of(2027, 8, 15));
        user.setInsuranceCarrier("Progressive Commercial");
        user.setInsuranceExpiry(LocalDate.of(2026, 10, 1));
        user.setMedCardExpiry(LocalDate.of(2026, 12, 1));

        assertThat(user.getEquipmentYear()).isEqualTo("2019");
        assertThat(user.getEquipmentMake()).isEqualTo("Freightliner");
        assertThat(user.getEquipmentModel()).isEqualTo("Cascadia");
        assertThat(user.getLicensePlate()).isEqualTo("TX-4821");
        assertThat(user.getVin()).isEqualTo("1FUJA6CV12LM12345");
        assertThat(user.getCdlClass()).isEqualTo(CdlClass.CLASS_A);
        assertThat(user.getCdlExpiry()).isEqualTo(LocalDate.of(2027, 8, 15));
        assertThat(user.getInsuranceCarrier()).isEqualTo("Progressive Commercial");
        assertThat(user.getInsuranceExpiry()).isEqualTo(LocalDate.of(2026, 10, 1));
        assertThat(user.getMedCardExpiry()).isEqualTo(LocalDate.of(2026, 12, 1));
    }
}
```

- [ ] **Step 6: Run the test to verify it fails (class doesn't compile yet if fields are missing)**

Run: `cd backend && "/c/tools/apache-maven-3.9.9/bin/mvn.cmd" test -Dtest=UserTest -DskipITs -q`
Expected: compile error or test failure if Step 4 wasn't done — if you're doing steps in order, this should already PASS since Step 4 came first. If so, skip to Step 7.

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd backend && "/c/tools/apache-maven-3.9.9/bin/mvn.cmd" test -Dtest=UserTest -DskipITs -q`
Expected: `Tests run: 1, Failures: 0, Errors: 0`

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/resources/db/migration/V20260708_1500__CarrierIdentityCredentials_US730h.sql backend/src/main/java/com/freightclub/domain/CdlClass.java backend/src/main/java/com/freightclub/domain/User.java backend/src/test/java/com/freightclub/domain/UserTest.java
git commit -m "feat(US-730h): add CdlClass enum + 10 new credential/equipment-detail fields on User"
```

---

### Task 2: Backend — extend `ProfileResponse`/`UpdateProfileRequest`/`ProfileService`

**Files:**
- Modify: `backend/src/main/java/com/freightclub/dto/ProfileResponse.java`
- Modify: `backend/src/main/java/com/freightclub/dto/UpdateProfileRequest.java`
- Modify: `backend/src/main/java/com/freightclub/service/ProfileService.java`
- Modify: `backend/src/test/java/com/freightclub/controller/ProfileControllerTest.java`

**Interfaces:**
- Consumes: `User` getters/setters from Task 1 (`getEquipmentYear()`, `getCdlClass()`, `getCdlExpiry()`, etc.)
- Produces: `ProfileResponse` record with 10 new components; `UpdateProfileRequest` record with 10 new components; `ProfileService.updateProfile()` maps all 10 new fields. Consumed by Task 3's frontend `Profile`/`UpdateProfileValues` types (field names below map 1:1, camelCase).

- [ ] **Step 1: Write the failing controller test additions**

Add to `backend/src/test/java/com/freightclub/controller/ProfileControllerTest.java` (find the existing `getProfile`/`updateProfile` test methods and add these alongside them — do not create a new test class):

```java
    @Test
    void getProfile_includesCarrierIdentityCredentialsFields() throws Exception {
        when(profileService.getProfile("trucker-1")).thenReturn(
            new ProfileResponse(
                "trucker-1", "jake@example.com", "Jake", "Morrison", "TRUCKER", "tenant-1",
                null, null, null, "(512) 555-0182",
                null, null, null, null, null,
                null, null, null, null, null,
                true, true, true,
                "MC-772341", "TX-4821", EquipmentType.DRY_VAN,
                "2019", "Freightliner", "Cascadia", "TX-4821", null,
                CdlClass.CLASS_A, LocalDate.of(2027, 8, 15),
                "Progressive Commercial", LocalDate.of(2026, 10, 1), LocalDate.of(2026, 12, 1),
                null, null, null, null, null, null,
                null, null, null, null, null
            )
        );

        mockMvc.perform(get("/api/v1/profile").with(trucker("trucker-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipmentYear").value("2019"))
                .andExpect(jsonPath("$.cdlClass").value("CLASS_A"))
                .andExpect(jsonPath("$.cdlExpiry").value("2027-08-15"))
                .andExpect(jsonPath("$.insuranceCarrier").value("Progressive Commercial"));
    }
```

Add imports at the top of the test file: `import com.freightclub.dto.ProfileResponse;`, `import com.freightclub.domain.CdlClass;`, `import com.freightclub.domain.EquipmentType;`, `import java.time.LocalDate;` (note: `EquipmentType` here is `com.freightclub.domain.EquipmentType`, not the carrier module's — check which one `ProfileResponse` actually imports before adding; it's `com.freightclub.domain.EquipmentType` per `ProfileResponse.java:3`).

**Note:** this test will not compile until Steps 2-3 add the new record components — that's expected, this is the TDD "write failing test" step for a compile failure, not a runtime assertion failure.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && "/c/tools/apache-maven-3.9.9/bin/mvn.cmd" test -Dtest=ProfileControllerTest -DskipITs -q`
Expected: FAIL with a compile error — `ProfileResponse` constructor doesn't match (wrong number of arguments).

- [ ] **Step 3: Extend `ProfileResponse`**

Replace the full contents of `backend/src/main/java/com/freightclub/dto/ProfileResponse.java`:

```java
package com.freightclub.dto;

import com.freightclub.domain.CdlClass;
import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfileResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
        String tenantId,
        String companyName,
        String companyJoinCode,
        String businessName,
        String phone,
        String billingAddress1,
        String billingAddress2,
        String billingCity,
        String billingState,
        String billingZip,
        String defaultPickupAddress1,
        String defaultPickupAddress2,
        String defaultPickupCity,
        String defaultPickupState,
        String defaultPickupZip,
        boolean notifyEmail,
        boolean notifySms,
        boolean notifyInApp,
        String mcNumber,
        String dotNumber,
        EquipmentType equipmentType,
        String equipmentYear,
        String equipmentMake,
        String equipmentModel,
        String licensePlate,
        String vin,
        CdlClass cdlClass,
        LocalDate cdlExpiry,
        String insuranceCarrier,
        LocalDate insuranceExpiry,
        LocalDate medCardExpiry,
        BigDecimal truckPaymentLease,
        BigDecimal insurance,
        BigDecimal iftaIrpPermits,
        BigDecimal phoneEldMisc,
        BigDecimal perDiemDailyRate,
        Integer perDiemDaysPerMonth,
        BigDecimal monthlyFixedCosts,
        BigDecimal fuelCostPerGallon,
        BigDecimal milesPerGallon,
        BigDecimal maintenanceCostPerMile,
        Integer monthlyMilesTarget,
        BigDecimal targetMarginPerMile
) {
    public static ProfileResponse from(User user, @Nullable Tenant tenant) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getTenantId(),
                tenant != null ? tenant.getName() : null,
                tenant != null ? tenant.getJoinCode() : null,
                user.getBusinessName(),
                user.getPhone(),
                user.getBillingAddress1(),
                user.getBillingAddress2(),
                user.getBillingCity(),
                user.getBillingState(),
                user.getBillingZip(),
                user.getDefaultPickupAddress1(),
                user.getDefaultPickupAddress2(),
                user.getDefaultPickupCity(),
                user.getDefaultPickupState(),
                user.getDefaultPickupZip(),
                user.isNotifyEmail(),
                user.isNotifySms(),
                user.isNotifyInApp(),
                user.getMcNumber(),
                user.getDotNumber(),
                user.getEquipmentType(),
                user.getEquipmentYear(),
                user.getEquipmentMake(),
                user.getEquipmentModel(),
                user.getLicensePlate(),
                user.getVin(),
                user.getCdlClass(),
                user.getCdlExpiry(),
                user.getInsuranceCarrier(),
                user.getInsuranceExpiry(),
                user.getMedCardExpiry(),
                user.getTruckPaymentLease(),
                user.getInsurance(),
                user.getIftaIrpPermits(),
                user.getPhoneEldMisc(),
                user.getPerDiemDailyRate(),
                user.getPerDiemDaysPerMonth(),
                user.getMonthlyFixedCosts(),
                user.getFuelCostPerGallon(),
                user.getMilesPerGallon(),
                user.getMaintenanceCostPerMile(),
                user.getMonthlyMilesTarget(),
                user.getTargetMarginPerMile()
        );
    }
}
```

- [ ] **Step 4: Extend `UpdateProfileRequest`**

Replace the full contents of `backend/src/main/java/com/freightclub/dto/UpdateProfileRequest.java`:

```java
package com.freightclub.dto;

import com.freightclub.domain.CdlClass;
import com.freightclub.domain.EquipmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateProfileRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String businessName,
        @Size(max = 20) String phone,
        String billingAddress1,
        String billingAddress2,
        String billingCity,
        String billingState,
        @Size(max = 10) String billingZip,
        String defaultPickupAddress1,
        String defaultPickupAddress2,
        String defaultPickupCity,
        String defaultPickupState,
        @Size(max = 10) String defaultPickupZip,
        boolean notifyEmail,
        boolean notifySms,
        boolean notifyInApp,
        @Size(max = 20) String mcNumber,
        @Size(max = 20) String dotNumber,
        EquipmentType equipmentType,
        @Size(max = 4) String equipmentYear,
        @Size(max = 50) String equipmentMake,
        @Size(max = 50) String equipmentModel,
        @Size(max = 20) String licensePlate,
        @Size(max = 17) String vin,
        CdlClass cdlClass,
        LocalDate cdlExpiry,
        @Size(max = 100) String insuranceCarrier,
        LocalDate insuranceExpiry,
        LocalDate medCardExpiry,
        BigDecimal truckPaymentLease,
        BigDecimal insurance,
        BigDecimal iftaIrpPermits,
        BigDecimal phoneEldMisc,
        BigDecimal perDiemDailyRate,
        Integer perDiemDaysPerMonth,
        BigDecimal fuelCostPerGallon,
        BigDecimal milesPerGallon,
        BigDecimal maintenanceCostPerMile,
        Integer monthlyMilesTarget,
        BigDecimal targetMarginPerMile
) {}
```

- [ ] **Step 5: Extend `ProfileService.updateProfile()`**

In `backend/src/main/java/com/freightclub/service/ProfileService.java`, add these 10 lines to `updateProfile()` right after the existing `user.setEquipmentType(request.equipmentType());` line:

```java
        user.setEquipmentYear(request.equipmentYear());
        user.setEquipmentMake(request.equipmentMake());
        user.setEquipmentModel(request.equipmentModel());
        user.setLicensePlate(request.licensePlate());
        user.setVin(request.vin());
        user.setCdlClass(request.cdlClass());
        user.setCdlExpiry(request.cdlExpiry());
        user.setInsuranceCarrier(request.insuranceCarrier());
        user.setInsuranceExpiry(request.insuranceExpiry());
        user.setMedCardExpiry(request.medCardExpiry());
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && "/c/tools/apache-maven-3.9.9/bin/mvn.cmd" test -Dtest=ProfileControllerTest -DskipITs -q`
Expected: `Tests run: N, Failures: 0, Errors: 0` (N = existing test count + 1)

- [ ] **Step 7: Full backend Docker Pre-Test Protocol verification**

Run (from repo root):
```bash
docker compose -f docker-compose.test.yml down -v
cd backend && "/c/tools/apache-maven-3.9.9/bin/mvn.cmd" clean package -DskipTests -Djacoco.skip=true -q
cd ..
docker compose -f docker-compose.test.yml up --build -d
```
Wait for `freightclub-test-backend` to show `(healthy)` via `docker ps`, then:
```bash
docker compose -f docker-compose.test.yml run --rm backend-tester mvn test
```
Expected: full suite passes, 0 failures, JaCoCo ≥80% branch coverage maintained.

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/freightclub/dto/ProfileResponse.java backend/src/main/java/com/freightclub/dto/UpdateProfileRequest.java backend/src/main/java/com/freightclub/service/ProfileService.java backend/src/test/java/com/freightclub/controller/ProfileControllerTest.java
git commit -m "feat(US-730h): extend ProfileResponse/UpdateProfileRequest/ProfileService with 10 new fields"
```

---

### Task 3: Frontend — types, Zod schema, hooks extension

**Files:**
- Modify: `frontend/src/features/profile/types.ts`
- Modify: `frontend/src/features/profile/hooks/useUpdateProfile.ts`
- Create: `frontend/src/features/carrier/schemas/carrierProfile.schemas.ts`
- Test: `frontend/src/features/carrier/schemas/__tests__/carrierProfile.schemas.test.ts`

**Interfaces:**
- Consumes: nothing new from earlier tasks (frontend types independent of backend Java types, matched by field name/shape per the ARCH Field Contract Table).
- Produces: `Profile` interface (extended), `UpdateProfileValues` interface (extended), `CdlClassEnum` Zod enum (`'CLASS_A' | 'CLASS_B' | 'CLASS_C'`), `expiryStatus(dateStr: string | null): 'ok' | 'warn' | 'critical' | 'expired' | 'none'`, `daysUntil(dateStr: string | null): number | null`, `expiryColor(status): string`, `expiryLabel(dateStr): string` — all consumed by Task 4's `ExpiryDateField` component and Task 7's Credentials tab.

- [ ] **Step 1: Write the failing test for the expiry-status helpers**

```typescript
// frontend/src/features/carrier/schemas/__tests__/carrierProfile.schemas.test.ts
import { describe, it, expect } from 'vitest'
import { daysUntil, expiryStatus, expiryColor, expiryLabel } from '../carrierProfile.schemas'

describe('expiry status helpers', () => {
  it('daysUntil returns null for a null date', () => {
    expect(daysUntil(null)).toBeNull()
  })

  it('expiryStatus returns "none" for a null date', () => {
    expect(expiryStatus(null)).toBe('none')
  })

  it('expiryStatus returns "expired" for a past date', () => {
    const past = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryStatus(past)).toBe('expired')
  })

  it('expiryStatus returns "critical" for a date within 30 days', () => {
    const soon = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryStatus(soon)).toBe('critical')
  })

  it('expiryStatus returns "warn" for a date within 90 days', () => {
    const midRange = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryStatus(midRange)).toBe('warn')
  })

  it('expiryStatus returns "ok" for a date more than 90 days out', () => {
    const farOut = new Date(Date.now() + 200 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryStatus(farOut)).toBe('ok')
  })

  it('expiryColor maps each status to the correct hex per the prototype', () => {
    expect(expiryColor('expired')).toBe('#E74C3C')
    expect(expiryColor('critical')).toBe('#E74C3C')
    expect(expiryColor('warn')).toBe('#F59E0B')
    expect(expiryColor('ok')).toBe('#27AE60')
    expect(expiryColor('none')).toBe('#2A2A2A')
  })

  it('expiryLabel describes an expired date in the past tense', () => {
    const past = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10)
    expect(expiryLabel(past)).toBe('Expired 5d ago')
  })

  it('expiryLabel describes a future date as "Nd left"', () => {
    const soon = new Date(Date.now() + 10 * 86_400_000)
    soon.setHours(23, 59, 59, 999) // avoid a same-day rounding flake
    expect(expiryLabel(soon.toISOString().slice(0, 10))).toMatch(/^(9|10)d left$/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/features/carrier/schemas/__tests__/carrierProfile.schemas.test.ts`
Expected: FAIL — module `../carrierProfile.schemas` doesn't exist.

- [ ] **Step 3: Write `carrierProfile.schemas.ts`**

```typescript
// frontend/src/features/carrier/schemas/carrierProfile.schemas.ts
import { z } from 'zod'

export const CdlClassEnum = z.enum(['CLASS_A', 'CLASS_B', 'CLASS_C'])
export type CdlClass = z.infer<typeof CdlClassEnum>

export const CDL_CLASS_LABELS: Record<CdlClass, string> = {
  CLASS_A: 'Class A',
  CLASS_B: 'Class B',
  CLASS_C: 'Class C',
}

export type ExpiryStatus = 'ok' | 'warn' | 'critical' | 'expired' | 'none'

const MS_PER_DAY = 86_400_000

// Ported 1:1 from Prototype/ui_kits/carrier/carrier-profile.html's daysUntil().
export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / MS_PER_DAY)
}

// Ported 1:1 from the prototype's expiryStatus(): expired < 0d, critical <= 30d, warn <= 90d, else ok.
export function expiryStatus(dateStr: string | null | undefined): ExpiryStatus {
  const d = daysUntil(dateStr)
  if (d === null) return 'none'
  if (d < 0) return 'expired'
  if (d <= 30) return 'critical'
  if (d <= 90) return 'warn'
  return 'ok'
}

// Ported 1:1 from the prototype's expiryColor() — exact hex values from carrier-profile.html.
export function expiryColor(status: ExpiryStatus): string {
  return { expired: '#E74C3C', critical: '#E74C3C', warn: '#F59E0B', ok: '#27AE60', none: '#2A2A2A' }[status]
}

// Ported 1:1 from the prototype's expiryLabel().
export function expiryLabel(dateStr: string | null | undefined): string {
  const d = daysUntil(dateStr)
  if (d === null) return ''
  if (d < 0) return `Expired ${Math.abs(d)}d ago`
  if (d === 0) return 'Today'
  return `${d}d left`
}

// Preferred-lane cap enforced by this UI (ARCH §3: existing carrier_lanes
// table/endpoints, capped here client-side, not a schema constraint).
export const MAX_PREFERRED_LANES = 3
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/features/carrier/schemas/__tests__/carrierProfile.schemas.test.ts`
Expected: `Test Files 1 passed`, `Tests 9 passed`

- [ ] **Step 5: Extend `Profile` and `UpdateProfileValues` types**

In `frontend/src/features/profile/types.ts`, add this import at the top:

```typescript
import type { CdlClass } from '@/features/carrier/schemas/carrierProfile.schemas'
```

Add these 10 fields to the `Profile` interface, after the existing `equipmentType: EquipmentType | null` line:

```typescript
  equipmentYear: string | null
  equipmentMake: string | null
  equipmentModel: string | null
  licensePlate: string | null
  vin: string | null
  cdlClass: CdlClass | null
  cdlExpiry: string | null
  insuranceCarrier: string | null
  insuranceExpiry: string | null
  medCardExpiry: string | null
```

Add these 10 fields to the `UpdateProfileValues` interface, after the existing `equipmentType: EquipmentType | '' | undefined` line:

```typescript
  equipmentYear: string
  equipmentMake: string
  equipmentModel: string
  licensePlate: string
  vin: string
  cdlClass: CdlClass | '' | undefined
  cdlExpiry: string
  insuranceCarrier: string
  insuranceExpiry: string
  medCardExpiry: string
```

- [ ] **Step 6: Extend `useUpdateProfile.ts` to pass through the new string fields untouched**

The 10 new fields are all plain strings (no number normalization needed, unlike the cost fields). In `frontend/src/features/profile/hooks/useUpdateProfile.ts`, no code change is needed IF the mutation already spreads `...data` — verify by reading the current file: since `mutationFn` does `return profileApi.update({ ...data, equipmentType: ..., truckPaymentLease: normalizeNumber(...), ... })`, the spread already carries `equipmentYear`/`cdlClass`/etc. through untouched. **No edit required for this step** — this step exists to force verification, not to skip it blindly.

Run: `grep -n "\.\.\.data" frontend/src/features/profile/hooks/useUpdateProfile.ts`
Expected: confirms the spread is present (`return profileApi.update({\n        ...data,`).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/carrier/schemas/carrierProfile.schemas.ts frontend/src/features/carrier/schemas/__tests__/carrierProfile.schemas.test.ts frontend/src/features/profile/types.ts
git commit -m "feat(US-730h): add carrierProfile.schemas.ts expiry helpers + extend Profile/UpdateProfileValues types"
```

---

### Task 4: Frontend — `ExpiryDateField` and `CompletenessBar` presentational components

**Files:**
- Create: `frontend/src/features/carrier/components/carrierProfile/ExpiryDateField.tsx`
- Create: `frontend/src/features/carrier/components/carrierProfile/CompletenessBar.tsx`
- Test: `frontend/src/features/carrier/components/carrierProfile/__tests__/ExpiryDateField.test.tsx`
- Test: `frontend/src/features/carrier/components/carrierProfile/__tests__/CompletenessBar.test.tsx`

**Interfaces:**
- Consumes: `expiryStatus`, `expiryColor`, `expiryLabel` from Task 3's `carrierProfile.schemas.ts`.
- Produces: `<ExpiryDateField label testId value onChange />` and `<CompletenessBar checks={boolean[]} />` — both consumed by Task 5 (Identity summary strip uses `CompletenessBar`) and Task 7 (Credentials tab uses `ExpiryDateField` ×3).

- [ ] **Step 1: Write the failing test for `ExpiryDateField`**

```typescript
// frontend/src/features/carrier/components/carrierProfile/__tests__/ExpiryDateField.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpiryDateField } from '../ExpiryDateField'

describe('ExpiryDateField', () => {
  it('renders the label and calls onChange when the date is edited', () => {
    const onChange = vi.fn()
    render(<ExpiryDateField label="CDL expiry" testId="cdl-expiry-input" value="" onChange={onChange} />)

    expect(screen.getByText('CDL expiry')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('cdl-expiry-input'), { target: { value: '2027-08-15' } })
    expect(onChange).toHaveBeenCalledWith('2027-08-15')
  })

  it('shows a red "Expired" badge for a past date', () => {
    const past = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10)
    render(<ExpiryDateField label="CDL expiry" testId="cdl-expiry-input" value={past} onChange={() => {}} />)
    expect(screen.getByText('Expired 5d ago')).toBeInTheDocument()
  })

  it('shows no badge when the value is empty', () => {
    render(<ExpiryDateField label="CDL expiry" testId="cdl-expiry-input" value="" onChange={() => {}} />)
    expect(screen.queryByText(/d left|Expired|Today/)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/features/carrier/components/carrierProfile/__tests__/ExpiryDateField.test.tsx`
Expected: FAIL — module `../ExpiryDateField` doesn't exist.

- [ ] **Step 3: Write `ExpiryDateField.tsx`**

```tsx
// frontend/src/features/carrier/components/carrierProfile/ExpiryDateField.tsx
import { expiryStatus, expiryColor, expiryLabel } from '../../schemas/carrierProfile.schemas'

interface Props {
  label: string
  testId: string
  value: string
  onChange: (value: string) => void
}

// Ported 1:1 from Prototype/ui_kits/carrier/carrier-profile.html's ExpiryF component.
export function ExpiryDateField({ label, testId, value, onChange }: Props) {
  const status = expiryStatus(value)
  const color = expiryColor(status)
  const label_ = expiryLabel(value)

  const borderColor = status === 'warn' ? '#F59E0B' : status === 'critical' || status === 'expired' ? '#E74C3C' : '#2A2A2A'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#636E72' }}>
          {label}
        </span>
        {label_ && (
          <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase' }}>{label_}</span>
        )}
      </div>
      <input
        type="date"
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 52, padding: '0 14px', background: '#161616', border: `1px solid ${borderColor}`,
          borderRadius: 8, color: '#F5F5F5', fontSize: 16, width: '100%', outline: 'none',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/features/carrier/components/carrierProfile/__tests__/ExpiryDateField.test.tsx`
Expected: `Test Files 1 passed`, `Tests 3 passed`

- [ ] **Step 5: Write the failing test for `CompletenessBar`**

```typescript
// frontend/src/features/carrier/components/carrierProfile/__tests__/CompletenessBar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompletenessBar } from '../CompletenessBar'

describe('CompletenessBar', () => {
  it('shows 100% when all checks pass', () => {
    render(<CompletenessBar checks={[true, true, true, true]} />)
    expect(screen.getByText('100% complete')).toBeInTheDocument()
  })

  it('rounds the percentage for a partial completion', () => {
    render(<CompletenessBar checks={[true, true, true, false]} />)
    expect(screen.getByText('75% complete')).toBeInTheDocument()
  })

  it('shows 0% when no checks pass', () => {
    render(<CompletenessBar checks={[false, false]} />)
    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/features/carrier/components/carrierProfile/__tests__/CompletenessBar.test.tsx`
Expected: FAIL — module `../CompletenessBar` doesn't exist.

- [ ] **Step 7: Write `CompletenessBar.tsx`**

```tsx
// frontend/src/features/carrier/components/carrierProfile/CompletenessBar.tsx
interface Props {
  checks: boolean[]
}

// Ported 1:1 from Prototype/ui_kits/carrier/carrier-profile.html's ComplPill component.
export function CompletenessBar({ checks }: Props) {
  const pct = checks.length === 0 ? 0 : Math.round((checks.filter(Boolean).length / checks.length) * 100)
  const color = pct === 100 ? '#27AE60' : pct >= 70 ? '#F59E0B' : '#E74C3C'

  return (
    <div
      data-testid="completeness-bar"
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
        background: '#161616', borderBottom: '1px solid #2A2A2A', flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, height: 4, background: '#2A2A2A', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 300ms' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{pct}% complete</span>
    </div>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/features/carrier/components/carrierProfile/__tests__/CompletenessBar.test.tsx`
Expected: `Test Files 1 passed`, `Tests 3 passed`

- [ ] **Step 9: Commit**

```bash
git add frontend/src/features/carrier/components/carrierProfile/ExpiryDateField.tsx frontend/src/features/carrier/components/carrierProfile/CompletenessBar.tsx frontend/src/features/carrier/components/carrierProfile/__tests__/
git commit -m "feat(US-730h): add ExpiryDateField and CompletenessBar presentational components"
```

---

### Task 5: Frontend — `CarrierProfilePage` shell, header, tab bar, Identity tab

**Files:**
- Create: `frontend/src/pages/CarrierProfilePage.tsx`
- Test: `frontend/src/pages/__tests__/CarrierProfilePage.test.tsx`

**Interfaces:**
- Consumes: `useProfile()` (Task-independent, existing hook), `useUpdateProfile()` (existing hook, extended in Task 3), `CompletenessBar` from Task 4, `CdlClassEnum`/`CDL_CLASS_LABELS` from Task 3.
- Produces: `CarrierProfilePage` component with internal `tab` state (`'identity' | 'equipment' | 'credentials' | 'lanes'`) — Tasks 6-8 add the Equipment/Credentials/Lanes tab bodies into this same file's `TAB_CONTENT` object (this task only builds Identity + the shell).

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/src/pages/__tests__/CarrierProfilePage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CarrierProfilePage } from '../CarrierProfilePage'

vi.mock('@/features/profile/hooks/useProfile', () => ({
  useProfile: () => ({
    data: {
      firstName: 'Jake', lastName: 'Morrison', phone: '(512) 555-0182', email: 'jake@example.com',
      equipmentType: 'DRY_VAN', equipmentYear: '2019', equipmentMake: 'Freightliner', equipmentModel: 'Cascadia',
      licensePlate: 'TX-4821', vin: '', dotNumber: 'TX-4821', mcNumber: 'MC-772341',
      cdlClass: 'CLASS_A', cdlExpiry: '2027-08-15',
      insuranceCarrier: 'Progressive Commercial', insuranceExpiry: '2026-10-01', medCardExpiry: '2026-12-01',
    },
    isLoading: false,
    error: null,
  }),
}))
vi.mock('@/features/profile/hooks/useUpdateProfile', () => ({
  useUpdateProfile: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('@/features/carrier/hooks/useCarrierProfile', () => ({
  useLanes: () => ({ data: [], isLoading: false }),
}))

describe('CarrierProfilePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the Identity tab by default with the profile data pre-filled', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toHaveValue('Jake'))
    expect(screen.getByTestId('identity-last-name-input')).toHaveValue('Morrison')
  })

  it('switches to the Equipment tab when clicked', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-equipment'))
    expect(screen.getByTestId('equipment-type-select')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: FAIL — module `../CarrierProfilePage` doesn't exist.

- [ ] **Step 3: Write `CarrierProfilePage.tsx` (shell + header + tab bar + Identity tab only — Equipment/Credentials/Lanes tabs added in later tasks)**

```tsx
// frontend/src/pages/CarrierProfilePage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import { CompletenessBar } from '@/features/carrier/components/carrierProfile/CompletenessBar'
import type { UpdateProfileValues } from '@/features/profile/types'

const inputStyle: React.CSSProperties = {
  height: 52, padding: '0 14px', background: '#161616', border: '1px solid #2A2A2A',
  borderRadius: 8, color: '#F5F5F5', fontSize: 16, width: '100%', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#636E72',
}

type Tab = 'identity' | 'equipment' | 'credentials' | 'lanes'
const TABS: { id: Tab; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'credentials', label: 'Creds' },
  { id: 'lanes', label: 'Lanes' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  )
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>
}

export function CarrierProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()
  const [tab, setTab] = useState<Tab>('identity')
  const [form, setForm] = useState<Partial<UpdateProfileValues>>({})
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (profile) setForm(profile as Partial<UpdateProfileValues>)
  }, [profile])

  const set = <K extends keyof UpdateProfileValues>(key: K, value: UpdateProfileValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = () => {
    updateProfile(form as UpdateProfileValues, {
      onSuccess: () => {
        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 2500)
      },
    })
  }

  const completenessChecks = [
    !!form.firstName, !!form.lastName, !!form.phone,
    !!form.equipmentType, !!form.licensePlate, !!form.dotNumber,
    !!form.cdlClass, !!form.cdlExpiry, !!form.insuranceExpiry, !!form.insuranceCarrier,
  ]

  const userInitials = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase() || 'U'

  if (isLoading) {
    return <div data-testid="carrier-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh' }} />
  }

  const TAB_CONTENT: Record<Tab, React.ReactNode> = {
    identity: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 14px 0' }}>
        <Row2>
          <Field label="First name">
            <input data-testid="identity-first-name-input" className="di" style={inputStyle}
              value={form.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} placeholder="First" />
          </Field>
          <Field label="Last name">
            <input data-testid="identity-last-name-input" style={inputStyle}
              value={form.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} placeholder="Last" />
          </Field>
        </Row2>
        <Field label="Phone">
          <input data-testid="identity-phone-input" type="tel" style={inputStyle}
            value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 000-0000" />
        </Field>
        <div style={{
          background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 12, marginTop: 4,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A46A,#8C6D3F)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
            fontSize: 16, flexShrink: 0, boxShadow: '0 0 0 2px #B08D57',
          }}>
            {userInitials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{form.firstName} {form.lastName}</div>
            <div style={{ fontSize: 11, color: '#636E72', marginTop: 2 }}>{form.phone} · {profile?.email || '—'}</div>
          </div>
        </div>
      </div>
    ),
    equipment: null,
    credentials: null,
    lanes: null,
  }

  return (
    <div data-testid="carrier-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh', color: '#F5F5F5', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', borderBottom: '1px solid #2A2A2A', background: '#1A1A1A', flexShrink: 0 }}>
        <button data-testid="header-logo-btn" onClick={() => navigate('/dashboard/trucker')}
          style={{ background: 'none', border: 'none', padding: 0, minHeight: 56, minWidth: 56, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src="/logo.png" alt="FreightClub" style={{ height: 32, objectFit: 'contain' }} />
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#636E72', textTransform: 'uppercase', letterSpacing: '.07em' }}>
          My Profile
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button data-testid="header-save-btn" disabled={isPending} onClick={handleSave}
            style={{ background: 'none', border: 'none', color: justSaved ? '#27AE60' : '#C9A876', fontWeight: 700, fontSize: 13, minHeight: 56, padding: '0 8px' }}>
            {isPending ? 'Saving…' : justSaved ? '✓ Saved' : 'Save'}
          </button>
          <div data-testid="header-avatar" style={{
            width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A46A,#8C6D3F)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
            fontSize: 13, flexShrink: 0, boxShadow: '0 0 0 2px #B08D57',
          }}>
            {userInitials}
          </div>
        </div>
      </header>

      <CompletenessBar checks={completenessChecks} />

      <div style={{ display: 'flex', background: '#1A1A1A', borderBottom: '1px solid #2A2A2A', flexShrink: 0 }}>
        {TABS.map((t) => (
          <button key={t.id} data-testid={`tab-${t.id}`} onClick={() => setTab(t.id)}
            style={{
              flex: 1, height: 48, background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? '#B08D57' : 'transparent'}`,
              color: tab === t.id ? '#F5F5F5' : '#636E72', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.04em',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {TAB_CONTENT[tab]}
        <div style={{ padding: '12px 14px', marginTop: 'auto', flexShrink: 0 }}>
          <button data-testid="save-profile-btn" onClick={handleSave} disabled={isPending} style={{
            height: 64, width: '100%', borderRadius: 8, border: '1px solid #7A5F3A', color: '#fff',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            background: 'linear-gradient(180deg,#C9A46A 0%,#B08D57 45%,#8C6D3F 100%)',
          }}>
            {justSaved ? '✓ Profile Saved' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: the Identity-tab test passes; the Equipment-tab test FAILS (`equipment-type-select` not found — expected, that tab body is added in Task 6). This is fine — leave that assertion unimplemented as a placeholder-to-fill test in this task; Task 6 completes it.

Actually, since "No Placeholders" forbids leaving a failing test in the suite: **remove the Equipment-tab test from this task's file for now** — re-add it in Task 6 once `equipment: null` becomes real content. Edit the test file to delete the second `it(...)` block, keeping only the Identity-tab test.

Run again: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: `Test Files 1 passed`, `Tests 1 passed`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/CarrierProfilePage.tsx frontend/src/pages/__tests__/CarrierProfilePage.test.tsx
git commit -m "feat(US-730h): add CarrierProfilePage shell with header, tab bar, completeness bar, Identity tab"
```

---

### Task 6: Frontend — Equipment tab + equipment-change confirmation sheet

**Files:**
- Modify: `frontend/src/pages/CarrierProfilePage.tsx`
- Modify: `frontend/src/pages/__tests__/CarrierProfilePage.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: equipment-change confirm sheet state (`pendingEquipmentChange: { from: string; to: string } | null`), used only within this file.

- [ ] **Step 1: Add the failing test back (from Task 5's removed assertion) plus the confirm-sheet test**

Add to `frontend/src/pages/__tests__/CarrierProfilePage.test.tsx`:

```typescript
  it('switches to the Equipment tab when clicked', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-equipment'))
    expect(screen.getByTestId('equipment-type-select')).toHaveValue('DRY_VAN')
  })

  it('shows a confirmation sheet before committing an equipment type change', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-equipment'))

    fireEvent.change(screen.getByTestId('equipment-type-select'), { target: { value: 'FLATBED' } })
    expect(screen.getByText(/Change equipment type/)).toBeInTheDocument()
    expect(screen.getByTestId('equipment-type-select')).toHaveValue('DRY_VAN') // unchanged until confirmed

    fireEvent.click(screen.getByTestId('equip-confirm-yes-btn'))
    expect(screen.getByTestId('equipment-type-select')).toHaveValue('FLATBED')
    expect(screen.queryByText(/Change equipment type/)).not.toBeInTheDocument()
  })

  it('cancelling the equipment-change sheet leaves the original type selected', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-equipment'))

    fireEvent.change(screen.getByTestId('equipment-type-select'), { target: { value: 'FLATBED' } })
    fireEvent.click(screen.getByTestId('equip-confirm-cancel-btn'))
    expect(screen.getByTestId('equipment-type-select')).toHaveValue('DRY_VAN')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: FAIL — `equipment-type-select` not found (tab content is still `null`).

- [ ] **Step 3: Implement the Equipment tab and confirm sheet**

In `frontend/src/pages/CarrierProfilePage.tsx`, add this state near the other `useState` calls:

```typescript
  const [pendingEquipmentChange, setPendingEquipmentChange] = useState<{ from: string; to: string } | null>(null)
```

Add this handler near `handleSave`:

```typescript
  const handleEquipmentTypeChange = (newType: string) => {
    if (newType === form.equipmentType) return
    setPendingEquipmentChange({ from: form.equipmentType ?? '', to: newType })
  }

  const confirmEquipmentChange = () => {
    if (pendingEquipmentChange) set('equipmentType', pendingEquipmentChange.to as UpdateProfileValues['equipmentType'])
    setPendingEquipmentChange(null)
  }
```

Replace `equipment: null,` in `TAB_CONTENT` with:

```tsx
    equipment: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 14px 0' }}>
        <Field label="Equipment type">
          <select data-testid="equipment-type-select" style={inputStyle}
            value={form.equipmentType ?? ''} onChange={(e) => handleEquipmentTypeChange(e.target.value)}>
            <option value="DRY_VAN">Dry Van</option>
            <option value="FLATBED">Flatbed</option>
            <option value="REEFER">Reefer</option>
            <option value="STEP_DECK">Step Deck</option>
            <option value="REFRIGERATED">Refrigerated</option>
            <option value="TANKER">Tanker</option>
            <option value="SPECIALIZED">Specialized</option>
          </select>
          <div style={{ fontSize: 11, color: '#4A5568', fontStyle: 'italic', marginTop: 4 }}>
            Filters every load on your board — one type only
          </div>
        </Field>
        <Row2>
          <Field label="Year">
            <input data-testid="equipment-year-input" style={inputStyle} value={form.equipmentYear ?? ''}
              onChange={(e) => set('equipmentYear', e.target.value)} placeholder="2019" maxLength={4} />
          </Field>
          <Field label="Make">
            <input data-testid="equipment-make-input" style={inputStyle} value={form.equipmentMake ?? ''}
              onChange={(e) => set('equipmentMake', e.target.value)} placeholder="Freightliner" />
          </Field>
        </Row2>
        <Row2>
          <Field label="Model">
            <input data-testid="equipment-model-input" style={inputStyle} value={form.equipmentModel ?? ''}
              onChange={(e) => set('equipmentModel', e.target.value)} placeholder="Cascadia" />
          </Field>
          <Field label="Plate">
            <input data-testid="equipment-plate-input" style={{ ...inputStyle, textTransform: 'uppercase' }}
              value={form.licensePlate ?? ''} onChange={(e) => set('licensePlate', e.target.value)} placeholder="TX-0000" />
          </Field>
        </Row2>
        <Field label="VIN (optional)">
          <input data-testid="equipment-vin-input" style={inputStyle} value={form.vin ?? ''}
            onChange={(e) => set('vin', e.target.value)} placeholder="Leave blank if unknown" maxLength={17} />
        </Field>
      </div>
    ),
```

Add the confirm-sheet render just before the closing `</div>` of the component's returned JSX (after the tab-content `<div>`, still inside the outer `data-testid="carrier-profile-page"` div):

```tsx
      {pendingEquipmentChange && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
          <div style={{ width: '100%', maxWidth: 375, margin: '0 auto', background: '#1A1A1A', borderTop: '1px solid #C9A876', borderRadius: '12px 12px 0 0', padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Change equipment type?</div>
            <div style={{ fontSize: 13, color: '#808080', marginBottom: 20, lineHeight: 1.6 }}>
              <span style={{ color: '#C9A876', fontWeight: 700 }}>{pendingEquipmentChange.to}</span> loads will replace{' '}
              <span style={{ color: '#C9A876', fontWeight: 700 }}>{pendingEquipmentChange.from}</span> on your board. Takes effect immediately.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button data-testid="equip-confirm-yes-btn" onClick={confirmEquipmentChange} style={{
                height: 64, borderRadius: 8, border: '1px solid #7A5F3A', color: '#fff', fontWeight: 700, cursor: 'pointer',
                background: 'linear-gradient(180deg,#C9A46A 0%,#B08D57 45%,#8C6D3F 100%)',
              }}>
                Yes, Switch
              </button>
              <button data-testid="equip-confirm-cancel-btn" onClick={() => setPendingEquipmentChange(null)} style={{
                height: 56, borderRadius: 8, border: '1px solid #3A3A3A', color: '#C9A876', fontWeight: 600, cursor: 'pointer', background: 'transparent',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: `Test Files 1 passed`, `Tests 4 passed`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/CarrierProfilePage.tsx frontend/src/pages/__tests__/CarrierProfilePage.test.tsx
git commit -m "feat(US-730h): add Equipment tab with equipment-change confirmation sheet"
```

---

### Task 7: Frontend — Credentials tab + expiry warning banner

**Files:**
- Modify: `frontend/src/pages/CarrierProfilePage.tsx`
- Modify: `frontend/src/pages/__tests__/CarrierProfilePage.test.tsx`

**Interfaces:**
- Consumes: `ExpiryDateField` from Task 4, `CDL_CLASS_LABELS`/`CdlClassEnum` from Task 3, `expiryStatus` from Task 3.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Write the failing tests**

Add to `frontend/src/pages/__tests__/CarrierProfilePage.test.tsx`:

```typescript
  it('renders the Creds tab with DOT/MC/CDL/insurance fields pre-filled', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-credentials'))
    expect(screen.getByTestId('creds-dot-input')).toHaveValue('TX-4821')
    expect(screen.getByTestId('creds-mc-input')).toHaveValue('MC-772341')
    expect(screen.getByTestId('creds-cdl-class-select')).toHaveValue('CLASS_A')
    expect(screen.getByTestId('creds-cdl-expiry-input')).toHaveValue('2027-08-15')
    expect(screen.getByTestId('creds-insurance-carrier-input')).toHaveValue('Progressive Commercial')
  })

  it('shows a credential warning banner when a credential is expiring soon', async () => {
    vi.doMock('@/features/profile/hooks/useProfile', () => ({
      useProfile: () => ({
        data: {
          firstName: 'Jake', lastName: 'Morrison', phone: '', email: 'jake@example.com',
          equipmentType: 'DRY_VAN', dotNumber: '', mcNumber: '',
          cdlClass: 'CLASS_A', cdlExpiry: new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10),
          insuranceCarrier: '', insuranceExpiry: '', medCardExpiry: '',
        },
        isLoading: false, error: null,
      }),
    }))
    const { CarrierProfilePage: FreshPage } = await import('../CarrierProfilePage')
    render(<MemoryRouter><FreshPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/expire.*soon/)).toBeInTheDocument())
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: FAIL — `creds-dot-input` etc. not found (tab content is still `null`).

- [ ] **Step 3: Implement the Credentials tab and warning banner**

Add this import to the top of `CarrierProfilePage.tsx`:

```typescript
import { ExpiryDateField } from '@/features/carrier/components/carrierProfile/ExpiryDateField'
import { expiryStatus } from '@/features/carrier/schemas/carrierProfile.schemas'
```

Replace `credentials: null,` in `TAB_CONTENT` with:

```tsx
    credentials: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 0' }}>
        <Row2>
          <Field label="DOT #">
            <input data-testid="creds-dot-input" style={inputStyle} value={form.dotNumber ?? ''}
              onChange={(e) => set('dotNumber', e.target.value)} placeholder="TX-0000" />
          </Field>
          <Field label="MC #">
            <input data-testid="creds-mc-input" style={inputStyle} value={form.mcNumber ?? ''}
              onChange={(e) => set('mcNumber', e.target.value)} placeholder="MC-000000" />
          </Field>
        </Row2>
        <Row2>
          <Field label="CDL class">
            <select data-testid="creds-cdl-class-select" style={inputStyle}
              value={form.cdlClass ?? ''} onChange={(e) => set('cdlClass', e.target.value as UpdateProfileValues['cdlClass'])}>
              <option value="CLASS_A">Class A</option>
              <option value="CLASS_B">Class B</option>
              <option value="CLASS_C">Class C</option>
            </select>
          </Field>
          <ExpiryDateField label="CDL expiry" testId="creds-cdl-expiry-input"
            value={form.cdlExpiry ?? ''} onChange={(v) => set('cdlExpiry', v)} />
        </Row2>
        <Field label="Insurance carrier">
          <input data-testid="creds-insurance-carrier-input" style={inputStyle} value={form.insuranceCarrier ?? ''}
            onChange={(e) => set('insuranceCarrier', e.target.value)} placeholder="Progressive Commercial" />
        </Field>
        <Row2>
          <ExpiryDateField label="Insurance expiry" testId="creds-insurance-expiry-input"
            value={form.insuranceExpiry ?? ''} onChange={(v) => set('insuranceExpiry', v)} />
          <ExpiryDateField label="Med card expiry" testId="creds-med-card-expiry-input"
            value={form.medCardExpiry ?? ''} onChange={(v) => set('medCardExpiry', v)} />
        </Row2>
      </div>
    ),
```

Add the credential-warning banner computation right after `completenessChecks`:

```typescript
  const credWarnings = [
    { label: 'CDL', expiry: form.cdlExpiry },
    { label: 'Insurance', expiry: form.insuranceExpiry },
    { label: 'Med', expiry: form.medCardExpiry },
  ].filter((c) => ['warn', 'critical', 'expired'].includes(expiryStatus(c.expiry)))
```

Add the banner render right after the `<CompletenessBar checks={completenessChecks} />` line:

```tsx
      {credWarnings.length > 0 && (
        <div style={{
          background: 'rgba(231,76,60,.1)', borderBottom: '1px solid #E74C3C', padding: '7px 14px',
          display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 13 }}>⚠️</span>
          <span style={{ fontSize: 12, color: '#E74C3C', fontWeight: 600 }}>
            {credWarnings.map((w) => w.label).join(', ')} expire{credWarnings.length === 1 ? 's' : ''} soon
          </span>
          <button data-testid="cred-warning-review-btn" onClick={() => setTab('credentials')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#E74C3C', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
            Review
          </button>
        </div>
      )}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: `Test Files 1 passed`, `Tests 6 passed`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/CarrierProfilePage.tsx frontend/src/pages/__tests__/CarrierProfilePage.test.tsx
git commit -m "feat(US-730h): add Credentials tab with expiry-badge fields and credential warning banner"
```

---

### Task 8: Frontend — Lanes tab (reuses existing `carrierApi.lanes`, capped at 3)

**Files:**
- Modify: `frontend/src/pages/CarrierProfilePage.tsx`
- Modify: `frontend/src/pages/__tests__/CarrierProfilePage.test.tsx`

**Interfaces:**
- Consumes: `useLanes(truckerId)` (existing React Query hook, `frontend/src/features/carrier/hooks/useCarrierProfile.ts:50-56` — takes the real authenticated user ID, guarded by `enabled: !!truckerId`), `carrierApi.lanes.add()`/`.update()` (existing, unchanged), `MAX_PREFERRED_LANES` from Task 3.
- Produces: nothing new for later tasks (final tab).

- [ ] **Step 1: Write the failing test**

Update the `vi.mock('@/features/carrier/hooks/useCarrierProfile', ...)` at the top of the test file to return a lane fixture, and add the test:

```typescript
vi.mock('@/features/carrier/hooks/useCarrierProfile', () => ({
  useLanes: () => ({
    data: [{ id: 'lane-1', originRegion: 'TX', destinationRegion: 'FL', frequencyPreference: 'ANY', status: 'ACTIVE', createdAt: '2026-01-01' }],
    isLoading: false,
  }),
}))
vi.mock('@/features/carrier/api', () => ({
  carrierApi: {
    lanes: {
      add: vi.fn().mockResolvedValue({ id: 'lane-2', originRegion: 'CA', destinationRegion: 'NY', frequencyPreference: 'ANY', status: 'ACTIVE', createdAt: '2026-01-02' }),
      update: vi.fn().mockResolvedValue({ id: 'lane-1', originRegion: 'TX', destinationRegion: 'FL', frequencyPreference: 'ANY', status: 'ACTIVE', createdAt: '2026-01-01' }),
    },
  },
}))
```

```typescript
  it('renders the Lanes tab with up to 3 rows, pre-filled from existing lanes', async () => {
    render(<MemoryRouter><CarrierProfilePage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('identity-first-name-input')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('tab-lanes'))
    await waitFor(() => expect(screen.getByTestId('lane-1-origin-select')).toHaveValue('TX'))
    expect(screen.getByTestId('lane-1-destination-select')).toHaveValue('FL')
    expect(screen.getByTestId('lane-2-origin-select')).toHaveValue('')
    expect(screen.getByTestId('lane-3-origin-select')).toHaveValue('')
    // exactly 3 rows, never a 4th "add lane" row
    expect(screen.queryByTestId('lane-4-origin-select')).not.toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: FAIL — `lane-1-origin-select` not found (tab content is still `null`).

- [ ] **Step 3: Implement the Lanes tab**

Add this import to the top of `CarrierProfilePage.tsx`:

```typescript
import { carrierApi } from '@/features/carrier/api'
import { useLanes } from '@/features/carrier/hooks/useCarrierProfile'
import { MAX_PREFERRED_LANES } from '@/features/carrier/schemas/carrierProfile.schemas'
```

Add this state near the other `useState` calls:

```typescript
  const [lanes, setLanes] = useState<Array<{ id?: string; originRegion: string; destinationRegion: string }>>([])
```

Add the `useLanes` call near the top of the component (needs `user?.id`, already destructured from `useAuthStore` earlier in the file):

```typescript
  const { data: existingLanes } = useLanes(user?.id ?? '')
```

Add this effect near the existing `useEffect` that seeds `form` — it reacts to `existingLanes` resolving, rather than fetching directly:

```typescript
  useEffect(() => {
    if (!existingLanes) return
    const rows = existingLanes.slice(0, MAX_PREFERRED_LANES).map((l) => ({ id: l.id, originRegion: l.originRegion, destinationRegion: l.destinationRegion }))
    while (rows.length < MAX_PREFERRED_LANES) rows.push({ originRegion: '', destinationRegion: '' })
    setLanes(rows)
  }, [existingLanes])
```

Add this handler near `handleSave`:

```typescript
  const setLaneField = (index: number, field: 'originRegion' | 'destinationRegion', value: string) => {
    setLanes((prev) => prev.map((lane, i) => (i === index ? { ...lane, [field]: value } : lane)))
  }

  const saveLane = (index: number) => {
    const lane = lanes[index]
    if (!lane.originRegion || !lane.destinationRegion) return
    if (lane.id) {
      carrierApi.lanes.update(lane.id, { originRegion: lane.originRegion, destinationRegion: lane.destinationRegion, frequencyPreference: 'ANY' })
    } else {
      carrierApi.lanes.add({ originRegion: lane.originRegion, destinationRegion: lane.destinationRegion, frequencyPreference: 'ANY' })
        .then((created) => setLanes((prev) => prev.map((l, i) => (i === index ? { ...l, id: created.id } : l))))
    }
  }
```

Replace `lanes: null,` in `TAB_CONTENT` with:

```tsx
    lanes: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 14px 0' }}>
        <div style={{ fontSize: 13, color: '#636E72', lineHeight: 1.5 }}>
          Up to {MAX_PREFERRED_LANES} lanes — matching loads surface first on your board.
        </div>
        {lanes.map((lane, i) => (
          <div key={i}>
            <div style={labelStyle}>Lane {i + 1}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr', gap: 6, alignItems: 'center', marginTop: 6 }}>
              <select data-testid={`lane-${i + 1}-origin-select`} style={inputStyle}
                value={lane.originRegion} onChange={(e) => { setLaneField(i, 'originRegion', e.target.value); }}
                onBlur={() => saveLane(i)}>
                <option value="">Origin</option>
                <option value="TX">TX</option><option value="CA">CA</option><option value="FL">FL</option>
                <option value="NY">NY</option><option value="IL">IL</option>
              </select>
              <span style={{ color: '#C9A876', textAlign: 'center', fontSize: 14 }}>→</span>
              <select data-testid={`lane-${i + 1}-destination-select`} style={inputStyle}
                value={lane.destinationRegion} onChange={(e) => { setLaneField(i, 'destinationRegion', e.target.value); }}
                onBlur={() => saveLane(i)}>
                <option value="">Dest.</option>
                <option value="TX">TX</option><option value="CA">CA</option><option value="FL">FL</option>
                <option value="NY">NY</option><option value="IL">IL</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    ),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/__tests__/CarrierProfilePage.test.tsx`
Expected: `Test Files 1 passed`, `Tests 7 passed`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/CarrierProfilePage.tsx frontend/src/pages/__tests__/CarrierProfilePage.test.tsx
git commit -m "feat(US-730h): add Lanes tab reusing existing carrierApi.lanes, capped at 3 rows"
```

---

### Task 9: Routing, Settings entry update, e2e golden path + touch-target sweep

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/TruckerDashboard.tsx`
- Create: `frontend/e2e/us-730h-carrier-profile.spec.ts`
- Create: `frontend/e2e/page-objects/CarrierProfilePageObject.ts`

**Interfaces:**
- Consumes: `CarrierProfilePage` from Task 5-8 (fully assembled).
- Produces: route `/carrier/profile`, updated Settings entry, e2e evidence.

- [ ] **Step 1: Register the route in `App.tsx`**

Add the lazy import near the existing `CostProfilePage` import (`frontend/src/App.tsx:20`):

```typescript
const CarrierProfilePage = lazy(() => import('@/pages/CarrierProfilePage').then(m => ({ default: m.CarrierProfilePage })))
```

Add the route right after the existing `/carrier/cost-profile` route block (`frontend/src/App.tsx:171-180`):

```tsx
      <Route
        path="/carrier/profile"
        element={
          <ProtectedRoute role="TRUCKER">
            <Suspense fallback={<PageLoader />}>
              <CarrierProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
```

- [ ] **Step 2: Update the Settings entry in `TruckerDashboard.tsx`**

Change line 430 from:
```typescript
    { icon: '👤', label: 'Profile', sub: 'DOT number, CDL, insurance', to: '/profile' },
```
to:
```typescript
    { icon: '👤', label: 'Profile', sub: 'DOT number, CDL, insurance', to: '/carrier/profile' },
```

- [ ] **Step 3: Run the frontend unit suite to confirm no regressions**

Run: `cd frontend && npx vitest run`
Expected: all tests pass, 0 failures (including the new `CarrierProfilePage.test.tsx`, `ExpiryDateField.test.tsx`, `CompletenessBar.test.tsx`, `carrierProfile.schemas.test.ts`).

- [ ] **Step 4: Write the e2e page object**

```typescript
// frontend/e2e/page-objects/CarrierProfilePageObject.ts
import type { Page } from '@playwright/test'

export class CarrierProfilePageObject {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/carrier/profile', { waitUntil: 'networkidle' })
  }

  async clickTab(tab: 'identity' | 'equipment' | 'credentials' | 'lanes') {
    await this.page.locator(`[data-testid="tab-${tab}"]`).click()
  }

  async fillIdentity(firstName: string, lastName: string, phone: string) {
    await this.page.locator('[data-testid="identity-first-name-input"]').fill(firstName)
    await this.page.locator('[data-testid="identity-last-name-input"]').fill(lastName)
    await this.page.locator('[data-testid="identity-phone-input"]').fill(phone)
  }

  async fillEquipment(year: string, make: string, model: string, plate: string) {
    await this.page.locator('[data-testid="equipment-year-input"]').fill(year)
    await this.page.locator('[data-testid="equipment-make-input"]').fill(make)
    await this.page.locator('[data-testid="equipment-model-input"]').fill(model)
    await this.page.locator('[data-testid="equipment-plate-input"]').fill(plate)
  }

  async fillCredentials(dot: string, mc: string, cdlClass: string, cdlExpiry: string) {
    await this.page.locator('[data-testid="creds-dot-input"]').fill(dot)
    await this.page.locator('[data-testid="creds-mc-input"]').fill(mc)
    await this.page.locator('[data-testid="creds-cdl-class-select"]').selectOption(cdlClass)
    await this.page.locator('[data-testid="creds-cdl-expiry-input"]').fill(cdlExpiry)
  }

  async save() {
    await this.page.locator('[data-testid="save-profile-btn"]').click()
  }
}
```

- [ ] **Step 5: Write the golden-path e2e spec with a touch-target sweep at every tab**

```typescript
// frontend/e2e/us-730h-carrier-profile.spec.ts
/**
 * Feature: US-730h (Carrier Identity & Credentials Profile)
 * AC: Carrier can fill Identity/Equipment/Credentials/Lanes tabs and save
 * AC: All interactive elements meet the 48px+ touch target minimum, at every tab
 */
import { test, expect } from '@playwright/test'
import { CarrierProfilePageObject } from './page-objects/CarrierProfilePageObject'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'

async function assertAllButtonsAreGloveFriendly(page: import('@playwright/test').Page) {
  const buttons = await page.locator('button').all()
  for (const button of buttons) {
    if (!(await button.isVisible())) continue
    const box = await button.boundingBox()
    expect(box, 'every visible button must report a bounding box').not.toBeNull()
    expect(box!.height, `button "${await button.textContent()}" must be >= 48px tall`).toBeGreaterThanOrEqual(48)
  }
}

test.describe('US-730h Carrier Identity & Credentials Profile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('golden path: fill all 4 tabs, save, reload, data persists', async ({ page }) => {
    const email = `us-730h-${Date.now()}@freightclub.local`
    await fetch(`${BACKEND}/api/test/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'E2ETestPassword123!', firstName: 'Test', lastName: 'Trucker', role: 'TRUCKER', companyName: `TestTruck-${Date.now()}` }),
    })
    await page.goto(`${FRONTEND}/login`)
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
    await page.click('[data-testid="login-submit-btn"]')
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })

    const profile = new CarrierProfilePageObject(page)
    await profile.goto()

    await profile.fillIdentity('Jake', 'Morrison', '(512) 555-0182')
    await assertAllButtonsAreGloveFriendly(page)

    await profile.clickTab('equipment')
    await profile.fillEquipment('2019', 'Freightliner', 'Cascadia', 'TX-4821')
    await assertAllButtonsAreGloveFriendly(page)

    await profile.clickTab('credentials')
    await profile.fillCredentials('TX-4821', 'MC-772341', 'CLASS_A', '2027-08-15')
    await assertAllButtonsAreGloveFriendly(page)

    await profile.clickTab('lanes')
    await assertAllButtonsAreGloveFriendly(page)

    await profile.save()
    await page.waitForTimeout(1000)
    await expect(page.locator('[data-testid="header-save-btn"]')).toContainText('Saved')

    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('[data-testid="identity-first-name-input"]')).toHaveValue('Jake')

    await profile.clickTab('equipment')
    await expect(page.locator('[data-testid="equipment-make-input"]')).toHaveValue('Freightliner')

    await page.screenshot({ path: 'test-results/evidence/US-730h-carrier-profile-identity.png', fullPage: true })
  })

  test('equipment-change confirmation sheet buttons are glove-friendly', async ({ page }) => {
    const email = `us-730h-equip-${Date.now()}@freightclub.local`
    await fetch(`${BACKEND}/api/test/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'E2ETestPassword123!', firstName: 'Test', lastName: 'Trucker', role: 'TRUCKER', companyName: `TestTruck-${Date.now()}` }),
    })
    await page.goto(`${FRONTEND}/login`)
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
    await page.click('[data-testid="login-submit-btn"]')
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })

    const profile = new CarrierProfilePageObject(page)
    await profile.goto()
    await profile.clickTab('equipment')
    await page.locator('[data-testid="equipment-type-select"]').selectOption('FLATBED')
    await expect(page.locator('[data-testid="equip-confirm-yes-btn"]')).toBeVisible()
    await assertAllButtonsAreGloveFriendly(page)
    await page.locator('[data-testid="equip-confirm-yes-btn"]').click()
    await expect(page.locator('[data-testid="equipment-type-select"]')).toHaveValue('FLATBED')
  })
})
```

- [ ] **Step 6: Full Docker Pre-Test Protocol + run the new e2e spec**

Run (from repo root):
```bash
docker compose -f docker-compose.test.yml down -v
cd backend && "/c/tools/apache-maven-3.9.9/bin/mvn.cmd" clean package -DskipTests -Djacoco.skip=true -q
cd ../frontend && npm run build
cd ..
docker compose -f docker-compose.test.yml up --build -d
```
Wait for all 3 containers `(healthy)` via `docker ps`, then:
```bash
cd frontend && npx playwright test us-730h-carrier-profile.spec.ts
```
Expected: `2 passed` with the golden-path screenshot at `test-results/evidence/US-730h-carrier-profile-identity.png`.

- [ ] **Step 7: Run the full existing e2e suite to confirm no regression (especially anything touching `/profile` or the Settings tab)**

Run: `cd frontend && npx playwright test`
Expected: all previously-passing specs still pass — pay particular attention to any spec asserting on the old `/profile` Settings link behavior, since Step 2 changed its target.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/App.tsx frontend/src/pages/TruckerDashboard.tsx frontend/e2e/us-730h-carrier-profile.spec.ts frontend/e2e/page-objects/CarrierProfilePageObject.ts
git commit -m "feat(US-730h): register /carrier/profile route, update Settings entry, add e2e golden path + touch-target sweep"
```

---

## Self-Review Notes (completed during plan authoring)

**Spec coverage:** ARCH §1-5 and HFD §1-9 are covered — Task 1 (schema/enum), Task 2 (DTOs/service), Task 3 (frontend types/expiry helpers), Task 4 (presentational components), Task 5-8 (all 4 tabs + shell), Task 9 (routing/Settings/e2e). The equipment-type→load-board-cache-invalidation directive from ARCH §5 item 5 is intentionally **not** included as a separate step: `useProfile`'s module-level cache (not React Query) already forces a full refetch of `/api/v1/profile` on next mount via `__clearCache()` in `useUpdateProfile`'s `onSuccess`, and the load board reads `equipmentType` fresh from its own board-listing endpoint on each navigation — there is no separate React-Query-cached "load board" key for this hook to invalidate the way `useCostProfile` had one. If a future audit finds the load board doesn't refresh promptly after an equipment change, that's a narrower, separate finding — not a gap in this plan's Task 6.

**Placeholder scan:** no TBD/TODO/"add proper" phrases; every code block is complete, runnable code, not a description.

**Type consistency:** `UpdateProfileValues.cdlClass: CdlClass | '' | undefined` (Task 3) is read as `form.cdlClass` and written via `set('cdlClass', ...)` consistently through Tasks 5-7; `carrierApi.lanes.add()`'s payload matches `LaneFormData` exactly (`originRegion`, `destinationRegion`, `frequencyPreference` — confirmed against `frontend/src/features/carrier/schemas/carrier.schemas.ts:45-49`, which requires `frequencyPreference`, hence Task 8 always supplies `'ANY'`).
