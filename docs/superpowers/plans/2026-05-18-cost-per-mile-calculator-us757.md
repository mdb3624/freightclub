# Cost Per Mile Calculator (US-757) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Trucker Cost Per Mile Calculator to enable truckers to track granular operating costs and calculate minimum acceptable revenue per mile (RPM).

**Architecture:** Database schema extension (11 new Profile fields) + backend validation service + enhanced frontend form with real-time CPM calculation component.

**Tech Stack:** Spring Boot 3.x + JPA, PostgreSQL Flyway migrations, React Hook Form + useWatch for real-time calculation, Vitest + Playwright.

---

## Task 1: Database Migration

**Files:**
- Create: `backend/src/main/resources/db/migration/V20260518_1100__AddCostProfileFields.sql`
- Reference: `DESIGN_TruckerCPMCalculator_US757.md` (schema design)

- [ ] **Step 1: Write the migration SQL**

```sql
-- V20260518_1100__AddCostProfileFields.sql
-- Add cost tracking fields to profile table for CPM calculator

ALTER TABLE profile ADD COLUMN truck_payment_lease NUMERIC(10, 2),
ADD COLUMN insurance NUMERIC(10, 2),
ADD COLUMN ifta_irp_permits NUMERIC(10, 2),
ADD COLUMN phone_eld_misc NUMERIC(10, 2),
ADD COLUMN per_diem_daily_rate NUMERIC(10, 2),
ADD COLUMN per_diem_days_per_month INTEGER,
ADD COLUMN fuel_cost_per_gallon NUMERIC(6, 3),
ADD COLUMN miles_per_gallon NUMERIC(4, 1),
ADD COLUMN maintenance_cost_per_mile NUMERIC(6, 3),
ADD COLUMN monthly_miles_target INTEGER,
ADD COLUMN target_margin_per_mile NUMERIC(6, 3);

-- Add comment documenting the fields
COMMENT ON COLUMN profile.truck_payment_lease IS 'Monthly truck payment or lease cost (dollars)';
COMMENT ON COLUMN profile.insurance IS 'Monthly insurance cost (dollars)';
COMMENT ON COLUMN profile.ifta_irp_permits IS 'Monthly IFTA/IRP/Permits cost (dollars)';
COMMENT ON COLUMN profile.phone_eld_misc IS 'Monthly phone/ELD/misc cost (dollars)';
COMMENT ON COLUMN profile.per_diem_daily_rate IS 'Daily per diem rate (dollars)';
COMMENT ON COLUMN profile.per_diem_days_per_month IS 'Days per month working (1-31)';
COMMENT ON COLUMN profile.fuel_cost_per_gallon IS 'Current diesel price per gallon (dollars)';
COMMENT ON COLUMN profile.miles_per_gallon IS 'Truck fuel efficiency in MPG';
COMMENT ON COLUMN profile.maintenance_cost_per_mile IS 'Maintenance reserve per mile (dollars)';
COMMENT ON COLUMN profile.monthly_miles_target IS 'Target monthly miles driven';
COMMENT ON COLUMN profile.target_margin_per_mile IS 'Target profit margin per mile (dollars)';
```

- [ ] **Step 2: Verify SQL syntax and Flyway naming**

Verify: Migration file `V20260518_1100__AddCostProfileFields.sql` is created with correct naming (version + double underscore + description)

Expected: File exists at `backend/src/main/resources/db/migration/V20260518_1100__AddCostProfileFields.sql`

- [ ] **Step 3: Commit migration**

```bash
cd backend
git add src/main/resources/db/migration/V20260518_1100__AddCostProfileFields.sql
git commit -m "migration: add 11 cost profile fields for CPM calculator (US-757)"
```

---

## Task 2: Backend Entity Updates

**Files:**
- Modify: `backend/src/main/java/com/freightclub/profile/entity/Profile.java`
- Reference: `DESIGN_TruckerCPMCalculator_US757.md` (schema mapping)

- [ ] **Step 1: Add fields to Profile entity**

Add the following fields to the `Profile` class (use standard Java getters/setters, no Lombok):

```java
// Cost Profile Fields
private BigDecimal truckPaymentLease;
private BigDecimal insurance;
private BigDecimal iftaIrpPermits;
private BigDecimal phoneEldMisc;
private BigDecimal perDiemDailyRate;
private Integer perDiemDaysPerMonth;
private BigDecimal fuelCostPerGallon;
private BigDecimal milesPerGallon;
private BigDecimal maintenanceCostPerMile;
private Integer monthlyMilesTarget;
private BigDecimal targetMarginPerMile;
```

- [ ] **Step 2: Add JPA column mappings**

For each field, add `@Column(name = "field_name", nullable = true)` annotation:

```java
@Column(name = "truck_payment_lease", nullable = true)
private BigDecimal truckPaymentLease;

@Column(name = "insurance", nullable = true)
private BigDecimal insurance;

@Column(name = "ifta_irp_permits", nullable = true)
private BigDecimal iftaIrpPermits;

@Column(name = "phone_eld_misc", nullable = true)
private BigDecimal phoneEldMisc;

@Column(name = "per_diem_daily_rate", nullable = true)
private BigDecimal perDiemDailyRate;

@Column(name = "per_diem_days_per_month", nullable = true)
private Integer perDiemDaysPerMonth;

@Column(name = "fuel_cost_per_gallon", nullable = true)
private BigDecimal fuelCostPerGallon;

@Column(name = "miles_per_gallon", nullable = true)
private BigDecimal milesPerGallon;

@Column(name = "maintenance_cost_per_mile", nullable = true)
private BigDecimal maintenanceCostPerMile;

@Column(name = "monthly_miles_target", nullable = true)
private Integer monthlyMilesTarget;

@Column(name = "target_margin_per_mile", nullable = true)
private BigDecimal targetMarginPerMile;
```

- [ ] **Step 3: Generate getters and setters (no Lombok)**

For each field, add public getter and setter methods:

```java
public BigDecimal getTruckPaymentLease() {
    return truckPaymentLease;
}

public void setTruckPaymentLease(BigDecimal truckPaymentLease) {
    this.truckPaymentLease = truckPaymentLease;
}

// ... repeat for all 11 fields
```

- [ ] **Step 4: Run backend tests to verify entity compiles**

```bash
cd backend
mvn clean test -Dtest=ProfileEntityTest
```

Expected: Tests pass, entity compiles with new fields

- [ ] **Step 5: Commit entity changes**

```bash
cd backend
git add src/main/java/com/freightclub/profile/entity/Profile.java
git commit -m "feat: add 11 cost profile fields to Profile entity (US-757)"
```

---

## Task 3: Backend ProfileService - CPM Calculation

**Files:**
- Modify: `backend/src/main/java/com/freightclub/profile/service/ProfileService.java`
- Reference: `DESIGN_TruckerCPMCalculator_US757.md` (calculation rules)

- [ ] **Step 1: Write unit test for CPM calculations**

Create test class: `backend/src/test/java/com/freightclub/profile/service/ProfileServiceCpmCalculationTest.java`

```java
package com.freightclub.profile.service;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class ProfileServiceCpmCalculationTest {
    
    @Test
    void calculateTotalFixedCosts_withAllFixedFields() {
        // Given: Profile with all fixed cost fields
        Profile profile = new Profile();
        profile.setTruckPaymentLease(new BigDecimal("1800.00"));
        profile.setInsurance(new BigDecimal("900.00"));
        profile.setIftaIrpPermits(new BigDecimal("200.00"));
        profile.setPhoneEldMisc(new BigDecimal("150.00"));
        profile.setPerDiemDailyRate(new BigDecimal("800.00"));
        profile.setPerDiemDaysPerMonth(20);
        
        // When: totalFixedCosts is calculated
        BigDecimal result = ProfileService.calculateTotalFixedCosts(profile);
        
        // Then: Result includes truck + insurance + ifta + phone + (perDiem * days)
        // Expected: 1800 + 900 + 200 + 150 + (800 * 20) = 4050 + 16000 = 20050
        assertEquals(new BigDecimal("20050.00"), result);
    }
    
    @Test
    void calculateTotalFixedCosts_withNullFields() {
        // Given: Profile with null cost fields
        Profile profile = new Profile();
        profile.setTruckPaymentLease(new BigDecimal("1800.00"));
        profile.setInsurance(null);
        profile.setIftaIrpPermits(null);
        profile.setPhoneEldMisc(null);
        profile.setPerDiemDailyRate(null);
        
        // When: totalFixedCosts is calculated
        BigDecimal result = ProfileService.calculateTotalFixedCosts(profile);
        
        // Then: Result uses 0 for null fields
        assertEquals(new BigDecimal("1800.00"), result);
    }
    
    @Test
    void calculateFixedCpm_dividesFixedCostsByMiles() {
        // Given: Total fixed costs and monthly miles
        BigDecimal fixedCosts = new BigDecimal("4050.00");
        Integer monthlyMiles = 8000;
        
        // When: Fixed CPM is calculated
        BigDecimal result = ProfileService.calculateFixedCpm(fixedCosts, monthlyMiles);
        
        // Then: Result = fixedCosts / miles
        // Expected: 4050 / 8000 = 0.50625
        assertEquals(new BigDecimal("0.5063"), result.setScale(4, BigDecimal.ROUND_HALF_UP));
    }
    
    @Test
    void calculateFuelCpm_dividesPriceByMpg() {
        // Given: Diesel price and MPG
        BigDecimal fuelPrice = new BigDecimal("3.89");
        BigDecimal mpg = new BigDecimal("6.5");
        
        // When: Fuel CPM is calculated
        BigDecimal result = ProfileService.calculateFuelCpm(fuelPrice, mpg);
        
        // Then: Result = fuelPrice / mpg
        // Expected: 3.89 / 6.5 = 0.5985
        assertEquals(new BigDecimal("0.5985"), result.setScale(4, BigDecimal.ROUND_HALF_UP));
    }
    
    @Test
    void calculateFuelCpm_withZeroMpg_returnsZero() {
        // Given: Diesel price with 0 MPG
        BigDecimal fuelPrice = new BigDecimal("3.89");
        BigDecimal mpg = BigDecimal.ZERO;
        
        // When: Fuel CPM is calculated
        BigDecimal result = ProfileService.calculateFuelCpm(fuelPrice, mpg);
        
        // Then: Result = 0 (avoid division by zero)
        assertEquals(BigDecimal.ZERO, result);
    }
    
    @Test
    void calculateVariableCpm_addsFuelAndMaintenance() {
        // Given: Fuel CPM and maintenance CPM
        BigDecimal fuelCpm = new BigDecimal("0.5985");
        BigDecimal maintenanceCpm = new BigDecimal("0.17");
        
        // When: Variable CPM is calculated
        BigDecimal result = ProfileService.calculateVariableCpm(fuelCpm, maintenanceCpm);
        
        // Then: Result = fuelCpm + maintenanceCpm
        // Expected: 0.5985 + 0.17 = 0.7685
        assertEquals(new BigDecimal("0.7685"), result.setScale(4, BigDecimal.ROUND_HALF_UP));
    }
    
    @Test
    void calculateTotalCpm_addsFixedAndVariable() {
        // Given: Fixed CPM and Variable CPM
        BigDecimal fixedCpm = new BigDecimal("0.5063");
        BigDecimal variableCpm = new BigDecimal("0.7685");
        
        // When: Total CPM is calculated
        BigDecimal result = ProfileService.calculateTotalCpm(fixedCpm, variableCpm);
        
        // Then: Result = fixedCpm + variableCpm
        // Expected: 0.5063 + 0.7685 = 1.2748
        assertEquals(new BigDecimal("1.2748"), result.setScale(4, BigDecimal.ROUND_HALF_UP));
    }
    
    @Test
    void calculateMinimumRpm_addsProfitMargin() {
        // Given: Total CPM and target profit margin
        BigDecimal totalCpm = new BigDecimal("1.2748");
        BigDecimal marginPerMile = new BigDecimal("0.60");
        
        // When: Minimum RPM is calculated
        BigDecimal result = ProfileService.calculateMinimumRpm(totalCpm, marginPerMile);
        
        // Then: Result = totalCpm + marginPerMile
        // Expected: 1.2748 + 0.60 = 1.8748
        assertEquals(new BigDecimal("1.8748"), result.setScale(4, BigDecimal.ROUND_HALF_UP));
    }
}
```

- [ ] **Step 2: Run tests and verify they fail (Red)**

```bash
cd backend
mvn test -Dtest=ProfileServiceCpmCalculationTest
```

Expected: Tests FAIL with "method not found" errors

- [ ] **Step 3: Implement CPM calculation methods in ProfileService**

Add static utility methods to `ProfileService`:

```java
public static BigDecimal calculateTotalFixedCosts(Profile profile) {
    BigDecimal truck = profile.getTruckPaymentLease() != null ? profile.getTruckPaymentLease() : BigDecimal.ZERO;
    BigDecimal insurance = profile.getInsurance() != null ? profile.getInsurance() : BigDecimal.ZERO;
    BigDecimal ifta = profile.getIftaIrpPermits() != null ? profile.getIftaIrpPermits() : BigDecimal.ZERO;
    BigDecimal phone = profile.getPhoneEldMisc() != null ? profile.getPhoneEldMisc() : BigDecimal.ZERO;
    
    BigDecimal perDiem = BigDecimal.ZERO;
    if (profile.getPerDiemDailyRate() != null && profile.getPerDiemDaysPerMonth() != null) {
        perDiem = profile.getPerDiemDailyRate().multiply(new BigDecimal(profile.getPerDiemDaysPerMonth()));
    }
    
    return truck.add(insurance).add(ifta).add(phone).add(perDiem);
}

public static BigDecimal calculateFixedCpm(BigDecimal fixedCosts, Integer monthlyMiles) {
    if (monthlyMiles == null || monthlyMiles <= 0) return BigDecimal.ZERO;
    return fixedCosts.divide(new BigDecimal(monthlyMiles), 4, BigDecimal.ROUND_HALF_UP);
}

public static BigDecimal calculateFuelCpm(BigDecimal fuelPrice, BigDecimal mpg) {
    if (fuelPrice == null) fuelPrice = BigDecimal.ZERO;
    if (mpg == null || mpg.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
    return fuelPrice.divide(mpg, 4, BigDecimal.ROUND_HALF_UP);
}

public static BigDecimal calculateVariableCpm(BigDecimal fuelCpm, BigDecimal maintenanceCpm) {
    if (fuelCpm == null) fuelCpm = BigDecimal.ZERO;
    if (maintenanceCpm == null) maintenanceCpm = BigDecimal.ZERO;
    return fuelCpm.add(maintenanceCpm);
}

public static BigDecimal calculateTotalCpm(BigDecimal fixedCpm, BigDecimal variableCpm) {
    if (fixedCpm == null) fixedCpm = BigDecimal.ZERO;
    if (variableCpm == null) variableCpm = BigDecimal.ZERO;
    return fixedCpm.add(variableCpm);
}

public static BigDecimal calculateMinimumRpm(BigDecimal totalCpm, BigDecimal marginPerMile) {
    if (totalCpm == null) totalCpm = BigDecimal.ZERO;
    if (marginPerMile == null) marginPerMile = BigDecimal.ZERO;
    return totalCpm.add(marginPerMile);
}
```

- [ ] **Step 4: Run tests and verify they pass (Green)**

```bash
cd backend
mvn test -Dtest=ProfileServiceCpmCalculationTest
```

Expected: All tests PASS

- [ ] **Step 5: Commit CPM calculation methods**

```bash
cd backend
git add src/main/java/com/freightclub/profile/service/ProfileService.java
git add src/test/java/com/freightclub/profile/service/ProfileServiceCpmCalculationTest.java
git commit -m "feat: add CPM calculation methods to ProfileService (US-757)"
```

---

## Task 4: Backend ProfileController - Validation

**Files:**
- Modify: `backend/src/main/java/com/freightclub/profile/controller/ProfileController.java`
- Reference: `DESIGN_TruckerCPMCalculator_US757.md` (validation rules)

- [ ] **Step 1: Write unit test for field validation**

Create test: `backend/src/test/java/com/freightclub/profile/controller/ProfileControllerValidationTest.java`

```java
package com.freightclub.profile.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ProfileControllerValidationTest {
    
    private ProfileController controller = new ProfileController();
    private ProfileService profileService = mock(ProfileService.class);
    
    @Test
    void updateProfile_withValidCostFields_returns200() {
        // Given: Valid cost profile DTO
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setTruckPaymentLease(new BigDecimal("1800.00"));
        request.setPerDiemDaysPerMonth(20);
        request.setMonthlyMilesTarget(8000);
        
        // When: Profile is updated
        ResponseEntity<?> response = controller.updateProfile(request, "tenantId");
        
        // Then: Returns 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
    
    @Test
    void updateProfile_withNegativeCostField_returns400() {
        // Given: Cost field with negative value
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setTruckPaymentLease(new BigDecimal("-100.00"));
        
        // When: Profile is updated
        ResponseEntity<?> response = controller.updateProfile(request, "tenantId");
        
        // Then: Returns 400 BAD_REQUEST
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
    
    @Test
    void updateProfile_withPerDiemDaysOutOfRange_returns400() {
        // Given: Per diem days > 31
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setPerDiemDaysPerMonth(35);
        
        // When: Profile is updated
        ResponseEntity<?> response = controller.updateProfile(request, "tenantId");
        
        // Then: Returns 400 BAD_REQUEST
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
    
    @Test
    void updateProfile_withZeroMiles_returns400() {
        // Given: Monthly miles target = 0
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setMonthlyMilesTarget(0);
        
        // When: Profile is updated
        ResponseEntity<?> response = controller.updateProfile(request, "tenantId");
        
        // Then: Returns 400 BAD_REQUEST
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
```

- [ ] **Step 2: Run tests and verify they fail (Red)**

```bash
cd backend
mvn test -Dtest=ProfileControllerValidationTest
```

Expected: Tests FAIL with validation not implemented

- [ ] **Step 3: Add validation logic to ProfileController**

In the `updateProfile` method, add field validation before persisting:

```java
private void validateCostProfileFields(UpdateProfileRequest request) throws ValidationException {
    List<String> errors = new ArrayList<>();
    
    if (request.getTruckPaymentLease() != null && request.getTruckPaymentLease().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("Truck payment/lease must be >= 0");
    }
    if (request.getInsurance() != null && request.getInsurance().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("Insurance must be >= 0");
    }
    if (request.getIftaIrpPermits() != null && request.getIftaIrpPermits().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("IFTA/IRP/Permits must be >= 0");
    }
    if (request.getPhoneEldMisc() != null && request.getPhoneEldMisc().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("Phone/ELD/Misc must be >= 0");
    }
    if (request.getPerDiemDailyRate() != null && request.getPerDiemDailyRate().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("Per diem daily rate must be >= 0");
    }
    if (request.getPerDiemDaysPerMonth() != null && 
        (request.getPerDiemDaysPerMonth() < 1 || request.getPerDiemDaysPerMonth() > 31)) {
        errors.add("Per diem days per month must be between 1 and 31");
    }
    if (request.getFuelCostPerGallon() != null && request.getFuelCostPerGallon().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("Fuel cost per gallon must be >= 0");
    }
    if (request.getMilesPerGallon() != null && request.getMilesPerGallon().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("Miles per gallon must be >= 0");
    }
    if (request.getMaintenanceCostPerMile() != null && request.getMaintenanceCostPerMile().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("Maintenance cost per mile must be >= 0");
    }
    if (request.getMonthlyMilesTarget() != null && request.getMonthlyMilesTarget() <= 0) {
        errors.add("Monthly miles target must be > 0");
    }
    if (request.getTargetMarginPerMile() != null && request.getTargetMarginPerMile().compareTo(BigDecimal.ZERO) < 0) {
        errors.add("Target margin per mile must be >= 0");
    }
    
    if (!errors.isEmpty()) {
        throw new ValidationException(errors);
    }
}
```

- [ ] **Step 4: Run tests and verify they pass (Green)**

```bash
cd backend
mvn test -Dtest=ProfileControllerValidationTest
```

Expected: All tests PASS

- [ ] **Step 5: Run full backend test suite**

```bash
cd backend
mvn clean test
```

Expected: All tests pass, JaCoCo coverage >= 80%

- [ ] **Step 6: Commit validation logic**

```bash
cd backend
git add src/main/java/com/freightclub/profile/controller/ProfileController.java
git add src/test/java/com/freightclub/profile/controller/ProfileControllerValidationTest.java
git commit -m "feat: add cost profile field validation to ProfileController (US-757)"
```

---

## Task 5: Frontend Type Updates

**Files:**
- Modify: `frontend/src/features/profile/types.ts` (already partially done, verify completion)
- Reference: `DESIGN_TruckerCPMCalculator_US757.md` (API contract)

- [ ] **Step 1: Verify all fields are in UpdateProfileValues type**

Check that `frontend/src/features/profile/types.ts` has all 11 cost fields in both `Profile` and `UpdateProfileValues` interfaces:

```typescript
// In Profile interface:
truckPaymentLease: number | null
insurance: number | null
iftaIrpPermits: number | null
phoneEldMisc: number | null
perDiemDailyRate: number | null
perDiemDaysPerMonth: number | null
fuelCostPerGallon: number | null
milesPerGallon: number | null
maintenanceCostPerMile: number | null
monthlyMilesTarget: number | null
targetMarginPerMile: number | null

// In UpdateProfileValues interface:
truckPaymentLease: number | '' | null
insurance: number | '' | null
iftaIrpPermits: number | '' | null
phoneEldMisc: number | '' | null
perDiemDailyRate: number | '' | null
perDiemDaysPerMonth: number | '' | null
fuelCostPerGallon: number | '' | null
milesPerGallon: number | '' | null
maintenanceCostPerMile: number | '' | null
monthlyMilesTarget: number | '' | null
targetMarginPerMile: number | '' | null
```

- [ ] **Step 2: Write unit test to verify type definitions**

Create test: `frontend/src/features/profile/types.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import type { Profile, UpdateProfileValues } from './types'

describe('Profile Types', () => {
  it('Profile interface includes all cost fields', () => {
    const profile: Profile = {
      // ... required fields ...
      truckPaymentLease: 1800,
      insurance: 900,
      iftaIrpPermits: 200,
      phoneEldMisc: 150,
      perDiemDailyRate: 800,
      perDiemDaysPerMonth: 20,
      fuelCostPerGallon: 3.89,
      milesPerGallon: 6.5,
      maintenanceCostPerMile: 0.17,
      monthlyMilesTarget: 8000,
      targetMarginPerMile: 0.60,
    }
    expect(profile.truckPaymentLease).toBe(1800)
  })

  it('UpdateProfileValues interface allows string input for cost fields', () => {
    const values: UpdateProfileValues = {
      // ... required fields ...
      truckPaymentLease: '1800',
      insurance: '900',
      iftaIrpPermits: '',
      phoneEldMisc: '',
      perDiemDailyRate: '800',
      perDiemDaysPerMonth: '20',
      fuelCostPerGallon: '3.89',
      milesPerGallon: '6.5',
      maintenanceCostPerMile: '0.17',
      monthlyMilesTarget: '8000',
      targetMarginPerMile: '0.60',
    }
    expect(values.truckPaymentLease).toBe('1800')
  })
})
```

- [ ] **Step 3: Run test and verify it passes**

```bash
cd frontend
npm run test -- types.test.ts
```

Expected: Test PASSES

- [ ] **Step 4: Commit type updates**

```bash
cd frontend
git add src/features/profile/types.ts
git add src/features/profile/types.test.ts
git commit -m "chore: verify all cost profile fields in type definitions (US-757)"
```

---

## Task 6: Frontend Form Enhancement - CostProfileSection

**Files:**
- Modify: `frontend/src/features/carrier/components/profile/CostProfileSection.tsx` (already partially done, verify/enhance)
- Reference: `DESIGN_TruckerCPMCalculator_US757.md` (component architecture)

- [ ] **Step 1: Write unit test for CostProfileSummary calculation**

Create test: `frontend/src/features/carrier/components/profile/CostProfileSection.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import CostProfileSection from './CostProfileSection'
import type { UpdateProfileValues } from '@/features/profile/types'

describe('CostProfileSection', () => {
  it('renders all three sections with correct headings', () => {
    const { control, register } = useForm<UpdateProfileValues>()
    render(<CostProfileSection register={register} control={control} />)
    
    expect(screen.getByText(/Fixed Monthly Costs/i)).toBeInTheDocument()
    expect(screen.getByText(/Variable Costs/i)).toBeInTheDocument()
    expect(screen.getByText(/Operational/i)).toBeInTheDocument()
  })

  it('renders all 10 input fields', () => {
    const { control, register } = useForm<UpdateProfileValues>()
    render(<CostProfileSection register={register} control={control} />)
    
    expect(screen.getByLabelText(/Truck Payment/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Insurance/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/IFTA/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Diesel Price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Fuel Efficiency/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Maintenance Reserve/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Per Diem \(\$\/Day\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Days\/Month/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Miles Driven/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Profit Margin/i)).toBeInTheDocument()
  })
})

describe('CostProfileSummary', () => {
  it('displays CPM breakdown when monthly miles > 0', () => {
    const { control } = useForm<UpdateProfileValues>({
      defaultValues: {
        truckPaymentLease: 1800,
        insurance: 900,
        iftaIrpPermits: 200,
        phoneEldMisc: 150,
        perDiemDailyRate: 800,
        perDiemDaysPerMonth: 20,
        fuelCostPerGallon: 3.89,
        milesPerGallon: 6.5,
        maintenanceCostPerMile: 0.17,
        monthlyMilesTarget: 8000,
        targetMarginPerMile: 0.60,
      },
    })
    render(<CostProfileSummary control={control} />)
    
    expect(screen.getByText(/Fixed CPM/i)).toBeInTheDocument()
    expect(screen.getByText(/Variable CPM/i)).toBeInTheDocument()
    expect(screen.getByText(/Total CPM/i)).toBeInTheDocument()
    expect(screen.getByText(/Minimum RPM/i)).toBeInTheDocument()
  })

  it('hides CPM breakdown when monthly miles = 0', () => {
    const { control } = useForm<UpdateProfileValues>({
      defaultValues: {
        monthlyMilesTarget: 0,
      },
    })
    const { container } = render(<CostProfileSummary control={control} />)
    
    expect(container.querySelector('.bg-gray-50')).not.toBeInTheDocument()
  })

  it('calculates fixed CPM correctly', () => {
    const { control } = useForm<UpdateProfileValues>({
      defaultValues: {
        truckPaymentLease: 1800,
        insurance: 900,
        iftaIrpPermits: 200,
        phoneEldMisc: 150,
        perDiemDailyRate: 800,
        perDiemDaysPerMonth: 20,
        monthlyMilesTarget: 8000,
      },
    })
    render(<CostProfileSummary control={control} />)
    
    // Fixed CPM = (1800 + 900 + 200 + 150 + 16000) / 8000 = 19050 / 8000 = 2.3813
    expect(screen.getByText(/\$2\.3813\/mi/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests and verify they fail (Red)**

```bash
cd frontend
npm run test -- CostProfileSection.test.tsx
```

Expected: Tests FAIL (components exist but not fully wired)

- [ ] **Step 3: Verify CostProfileSection component has all fields and calculation**

Ensure `frontend/src/features/carrier/components/profile/CostProfileSection.tsx` matches design:

- Fixed Monthly Costs section with 4 inputs
- Variable Costs section with 5 inputs (including per diem split into 2 fields)
- Operational section with 2 inputs
- CostProfileSummary component displaying real-time calculations

Expected: Component already exists and is mostly complete from earlier work

- [ ] **Step 4: Run tests and verify they pass (Green)**

```bash
cd frontend
npm run test -- CostProfileSection.test.tsx
```

Expected: All tests PASS

- [ ] **Step 5: Run full frontend test suite**

```bash
cd frontend
npm run test
```

Expected: All tests pass

- [ ] **Step 6: Commit form enhancements**

```bash
cd frontend
git add src/features/carrier/components/profile/CostProfileSection.tsx
git add src/features/carrier/components/profile/CostProfileSection.test.tsx
git commit -m "test: add comprehensive tests for CostProfileSection (US-757)"
```

---

## Task 7: E2E Test - Golden Path

**Files:**
- Create: `frontend/e2e/cost-profile-setup.spec.ts`
- Reference: `DESIGN_TruckerCPMCalculator_US757.md` (golden path: enter fields → save → reload → persist)

- [ ] **Step 1: Write E2E test for cost profile setup**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Trucker Cost Profile Setup', () => {
  test('Golden path: enter cost fields, save, reload, values persist', async ({ page }) => {
    // Setup: Login as a trucker
    await page.goto('/login')
    await page.fill('input[name="email"]', 'trucker@example.com')
    await page.fill('input[name="password"]', 'testpassword123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
    
    // Navigate to Profile
    await page.click('a:has-text("Profile")')
    await page.waitForURL('/profile')
    
    // Find Cost Profile Section
    await expect(page.locator('text=Cost Profile')).toBeVisible()
    
    // Fill Fixed Monthly Costs
    await page.fill('input[name="truckPaymentLease"]', '1800')
    await page.fill('input[name="insurance"]', '900')
    await page.fill('input[name="iftaIrpPermits"]', '200')
    await page.fill('input[name="phoneEldMisc"]', '150')
    
    // Fill Variable Costs
    await page.fill('input[name="fuelCostPerGallon"]', '3.89')
    await page.fill('input[name="milesPerGallon"]', '6.5')
    await page.fill('input[name="maintenanceCostPerMile"]', '0.17')
    await page.fill('input[name="perDiemDailyRate"]', '800')
    await page.fill('input[name="perDiemDaysPerMonth"]', '20')
    
    // Fill Operational
    await page.fill('input[name="monthlyMilesTarget"]', '8000')
    await page.fill('input[name="targetMarginPerMile"]', '0.60')
    
    // Verify CPM calculations are displayed
    await expect(page.locator('text=Calculated Cost Breakdown')).toBeVisible()
    await expect(page.locator('text=Fixed CPM')).toBeVisible()
    await expect(page.locator('text=Variable CPM')).toBeVisible()
    await expect(page.locator('text=Total CPM')).toBeVisible()
    await expect(page.locator('text=Minimum RPM')).toBeVisible()
    
    // Click Save button
    await page.click('button:has-text("Save")')
    
    // Verify success message
    await expect(page.locator('text=Profile saved')).toBeVisible()
    
    // Reload page
    await page.reload()
    
    // Verify all values persist
    await expect(page.locator('input[name="truckPaymentLease"]')).toHaveValue('1800')
    await expect(page.locator('input[name="insurance"]')).toHaveValue('900')
    await expect(page.locator('input[name="iftaIrpPermits"]')).toHaveValue('200')
    await expect(page.locator('input[name="phoneEldMisc"]')).toHaveValue('150')
    await expect(page.locator('input[name="fuelCostPerGallon"]')).toHaveValue('3.89')
    await expect(page.locator('input[name="milesPerGallon"]')).toHaveValue('6.5')
    await expect(page.locator('input[name="maintenanceCostPerMile"]')).toHaveValue('0.17')
    await expect(page.locator('input[name="perDiemDailyRate"]')).toHaveValue('800')
    await expect(page.locator('input[name="perDiemDaysPerMonth"]')).toHaveValue('20')
    await expect(page.locator('input[name="monthlyMilesTarget"]')).toHaveValue('8000')
    await expect(page.locator('input[name="targetMarginPerMile"]')).toHaveValue('0.60')
    
    // Verify CPM calculations still visible
    await expect(page.locator('text=Calculated Cost Breakdown')).toBeVisible()
  })

  test('Partial entry: user enters only some fields, CPM displays partial calculation', async ({ page }) => {
    // Setup: Login and navigate to profile
    await page.goto('/profile')
    
    // Fill only truck payment and monthly miles
    await page.fill('input[name="truckPaymentLease"]', '1800')
    await page.fill('input[name="monthlyMilesTarget"]', '8000')
    
    // Verify CPM displays with partial data
    await expect(page.locator('text=Fixed CPM')).toBeVisible()
    await expect(page.locator('text=Fixed CPM')).toContainText('$0.2250/mi') // 1800 / 8000
  })

  test('Edge case: zero MPG is handled safely (no division by zero)', async ({ page }) => {
    // Setup: Login and navigate to profile
    await page.goto('/profile')
    
    // Enter fuel price but zero MPG
    await page.fill('input[name="fuelCostPerGallon"]', '3.89')
    await page.fill('input[name="milesPerGallon"]', '0')
    await page.fill('input[name="monthlyMilesTarget"]', '8000')
    
    // Verify Fuel CPM is 0 (not NaN or Infinity)
    await expect(page.locator('text=Variable CPM')).toContainText('$0.0000/mi')
  })
})
```

- [ ] **Step 2: Run E2E test and verify it passes**

```bash
cd frontend
npm run test:e2e -- cost-profile-setup.spec.ts
```

Expected: Test PASSES

- [ ] **Step 3: Commit E2E test**

```bash
cd frontend
git add e2e/cost-profile-setup.spec.ts
git commit -m "test: add golden-path E2E test for cost profile setup (US-757)"
```

---

## Task 8: Final Integration Test & Coverage

**Files:**
- Run existing test suites
- Verify 70%+ backend coverage, 70%+ frontend coverage

- [ ] **Step 1: Run full backend test suite**

```bash
cd backend
mvn clean test
```

Expected: All tests pass, JaCoCo coverage >= 80%

- [ ] **Step 2: Run full frontend test suite**

```bash
cd frontend
npm run test
```

Expected: All tests pass

- [ ] **Step 3: Run E2E tests**

```bash
cd frontend
npm run test:e2e
```

Expected: All E2E tests pass

- [ ] **Step 4: Create summary of test coverage**

```bash
cd backend
mvn jacoco:report
echo "Backend coverage report: target/site/jacoco/index.html"

cd ../frontend
npm run test -- --coverage
echo "Frontend coverage report: coverage/index.html"
```

- [ ] **Step 5: Commit final integration**

```bash
git add -A
git commit -m "feat: complete Cost Per Mile Calculator implementation (US-757) - all tests passing, 80%+ coverage"
```

---

## Definition of Done

- [ ] Database migration created and applied
- [ ] Profile entity updated with 11 new fields
- [ ] Backend CPM calculation methods implemented and tested (TDD)
- [ ] Backend field validation implemented and tested (TDD)
- [ ] Frontend type definitions updated and verified
- [ ] Frontend form component fully functional with all 10 fields
- [ ] Real-time CPM calculation displays in browser
- [ ] Backend unit tests: >= 80% coverage
- [ ] Frontend unit tests: >= 70% coverage
- [ ] E2E test: golden path passes
- [ ] All AC1-AC9 manually verified
- [ ] Ready for REVIEWER phase

---

**Implementation Status:** READY_FOR_CODER  
**Subagent-Driven Execution:** Recommended (8 independent tasks, 2-stage review per task)
