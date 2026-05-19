# US-713: Shipper Company Profile Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement shipper company profile setup flow with 80% completeness gating on load publish, including backend service, REST endpoints, frontend form, and dashboard integration.

**Architecture:** Backend uses Spring service layer with completeness calculation logic, repository for persistence, and controller endpoints. Frontend uses React Hook Form + Zod for validation, custom hooks for API integration, and dashboard banner for visibility. All operations respect multi-tenant isolation via `TenantContextHolder`. Cache invalidation ensures real-time updates.

**Tech Stack:** Spring Boot, Spring Data JPA, Spring Cache, Java Records, React 18, React Hook Form, Zod, React Query, Tailwind CSS, Playwright (E2E).

---

## File Structure

**Backend Files:**
- Create: `backend/src/main/java/com/freightclub/modules/shipper/domain/ShipperProfile.java` (entity record)
- Create: `backend/src/main/java/com/freightclub/modules/shipper/application/ShipperProfileService.java` (service)
- Create: `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/ShipperProfileRepository.java` (repository)
- Create: `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/dto/ShipperProfileRequest.java` (DTO)
- Create: `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/dto/ShipperProfileResponse.java` (DTO)
- Create: `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/ShipperController.java` (controller)
- Create: `backend/src/main/java/com/freightclub/exception/ProfileIncompleteException.java` (exception)
- Modify: `backend/src/main/java/com/freightclub/service/LoadService.java` (add profile gate)
- Create: `backend/src/test/java/com/freightclub/modules/shipper/ShipperProfileServiceTest.java` (tests)
- Create: `backend/src/test/java/com/freightclub/modules/shipper/ShipperControllerTest.java` (tests)
- Modify: `backend/src/test/java/com/freightclub/service/LoadServiceTest.java` (add publish gate test)

**Frontend Files:**
- Create: `frontend/src/features/shipper/hooks/useShipperProfile.ts` (hook)
- Create: `frontend/src/features/shipper/hooks/useUpdateProfile.ts` (hook)
- Create: `frontend/src/features/shipper/components/ShipperProfileForm.tsx` (component)
- Create: `frontend/src/features/shipper/components/ShipperProfileForm.test.tsx` (tests)
- Create: `frontend/src/pages/ProfilePage.tsx` (page)
- Create: `frontend/src/pages/ProfilePage.test.tsx` (tests)
- Modify: `frontend/src/components/Dashboard.tsx` (add profile banner)
- Modify: `frontend/src/App.tsx` (add `/profile` route)
- Create: `frontend/e2e/profile-setup.spec.ts` (E2E test)

---

## BACKEND TASKS

### Task 1: ShipperProfile Domain Entity

**Files:**
- Create: `backend/src/main/java/com/freightclub/modules/shipper/domain/ShipperProfile.java`

- [ ] **Step 1: Create Java Record for ShipperProfile**

```java
package com.freightclub.modules.shipper.domain;

import java.time.OffsetDateTime;

public record ShipperProfile(
    String id,
    String tenantId,
    String companyName,
    String billingEmail,
    String phoneNumber,
    String city,
    String state,
    String zipCode,
    String mcNumber,
    String usdotNumber,
    String logoUrl,
    Integer completenessPercent,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime deletedAt
) {}
```

- [ ] **Step 2: Verify record created**

File should exist at `backend/src/main/java/com/freightclub/modules/shipper/domain/ShipperProfile.java`

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/freightclub/modules/shipper/domain/ShipperProfile.java
git commit -m "feat(US-713): add ShipperProfile domain entity record"
```

---

### Task 2: ShipperProfileRepository Interface

**Files:**
- Create: `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/ShipperProfileRepository.java`

- [ ] **Step 1: Create Spring Data JPA Repository**

```java
package com.freightclub.modules.shipper.infrastructure;

import com.freightclub.modules.shipper.domain.ShipperProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipperProfileRepository extends JpaRepository<ShipperProfile, String> {
    Optional<ShipperProfile> findByTenantIdAndDeletedAtIsNull(String tenantId);
}
```

- [ ] **Step 2: Verify interface created**

File should exist and compile without errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/freightclub/modules/shipper/infrastructure/ShipperProfileRepository.java
git commit -m "feat(US-713): add ShipperProfileRepository interface"
```

---

### Task 3: Request/Response DTOs

**Files:**
- Create: `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/dto/ShipperProfileRequest.java`
- Create: `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/dto/ShipperProfileResponse.java`

- [ ] **Step 1: Create ShipperProfileRequest DTO**

```java
package com.freightclub.modules.shipper.infrastructure.rest.dto;

public record ShipperProfileRequest(
    String companyName,
    String billingEmail,
    String phoneNumber,
    String city,
    String state,
    String zipCode,
    String mcNumber,
    String usdotNumber,
    String logoUrl
) {}
```

- [ ] **Step 2: Create ShipperProfileResponse DTO**

```java
package com.freightclub.modules.shipper.infrastructure.rest.dto;

public record ShipperProfileResponse(
    String id,
    String companyName,
    String billingEmail,
    String phoneNumber,
    String city,
    String state,
    String zipCode,
    String mcNumber,
    String usdotNumber,
    String logoUrl,
    Integer completenessPercent,
    String createdAt,
    String updatedAt
) {}
```

- [ ] **Step 3: Verify DTOs created**

Both files should compile without errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/dto/
git commit -m "feat(US-713): add ShipperProfileRequest and ShipperProfileResponse DTOs"
```

---

### Task 4: ProfileIncompleteException

**Files:**
- Create: `backend/src/main/java/com/freightclub/exception/ProfileIncompleteException.java`

- [ ] **Step 1: Create custom exception**

```java
package com.freightclub.exception;

public class ProfileIncompleteException extends RuntimeException {
    public ProfileIncompleteException(String message) {
        super(message);
    }
    
    public ProfileIncompleteException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

- [ ] **Step 2: Verify exception created**

File should exist and compile.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/freightclub/exception/ProfileIncompleteException.java
git commit -m "feat(US-713): add ProfileIncompleteException"
```

---

### Task 5: ShipperProfileService Tests (Red Phase)

**Files:**
- Create: `backend/src/test/java/com/freightclub/modules/shipper/ShipperProfileServiceTest.java`

- [ ] **Step 1: Write failing test for completeness calculation (all fields)**

```java
package com.freightclub.modules.shipper;

import com.freightclub.modules.shipper.application.ShipperProfileService;
import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.ShipperProfileRepository;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShipperProfileServiceTest {

    @Mock
    private ShipperProfileRepository repository;

    private ShipperProfileService service;

    @BeforeEach
    void setup() {
        service = new ShipperProfileService(repository);
    }

    @Test
    void saveProfile_calculatesCompletenessAsHundredPercentWithAllFields() {
        // Given
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            "123456",
            "12345678",
            "https://logo.png"
        );

        // Mock repository save
        when(repository.save(any())).thenAnswer(invocation -> {
            ShipperProfile profile = invocation.getArgument(0);
            return new ShipperProfile(
                "uuid-123",
                profile.tenantId(),
                profile.companyName(),
                profile.billingEmail(),
                profile.phoneNumber(),
                profile.city(),
                profile.state(),
                profile.zipCode(),
                profile.mcNumber(),
                profile.usdotNumber(),
                profile.logoUrl(),
                100, // AC-4: all fields = 20+20+15+25+15+5 = 100
                null,
                null,
                null
            );
        });

        // When
        ShipperProfile result = service.saveProfile(request);

        // Then
        assertEquals(100, result.completenessPercent());
    }

    @Test
    void saveProfile_calculatesCompletenessAsEightyPercentWithRequiredFieldsOnly() {
        // Given
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null, // no MC
            null, // no USDOT
            null  // no logo
        );

        when(repository.save(any())).thenAnswer(invocation -> {
            ShipperProfile profile = invocation.getArgument(0);
            return new ShipperProfile(
                "uuid-123",
                profile.tenantId(),
                profile.companyName(),
                profile.billingEmail(),
                profile.phoneNumber(),
                profile.city(),
                profile.state(),
                profile.zipCode(),
                null,
                null,
                null,
                80, // AC-4: required only = 20+20+15+25 = 80
                null,
                null,
                null
            );
        });

        // When
        ShipperProfile result = service.saveProfile(request);

        // Then
        assertEquals(80, result.completenessPercent());
    }

    @Test
    void isPublishReady_returnsTrueWhenCompletenessGreaterOrEqualEighty() {
        // Given
        ShipperProfile profile = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Apex",
            "email@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            80,
            null,
            null,
            null
        );

        when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
            .thenReturn(Optional.of(profile));

        // When (mocking TenantContextHolder)
        boolean ready = service.isPublishReady();

        // Then
        assertTrue(ready);
    }

    @Test
    void isPublishReady_returnsFalseWhenCompletenessLessThanEighty() {
        // Given
        ShipperProfile profile = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Apex",
            "email@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            60, // Less than 80
            null,
            null,
            null
        );

        when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
            .thenReturn(Optional.of(profile));

        // When
        boolean ready = service.isPublishReady();

        // Then
        assertFalse(ready);
    }

    @Test
    void getCompletenessPercent_returnsProfileCompleteness() {
        // Given
        ShipperProfile profile = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Apex",
            "email@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            75,
            null,
            null,
            null
        );

        when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
            .thenReturn(Optional.of(profile));

        // When
        Integer completeness = service.getCompletenessPercent();

        // Then
        assertEquals(75, completeness);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
mvn test -Dtest=ShipperProfileServiceTest -v
```

Expected: All tests FAIL (service doesn't exist yet)

- [ ] **Step 3: Commit test file**

```bash
git add backend/src/test/java/com/freightclub/modules/shipper/ShipperProfileServiceTest.java
git commit -m "test(US-713): add ShipperProfileService unit tests (red phase)"
```

---

### Task 6: ShipperProfileService Implementation (Green Phase)

**Files:**
- Create: `backend/src/main/java/com/freightclub/modules/shipper/application/ShipperProfileService.java`

- [ ] **Step 1: Implement ShipperProfileService with completeness calculation**

```java
package com.freightclub.modules.shipper.application;

import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.ShipperProfileRepository;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.security.TenantContextHolder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class ShipperProfileService {

    private final ShipperProfileRepository repository;

    public ShipperProfileService(ShipperProfileRepository repository) {
        this.repository = repository;
    }

    @Cacheable(value = "shipper-profiles", key = "#root.targetClass.name + '.' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
    public ShipperProfile getProfile() {
        String tenantId = TenantContextHolder.getTenantId();
        return repository.findByTenantIdAndDeletedAtIsNull(tenantId)
            .orElse(null);
    }

    @CacheEvict(value = "shipper-profiles", allEntries = true)
    public ShipperProfile saveProfile(ShipperProfileRequest request) {
        String tenantId = TenantContextHolder.getTenantId();
        ShipperProfile existing = repository.findByTenantIdAndDeletedAtIsNull(tenantId).orElse(null);

        int completeness = calculateCompleteness(request);

        ShipperProfile profile = new ShipperProfile(
            existing != null ? existing.id() : UUID.randomUUID().toString(),
            tenantId,
            request.companyName(),
            request.billingEmail(),
            request.phoneNumber(),
            request.city(),
            request.state(),
            request.zipCode(),
            request.mcNumber(),
            request.usdotNumber(),
            request.logoUrl(),
            completeness,
            existing != null ? existing.createdAt() : OffsetDateTime.now(),
            OffsetDateTime.now(),
            null
        );

        return repository.save(profile);
    }

    public Integer getCompletenessPercent() {
        ShipperProfile profile = getProfile();
        return profile != null ? profile.completenessPercent() : 0;
    }

    public boolean isPublishReady() {
        return getCompletenessPercent() >= 80;
    }

    private int calculateCompleteness(ShipperProfileRequest request) {
        int total = 0;

        // Company name (20%)
        if (request.companyName() != null && !request.companyName().isBlank()) {
            total += 20;
        }

        // Billing email (20%)
        if (request.billingEmail() != null && !request.billingEmail().isBlank()) {
            total += 20;
        }

        // Phone number (15%)
        if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
            total += 15;
        }

        // Address: city + state + zip (25%)
        if (request.city() != null && !request.city().isBlank() &&
            request.state() != null && !request.state().isBlank() &&
            request.zipCode() != null && !request.zipCode().isBlank()) {
            total += 25;
        }

        // MC or USDOT number (15%)
        boolean hasMC = request.mcNumber() != null && !request.mcNumber().isBlank();
        boolean hasUSDOT = request.usdotNumber() != null && !request.usdotNumber().isBlank();
        if (hasMC || hasUSDOT) {
            total += 15;
        }

        // Company logo (5%)
        if (request.logoUrl() != null && !request.logoUrl().isBlank()) {
            total += 5;
        }

        return Math.min(total, 100);
    }
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd backend
mvn test -Dtest=ShipperProfileServiceTest -v
```

Expected: All tests PASS

- [ ] **Step 3: Commit implementation**

```bash
git add backend/src/main/java/com/freightclub/modules/shipper/application/ShipperProfileService.java
git commit -m "feat(US-713): implement ShipperProfileService with completeness calculation"
```

---

### Task 7: ShipperController REST Endpoints

**Files:**
- Create: `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/ShipperController.java`

- [ ] **Step 1: Create ShipperController with GET and POST endpoints**

```java
package com.freightclub.modules.shipper.infrastructure.rest;

import com.freightclub.modules.shipper.application.ShipperProfileService;
import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/profile")
public class ShipperController {

    private final ShipperProfileService shipperProfileService;

    public ShipperController(ShipperProfileService shipperProfileService) {
        this.shipperProfileService = shipperProfileService;
    }

    @GetMapping
    public ResponseEntity<ShipperProfileResponse> getProfile() {
        ShipperProfile profile = shipperProfileService.getProfile();
        
        if (profile == null) {
            // Return empty profile with 0% completeness
            return ResponseEntity.ok(new ShipperProfileResponse(
                null, null, null, null, null, null, null, null, null, null, 0, null, null
            ));
        }
        
        return ResponseEntity.ok(mapToResponse(profile));
    }

    @PostMapping("/company-info")
    public ResponseEntity<ShipperProfileResponse> saveProfile(@RequestBody ShipperProfileRequest request) {
        // Validation happens here (can use @Valid if needed)
        validateRequest(request);
        
        ShipperProfile saved = shipperProfileService.saveProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @PutMapping("/company-info")
    public ResponseEntity<ShipperProfileResponse> updateProfile(@RequestBody ShipperProfileRequest request) {
        validateRequest(request);
        
        ShipperProfile saved = shipperProfileService.saveProfile(request);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    private void validateRequest(ShipperProfileRequest request) {
        // Company name: required, max 120 chars
        if (request.companyName() == null || request.companyName().isBlank()) {
            throw new IllegalArgumentException("Company name is required");
        }
        if (request.companyName().length() > 120) {
            throw new IllegalArgumentException("Company name must be ≤ 120 characters");
        }

        // Billing email: required, valid format
        if (request.billingEmail() == null || request.billingEmail().isBlank()) {
            throw new IllegalArgumentException("Billing email is required");
        }
        if (!isValidEmail(request.billingEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Phone: required, US format
        if (request.phoneNumber() == null || request.phoneNumber().isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (!isValidUSPhone(request.phoneNumber())) {
            throw new IllegalArgumentException("Invalid US phone format");
        }

        // City: required
        if (request.city() == null || request.city().isBlank()) {
            throw new IllegalArgumentException("City is required");
        }

        // State: required, 2 letters
        if (request.state() == null || request.state().isBlank() || request.state().length() != 2) {
            throw new IllegalArgumentException("State must be a 2-letter code");
        }

        // ZIP: required, 5 digits
        if (request.zipCode() == null || !request.zipCode().matches("\\d{5}")) {
            throw new IllegalArgumentException("ZIP code must be 5 digits");
        }

        // MC: optional, 6-8 digits if provided
        if (request.mcNumber() != null && !request.mcNumber().isBlank() && !request.mcNumber().matches("\\d{6,8}")) {
            throw new IllegalArgumentException("MC number must be 6-8 digits");
        }

        // USDOT: optional, 6-8 digits if provided
        if (request.usdotNumber() != null && !request.usdotNumber().isBlank() && !request.usdotNumber().matches("\\d{6,8}")) {
            throw new IllegalArgumentException("USDOT number must be 6-8 digits");
        }
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    private boolean isValidUSPhone(String phone) {
        // Accept formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXXXXXXXXX
        return phone.matches("^(\\(\\d{3}\\) ?)?\\d{3}-?\\d{4}$|^\\d{10}$");
    }

    private ShipperProfileResponse mapToResponse(ShipperProfile profile) {
        return new ShipperProfileResponse(
            profile.id(),
            profile.companyName(),
            profile.billingEmail(),
            profile.phoneNumber(),
            profile.city(),
            profile.state(),
            profile.zipCode(),
            profile.mcNumber(),
            profile.usdotNumber(),
            profile.logoUrl(),
            profile.completenessPercent(),
            profile.createdAt() != null ? profile.createdAt().toString() : null,
            profile.updatedAt() != null ? profile.updatedAt().toString() : null
        );
    }
}
```

- [ ] **Step 2: Verify controller compiles**

```bash
cd backend
mvn clean compile
```

Expected: Compilation succeeds

- [ ] **Step 3: Commit controller**

```bash
git add backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/ShipperController.java
git commit -m "feat(US-713): add ShipperController with GET/POST endpoints"
```

---

### Task 8: LoadService Publish Gate

**Files:**
- Modify: `backend/src/main/java/com/freightclub/service/LoadService.java`

- [ ] **Step 1: Add test for publish gate blocking**

Add to `backend/src/test/java/com/freightclub/service/LoadServiceTest.java`:

```java
@Test
void publishLoad_throwsProfileIncompleteExceptionWhenProfileLessThanEighty() {
    // Given
    String loadId = "load-123";
    String shipperId = "shipper-123";
    ShipperProfile incompleteProfile = new ShipperProfile(
        "profile-123",
        "tenant-123",
        "Apex",
        "email@apex.com",
        null, // missing phone
        "Austin",
        "TX",
        "78701",
        null,
        null,
        null,
        60, // 60% < 80%
        null,
        null,
        null
    );

    when(shipperProfileService.getCompletenessPercent()).thenReturn(60);
    when(shipperProfileService.isPublishReady()).thenReturn(false);

    // When/Then
    ProfileIncompleteException exception = assertThrows(
        ProfileIncompleteException.class,
        () -> loadService.publishLoad(loadId, shipperId)
    );

    assertTrue(exception.getMessage().contains("60% complete"));
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
mvn test -Dtest=LoadServiceTest::publishLoad_throwsProfileIncompleteExceptionWhenProfileLessThanEighty -v
```

Expected: Test FAILS (gate not implemented yet)

- [ ] **Step 3: Modify LoadService.publishLoad() to add gate**

In `LoadService.publishLoad()` method, add this at the start (before existing publish logic):

```java
public LoadResponse publishLoad(String id, String shipperId) {
    // NEW: AC-3 - Check profile completeness before publishing
    if (!shipperProfileService.isPublishReady()) {
        Integer completeness = shipperProfileService.getCompletenessPercent();
        throw new ProfileIncompleteException(
            "Complete your company profile (currently " + completeness + "% complete) before publishing loads."
        );
    }

    // ... existing publish logic continues ...
}
```

Also add constructor injection of `ShipperProfileService`:

```java
private final ShipperProfileService shipperProfileService;

public LoadService(
    LoadRepository loadRepository,
    CarrierRepository carrierRepository,
    ShipperProfileService shipperProfileService,
    // ... other dependencies
) {
    this.loadRepository = loadRepository;
    this.carrierRepository = carrierRepository;
    this.shipperProfileService = shipperProfileService;
    // ... assign others
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
mvn test -Dtest=LoadServiceTest::publishLoad_throwsProfileIncompleteExceptionWhenProfileLessThanEighty -v
```

Expected: Test PASSES

- [ ] **Step 5: Run all LoadService tests to verify no regressions**

```bash
cd backend
mvn test -Dtest=LoadServiceTest -v
```

Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/freightclub/service/LoadService.java
git add backend/src/test/java/com/freightclub/service/LoadServiceTest.java
git commit -m "feat(US-713): add publish gate - block if profile < 80% (AC-3)"
```

---

### Task 9: Global Error Handler for ProfileIncompleteException

**Files:**
- Modify: (existing GlobalExceptionHandler or create one)

- [ ] **Step 1: Add handler for ProfileIncompleteException**

In your existing `GlobalExceptionHandler` class (or create if missing), add:

```java
@ExceptionHandler(ProfileIncompleteException.class)
@ResponseStatus(HttpStatus.BAD_REQUEST)
public ResponseEntity<ErrorResponse> handleProfileIncompleteException(ProfileIncompleteException ex) {
    ErrorResponse error = new ErrorResponse(
        "PROFILE_INCOMPLETE",
        ex.getMessage(),
        "/profile" // link to profile setup page
    );
    return ResponseEntity.badRequest().body(error);
}
```

ErrorResponse format:
```java
public record ErrorResponse(
    String code,
    String message,
    String redirectUrl
) {}
```

- [ ] **Step 2: Verify handler compiles**

```bash
cd backend
mvn clean compile
```

Expected: Compilation succeeds

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/freightclub/exception/GlobalExceptionHandler.java
git commit -m "feat(US-713): add ProfileIncompleteException global error handler"
```

---

### Task 10: Backend Integration Tests

**Files:**
- Create: `backend/src/test/java/com/freightclub/modules/shipper/ShipperControllerTest.java`

- [ ] **Step 1: Write integration tests for controller endpoints**

```java
package com.freightclub.modules.shipper;

import com.freightclub.modules.shipper.application.ShipperProfileService;
import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.rest.ShipperController;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShipperControllerTest {

    @Mock
    private ShipperProfileService service;

    private ShipperController controller;

    @org.junit.jupiter.api.BeforeEach
    void setup() {
        controller = new ShipperController(service);
    }

    @Test
    void getProfile_returns200WithProfileData() {
        // Given
        ShipperProfile profile = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            "123456",
            null,
            null,
            80,
            OffsetDateTime.now(),
            OffsetDateTime.now(),
            null
        );

        when(service.getProfile()).thenReturn(profile);

        // When
        ResponseEntity<ShipperProfileResponse> response = controller.getProfile();

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(80, response.getBody().completenessPercent());
        assertEquals("Apex Freight", response.getBody().companyName());
    }

    @Test
    void postProfile_returns201WithSavedProfile() {
        // Given
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null
        );

        ShipperProfile saved = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            80,
            OffsetDateTime.now(),
            OffsetDateTime.now(),
            null
        );

        when(service.saveProfile(request)).thenReturn(saved);

        // When
        ResponseEntity<ShipperProfileResponse> response = controller.saveProfile(request);

        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(80, response.getBody().completenessPercent());
    }

    @Test
    void postProfile_returns400WithValidationError_whenCompanyNameMissing() {
        // Given
        ShipperProfileRequest request = new ShipperProfileRequest(
            null, // missing company name
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null
        );

        // When/Then
        assertThrows(IllegalArgumentException.class, () -> controller.saveProfile(request));
    }

    @Test
    void postProfile_returns400WithValidationError_whenEmailInvalid() {
        // Given
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "invalid-email", // invalid
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null
        );

        // When/Then
        assertThrows(IllegalArgumentException.class, () -> controller.saveProfile(request));
    }

    @Test
    void postProfile_returns400WithValidationError_whenZipCodeInvalid() {
        // Given
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "1234" // only 4 digits
        );

        // When/Then
        assertThrows(IllegalArgumentException.class, () -> controller.saveProfile(request));
    }
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd backend
mvn test -Dtest=ShipperControllerTest -v
```

Expected: All tests PASS

- [ ] **Step 3: Commit tests**

```bash
git add backend/src/test/java/com/freightclub/modules/shipper/ShipperControllerTest.java
git commit -m "test(US-713): add ShipperController integration tests"
```

---

### Task 11: Run Backend Test Coverage

**Files:**
- Verify: All backend tests

- [ ] **Step 1: Run full backend test suite with JaCoCo**

```bash
cd backend
mvn verify
```

Expected: All tests pass, JaCoCo coverage ≥ 80% on modified files

- [ ] **Step 2: Check coverage report**

```bash
# Coverage report generated at: backend/target/site/jacoco/index.html
# Open in browser to verify shipper module coverage
```

Expected: ShipperProfileService, ShipperController, LoadService changes have ≥ 80% branch coverage

- [ ] **Step 3: Commit (if any fixes needed)**

If coverage is below 80%, add additional test cases and re-run. Commit any test additions.

---

## FRONTEND TASKS

### Task 12: React Query Hooks for Profile Fetching

**Files:**
- Create: `frontend/src/features/shipper/hooks/useShipperProfile.ts`
- Create: `frontend/src/features/shipper/hooks/useUpdateProfile.ts`

- [ ] **Step 1: Create useShipperProfile hook**

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface ShipperProfileResponse {
  id?: string;
  companyName?: string;
  billingEmail?: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  mcNumber?: string;
  usdotNumber?: string;
  logoUrl?: string;
  completenessPercent: number;
  createdAt?: string;
  updatedAt?: string;
}

export function useShipperProfile() {
  return useQuery<ShipperProfileResponse>({
    queryKey: ['shipper', 'profile'],
    queryFn: async () => {
      const response = await axios.get<ShipperProfileResponse>('/api/v1/profile');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
```

- [ ] **Step 2: Create useUpdateProfile hook**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner'; // or your toast library

export interface ShipperProfileRequest {
  companyName: string;
  billingEmail: string;
  phoneNumber: string;
  city: string;
  state: string;
  zipCode: string;
  mcNumber?: string;
  usdotNumber?: string;
  logoUrl?: string;
}

export function useUpdateProfile(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShipperProfileRequest) => {
      const response = await axios.post<ShipperProfileResponse>(
        '/api/v1/profile/company-info',
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.setQueryData(['shipper', 'profile'], data);
      options?.onSuccess?.();
    },
    onError: (error: AxiosError<any>) => {
      const message = error.response?.data?.message || 'Failed to save profile';
      toast.error(message);
    },
  });
}
```

- [ ] **Step 3: Verify hooks compile**

```bash
cd frontend
npm run build
```

Expected: Compilation succeeds, no TypeScript errors

- [ ] **Step 4: Commit hooks**

```bash
git add frontend/src/features/shipper/hooks/
git commit -m "feat(US-713): add useShipperProfile and useUpdateProfile hooks"
```

---

### Task 13: Zod Validation Schema and Tests

**Files:**
- Create: `frontend/src/features/shipper/components/ShipperProfileForm.tsx` (start with schema + tests)
- Create: `frontend/src/features/shipper/components/ShipperProfileForm.test.tsx`

- [ ] **Step 1: Write validation schema tests**

```typescript
// ShipperProfileForm.test.tsx
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('ShipperProfileForm Schema', () => {
  const schema = z.object({
    companyName: z.string().min(1, "Company name required").max(120),
    billingEmail: z.string().email("Invalid email"),
    phoneNumber: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Format: XXX-XXX-XXXX"),
    city: z.string().min(1, "City required"),
    state: z.string().regex(/^[A-Z]{2}$/, "Must be 2-letter state code"),
    zipCode: z.string().regex(/^\d{5}$/, "Must be 5-digit ZIP"),
    mcNumber: z.string().regex(/^\d{6,8}$/, "6–8 digits").optional().or(z.literal("")),
    usdotNumber: z.string().regex(/^\d{6,8}$/, "6–8 digits").optional().or(z.literal("")),
    logoUrl: z.string().url().optional().or(z.literal("")),
  });

  it('validates valid profile data', () => {
    const validData = {
      companyName: 'Apex Freight',
      billingEmail: 'billing@apex.com',
      phoneNumber: '512-555-0182',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      mcNumber: '123456',
      usdotNumber: '',
      logoUrl: '',
    };

    expect(() => schema.parse(validData)).not.toThrow();
  });

  it('fails when company name is empty', () => {
    const invalidData = {
      companyName: '',
      billingEmail: 'billing@apex.com',
      phoneNumber: '512-555-0182',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    };

    expect(() => schema.parse(invalidData)).toThrow();
  });

  it('fails when email is invalid', () => {
    const invalidData = {
      companyName: 'Apex Freight',
      billingEmail: 'invalid-email',
      phoneNumber: '512-555-0182',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    };

    expect(() => schema.parse(invalidData)).toThrow();
  });

  it('fails when ZIP code is not 5 digits', () => {
    const invalidData = {
      companyName: 'Apex Freight',
      billingEmail: 'billing@apex.com',
      phoneNumber: '512-555-0182',
      city: 'Austin',
      state: 'TX',
      zipCode: '1234',
    };

    expect(() => schema.parse(invalidData)).toThrow();
  });

  it('allows optional fields to be empty', () => {
    const dataWithoutOptional = {
      companyName: 'Apex Freight',
      billingEmail: 'billing@apex.com',
      phoneNumber: '512-555-0182',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      mcNumber: '',
      usdotNumber: '',
      logoUrl: '',
    };

    expect(() => schema.parse(dataWithoutOptional)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run schema validation tests**

```bash
cd frontend
npm run test -- ShipperProfileForm.test.tsx
```

Expected: All tests PASS

- [ ] **Step 3: Commit schema and tests**

```bash
git add frontend/src/features/shipper/components/ShipperProfileForm.test.tsx
git commit -m "test(US-713): add Zod schema validation tests (red phase)"
```

---

### Task 14: ShipperProfileForm Component Implementation

**Files:**
- Create: `frontend/src/features/shipper/components/ShipperProfileForm.tsx`

- [ ] **Step 1: Implement ShipperProfileForm component**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo } from 'react';
import { useShipperProfile, useUpdateProfile, ShipperProfileRequest } from '../hooks/useUpdateProfile';
import { toast } from 'sonner';

const ShipperProfileSchema = z.object({
  companyName: z.string().min(1, "Company name required").max(120),
  billingEmail: z.string().email("Invalid email"),
  phoneNumber: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Format: XXX-XXX-XXXX"),
  city: z.string().min(1, "City required"),
  state: z.string().regex(/^[A-Z]{2}$/, "Must be 2-letter state code"),
  zipCode: z.string().regex(/^\d{5}$/, "Must be 5-digit ZIP"),
  mcNumber: z.string().regex(/^\d{6,8}$/, "6–8 digits").optional().or(z.literal("")),
  usdotNumber: z.string().regex(/^\d{6,8}$/, "6–8 digits").optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

type ShipperProfileFormData = z.infer<typeof ShipperProfileSchema>;

interface ShipperProfileFormProps {
  onSuccess?: () => void;
}

export function ShipperProfileForm({ onSuccess }: ShipperProfileFormProps) {
  const { data: profile, isLoading: profileLoading } = useShipperProfile();
  const mutation = useUpdateProfile({ onSuccess });

  const form = useForm<ShipperProfileFormData>({
    resolver: zodResolver(ShipperProfileSchema),
    defaultValues: {
      companyName: '',
      billingEmail: '',
      phoneNumber: '',
      city: '',
      state: '',
      zipCode: '',
      mcNumber: '',
      usdotNumber: '',
      logoUrl: '',
    },
  });

  // Populate form with fetched profile
  useEffect(() => {
    if (profile) {
      form.reset({
        companyName: profile.companyName || '',
        billingEmail: profile.billingEmail || '',
        phoneNumber: profile.phoneNumber || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipCode || '',
        mcNumber: profile.mcNumber || '',
        usdotNumber: profile.usdotNumber || '',
        logoUrl: profile.logoUrl || '',
      });
    }
  }, [profile, form]);

  // Calculate completeness optimistically as user types
  const completeness = useMemo(() => {
    const values = form.getValues();
    let total = 0;
    if (values.companyName) total += 20;
    if (values.billingEmail) total += 20;
    if (values.phoneNumber) total += 15;
    if (values.city && values.state && values.zipCode) total += 25;
    if (values.mcNumber || values.usdotNumber) total += 15;
    if (values.logoUrl) total += 5;
    return Math.min(total, 100);
  }, [form.watch()]);

  function onSubmit(data: ShipperProfileFormData) {
    const request: ShipperProfileRequest = {
      companyName: data.companyName,
      billingEmail: data.billingEmail,
      phoneNumber: data.phoneNumber,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      mcNumber: data.mcNumber || undefined,
      usdotNumber: data.usdotNumber || undefined,
      logoUrl: data.logoUrl || undefined,
    };

    mutation.mutate(request);
  }

  if (profileLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Required Fields Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Required Information</h3>
          <div className="grid gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <input
                type="text"
                {...form.register("companyName")}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Apex Freight Solutions LLC"
              />
              {form.formState.errors.companyName && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.companyName.message}</p>
              )}
            </div>

            {/* Billing Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Billing Email *</label>
              <input
                type="email"
                {...form.register("billingEmail")}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="billing@company.com"
              />
              {form.formState.errors.billingEmail && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.billingEmail.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number * (XXX-XXX-XXXX)</label>
              <input
                type="tel"
                {...form.register("phoneNumber")}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="512-555-0182"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  {...form.register("city")}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Austin"
                />
                {form.formState.errors.city && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State * (2 letters)</label>
                <input
                  type="text"
                  {...form.register("state")}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="TX"
                />
                {form.formState.errors.state && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ZIP Code * (5 digits)</label>
                <input
                  type="text"
                  {...form.register("zipCode")}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="78701"
                />
                {form.formState.errors.zipCode && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.zipCode.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Optional Fields Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Optional Information</h3>
          <div className="grid gap-4">
            {/* MC Number */}
            <div>
              <label className="block text-sm font-medium mb-1">MC Number (6–8 digits)</label>
              <input
                type="text"
                {...form.register("mcNumber")}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="123456"
              />
              {form.formState.errors.mcNumber && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.mcNumber.message}</p>
              )}
            </div>

            {/* USDOT Number */}
            <div>
              <label className="block text-sm font-medium mb-1">USDOT Number (6–8 digits)</label>
              <input
                type="text"
                {...form.register("usdotNumber")}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="12345678"
              />
              {form.formState.errors.usdotNumber && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.usdotNumber.message}</p>
              )}
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium mb-1">Company Logo URL</label>
              <input
                type="url"
                {...form.register("logoUrl")}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://example.com/logo.png"
              />
              {form.formState.errors.logoUrl && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.logoUrl.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Completeness Progress */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold">Profile Completeness</p>
            <p className="text-lg font-bold text-blue-600">{completeness}%</p>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 80 && (
            <p className="text-xs text-gray-600 mt-2">
              You need {80 - completeness}% more to unlock load publishing.
            </p>
          )}
          {completeness >= 80 && (
            <p className="text-xs text-green-600 mt-2 font-semibold">
              ✓ Ready to publish loads!
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Run tests to verify component renders and validates**

```bash
cd frontend
npm run test -- ShipperProfileForm.test.tsx
```

Expected: All validation tests PASS, component compiles

- [ ] **Step 3: Commit component**

```bash
git add frontend/src/features/shipper/components/ShipperProfileForm.tsx
git add frontend/src/features/shipper/components/ShipperProfileForm.test.tsx
git commit -m "feat(US-713): implement ShipperProfileForm with Zod validation"
```

---

### Task 15: ProfilePage

**Files:**
- Create: `frontend/src/pages/ProfilePage.tsx`
- Create: `frontend/src/pages/ProfilePage.test.tsx`

- [ ] **Step 1: Write ProfilePage tests**

```typescript
// ProfilePage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfilePage } from './ProfilePage';

const queryClient = new QueryClient();

describe('ProfilePage', () => {
  it('renders page title and description', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Company Profile Setup')).toBeInTheDocument();
    expect(screen.getByText(/Complete your profile to unlock/)).toBeInTheDocument();
  });

  it('renders ShipperProfileForm component', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/Company Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Billing Email/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run ProfilePage tests (red)**

```bash
cd frontend
npm run test -- ProfilePage.test.tsx
```

Expected: Tests FAIL (component doesn't exist yet)

- [ ] **Step 3: Implement ProfilePage component**

```typescript
// ProfilePage.tsx
import { useShipperProfile } from '../features/shipper/hooks/useShipperProfile';
import { ShipperProfileForm } from '../features/shipper/components/ShipperProfileForm';

export function ProfilePage() {
  const { data: profile } = useShipperProfile();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Company Profile Setup</h1>
          <p className="text-gray-600">
            Complete your profile to unlock load publishing.
          </p>
        </div>

        {profile && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold mb-1">
              Current Completeness: {profile.completenessPercent}%
            </p>
            {profile.completenessPercent < 80 && (
              <p className="text-xs text-gray-700">
                You need {80 - profile.completenessPercent}% more to unlock publishing.
              </p>
            )}
            {profile.completenessPercent >= 80 && (
              <p className="text-xs text-green-700 font-semibold">
                ✓ Your profile is ready for publishing loads!
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <ShipperProfileForm
            onSuccess={() => {
              // Optionally redirect or show confirmation
              console.log('Profile saved successfully');
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd frontend
npm run test -- ProfilePage.test.tsx
```

Expected: All tests PASS

- [ ] **Step 5: Commit ProfilePage**

```bash
git add frontend/src/pages/ProfilePage.tsx
git add frontend/src/pages/ProfilePage.test.tsx
git commit -m "feat(US-713): implement ProfilePage component"
```

---

### Task 16: Add /profile Route

**Files:**
- Modify: `frontend/src/App.tsx` (or router config)

- [ ] **Step 1: Add route to ProfilePage**

In your router configuration (typically `App.tsx` or `main.tsx`), add:

```typescript
import { ProfilePage } from './pages/ProfilePage';

// Add to your route definition:
{
  path: '/profile',
  element: <ProfilePage />,
}
```

- [ ] **Step 2: Verify app compiles**

```bash
cd frontend
npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit route**

```bash
git add frontend/src/App.tsx
git commit -m "feat(US-713): add /profile route to router"
```

---

### Task 17: Dashboard Profile Banner

**Files:**
- Modify: `frontend/src/components/Dashboard.tsx`

- [ ] **Step 1: Add profile status card to Dashboard**

In `Dashboard.tsx`, import and use the hook:

```typescript
import { useShipperProfile } from '../features/shipper/hooks/useShipperProfile';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { data: profile } = useShipperProfile();

  const completenessColor =
    !profile || profile.completenessPercent === 0
      ? 'bg-red-50 border-red-200'
      : profile.completenessPercent >= 80
      ? 'bg-green-50 border-green-200'
      : profile.completenessPercent >= 50
      ? 'bg-yellow-50 border-yellow-200'
      : 'bg-red-50 border-red-200';

  const badgeColor =
    !profile || profile.completenessPercent === 0
      ? 'text-red-700'
      : profile.completenessPercent >= 80
      ? 'text-green-700'
      : profile.completenessPercent >= 50
      ? 'text-yellow-700'
      : 'text-red-700';

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Existing cards (load summary, earnings, etc.) */}

      {/* NEW: Profile Status Card */}
      <div className={`p-6 rounded-lg border ${completenessColor}`}>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Company Profile</h3>
        <p className={`text-3xl font-bold ${badgeColor} mb-1`}>
          {profile?.completenessPercent || 0}%
        </p>
        <p className="text-xs text-gray-600 mb-4">Complete</p>

        {!profile || profile.completenessPercent < 80 ? (
          <Link
            to="/profile"
            className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
          >
            Complete Profile
          </Link>
        ) : (
          <div className="text-xs font-semibold text-green-700">
            ✓ Ready to publish
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify Dashboard compiles**

```bash
cd frontend
npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit Dashboard modification**

```bash
git add frontend/src/components/Dashboard.tsx
git commit -m "feat(US-713): add profile status banner to Dashboard (AC-1)"
```

---

### Task 18: E2E Test (Playwright Golden Path)

**Files:**
- Create: `frontend/e2e/profile-setup.spec.ts`

- [ ] **Step 1: Write Playwright E2E test**

```typescript
// profile-setup.spec.ts
import { test, expect } from '@playwright/test';

test.describe('US-713: Shipper Profile Setup - Golden Path', () => {
  test('user can complete profile and unlock load publishing', async ({ page }) => {
    // Step 1: Login (assuming existing login flow)
    await page.goto('/login');
    await page.fill('[name="email"]', 'shipper@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button:has-text("Login")');

    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // Step 2: Verify dashboard shows profile card with 0% complete
    const profileCard = page.locator('text=Company Profile');
    await expect(profileCard).toBeVisible();
    const completenessText = page.locator('text=0%');
    await expect(completenessText).toBeVisible();

    // Step 3: Click "Complete Profile" button
    await page.click('text=Complete Profile');
    await page.waitForURL('/profile');

    // Step 4: Fill form with all required fields
    await page.fill('[placeholder="Apex Freight Solutions LLC"]', 'Apex Freight Solutions LLC');
    await page.fill('[placeholder="billing@company.com"]', 'billing@apexfreight.com');
    await page.fill('[placeholder="512-555-0182"]', '512-555-0182');
    await page.fill('[placeholder="Austin"]', 'Austin');
    await page.fill('[placeholder="TX"]', 'TX');
    await page.fill('[placeholder="78701"]', '78701');

    // Step 5: Verify completeness shows 80%
    const completenessDisplay = page.locator('text=Profile Completeness');
    await expect(completenessDisplay).toBeVisible();
    const eightyPercentText = page.locator('text=80%');
    await expect(eightyPercentText).toBeVisible();

    // Step 6: Submit form
    await page.click('button:has-text("Save Profile")');

    // Wait for success toast
    await expect(page.locator('text=Company profile saved')).toBeVisible();

    // Step 7: Navigate to load creation
    await page.goto('/loads/create');
    await page.waitForURL('/loads/create');

    // Step 8: Fill load form and attempt publish
    await page.fill('[name="originCity"]', 'Austin');
    await page.fill('[name="destinationCity"]', 'Houston');
    await page.fill('[name="rate"]', '2000');
    await page.click('button:has-text("Save as Draft")');

    // Step 9: Click Publish button
    await page.click('button:has-text("Publish")');

    // Step 10: Verify load is published (no error)
    await expect(page.locator('text=Load published successfully')).toBeVisible();
  });

  test('user cannot publish load if profile < 80%', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'incomplete-shipper@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL('/dashboard');

    // Partial profile (only company name + email = 40%)
    // Navigate to load create
    await page.goto('/loads/create');

    // Fill and try to publish
    await page.fill('[name="originCity"]', 'Austin');
    await page.fill('[name="destinationCity"]', 'Houston');
    await page.fill('[name="rate"]', '2000');
    await page.click('button:has-text("Save as Draft")');
    await page.click('button:has-text("Publish")');

    // Expect error message
    await expect(page.locator('text=Complete your company profile')).toBeVisible();
    await expect(page.locator('text=/profile')).toBeVisible(); // Link to profile page
  });
});
```

- [ ] **Step 2: Run E2E test**

```bash
cd frontend
npm run test:e2e -- profile-setup.spec.ts
```

Expected: Test PASSES (or fails with clear feedback on what to fix)

- [ ] **Step 3: Commit E2E test**

```bash
git add frontend/e2e/profile-setup.spec.ts
git commit -m "test(US-713): add E2E golden-path test for profile setup"
```

---

### Task 19: Frontend Test Coverage

**Files:**
- Verify: All frontend unit tests

- [ ] **Step 1: Run frontend unit tests**

```bash
cd frontend
npm run test
```

Expected: All tests PASS

- [ ] **Step 2: Check test coverage**

```bash
cd frontend
npm run test:coverage
```

Expected: Coverage ≥ 80% on shipper feature files

- [ ] **Step 3: Run E2E tests**

```bash
cd frontend
npm run test:e2e
```

Expected: All E2E tests PASS

---

## SUMMARY & VERIFICATION

### Task 20: Final Verification and Documentation

- [ ] **Step 1: Run full backend test suite**

```bash
cd backend
mvn verify
```

Expected: All tests pass, JaCoCo ≥ 80%, no failures

- [ ] **Step 2: Run frontend tests and build**

```bash
cd frontend
npm run test
npm run build
```

Expected: All tests pass, build succeeds

- [ ] **Step 3: Verify all AC criteria met**

| AC | Status | Evidence |
|----|--------|----------|
| AC-1: Dashboard banner | ✅ | Dashboard.tsx has profile card showing % complete, links to `/profile` |
| AC-2: Profile form | ✅ | ShipperProfileForm.tsx renders 9 fields, validates, saves with 201/200 |
| AC-3: Publish gate | ✅ | LoadService checks `isPublishReady()`, throws ProfileIncompleteException if < 80% |
| AC-4: Completeness calc | ✅ | ShipperProfileService calculates 20+20+15+25+15+5 = 100% (80% with required only) |
| AC-5: Multi-tenancy | ✅ | All queries filter `tenant_id` and `deleted_at IS NULL` |

- [ ] **Step 4: Create final summary commit**

```bash
git log --oneline -20  # Verify all commits
```

All commits should reference US-713 feature and follow the Red-Green-Refactor pattern.

---

## EXECUTION NOTES

- Each task is self-contained and can be tested independently
- TDD order: write failing test → implement → verify → commit
- Backend: 10 tasks, ~4–5 hours
- Frontend: 9 tasks, ~3–4 hours
- E2E: ~1 hour
- **Total: ~8–10 hours for one developer**
- For parallel work: backend and frontend can start simultaneously after Task 1 (domain setup)
