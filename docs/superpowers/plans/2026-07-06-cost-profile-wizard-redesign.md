# Cost Profile Wizard Redesign (US-730a-v2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline Cost Profile form in `ProfilePage.tsx` with a dedicated `/carrier/cost-profile` screen (summary + 3-step wizard) that reads/writes the same backend entity the load board already uses for RPM coloring, fixing the pre-existing two-data-store disconnect.

**Architecture:** Extend the existing hexagonal `carrier` module (`CarrierCostProfile` domain, `CarrierCostProfileEntity`, `CarrierCostProfileService`) with new wizard fields and diesel-region-aware formulas, additive-only DB migration. New `CarrierCostProfileController` exposes `GET/PUT /api/v1/carrier/cost-profile`. Frontend adds a new route + summary/wizard components backed by React Query, matching the `useCarrierProfile.ts` hook pattern already used elsewhere in this module.

**Tech Stack:** Spring Boot 3 (Java 21, no Lombok), JPA/Hibernate, Flyway, PostgreSQL; React 18 + TypeScript + React Query + react-hook-form + Zod + Tailwind; Playwright e2e.

## Global Constraints

- No Lombok — hand-written getters/setters/constructors (CODER.md).
- All DB IDs `VARCHAR(36)`; RLS already enabled on `carrier_cost_profiles` — do not add a new policy.
- Migration must be **additive only** — no dropped/renamed columns (existing rows must keep working).
- `@RequestBody` (not `@RequestParam`) for the PUT endpoint per reviewer-checklist §5.
- `apiClient`/`apiGet`/`apiPost`/`apiPut` calls must NOT include `/api/v1/` prefix (baseURL already has it).
- All new interactive elements need a `data-testid`; every new button needs a `boundingBox()` Playwright assertion (reviewer-checklist §4 touch-target rule) — 56px tap targets / 64px primary CTA / 52px inputs per the locked HFD spec.
- Design is locked: `docs/architecture/ARCH_US-730a-v2_Cost_Profile_Wizard_Design.md` + `docs/hfd/US-730a-v2_Cost_Profile_Wizard_Design_Spec.md`. Any infeasibility found while implementing must be escalated to LIBRARIAN via CHG, not silently changed.
- KPI tile colors are `#EF4444` / `#F59E0B` / `#22C55E` (prototype-approved exception — do NOT "fix" these to the general Style Guide's `#E74C3C`/`#F39C12`/`#27AE60`).
- Commit message prefix must match `^(feat|fix|chore|docs|test|refactor|style)\(US-[0-9]+-?[a-z0-9]*\):` (single hyphen max) — use `US-730a` as the commit-message ID, mention `US-730a-v2` in the body.
- Branch: work happens on `feature/US-730a-v2-cost-profile-wizard` (already created).

---

## Design Correction Found During Planning

While mapping the locked ARCH migration against the actual `CarrierCostProfileEntity`/`carrier_cost_profiles` schema, found that the original migration (`V20260427_1600__CarrierCostProfile_US702.sql`) marks `monthly_fixed_costs`, `fuel_cost_per_gallon`, `maintenance_cost_per_mile`, `monthly_miles_target`, and `target_margin_per_mile` as `NOT NULL`. A first-time wizard user creates a **new row that only has the new wizard fields populated** — those legacy columns would be `NULL`, violating the existing `NOT NULL` constraints and the `int monthlyMilesTarget` primitive field (can't hold `null`) in `CarrierCostProfileEntity`/`CarrierCostProfile`.

**Fix (folded into Task 1):** the migration additionally relaxes those 5 legacy columns to nullable (Postgres `CHECK` constraints already pass automatically on `NULL`, so no constraint rewrite needed), and `monthlyMilesTarget` changes from `int` to `Integer` in both the domain class and entity. This is additive/backward-compatible — existing fully-populated rows are unaffected.

---

### Task 1: Database Migration — Additive Wizard Columns + Legacy Nullability Fix

**Files:**
- Create: `backend/src/main/resources/db/migration/V20260706_1400__CarrierCostProfile_US730a_v2.sql`

**Interfaces:**
- Produces: 8 new nullable columns on `carrier_cost_profiles` (`diesel_region`, `additional_cost_per_mile`, `truck_payment_monthly`, `insurance_monthly`, `permits_monthly`, `annual_miles`, `weekly_income_goal`, `weeks_worked_per_year`), plus 5 existing columns relaxed to nullable.

- [ ] **Step 1: Write the migration file**

```sql
-- US-730a-v2: Cost Profile Wizard Redesign (CHG-US730-007)
-- Additive columns for the new wizard model; relaxes legacy NOT NULL
-- constraints so a wizard-only row (no legacy fields) can be created.

ALTER TABLE carrier_cost_profiles
  ADD COLUMN diesel_region VARCHAR(20),
  ADD COLUMN additional_cost_per_mile DECIMAL(10, 4),
  ADD COLUMN truck_payment_monthly DECIMAL(10, 2),
  ADD COLUMN insurance_monthly DECIMAL(10, 2),
  ADD COLUMN permits_monthly DECIMAL(10, 2),
  ADD COLUMN annual_miles INT,
  ADD COLUMN weekly_income_goal DECIMAL(10, 2),
  ADD COLUMN weeks_worked_per_year SMALLINT;

ALTER TABLE carrier_cost_profiles
  ADD CONSTRAINT chk_diesel_region
  CHECK (diesel_region IS NULL OR diesel_region IN ('EAST', 'MIDWEST', 'SOUTH', 'ROCKY', 'WEST'));

-- Legacy columns become nullable so a wizard-only profile (no legacy
-- inputs) can be inserted. Existing CHECK constraints on these columns
-- already pass automatically for NULL values in Postgres.
ALTER TABLE carrier_cost_profiles ALTER COLUMN monthly_fixed_costs DROP NOT NULL;
ALTER TABLE carrier_cost_profiles ALTER COLUMN fuel_cost_per_gallon DROP NOT NULL;
ALTER TABLE carrier_cost_profiles ALTER COLUMN maintenance_cost_per_mile DROP NOT NULL;
ALTER TABLE carrier_cost_profiles ALTER COLUMN monthly_miles_target DROP NOT NULL;
ALTER TABLE carrier_cost_profiles ALTER COLUMN target_margin_per_mile DROP NOT NULL;
```

- [ ] **Step 2: Verify migration applies cleanly**

Run (from repo root, PowerShell):
```powershell
docker compose -f docker-compose.test.yml down -v
cd backend
& "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" clean package -DskipTests -Djacoco.skip=true -q
cd ..
docker compose -f docker-compose.test.yml up --build -d
```
Expected: backend container starts cleanly; `docker compose -f docker-compose.test.yml logs freightclub-test-backend | Select-String "Flyway"` shows the new migration version applied with no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V20260706_1400__CarrierCostProfile_US730a_v2.sql
git commit -m "feat(US-730a): add wizard columns + relax legacy NOT NULL on carrier_cost_profiles"
```

---

### Task 2: Domain Model — Wizard Fields, Formulas, Null-Safety

**Files:**
- Modify: `backend/src/main/java/com/freightclub/modules/carrier/domain/CarrierCostProfile.java`
- Modify: `backend/src/main/java/com/freightclub/modules/carrier/infrastructure/CarrierCostProfileEntity.java`
- Test: `backend/src/test/java/com/freightclub/modules/carrier/CarrierCostProfileTest.java` (new — domain unit tests, no Spring context needed)

**Interfaces:**
- Consumes: nothing new (pure domain object).
- Produces: `CarrierCostProfile.calculateFuelCPM(BigDecimal)`, `.calculateVariableCPM(BigDecimal)`, `.calculateAnnualFixedCPM()`, `.calculateAnnualMarginCPM()`, `.calculateBreakevenRPM(BigDecimal)`, `.calculateMinimumRPM(BigDecimal)` (overload), `.calculateTargetRPM(BigDecimal)`, `.hasWizardFields()`, `.createNewWizard(...)` (static factory), `.updateWizardFields(...)`. Consumed by Task 3.

- [ ] **Step 1: Write the failing domain unit test**

```java
package com.freightclub.modules.carrier;

import static org.assertj.core.api.Assertions.assertThat;

import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CarrierCostProfileTest {

  @Test
  void wizardFormulas_computeExpectedRpm() {
    CarrierCostProfile profile =
        CarrierCostProfile.createNewWizard(
            "tenant-1",
            "trucker-1",
            "MIDWEST",
            new BigDecimal("6.5"),          // milesPerGallon
            new BigDecimal("0.08"),          // additionalCostPerMile
            new BigDecimal("1200"),          // truckPaymentMonthly
            new BigDecimal("600"),           // insuranceMonthly
            new BigDecimal("150"),           // permitsMonthly
            120000,                          // annualMiles
            new BigDecimal("2000"),          // weeklyIncomeGoal
            48);                             // weeksWorkedPerYear

    BigDecimal dieselPrice = new BigDecimal("3.90");

    // fuelCpm = 3.90 / 6.5 = 0.6000
    assertThat(profile.calculateFuelCPM(dieselPrice)).isEqualByComparingTo("0.6000");
    // variableCpm = 0.6000 + 0.08 = 0.6800
    assertThat(profile.calculateVariableCPM(dieselPrice)).isEqualByComparingTo("0.6800");
    // annualFixedCpm = (1200+600+150)*12 / 120000 = 0.1950
    assertThat(profile.calculateAnnualFixedCPM()).isEqualByComparingTo("0.1950");
    // annualMarginCpm = (2000*48) / 120000 = 0.8000
    assertThat(profile.calculateAnnualMarginCPM()).isEqualByComparingTo("0.8000");
    // breakeven = 0.6800 + 0.1950 = 0.8750
    assertThat(profile.calculateBreakevenRPM(dieselPrice)).isEqualByComparingTo("0.8750");
    // minRpm = 0.8750 + 0.8000 = 1.6750
    assertThat(profile.calculateMinimumRPM(dieselPrice)).isEqualByComparingTo("1.6750");
    // targetRpm = 1.6750 * 1.2 = 2.01000
    assertThat(profile.calculateTargetRPM(dieselPrice)).isEqualByComparingTo("2.01000");
    assertThat(profile.hasWizardFields()).isTrue();
  }

  @Test
  void legacyProfile_hasWizardFieldsFalse_andNoArgFormulasStillWork() {
    CarrierCostProfile legacy =
        CarrierCostProfile.createNew(
            "tenant-1",
            "trucker-2",
            new BigDecimal("2500"),
            new BigDecimal("3.50"),
            new BigDecimal("6.5"),
            new BigDecimal("0.15"),
            10000,
            new BigDecimal("0.50"));

    assertThat(legacy.hasWizardFields()).isFalse();
    assertThat(legacy.calculateMinimumRPM()).isGreaterThan(BigDecimal.ZERO);
  }

  @Test
  void wizardOnlyProfile_legacyNoArgFormulasReturnZero_noNullPointerException() {
    CarrierCostProfile wizardOnly =
        CarrierCostProfile.createNewWizard(
            "tenant-1", "trucker-3", "EAST", new BigDecimal("6.0"),
            new BigDecimal("0.07"), new BigDecimal("1000"), new BigDecimal("500"),
            new BigDecimal("100"), 100000, new BigDecimal("1800"), 48);

    // legacy fields are null on a wizard-only profile — must not NPE
    assertThat(wizardOnly.calculateMinimumRPM()).isEqualByComparingTo(BigDecimal.ZERO);
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=CarrierCostProfileTest`
Expected: FAIL — compile error, `createNewWizard` / new methods do not exist yet.

- [ ] **Step 3: Rewrite `CarrierCostProfile.java` domain class**

```java
package com.freightclub.modules.carrier.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class CarrierCostProfile {

  private String id;
  private String tenantId;
  private String truckerId;

  // Legacy fields (nullable — a wizard-only profile leaves these null)
  private BigDecimal monthlyFixedCosts;
  private BigDecimal fuelCostPerGallon;
  private BigDecimal maintenanceCostPerMile;
  private Integer monthlyMilesTarget;
  private BigDecimal targetMarginPerMile;

  // Shared field (both legacy and wizard model populate this)
  private BigDecimal milesPerGallon;

  // Wizard fields (US-730a-v2, nullable — a legacy-only profile leaves these null)
  private String dieselRegion;
  private BigDecimal additionalCostPerMile;
  private BigDecimal truckPaymentMonthly;
  private BigDecimal insuranceMonthly;
  private BigDecimal permitsMonthly;
  private Integer annualMiles;
  private BigDecimal weeklyIncomeGoal;
  private Integer weeksWorkedPerYear;

  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;
  private OffsetDateTime deletedAt;

  public CarrierCostProfile() {}

  public CarrierCostProfile(
      String id,
      String tenantId,
      String truckerId,
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      Integer monthlyMilesTarget,
      BigDecimal targetMarginPerMile,
      String dieselRegion,
      BigDecimal additionalCostPerMile,
      BigDecimal truckPaymentMonthly,
      BigDecimal insuranceMonthly,
      BigDecimal permitsMonthly,
      Integer annualMiles,
      BigDecimal weeklyIncomeGoal,
      Integer weeksWorkedPerYear,
      OffsetDateTime createdAt,
      OffsetDateTime updatedAt,
      OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.truckerId = truckerId;
    this.monthlyFixedCosts = monthlyFixedCosts;
    this.fuelCostPerGallon = fuelCostPerGallon;
    this.milesPerGallon = milesPerGallon;
    this.maintenanceCostPerMile = maintenanceCostPerMile;
    this.monthlyMilesTarget = monthlyMilesTarget;
    this.targetMarginPerMile = targetMarginPerMile;
    this.dieselRegion = dieselRegion;
    this.additionalCostPerMile = additionalCostPerMile;
    this.truckPaymentMonthly = truckPaymentMonthly;
    this.insuranceMonthly = insuranceMonthly;
    this.permitsMonthly = permitsMonthly;
    this.annualMiles = annualMiles;
    this.weeklyIncomeGoal = weeklyIncomeGoal;
    this.weeksWorkedPerYear = weeksWorkedPerYear;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  // Legacy factory (US-702) — unchanged signature, new fields default to null
  public static CarrierCostProfile createNew(
      String tenantId,
      String truckerId,
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile) {
    return new CarrierCostProfile(
        java.util.UUID.randomUUID().toString(),
        tenantId,
        truckerId,
        monthlyFixedCosts,
        fuelCostPerGallon,
        milesPerGallon,
        maintenanceCostPerMile,
        monthlyMilesTarget,
        targetMarginPerMile,
        null, null, null, null, null, null, null, null,
        OffsetDateTime.now(ZoneOffset.UTC),
        OffsetDateTime.now(ZoneOffset.UTC),
        null);
  }

  // Wizard factory (US-730a-v2) — legacy-specific fields default to null
  public static CarrierCostProfile createNewWizard(
      String tenantId,
      String truckerId,
      String dieselRegion,
      BigDecimal milesPerGallon,
      BigDecimal additionalCostPerMile,
      BigDecimal truckPaymentMonthly,
      BigDecimal insuranceMonthly,
      BigDecimal permitsMonthly,
      int annualMiles,
      BigDecimal weeklyIncomeGoal,
      int weeksWorkedPerYear) {
    return new CarrierCostProfile(
        java.util.UUID.randomUUID().toString(),
        tenantId,
        truckerId,
        null, null,
        milesPerGallon,
        null, null, null,
        dieselRegion,
        additionalCostPerMile,
        truckPaymentMonthly,
        insuranceMonthly,
        permitsMonthly,
        annualMiles,
        weeklyIncomeGoal,
        weeksWorkedPerYear,
        OffsetDateTime.now(ZoneOffset.UTC),
        OffsetDateTime.now(ZoneOffset.UTC),
        null);
  }

  // Legacy formulas (US-702) — null-safe so a wizard-only profile returns ZERO instead of NPE
  public BigDecimal calculateFixedCPM() {
    if (monthlyMilesTarget == null || monthlyMilesTarget == 0 || monthlyFixedCosts == null) {
      return BigDecimal.ZERO;
    }
    return monthlyFixedCosts.divide(new BigDecimal(monthlyMilesTarget), 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateFuelCPM() {
    if (milesPerGallon == null || milesPerGallon.compareTo(BigDecimal.ZERO) == 0 || fuelCostPerGallon == null) {
      return BigDecimal.ZERO;
    }
    return fuelCostPerGallon.divide(milesPerGallon, 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateVariableCPM() {
    BigDecimal maintenance = maintenanceCostPerMile != null ? maintenanceCostPerMile : BigDecimal.ZERO;
    return calculateFuelCPM().add(maintenance);
  }

  public BigDecimal calculateTotalCPM() {
    return calculateFixedCPM().add(calculateVariableCPM());
  }

  public BigDecimal calculateMinimumRPM() {
    BigDecimal margin = targetMarginPerMile != null ? targetMarginPerMile : BigDecimal.ZERO;
    return calculateTotalCPM().add(margin);
  }

  // Wizard formulas (US-730a-v2) — diesel price is passed in by the application
  // layer (fetched from EiaFuelPriceService); domain stays framework-free.
  public BigDecimal calculateFuelCPM(BigDecimal dieselPricePerGallon) {
    if (milesPerGallon == null || milesPerGallon.compareTo(BigDecimal.ZERO) == 0) {
      return BigDecimal.ZERO;
    }
    return dieselPricePerGallon.divide(milesPerGallon, 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateVariableCPM(BigDecimal dieselPricePerGallon) {
    BigDecimal additional = additionalCostPerMile != null ? additionalCostPerMile : BigDecimal.ZERO;
    return calculateFuelCPM(dieselPricePerGallon).add(additional);
  }

  public BigDecimal calculateAnnualFixedCPM() {
    if (annualMiles == null || annualMiles == 0) {
      return BigDecimal.ZERO;
    }
    BigDecimal monthly =
        nz(truckPaymentMonthly).add(nz(insuranceMonthly)).add(nz(permitsMonthly));
    return monthly
        .multiply(BigDecimal.valueOf(12))
        .divide(new BigDecimal(annualMiles), 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateAnnualMarginCPM() {
    if (annualMiles == null || annualMiles == 0 || weeklyIncomeGoal == null || weeksWorkedPerYear == null) {
      return BigDecimal.ZERO;
    }
    BigDecimal annualGoal = weeklyIncomeGoal.multiply(BigDecimal.valueOf(weeksWorkedPerYear));
    return annualGoal.divide(new BigDecimal(annualMiles), 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateBreakevenRPM(BigDecimal dieselPricePerGallon) {
    return calculateVariableCPM(dieselPricePerGallon).add(calculateAnnualFixedCPM());
  }

  public BigDecimal calculateMinimumRPM(BigDecimal dieselPricePerGallon) {
    return calculateBreakevenRPM(dieselPricePerGallon).add(calculateAnnualMarginCPM());
  }

  public BigDecimal calculateTargetRPM(BigDecimal dieselPricePerGallon) {
    return calculateMinimumRPM(dieselPricePerGallon).multiply(new BigDecimal("1.2"));
  }

  public boolean hasWizardFields() {
    return dieselRegion != null;
  }

  private static BigDecimal nz(BigDecimal value) {
    return value != null ? value : BigDecimal.ZERO;
  }

  public void update(
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile) {
    this.monthlyFixedCosts = monthlyFixedCosts;
    this.fuelCostPerGallon = fuelCostPerGallon;
    this.milesPerGallon = milesPerGallon;
    this.maintenanceCostPerMile = maintenanceCostPerMile;
    this.monthlyMilesTarget = monthlyMilesTarget;
    this.targetMarginPerMile = targetMarginPerMile;
    this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  public void updateWizardFields(
      String dieselRegion,
      BigDecimal milesPerGallon,
      BigDecimal additionalCostPerMile,
      BigDecimal truckPaymentMonthly,
      BigDecimal insuranceMonthly,
      BigDecimal permitsMonthly,
      int annualMiles,
      BigDecimal weeklyIncomeGoal,
      int weeksWorkedPerYear) {
    this.dieselRegion = dieselRegion;
    this.milesPerGallon = milesPerGallon;
    this.additionalCostPerMile = additionalCostPerMile;
    this.truckPaymentMonthly = truckPaymentMonthly;
    this.insuranceMonthly = insuranceMonthly;
    this.permitsMonthly = permitsMonthly;
    this.annualMiles = annualMiles;
    this.weeklyIncomeGoal = weeklyIncomeGoal;
    this.weeksWorkedPerYear = weeksWorkedPerYear;
    this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  public void softDelete() {
    this.deletedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  // Getters
  public String getId() { return id; }
  public String getTenantId() { return tenantId; }
  public String getTruckerId() { return truckerId; }
  public BigDecimal getMonthlyFixedCosts() { return monthlyFixedCosts; }
  public BigDecimal getFuelCostPerGallon() { return fuelCostPerGallon; }
  public BigDecimal getMilesPerGallon() { return milesPerGallon; }
  public BigDecimal getMaintenanceCostPerMile() { return maintenanceCostPerMile; }
  public Integer getMonthlyMilesTarget() { return monthlyMilesTarget; }
  public BigDecimal getTargetMarginPerMile() { return targetMarginPerMile; }
  public String getDieselRegion() { return dieselRegion; }
  public BigDecimal getAdditionalCostPerMile() { return additionalCostPerMile; }
  public BigDecimal getTruckPaymentMonthly() { return truckPaymentMonthly; }
  public BigDecimal getInsuranceMonthly() { return insuranceMonthly; }
  public BigDecimal getPermitsMonthly() { return permitsMonthly; }
  public Integer getAnnualMiles() { return annualMiles; }
  public BigDecimal getWeeklyIncomeGoal() { return weeklyIncomeGoal; }
  public Integer getWeeksWorkedPerYear() { return weeksWorkedPerYear; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public OffsetDateTime getDeletedAt() { return deletedAt; }
}
```

- [ ] **Step 4: Rewrite `CarrierCostProfileEntity.java`**

```java
package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "carrier_cost_profiles")
public class CarrierCostProfileEntity {

  @Id private String id;
  @Column(nullable = false) private String tenantId;
  @Column(nullable = false) private String truckerId;

  private BigDecimal monthlyFixedCosts;
  private BigDecimal fuelCostPerGallon;
  @Column(nullable = false) private BigDecimal milesPerGallon;
  private BigDecimal maintenanceCostPerMile;
  private Integer monthlyMilesTarget;
  private BigDecimal targetMarginPerMile;

  private String dieselRegion;
  private BigDecimal additionalCostPerMile;
  private BigDecimal truckPaymentMonthly;
  private BigDecimal insuranceMonthly;
  private BigDecimal permitsMonthly;
  private Integer annualMiles;
  private BigDecimal weeklyIncomeGoal;
  private Integer weeksWorkedPerYear;

  @Column(nullable = false) private OffsetDateTime createdAt;
  @Column(nullable = false) private OffsetDateTime updatedAt;
  private OffsetDateTime deletedAt;

  public CarrierCostProfileEntity() {}

  public CarrierCostProfileEntity(
      String id, String tenantId, String truckerId,
      BigDecimal monthlyFixedCosts, BigDecimal fuelCostPerGallon, BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile, Integer monthlyMilesTarget, BigDecimal targetMarginPerMile,
      String dieselRegion, BigDecimal additionalCostPerMile, BigDecimal truckPaymentMonthly,
      BigDecimal insuranceMonthly, BigDecimal permitsMonthly, Integer annualMiles,
      BigDecimal weeklyIncomeGoal, Integer weeksWorkedPerYear,
      OffsetDateTime createdAt, OffsetDateTime updatedAt, OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.truckerId = truckerId;
    this.monthlyFixedCosts = monthlyFixedCosts;
    this.fuelCostPerGallon = fuelCostPerGallon;
    this.milesPerGallon = milesPerGallon;
    this.maintenanceCostPerMile = maintenanceCostPerMile;
    this.monthlyMilesTarget = monthlyMilesTarget;
    this.targetMarginPerMile = targetMarginPerMile;
    this.dieselRegion = dieselRegion;
    this.additionalCostPerMile = additionalCostPerMile;
    this.truckPaymentMonthly = truckPaymentMonthly;
    this.insuranceMonthly = insuranceMonthly;
    this.permitsMonthly = permitsMonthly;
    this.annualMiles = annualMiles;
    this.weeklyIncomeGoal = weeklyIncomeGoal;
    this.weeksWorkedPerYear = weeksWorkedPerYear;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static CarrierCostProfileEntity fromDomain(CarrierCostProfile d) {
    return new CarrierCostProfileEntity(
        d.getId(), d.getTenantId(), d.getTruckerId(),
        d.getMonthlyFixedCosts(), d.getFuelCostPerGallon(), d.getMilesPerGallon(),
        d.getMaintenanceCostPerMile(), d.getMonthlyMilesTarget(), d.getTargetMarginPerMile(),
        d.getDieselRegion(), d.getAdditionalCostPerMile(), d.getTruckPaymentMonthly(),
        d.getInsuranceMonthly(), d.getPermitsMonthly(), d.getAnnualMiles(),
        d.getWeeklyIncomeGoal(), d.getWeeksWorkedPerYear(),
        d.getCreatedAt(), d.getUpdatedAt(), d.getDeletedAt());
  }

  public CarrierCostProfile toDomain() {
    return new CarrierCostProfile(
        id, tenantId, truckerId,
        monthlyFixedCosts, fuelCostPerGallon, milesPerGallon,
        maintenanceCostPerMile, monthlyMilesTarget, targetMarginPerMile,
        dieselRegion, additionalCostPerMile, truckPaymentMonthly,
        insuranceMonthly, permitsMonthly, annualMiles,
        weeklyIncomeGoal, weeksWorkedPerYear,
        createdAt, updatedAt, deletedAt);
  }

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getTenantId() { return tenantId; }
  public void setTenantId(String tenantId) { this.tenantId = tenantId; }
  public String getTruckerId() { return truckerId; }
  public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
  public BigDecimal getMonthlyFixedCosts() { return monthlyFixedCosts; }
  public void setMonthlyFixedCosts(BigDecimal v) { this.monthlyFixedCosts = v; }
  public BigDecimal getFuelCostPerGallon() { return fuelCostPerGallon; }
  public void setFuelCostPerGallon(BigDecimal v) { this.fuelCostPerGallon = v; }
  public BigDecimal getMilesPerGallon() { return milesPerGallon; }
  public void setMilesPerGallon(BigDecimal v) { this.milesPerGallon = v; }
  public BigDecimal getMaintenanceCostPerMile() { return maintenanceCostPerMile; }
  public void setMaintenanceCostPerMile(BigDecimal v) { this.maintenanceCostPerMile = v; }
  public Integer getMonthlyMilesTarget() { return monthlyMilesTarget; }
  public void setMonthlyMilesTarget(Integer v) { this.monthlyMilesTarget = v; }
  public BigDecimal getTargetMarginPerMile() { return targetMarginPerMile; }
  public void setTargetMarginPerMile(BigDecimal v) { this.targetMarginPerMile = v; }
  public String getDieselRegion() { return dieselRegion; }
  public void setDieselRegion(String v) { this.dieselRegion = v; }
  public BigDecimal getAdditionalCostPerMile() { return additionalCostPerMile; }
  public void setAdditionalCostPerMile(BigDecimal v) { this.additionalCostPerMile = v; }
  public BigDecimal getTruckPaymentMonthly() { return truckPaymentMonthly; }
  public void setTruckPaymentMonthly(BigDecimal v) { this.truckPaymentMonthly = v; }
  public BigDecimal getInsuranceMonthly() { return insuranceMonthly; }
  public void setInsuranceMonthly(BigDecimal v) { this.insuranceMonthly = v; }
  public BigDecimal getPermitsMonthly() { return permitsMonthly; }
  public void setPermitsMonthly(BigDecimal v) { this.permitsMonthly = v; }
  public Integer getAnnualMiles() { return annualMiles; }
  public void setAnnualMiles(Integer v) { this.annualMiles = v; }
  public BigDecimal getWeeklyIncomeGoal() { return weeklyIncomeGoal; }
  public void setWeeklyIncomeGoal(BigDecimal v) { this.weeklyIncomeGoal = v; }
  public Integer getWeeksWorkedPerYear() { return weeksWorkedPerYear; }
  public void setWeeksWorkedPerYear(Integer v) { this.weeksWorkedPerYear = v; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
  public OffsetDateTime getDeletedAt() { return deletedAt; }
  public void setDeletedAt(OffsetDateTime v) { this.deletedAt = v; }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=CarrierCostProfileTest`
Expected: PASS (3 tests).

- [ ] **Step 6: Run the existing service test to confirm no regression**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=CarrierCostProfileServiceTest`
Expected: PASS (legacy `createCostProfile`/`updateCostProfile` calls still compile and pass — `int monthlyMilesTarget` boxing to `Integer` is transparent to existing call sites).

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/freightclub/modules/carrier/domain/CarrierCostProfile.java
git add backend/src/main/java/com/freightclub/modules/carrier/infrastructure/CarrierCostProfileEntity.java
git add backend/src/test/java/com/freightclub/modules/carrier/CarrierCostProfileTest.java
git commit -m "feat(US-730a): add wizard fields + diesel-price-aware RPM formulas to CarrierCostProfile"
```

---

### Task 3: Service Layer — Wizard Upsert + EIA-Aware `calculateMinimumRPM`

**Files:**
- Modify: `backend/src/main/java/com/freightclub/modules/carrier/application/CarrierCostProfileService.java`
- Test: `backend/src/test/java/com/freightclub/modules/carrier/CarrierCostProfileServiceTest.java` (add new tests — do not remove existing ones)

**Interfaces:**
- Consumes: `EiaFuelPriceService.getDieselPrices()` → `DieselPriceResponse` (`backend/src/main/java/com/freightclub/service/EiaFuelPriceService.java`, `backend/src/main/java/com/freightclub/dto/DieselPriceResponse.java` — fields `eastPrice/midwestPrice/southPrice/rockyPrice/westPrice`).
- Produces: `CarrierCostProfileService.upsertWizardProfile(String truckerId, CostProfileWizardInput input)` and updated `.calculateMinimumRPM(String truckerId)` (now diesel-region-aware when `hasWizardFields()`). Consumed by Task 4 (controller) and unchanged by `LoadService` (still calls `calculateMinimumRPM(truckerId)`).

- [ ] **Step 1: Write the failing service test (append to existing file)**

Add to `backend/src/test/java/com/freightclub/modules/carrier/CarrierCostProfileServiceTest.java` (keep all existing tests, add these new ones + new imports `com.freightclub.modules.carrier.application.CostProfileWizardInput`, `com.freightclub.service.EiaFuelPriceService`, `com.freightclub.dto.DieselPriceResponse`, `org.springframework.boot.test.mock.mockito.MockBean`):

```java
  @org.springframework.boot.test.mock.mockito.MockBean
  private com.freightclub.service.EiaFuelPriceService eiaFuelPriceService;

  @Test
  void testUpsertWizardProfile_createsNewProfile_andRpmUsesEiaPrice() {
    org.mockito.Mockito.when(eiaFuelPriceService.getDieselPrices())
        .thenReturn(new com.freightclub.dto.DieselPriceResponse(
            null, null, // east
            new BigDecimal("3.90"), null, // midwest
            null, null, null, null, null, null, // south, rocky, west
            "2026-07-01", false, true));

    var input = new com.freightclub.modules.carrier.application.CostProfileWizardInput(
        "MIDWEST", new BigDecimal("6.5"), new BigDecimal("0.08"),
        new BigDecimal("1200"), new BigDecimal("600"), new BigDecimal("150"),
        120000, new BigDecimal("2000"), 48);

    CarrierCostProfile profile = service.upsertWizardProfile(TRUCKER_ID, input);

    assertThat(profile.hasWizardFields()).isTrue();
    BigDecimal minRpm = service.calculateMinimumRPM(TRUCKER_ID);
    // fuelCpm=3.90/6.5=0.6, varCpm=0.68, fixedCpm=0.195, marginCpm=0.8 -> minRpm=1.675
    assertThat(minRpm).isEqualByComparingTo("1.6750");
  }

  @Test
  void testUpsertWizardProfile_updatesExistingProfile() {
    org.mockito.Mockito.when(eiaFuelPriceService.getDieselPrices())
        .thenReturn(new com.freightclub.dto.DieselPriceResponse(
            null, null, new BigDecimal("3.90"), null,
            null, null, null, null, null, null,
            "2026-07-01", false, true));

    var firstInput = new com.freightclub.modules.carrier.application.CostProfileWizardInput(
        "MIDWEST", new BigDecimal("6.5"), new BigDecimal("0.08"),
        new BigDecimal("1200"), new BigDecimal("600"), new BigDecimal("150"),
        120000, new BigDecimal("2000"), 48);
    service.upsertWizardProfile(TRUCKER_ID, firstInput);

    var secondInput = new com.freightclub.modules.carrier.application.CostProfileWizardInput(
        "MIDWEST", new BigDecimal("7.0"), new BigDecimal("0.08"),
        new BigDecimal("1200"), new BigDecimal("600"), new BigDecimal("150"),
        120000, new BigDecimal("2000"), 48);
    CarrierCostProfile updated = service.upsertWizardProfile(TRUCKER_ID, secondInput);

    assertThat(updated.getMilesPerGallon()).isEqualByComparingTo("7.0");
  }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=CarrierCostProfileServiceTest`
Expected: FAIL — compile error, `CostProfileWizardInput` and `upsertWizardProfile` do not exist yet.

- [ ] **Step 3: Create the input record**

Create `backend/src/main/java/com/freightclub/modules/carrier/application/CostProfileWizardInput.java`:

```java
package com.freightclub.modules.carrier.application;

import java.math.BigDecimal;

public record CostProfileWizardInput(
    String dieselRegion,
    BigDecimal milesPerGallon,
    BigDecimal additionalCostPerMile,
    BigDecimal truckPaymentMonthly,
    BigDecimal insuranceMonthly,
    BigDecimal permitsMonthly,
    int annualMiles,
    BigDecimal weeklyIncomeGoal,
    int weeksWorkedPerYear) {}
```

- [ ] **Step 4: Update `CarrierCostProfileService.java`**

```java
package com.freightclub.modules.carrier.application;

import com.freightclub.dto.DieselPriceResponse;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileEntity;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.EiaFuelPriceService;
import java.math.BigDecimal;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class CarrierCostProfileService {

  private final CarrierCostProfileRepository repository;
  private final EiaFuelPriceService eiaFuelPriceService;

  public CarrierCostProfileService(
      CarrierCostProfileRepository repository, EiaFuelPriceService eiaFuelPriceService) {
    this.repository = repository;
    this.eiaFuelPriceService = eiaFuelPriceService;
  }

  @Cacheable(value = "carrierCostProfile", key = "#truckerId", unless = "#result == null")
  public CarrierCostProfile getCostProfile(String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    CarrierCostProfileEntity entity =
        repository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);
    return entity != null ? entity.toDomain() : null;
  }

  @CacheEvict(value = "carrierCostProfile", key = "#truckerId")
  public CarrierCostProfile createCostProfile(
      String truckerId,
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile) {
    String tenantId = TenantContextHolder.getTenantId();
    CarrierCostProfile domain =
        CarrierCostProfile.createNew(
            tenantId, truckerId, monthlyFixedCosts, fuelCostPerGallon,
            milesPerGallon, maintenanceCostPerMile, monthlyMilesTarget, targetMarginPerMile);
    repository.save(CarrierCostProfileEntity.fromDomain(domain));
    return domain;
  }

  @CacheEvict(value = "carrierCostProfile", key = "#truckerId")
  public CarrierCostProfile updateCostProfile(
      String truckerId,
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile) {
    String tenantId = TenantContextHolder.getTenantId();
    CarrierCostProfileEntity entity =
        repository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);
    if (entity == null) {
      throw new CarrierCostProfileNotFoundException(
          String.format("Cost profile not found for trucker %s", truckerId));
    }
    CarrierCostProfile domain = entity.toDomain();
    domain.update(
        monthlyFixedCosts, fuelCostPerGallon, milesPerGallon,
        maintenanceCostPerMile, monthlyMilesTarget, targetMarginPerMile);
    repository.save(CarrierCostProfileEntity.fromDomain(domain));
    return domain;
  }

  // US-730a-v2: create-or-update the wizard-model profile (idempotent upsert).
  @CacheEvict(value = "carrierCostProfile", key = "#truckerId")
  public CarrierCostProfile upsertWizardProfile(String truckerId, CostProfileWizardInput input) {
    String tenantId = TenantContextHolder.getTenantId();
    CarrierCostProfileEntity existing =
        repository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);

    CarrierCostProfile domain;
    if (existing == null) {
      domain =
          CarrierCostProfile.createNewWizard(
              tenantId, truckerId, input.dieselRegion(), input.milesPerGallon(),
              input.additionalCostPerMile(), input.truckPaymentMonthly(),
              input.insuranceMonthly(), input.permitsMonthly(), input.annualMiles(),
              input.weeklyIncomeGoal(), input.weeksWorkedPerYear());
    } else {
      domain = existing.toDomain();
      domain.updateWizardFields(
          input.dieselRegion(), input.milesPerGallon(), input.additionalCostPerMile(),
          input.truckPaymentMonthly(), input.insuranceMonthly(), input.permitsMonthly(),
          input.annualMiles(), input.weeklyIncomeGoal(), input.weeksWorkedPerYear());
    }
    repository.save(CarrierCostProfileEntity.fromDomain(domain));
    return domain;
  }

  // US-730a-v2: resolves the live diesel price for a profile's region.
  public BigDecimal resolveDieselPrice(CarrierCostProfile profile) {
    DieselPriceResponse prices = eiaFuelPriceService.getDieselPrices();
    Double price =
        switch (profile.getDieselRegion()) {
          case "EAST" -> prices.eastPrice();
          case "MIDWEST" -> prices.midwestPrice();
          case "SOUTH" -> prices.southPrice();
          case "ROCKY" -> prices.rockyPrice();
          case "WEST" -> prices.westPrice();
          default -> null;
        };
    return price != null ? BigDecimal.valueOf(price) : BigDecimal.ZERO;
  }

  // US-705 / US-730a-v2: LoadService calls this unchanged; internally now prefers
  // the diesel-region-aware wizard formula when the profile has wizard fields.
  public BigDecimal calculateMinimumRPM(String truckerId) {
    CarrierCostProfile profile = getCostProfile(truckerId);
    if (profile == null) {
      return BigDecimal.ZERO;
    }
    if (profile.hasWizardFields()) {
      return profile.calculateMinimumRPM(resolveDieselPrice(profile));
    }
    return profile.calculateMinimumRPM();
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=CarrierCostProfileServiceTest`
Expected: PASS — all existing + new tests green.

- [ ] **Step 6: Full backend test suite + coverage check**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" clean verify`
Expected: BUILD SUCCESS, JaCoCo branch coverage ≥80%.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/freightclub/modules/carrier/application/CostProfileWizardInput.java
git add backend/src/main/java/com/freightclub/modules/carrier/application/CarrierCostProfileService.java
git add backend/src/test/java/com/freightclub/modules/carrier/CarrierCostProfileServiceTest.java
git commit -m "feat(US-730a): wire CarrierCostProfileService to EiaFuelPriceService for wizard RPM"
```

---

### Task 4: DTOs + Controller + Integration Test

**Files:**
- Create: `backend/src/main/java/com/freightclub/modules/carrier/application/CostProfileResponse.java`
- Create: `backend/src/main/java/com/freightclub/modules/carrier/presentation/CarrierCostProfileController.java`
- Test: `backend/src/test/java/com/freightclub/modules/carrier/presentation/CarrierCostProfileControllerTest.java`

**Interfaces:**
- Consumes: `CarrierCostProfileService.getCostProfile/upsertWizardProfile/resolveDieselPrice` (Task 3).
- Produces: `GET /api/v1/carrier/cost-profile` → `200 CostProfileResponse` or `200` with `null` body (no profile yet). `PUT /api/v1/carrier/cost-profile` (body: `CostProfileWizardInput`-shaped JSON) → `200 CostProfileResponse`. Consumed by Task 5 (frontend `api.ts`).

- [ ] **Step 1: Write the failing controller test**

```java
package com.freightclub.modules.carrier.presentation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.DieselPriceResponse;
import com.freightclub.modules.carrier.application.CarrierCostProfileService;
import com.freightclub.modules.carrier.application.CostProfileWizardInput;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

// Feature: US-730a-v2 (Cost Profile Wizard Redesign)
// AC: GET returns null body when no profile exists (triggers wizard on frontend)
// AC: PUT upserts and returns derived RPM values
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CarrierCostProfileControllerTest {

  @Autowired private MockMvc mvc;
  @Autowired private ObjectMapper objectMapper;
  @MockBean private CarrierCostProfileService service;

  @BeforeEach
  void setTenantContext() {
    TenantContextHolder.setTenantId("tenant-1");
  }

  @AfterEach
  void clearTenantContext() {
    TenantContextHolder.clear();
  }

  @Test
  @WithMockUser(username = "trucker-1", roles = "TRUCKER")
  void getCostProfile_noProfile_returnsNullBody() throws Exception {
    when(service.getCostProfile("trucker-1")).thenReturn(null);

    mvc.perform(get("/api/v1/carrier/cost-profile"))
        .andExpect(status().isOk())
        .andExpect(result -> org.junit.jupiter.api.Assertions.assertEquals(
            "", result.getResponse().getContentAsString().replace("null", "")));
  }

  @Test
  @WithMockUser(username = "trucker-1", roles = "TRUCKER")
  void putCostProfile_upsertsAndReturnsDerivedValues() throws Exception {
    CarrierCostProfile saved =
        CarrierCostProfile.createNewWizard(
            "tenant-1", "trucker-1", "MIDWEST", new BigDecimal("6.5"),
            new BigDecimal("0.08"), new BigDecimal("1200"), new BigDecimal("600"),
            new BigDecimal("150"), 120000, new BigDecimal("2000"), 48);

    when(service.upsertWizardProfile(eq("trucker-1"), any(CostProfileWizardInput.class)))
        .thenReturn(saved);
    when(service.resolveDieselPrice(saved)).thenReturn(new BigDecimal("3.90"));

    String body =
        """
        {
          "dieselRegion": "MIDWEST",
          "milesPerGallon": 6.5,
          "additionalCostPerMile": 0.08,
          "truckPaymentMonthly": 1200,
          "insuranceMonthly": 600,
          "permitsMonthly": 150,
          "annualMiles": 120000,
          "weeklyIncomeGoal": 2000,
          "weeksWorkedPerYear": 48
        }
        """;

    mvc.perform(put("/api/v1/carrier/cost-profile")
            .contentType("application/json")
            .content(body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.dieselRegion").value("MIDWEST"))
        .andExpect(jsonPath("$.minRpm").value(1.675));
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=CarrierCostProfileControllerTest`
Expected: FAIL — `CarrierCostProfileController` / `CostProfileResponse` do not exist yet.

- [ ] **Step 3: Create `CostProfileResponse.java`**

```java
package com.freightclub.modules.carrier.application;

import java.math.BigDecimal;

public record CostProfileResponse(
    String dieselRegion,
    BigDecimal milesPerGallon,
    BigDecimal additionalCostPerMile,
    BigDecimal truckPaymentMonthly,
    BigDecimal insuranceMonthly,
    BigDecimal permitsMonthly,
    Integer annualMiles,
    BigDecimal weeklyIncomeGoal,
    Integer weeksWorkedPerYear,
    BigDecimal fuelCpm,
    BigDecimal variableCpm,
    BigDecimal fixedCpm,
    BigDecimal marginCpm,
    BigDecimal breakevenRpm,
    BigDecimal minRpm,
    BigDecimal targetRpm) {

  public static CostProfileResponse from(
      com.freightclub.modules.carrier.domain.CarrierCostProfile profile, BigDecimal dieselPrice) {
    return new CostProfileResponse(
        profile.getDieselRegion(),
        profile.getMilesPerGallon(),
        profile.getAdditionalCostPerMile(),
        profile.getTruckPaymentMonthly(),
        profile.getInsuranceMonthly(),
        profile.getPermitsMonthly(),
        profile.getAnnualMiles(),
        profile.getWeeklyIncomeGoal(),
        profile.getWeeksWorkedPerYear(),
        profile.calculateFuelCPM(dieselPrice),
        profile.calculateVariableCPM(dieselPrice),
        profile.calculateAnnualFixedCPM(),
        profile.calculateAnnualMarginCPM(),
        profile.calculateBreakevenRPM(dieselPrice),
        profile.calculateMinimumRPM(dieselPrice),
        profile.calculateTargetRPM(dieselPrice));
  }
}
```

- [ ] **Step 4: Create `CarrierCostProfileController.java`**

```java
package com.freightclub.modules.carrier.presentation;

import com.freightclub.modules.carrier.application.CarrierCostProfileService;
import com.freightclub.modules.carrier.application.CostProfileResponse;
import com.freightclub.modules.carrier.application.CostProfileWizardInput;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

// US-730a-v2 (CHG-US730-007): dedicated /carrier/cost-profile endpoint,
// standardizes on CarrierCostProfileEntity so LoadService's RPM coloring
// and this wizard read/write the same data.
@RestController
@RequestMapping("/api/v1/carrier/cost-profile")
@PreAuthorize("hasRole('TRUCKER')")
public class CarrierCostProfileController {

  private final CarrierCostProfileService service;

  public CarrierCostProfileController(CarrierCostProfileService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<CostProfileResponse> getCostProfile(@AuthenticationPrincipal String truckerId) {
    CarrierCostProfile profile = service.getCostProfile(truckerId);
    if (profile == null) {
      return ResponseEntity.ok(null);
    }
    BigDecimal dieselPrice = service.resolveDieselPrice(profile);
    return ResponseEntity.ok(CostProfileResponse.from(profile, dieselPrice));
  }

  @PutMapping
  public ResponseEntity<CostProfileResponse> upsertCostProfile(
      @AuthenticationPrincipal String truckerId, @RequestBody CostProfileWizardInput request) {
    CarrierCostProfile profile = service.upsertWizardProfile(truckerId, request);
    BigDecimal dieselPrice = service.resolveDieselPrice(profile);
    return ResponseEntity.ok(CostProfileResponse.from(profile, dieselPrice));
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" test -Dtest=CarrierCostProfileControllerTest`
Expected: PASS (2 tests).

- [ ] **Step 6: Full backend verify**

Run: `cd backend && & "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" clean verify`
Expected: BUILD SUCCESS, JaCoCo ≥80%.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/freightclub/modules/carrier/application/CostProfileResponse.java
git add backend/src/main/java/com/freightclub/modules/carrier/presentation/CarrierCostProfileController.java
git add backend/src/test/java/com/freightclub/modules/carrier/presentation/CarrierCostProfileControllerTest.java
git commit -m "feat(US-730a): add GET/PUT /api/v1/carrier/cost-profile controller"
```

---

### Task 5: Frontend — Types, Schema, API, Hooks

**Files:**
- Create: `frontend/src/features/carrier/schemas/costProfile.schemas.ts`
- Create: `frontend/src/features/carrier/costProfileApi.ts`
- Create: `frontend/src/features/carrier/hooks/useCostProfile.ts`
- Test: `frontend/src/features/carrier/hooks/__tests__/useCostProfile.test.tsx`

**Interfaces:**
- Consumes: `apiGet`/`apiPut` from `@/lib/apiClient` (no `/api/v1/` prefix).
- Produces: `useCostProfile()` (React Query `useQuery`, key `['cost-profile']`), `useSaveCostProfile()` (React Query `useMutation`, invalidates `['cost-profile']` and `['loads']`). Consumed by Task 6/7 components.

- [ ] **Step 1: Write the failing hook test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCostProfile } from '../useCostProfile'
import { costProfileApi } from '../../costProfileApi'

vi.mock('../../costProfileApi')

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useCostProfile', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns null data when no profile exists yet', async () => {
    vi.mocked(costProfileApi.get).mockResolvedValue(null)
    const { result } = renderHook(() => useCostProfile(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
  })

  it('returns profile data when a profile exists', async () => {
    vi.mocked(costProfileApi.get).mockResolvedValue({
      dieselRegion: 'MIDWEST', milesPerGallon: 6.5, additionalCostPerMile: 0.08,
      truckPaymentMonthly: 1200, insuranceMonthly: 600, permitsMonthly: 150,
      annualMiles: 120000, weeklyIncomeGoal: 2000, weeksWorkedPerYear: 48,
      fuelCpm: 0.6, variableCpm: 0.68, fixedCpm: 0.195, marginCpm: 0.8,
      breakevenRpm: 0.875, minRpm: 1.675, targetRpm: 2.01,
    })
    const { result } = renderHook(() => useCostProfile(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.minRpm).toBe(1.675)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- useCostProfile`
Expected: FAIL — `costProfileApi`, `useCostProfile` do not exist yet.

- [ ] **Step 3: Create the Zod schema**

```ts
// frontend/src/features/carrier/schemas/costProfile.schemas.ts
import { z } from 'zod'

export const DieselRegionEnum = z.enum(['EAST', 'MIDWEST', 'SOUTH', 'ROCKY', 'WEST'])
export const WeeksWorkedEnum = z.enum(['44', '46', '48', '50', '52'])

export const costProfileWizardSchema = z.object({
  dieselRegion: DieselRegionEnum,
  milesPerGallon: z.number().min(1, 'MPG must be positive'),
  additionalCostPerMile: z.number().min(0, 'Must be 0 or more'),
  truckPaymentMonthly: z.number().min(0, 'Must be 0 or more'),
  insuranceMonthly: z.number().min(0, 'Must be 0 or more'),
  permitsMonthly: z.number().min(0, 'Must be 0 or more'),
  annualMiles: z.number().min(1, 'Annual miles must be positive'),
  weeklyIncomeGoal: z.number().min(0, 'Must be 0 or more'),
  weeksWorkedPerYear: z.number().min(1).max(52),
})

export type CostProfileWizardFormData = z.infer<typeof costProfileWizardSchema>

export interface CostProfileResponseDTO extends CostProfileWizardFormData {
  fuelCpm: number
  variableCpm: number
  fixedCpm: number
  marginCpm: number
  breakevenRpm: number
  minRpm: number
  targetRpm: number
}
```

- [ ] **Step 4: Create the API client**

```ts
// frontend/src/features/carrier/costProfileApi.ts
import { apiGet, apiPut } from '@/lib/apiClient'
import type { CostProfileResponseDTO, CostProfileWizardFormData } from './schemas/costProfile.schemas'

export const costProfileApi = {
  get: () => apiGet<CostProfileResponseDTO | null>('/carrier/cost-profile'),
  save: (data: CostProfileWizardFormData) =>
    apiPut<CostProfileResponseDTO>('/carrier/cost-profile', data),
}
```

- [ ] **Step 5: Create the hooks**

```ts
// frontend/src/features/carrier/hooks/useCostProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { costProfileApi } from '../costProfileApi'
import type { CostProfileWizardFormData } from '../schemas/costProfile.schemas'

export function useCostProfile() {
  return useQuery({
    queryKey: ['cost-profile'],
    queryFn: costProfileApi.get,
  })
}

export function useSaveCostProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CostProfileWizardFormData) => costProfileApi.save(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['cost-profile'], data)
      // US-730a-v2 AC: load board RPM badges must refresh after a cost profile save
      queryClient.invalidateQueries({ queryKey: ['loads'] })
    },
  })
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd frontend && npm run test -- useCostProfile`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/carrier/schemas/costProfile.schemas.ts
git add frontend/src/features/carrier/costProfileApi.ts
git add frontend/src/features/carrier/hooks/useCostProfile.ts
git add frontend/src/features/carrier/hooks/__tests__/useCostProfile.test.tsx
git commit -m "feat(US-730a): add cost profile schema, api client, and React Query hooks"
```

---

### Task 6: Frontend — `CostProfileSummary` Component

**Files:**
- Create: `frontend/src/features/carrier/components/costProfile/CostProfileSummary.tsx`
- Test: `frontend/src/features/carrier/components/costProfile/__tests__/CostProfileSummary.test.tsx`

**Interfaces:**
- Consumes: `CostProfileResponseDTO` (Task 5).
- Produces: `<CostProfileSummary profile={...} onEdit={() => void} />`. Consumed by Task 7 (`CostProfilePage`).

- [ ] **Step 1: Write the failing component test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CostProfileSummary } from '../CostProfileSummary'

const profile = {
  dieselRegion: 'MIDWEST' as const, milesPerGallon: 6.5, additionalCostPerMile: 0.08,
  truckPaymentMonthly: 1200, insuranceMonthly: 600, permitsMonthly: 150,
  annualMiles: 120000, weeklyIncomeGoal: 2000, weeksWorkedPerYear: 48,
  fuelCpm: 0.6, variableCpm: 0.68, fixedCpm: 0.195, marginCpm: 0.8,
  breakevenRpm: 0.875, minRpm: 1.675, targetRpm: 2.01,
}

describe('CostProfileSummary', () => {
  it('renders the three KPI tiles with correct values', () => {
    render(<CostProfileSummary profile={profile} onEdit={vi.fn()} />)
    expect(screen.getByTestId('kpi-breakeven-value')).toHaveTextContent('$0.88')
    expect(screen.getByTestId('kpi-min-rpm-value')).toHaveTextContent('$1.68')
    expect(screen.getByTestId('kpi-target-value')).toHaveTextContent('$2.01')
  })

  it('calls onEdit when the Update Cost Profile button is clicked', () => {
    const onEdit = vi.fn()
    render(<CostProfileSummary profile={profile} onEdit={onEdit} />)
    fireEvent.click(screen.getByTestId('update-cost-profile-btn'))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- CostProfileSummary`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the component**

```tsx
// frontend/src/features/carrier/components/costProfile/CostProfileSummary.tsx
import { Button } from '@/components/ui/Button'
import type { CostProfileResponseDTO } from '../../schemas/costProfile.schemas'

interface Props {
  profile: CostProfileResponseDTO
  onEdit: () => void
}

const fmt = (n: number) => `$${n.toFixed(2)}`

export function CostProfileSummary({ profile, onEdit }: Props) {
  return (
    <div data-testid="cost-profile-summary" style={{ background: '#0a0a0a', color: '#F5F5F5', padding: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          data-testid="kpi-breakeven-tile"
          style={{ flex: 1, background: '#121212', border: '1px solid #2A2A2A', borderRadius: 8, padding: 16, textAlign: 'center' }}
        >
          <p style={{ fontSize: 12, textTransform: 'uppercase', color: '#808080' }}>Break-even</p>
          <p data-testid="kpi-breakeven-value" style={{ fontSize: 24, fontWeight: 700, color: '#EF4444' }}>
            {fmt(profile.breakevenRpm)}
          </p>
          <p style={{ fontSize: 12, color: '#636E72' }}>Stay home</p>
        </div>
        <div
          data-testid="kpi-min-rpm-tile"
          style={{ flex: 1, background: '#121212', border: '1px solid #2A2A2A', borderRadius: 8, padding: 16, textAlign: 'center' }}
        >
          <p style={{ fontSize: 12, textTransform: 'uppercase', color: '#808080' }}>Min RPM</p>
          <p data-testid="kpi-min-rpm-value" style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>
            {fmt(profile.minRpm)}
          </p>
          <p style={{ fontSize: 12, color: '#636E72' }}>Bare min</p>
        </div>
        <div
          data-testid="kpi-target-tile"
          style={{ flex: 1, background: '#121212', border: '1px solid #2A2A2A', borderRadius: 8, padding: 16, textAlign: 'center' }}
        >
          <p style={{ fontSize: 12, textTransform: 'uppercase', color: '#808080' }}>Target</p>
          <p data-testid="kpi-target-value" style={{ fontSize: 24, fontWeight: 700, color: '#22C55E' }}>
            {fmt(profile.targetRpm)}
          </p>
          <p style={{ fontSize: 12, color: '#636E72' }}>Run it</p>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        <p>Fuel: <span style={{ fontFamily: 'monospace' }}>${profile.fuelCpm.toFixed(3)}/mi</span> → {profile.milesPerGallon} MPG · {profile.dieselRegion} diesel</p>
        <p>Fixed: <span style={{ fontFamily: 'monospace' }}>${profile.fixedCpm.toFixed(3)}/mi</span> → ${(profile.truckPaymentMonthly + profile.insuranceMonthly + profile.permitsMonthly).toLocaleString()}/mo ÷ {profile.annualMiles.toLocaleString()} mi</p>
        <p>Margin: <span style={{ fontFamily: 'monospace' }}>${profile.marginCpm.toFixed(3)}/mi</span> → ${profile.weeklyIncomeGoal.toLocaleString()}/wk × {profile.weeksWorkedPerYear} wks</p>
      </div>

      <Button
        persona="carrier"
        data-testid="update-cost-profile-btn"
        onClick={onEdit}
        style={{ marginTop: 16, height: 64, width: '100%' }}
      >
        Update Cost Profile
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test -- CostProfileSummary`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/carrier/components/costProfile/CostProfileSummary.tsx
git add frontend/src/features/carrier/components/costProfile/__tests__/CostProfileSummary.test.tsx
git commit -m "feat(US-730a): add CostProfileSummary component with KPI tiles"
```

---

### Task 7: Frontend — `CostProfileWizard`, Page, Route, Nav Update

**Files:**
- Create: `frontend/src/features/carrier/components/costProfile/CostProfileWizard.tsx`
- Create: `frontend/src/pages/CostProfilePage.tsx`
- Test: `frontend/src/features/carrier/components/costProfile/__tests__/CostProfileWizard.test.tsx`
- Modify: `frontend/src/App.tsx` (add route)
- Modify: `frontend/src/pages/TruckerDashboard.tsx:430` (quick-action link)
- Modify: `frontend/src/pages/ProfilePage.tsx` (remove `CostProfileSection` usage for trucker persona)

**Interfaces:**
- Consumes: `useCostProfile`, `useSaveCostProfile` (Task 5), `CostProfileSummary` (Task 6), `costProfileWizardSchema` (Task 5).
- Produces: route `/carrier/cost-profile`, `data-testid="cost-profile-page"` root. Consumed by Task 8 (e2e).

- [ ] **Step 1: Write the failing wizard test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CostProfileWizard } from '../CostProfileWizard'

describe('CostProfileWizard', () => {
  it('walks through all 3 steps and calls onComplete with form data', () => {
    const onComplete = vi.fn()
    render(<CostProfileWizard initialData={undefined} onComplete={onComplete} />)

    // Step 1: Fuel
    expect(screen.getByTestId('wizard-step-1')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('mpg-input'), { target: { value: '6.5' } })
    fireEvent.click(screen.getByTestId('region-chip-MIDWEST'))
    fireEvent.change(screen.getByTestId('additional-cost-input'), { target: { value: '0.08' } })
    fireEvent.click(screen.getByTestId('wizard-next-btn'))

    // Step 2: Fixed Costs
    expect(screen.getByTestId('wizard-step-2')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('truck-payment-input'), { target: { value: '1200' } })
    fireEvent.change(screen.getByTestId('insurance-input'), { target: { value: '600' } })
    fireEvent.change(screen.getByTestId('permits-input'), { target: { value: '150' } })
    fireEvent.change(screen.getByTestId('annual-miles-input'), { target: { value: '120000' } })
    fireEvent.click(screen.getByTestId('wizard-next-btn'))

    // Step 3: Income Goal
    expect(screen.getByTestId('wizard-step-3')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('weekly-goal-input'), { target: { value: '2000' } })
    fireEvent.click(screen.getByTestId('weeks-chip-48'))
    fireEvent.click(screen.getByTestId('wizard-see-rpm-btn'))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      dieselRegion: 'MIDWEST',
      milesPerGallon: 6.5,
      annualMiles: 120000,
      weeklyIncomeGoal: 2000,
      weeksWorkedPerYear: 48,
    }))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- CostProfileWizard`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the wizard component**

```tsx
// frontend/src/features/carrier/components/costProfile/CostProfileWizard.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CostProfileWizardFormData } from '../../schemas/costProfile.schemas'

interface Props {
  initialData: Partial<CostProfileWizardFormData> | undefined
  onComplete: (data: CostProfileWizardFormData) => void
}

const REGIONS = ['EAST', 'MIDWEST', 'SOUTH', 'ROCKY', 'WEST'] as const
const WEEK_OPTIONS = [44, 46, 48, 50, 52]
const inputStyle = { height: 52, fontSize: 16 }
const chipStyle = (active: boolean): React.CSSProperties => ({
  height: 56,
  padding: '0 16px',
  borderRadius: 9999,
  border: active ? '1px solid #7A5F3A' : '1px solid #3A3A3A',
  background: active ? 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)' : 'transparent',
  color: active ? '#FFFFFF' : '#F5F5F5',
})

export function CostProfileWizard({ initialData, onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<CostProfileWizardFormData>>(initialData ?? {})

  const set = <K extends keyof CostProfileWizardFormData>(key: K, value: CostProfileWizardFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  return (
    <div data-testid="cost-profile-wizard" style={{ background: '#0a0a0a', color: '#F5F5F5', padding: 16 }}>
      {step === 1 && (
        <div data-testid="wizard-step-1">
          <h2>Fuel</h2>
          <Input
            testId="mpg-input"
            label="MPG"
            type="number"
            style={inputStyle}
            defaultValue={data.milesPerGallon}
            onChange={(e) => set('milesPerGallon', Number(e.target.value))}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                data-testid={`region-chip-${region}`}
                style={chipStyle(data.dieselRegion === region)}
                onClick={() => set('dieselRegion', region)}
              >
                {region}
              </button>
            ))}
          </div>
          <Input
            testId="additional-cost-input"
            label="Oil, tires, DEF ($/mi)"
            type="number"
            step="0.01"
            style={inputStyle}
            placeholder="Typically $0.06-$0.10/mi"
            defaultValue={data.additionalCostPerMile}
            onChange={(e) => set('additionalCostPerMile', Number(e.target.value))}
          />
          <Button
            persona="carrier"
            data-testid="wizard-next-btn"
            style={{ height: 64, width: '100%', marginTop: 16 }}
            onClick={() => setStep(2)}
          >
            Next — Fixed Costs →
          </Button>
        </div>
      )}

      {step === 2 && (
        <div data-testid="wizard-step-2">
          <h2>Fixed Costs</h2>
          <Input testId="truck-payment-input" label="Truck payment ($/mo)" type="number" style={inputStyle}
            placeholder="$0 if paid off" defaultValue={data.truckPaymentMonthly}
            onChange={(e) => set('truckPaymentMonthly', Number(e.target.value))} />
          <Input testId="insurance-input" label="Insurance ($/mo)" type="number" style={inputStyle}
            placeholder="$400-$900/mo for new authority" defaultValue={data.insuranceMonthly}
            onChange={(e) => set('insuranceMonthly', Number(e.target.value))} />
          <Input testId="permits-input" label="Permits ($/mo)" type="number" style={inputStyle}
            placeholder="IFTA, UCR, base plate ~$150" defaultValue={data.permitsMonthly}
            onChange={(e) => set('permitsMonthly', Number(e.target.value))} />
          <Input testId="annual-miles-input" label="Annual miles" type="number" style={inputStyle}
            placeholder="100,000-130,000 mi/year typical" defaultValue={data.annualMiles}
            onChange={(e) => set('annualMiles', Number(e.target.value))} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="ghost" persona="carrier" data-testid="wizard-back-btn" style={{ height: 64, flex: 1 }} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button persona="carrier" data-testid="wizard-next-btn" style={{ height: 64, flex: 1 }} onClick={() => setStep(3)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div data-testid="wizard-step-3">
          <h2>Income Goal</h2>
          <Input testId="weekly-goal-input" label="Weekly take-home goal ($)" type="number" style={inputStyle}
            defaultValue={data.weeklyIncomeGoal}
            onChange={(e) => set('weeklyIncomeGoal', Number(e.target.value))} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {WEEK_OPTIONS.map((weeks) => (
              <button
                key={weeks}
                type="button"
                data-testid={`weeks-chip-${weeks}`}
                style={chipStyle(data.weeksWorkedPerYear === weeks)}
                onClick={() => set('weeksWorkedPerYear', weeks)}
              >
                {weeks}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="ghost" persona="carrier" data-testid="wizard-back-btn" style={{ height: 64, flex: 1 }} onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              persona="carrier"
              data-testid="wizard-see-rpm-btn"
              style={{ height: 64, flex: 1 }}
              onClick={() => onComplete(data as CostProfileWizardFormData)}
            >
              See My RPM →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test -- CostProfileWizard`
Expected: PASS (1 test).

- [ ] **Step 5: Write `CostProfilePage.tsx`**

```tsx
// frontend/src/pages/CostProfilePage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCostProfile, useSaveCostProfile } from '@/features/carrier/hooks/useCostProfile'
import { CostProfileSummary } from '@/features/carrier/components/costProfile/CostProfileSummary'
import { CostProfileWizard } from '@/features/carrier/components/costProfile/CostProfileWizard'
import type { CostProfileWizardFormData } from '@/features/carrier/schemas/costProfile.schemas'

export function CostProfilePage() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useCostProfile()
  const { mutate: save, isPending } = useSaveCostProfile()
  const [view, setView] = useState<'summary' | 'wizard'>('wizard')

  useEffect(() => {
    if (!isLoading) {
      setView(profile ? 'summary' : 'wizard')
    }
  }, [isLoading, profile])

  if (isLoading) {
    return <div data-testid="cost-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh' }} />
  }

  return (
    <div data-testid="cost-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh', color: '#F5F5F5' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #2A2A2A' }}>
        <button data-testid="header-logo-btn" onClick={() => navigate('/dashboard/trucker')} style={{ background: 'none', border: 'none', color: '#B08D57', fontWeight: 700 }}>
          FreightClub
        </button>
        <span>Cost Profile</span>
        <button
          data-testid="header-save-btn"
          disabled={isPending}
          onClick={() => view === 'wizard' && save(undefined as unknown as CostProfileWizardFormData)}
          style={{ background: 'none', border: 'none', color: '#B08D57', fontWeight: 700 }}
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </header>

      {view === 'summary' && profile && (
        <CostProfileSummary profile={profile} onEdit={() => setView('wizard')} />
      )}
      {view === 'wizard' && (
        <CostProfileWizard
          initialData={profile ?? undefined}
          onComplete={(formData) => save(formData, { onSuccess: () => setView('summary') })}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Register the route in `App.tsx`**

Add lazy import near line 20 (after `ProfilePage`):
```tsx
const CostProfilePage = lazy(() => import('@/pages/CostProfilePage').then(m => ({ default: m.CostProfilePage })))
```

Add route after the `/profile` route (around line 168):
```tsx
      <Route
        path="/carrier/cost-profile"
        element={
          <ProtectedRoute role="TRUCKER">
            <Suspense fallback={<PageLoader />}>
              <CostProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
```

- [ ] **Step 7: Update the dashboard quick-action link**

In `frontend/src/pages/TruckerDashboard.tsx:430`, change:
```tsx
    { icon: '⚙', label: 'Cost Profile', sub: 'Set CPM, fuel & maintenance costs', to: '/profile' },
```
to:
```tsx
    { icon: '⚙', label: 'Cost Profile', sub: 'Set CPM, fuel & maintenance costs', to: '/carrier/cost-profile' },
```

- [ ] **Step 8: Retire the old `CostProfileSection` from `ProfilePage.tsx`**

Remove the import (`frontend/src/pages/ProfilePage.tsx:18`):
```tsx
import { CostProfileSection } from '@/features/carrier/components/profile/CostProfileSection'
```
Remove the usage (`frontend/src/pages/ProfilePage.tsx:208`):
```tsx
        {isTrucker && <CostProfileSection register={register} control={control} />}
```
Do NOT delete `CostProfileSection.tsx`, `UpdateProfileValues` fields, or the backend `User`-entity cost columns in this task — that cleanup is explicitly deferred (see CHG-US730-007 note in `.claude/learnings.md`).

- [ ] **Step 9: Run frontend unit tests**

Run: `cd frontend && npm run test`
Expected: all tests pass, including `ProfilePage` tests (verify no test asserts on the removed `CostProfileSection` — if one does, update that assertion to remove the cost-profile-specific expectations, not the whole test file).

- [ ] **Step 10: Commit**

```bash
git add frontend/src/features/carrier/components/costProfile/
git add frontend/src/pages/CostProfilePage.tsx
git add frontend/src/App.tsx
git add frontend/src/pages/TruckerDashboard.tsx
git add frontend/src/pages/ProfilePage.tsx
git commit -m "feat(US-730a): add /carrier/cost-profile route, wizard+summary wiring, retire old section"
```

---

### Task 8: E2E Playwright Test + Evidence

**Files:**
- Create: `frontend/e2e/page-objects/CostProfilePageObject.ts`
- Create: `frontend/e2e/us-730a-v2-cost-profile-wizard.spec.ts`

**Interfaces:**
- Consumes: `data-testid`s from Tasks 6/7 (`cost-profile-page`, `wizard-step-1/2/3`, `mpg-input`, `region-chip-MIDWEST`, `additional-cost-input`, `wizard-next-btn`, `truck-payment-input`, `insurance-input`, `permits-input`, `annual-miles-input`, `weekly-goal-input`, `weeks-chip-48`, `wizard-see-rpm-btn`, `kpi-breakeven-value`, `kpi-min-rpm-value`, `kpi-target-value`, `update-cost-profile-btn`).
- Produces: passing golden-path spec + screenshot evidence in `frontend/test-results/evidence/`.

- [ ] **Step 1: Write the page object**

```ts
// frontend/e2e/page-objects/CostProfilePageObject.ts
import { Page, Locator, expect } from '@playwright/test'

export class CostProfilePageObject {
  readonly page: Page
  readonly root: Locator
  readonly mpgInput: Locator
  readonly additionalCostInput: Locator
  readonly nextBtn: Locator
  readonly truckPaymentInput: Locator
  readonly insuranceInput: Locator
  readonly permitsInput: Locator
  readonly annualMilesInput: Locator
  readonly weeklyGoalInput: Locator
  readonly seeRpmBtn: Locator
  readonly minRpmValue: Locator
  readonly targetValue: Locator
  readonly breakevenValue: Locator

  constructor(page: Page) {
    this.page = page
    this.root = page.locator('[data-testid="cost-profile-page"]')
    this.mpgInput = page.locator('[data-testid="mpg-input"]')
    this.additionalCostInput = page.locator('[data-testid="additional-cost-input"]')
    this.nextBtn = page.locator('[data-testid="wizard-next-btn"]')
    this.truckPaymentInput = page.locator('[data-testid="truck-payment-input"]')
    this.insuranceInput = page.locator('[data-testid="insurance-input"]')
    this.permitsInput = page.locator('[data-testid="permits-input"]')
    this.annualMilesInput = page.locator('[data-testid="annual-miles-input"]')
    this.weeklyGoalInput = page.locator('[data-testid="weekly-goal-input"]')
    this.seeRpmBtn = page.locator('[data-testid="wizard-see-rpm-btn"]')
    this.minRpmValue = page.locator('[data-testid="kpi-min-rpm-value"]')
    this.targetValue = page.locator('[data-testid="kpi-target-value"]')
    this.breakevenValue = page.locator('[data-testid="kpi-breakeven-value"]')
  }

  async goto() {
    await this.page.goto('/carrier/cost-profile', { waitUntil: 'domcontentloaded' })
  }

  async completeWizard() {
    await this.mpgInput.fill('6.5')
    await this.page.locator('[data-testid="region-chip-MIDWEST"]').click()
    await this.additionalCostInput.fill('0.08')
    await this.nextBtn.click()

    await this.truckPaymentInput.fill('1200')
    await this.insuranceInput.fill('600')
    await this.permitsInput.fill('150')
    await this.annualMilesInput.fill('120000')
    await this.nextBtn.click()

    await this.weeklyGoalInput.fill('2000')
    await this.page.locator('[data-testid="weeks-chip-48"]').click()
    await this.seeRpmBtn.click()
  }

  async assertAllButtonsAreGloveFriendly() {
    const buttons = await this.page.locator('button').all()
    for (const button of buttons) {
      const box = await button.boundingBox()
      expect(box, 'every button must report a bounding box').not.toBeNull()
      expect(box!.height, `button "${await button.textContent()}" must be >=48px tall`).toBeGreaterThanOrEqual(48)
    }
  }
}
```

- [ ] **Step 2: Write the spec**

```ts
/**
 * Feature: US-730a-v2 (Cost Profile Wizard Redesign)
 * AC: first-time wizard completion shows Summary with correct derived RPM values
 * AC: load board RPM query is invalidated after save (US-705 integration)
 * AC: all interactive elements meet the 48px+ glove-friendly touch target minimum
 */
import { test, expect } from '@playwright/test'
import { CostProfilePageObject } from './page-objects/CostProfilePageObject'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'

async function loginAsTrucker(page: any, email: string) {
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password: 'E2ETestPassword123!', firstName: 'Test', lastName: 'Trucker',
      role: 'TRUCKER', companyName: `TestTruck-${Date.now()}`,
    }),
  })
  await page.goto(`${FRONTEND}/login`)
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  await page.waitForLoadState('networkidle')
}

test.describe('US-730a-v2: Cost Profile Wizard', () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test.setTimeout(60000)

  test('US-730a-v2 AC: first-time wizard completion shows correct summary + touch targets', async ({ page }) => {
    await loginAsTrucker(page, `cost-profile-wizard-${Date.now()}@freightclub.local`)
    const costProfilePage = new CostProfilePageObject(page)

    await costProfilePage.goto()
    await expect(costProfilePage.root).toBeVisible({ timeout: 10000 })

    await costProfilePage.assertAllButtonsAreGloveFriendly()
    await costProfilePage.completeWizard()

    await expect(costProfilePage.breakevenValue).toHaveText('$0.88')
    await expect(costProfilePage.minRpmValue).toHaveText('$1.68')
    await expect(costProfilePage.targetValue).toHaveText('$2.01')

    await page.screenshot({ path: 'test-results/evidence/US-730a-v2-cost-profile-summary.png', fullPage: true })
  })
})
```

- [ ] **Step 3: Run the Pre-Test Protocol and execute the spec**

Run (PowerShell, from repo root):
```powershell
docker compose -f docker-compose.test.yml down -v
cd backend
& "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" clean package -DskipTests -Djacoco.skip=true -q
cd ../frontend
npm run build
cd ..
docker compose -f docker-compose.test.yml up --build -d
```
Wait for `/actuator/health` on port 9091 to return 200/401, then:
```powershell
cd frontend
npx playwright test us-730a-v2-cost-profile-wizard.spec.ts
```
Expected: `1 passed`, screenshot present at `frontend/test-results/evidence/US-730a-v2-cost-profile-summary.png`.

- [ ] **Step 4: Commit**

```bash
git add frontend/e2e/page-objects/CostProfilePageObject.ts
git add frontend/e2e/us-730a-v2-cost-profile-wizard.spec.ts
git add frontend/test-results/evidence/US-730a-v2-cost-profile-summary.png
git commit -m "test(US-730a): add US-730a-v2 e2e golden path + touch-target evidence"
```

---

## Post-Implementation: Update Story Map

After Task 8 passes, update `docs/project/Story_Map.md` line for `US-730a-v2` status from `IN_PROGRESS` to `COMPLETED`, and note the merged PR reference. This is a LIBRARIAN action — do not mark `COMPLETED` without REVIEWER PASS per `feedback_reviewer_gate.md`.
