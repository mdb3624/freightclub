# BOL Pickup Attestation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a carrier/OO-side "confirm pickup" attestation step (timestamp + optional exception note/photo) that locks the platform-generated BOL as the canonical, immutable record — implementing the `/roast` council's recommendation from CHG-855 without reworking the COMPLETED US-302 shipper-side generation flow.

**Architecture:** Extend the existing legacy stack (`LoadService`, `DocumentService`, `LoadController`/`LoadBoardController` — this is where all BOL/document/pickup logic already lives; the new `modules/load` package has no document awareness and is out of scope per CHG-855). Add one new table (`bol_attestations`) and one new service (`BolAttestationService`) that plugs into the existing `markPickedUp` transition, reusing the existing BOL-photo gate, the `LoadDocument`/`DocumentType` abstraction (for the optional exception photo), and the existing `document_audit_log` audit trail.

**Tech Stack:** Spring Boot 3 / Java 21 (no Lombok), JPA/Hibernate, Flyway, PostgreSQL RLS, React 18 + TypeScript + React Query + Zod, Playwright.

## Global Constraints

- No Lombok — standard Java POJOs with manual getters/setters (`testing_standards.md`).
- All PK/FK columns `VARCHAR(36)` (matches existing `load_documents`/`loads` convention — CLAUDE.md ID Standard overrides `postgres-native.md`'s UUID-native guidance for this codebase; every existing table in this area already uses `VARCHAR(36)`).
- Every new table needs `tenant_id`, `deleted_at`, RLS (`postgres-native.md`).
- RLS policy must use `current_setting('app.current_tenant', true)` (the `missing_ok=true` form) per the fix in `.claude/learnings.md` CHG "RLS missing_ok" entry — not the older no-arg form still visible in `V20260422_11`.
- Migration filename format `VYYYYMMDD_HHmm__Description.sql`, wrapped in `DO $$ ... EXCEPTION WHEN duplicate_table/duplicate_object THEN NULL; END $$;` for idempotency (`feedback_flyway_idempotency.md`).
- 80% branch coverage (JaCoCo) on new backend code; every new interactive frontend element needs `data-testid`; new E2E golden-path spec required before sign-off (`reviewer-checklist.md`).
- Per Sequential Lock Protocol, this plan is the ARCHITECT-level technical design for candidate story **US-302-v2** (tracked in CHG-855); BA must formally add US-302-v2 to `Story_Map.md`/Jira before Task 1 begins (Task 0 below).

---

## Task 0: Story registration (BA/LIBRARIAN gate)

**Files:**
- Modify: `docs/project/Story_Map.md`
- Modify: `docs/project/Story_ID_to_Jira_Mapping.md`, `docs/project/Story_ID_to_Jira_Mapping.csv`
- Create: `docs/business/stories/US-302-v2.md`

**Interfaces:** None (documentation only) — produces the story ID `US-302-v2` that all later tasks' commit messages reference.

- [ ] **Step 1: Create the story file**

Write `docs/business/stories/US-302-v2.md` with AC drawn directly from CHG-855's Option 1:
- AC1: OO can confirm pickup with an optional exception note (free text) and optional exception photo.
- AC2: Confirming pickup creates an immutable attestation record (trucker id, timestamp, notes) tied to the load.
- AC3: The platform-generated BOL document is marked `locked` at the moment of attestation and cannot be regenerated/altered afterward.
- AC4: Shipper-side document list shows a "Locked" indicator on the BOL once attested.
- AC5: Existing BOL-photo-required gate on `markPickedUp` is preserved unchanged (this feature is additive, not a replacement).

- [ ] **Step 2: Register in Story_Map.md and Jira mapping**

Add a row: `| US-302-v2 | BOL Pickup Attestation (Carrier Confirm+Lock) | PLANNED | 3 | US-302, US-303 | ... |` next to the existing US-302/US-303 rows (`docs/project/Story_Map.md:63-64`). Add matching rows to both mapping files once the Jira ticket is created via `mcp__jira-write__jira_create_issue` (project `FREIG`).

- [ ] **Step 3: Commit**

```bash
git checkout -b feature/US-302-v2-bol-pickup-attestation
git add docs/business/stories/US-302-v2.md docs/project/Story_Map.md docs/project/Story_ID_to_Jira_Mapping.md docs/project/Story_ID_to_Jira_Mapping.csv
git commit -m "docs(US-302-v2): register BOL pickup attestation story"
```

---

## Task 1: Database migration — `bol_attestations` table + `load_documents` lock columns + new DocumentType

**Files:**
- Create: `backend/src/main/resources/db/migration/V20260714_1000__BolAttestation_US302v2.sql`
- Modify: `backend/src/main/java/com/freightclub/domain/DocumentType.java`

**Interfaces:**
- Produces: table `freightclub.bol_attestations(id, tenant_id, load_id, trucker_id, confirmed_at, exception_notes, exception_photo_document_id, created_at, deleted_at)`; new columns `freightclub.load_documents.locked BOOLEAN`, `freightclub.load_documents.locked_at TIMESTAMPTZ`; new enum constant `DocumentType.PICKUP_EXCEPTION_PHOTO`.

- [ ] **Step 1: Write the migration**

```sql
-- US-302-v2: BOL Pickup Attestation (CHG-855)
-- Adds a carrier/OO-side pickup attestation record that locks the
-- platform-generated BOL as canonical, per /roast council recommendation.

DO $$ BEGIN
  CREATE TABLE freightclub.bol_attestations (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
      load_id VARCHAR(36) NOT NULL UNIQUE REFERENCES freightclub.loads(id),
      trucker_id VARCHAR(36) NOT NULL,
      confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      exception_notes TEXT,
      exception_photo_document_id VARCHAR(36) REFERENCES freightclub.load_documents(id),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP WITH TIME ZONE
  );

  CREATE INDEX idx_bol_attestations_tenant_id ON freightclub.bol_attestations(tenant_id);
  CREATE INDEX idx_bol_attestations_load_id ON freightclub.bol_attestations(load_id);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE freightclub.load_documents ADD COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE freightclub.load_documents ADD COLUMN locked_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE freightclub.bol_attestations ENABLE ROW LEVEL SECURITY;

  CREATE POLICY bol_attestations_tenant_isolation ON freightclub.bol_attestations
      FOR ALL
      USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
```

- [ ] **Step 2: Add the new DocumentType enum constant**

`backend/src/main/java/com/freightclub/domain/DocumentType.java`:

```java
package com.freightclub.domain;

public enum DocumentType {
    BOL_GENERATED,
    BOL_PHOTO,
    POD_PHOTO,
    ISSUE_PHOTO,
    PICKUP_EXCEPTION_PHOTO
}
```

- [ ] **Step 3: Run the migration against the local test DB**

```bash
docker compose -f docker-compose.test.yml down -v
cd backend && mvn clean package -DskipTests -Djacoco.skip=true -q && cd ..
docker compose -f docker-compose.test.yml up --build -d
```

Expected: `backend-tester` logs show `Migrating schema "freightclub" to version "20260714_1000 - BolAttestation US302v2"` with no errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/resources/db/migration/V20260714_1000__BolAttestation_US302v2.sql backend/src/main/java/com/freightclub/domain/DocumentType.java
git commit -m "feat(US-302-v2): add bol_attestations table and load_documents lock columns"
```

---

## Task 2: `BolAttestation` entity + repository

**Files:**
- Create: `backend/src/main/java/com/freightclub/domain/BolAttestation.java`
- Create: `backend/src/main/java/com/freightclub/repository/BolAttestationRepository.java`
- Test: `backend/src/test/java/com/freightclub/repository/BolAttestationRepositoryTest.java`

**Interfaces:**
- Consumes: nothing new (standard JPA/Hibernate against Task 1's table).
- Produces: `BolAttestation` (getters: `getId`, `getTenantId`, `getLoadId`, `getTruckerId`, `getConfirmedAt`, `getExceptionNotes`, `getExceptionPhotoDocumentId`, `getCreatedAt`, `getDeletedAt`); `BolAttestationRepository.findByLoadIdAndDeletedAtIsNull(String loadId): Optional<BolAttestation>`; `BolAttestationRepository.existsByLoadIdAndDeletedAtIsNull(String loadId): boolean`.

- [ ] **Step 1: Write the failing repository test**

```java
package com.freightclub.repository;

import com.freightclub.domain.BolAttestation;
import com.freightclub.test.DataJpaSliceTest;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaSliceTest
class BolAttestationRepositoryTest {

    @org.springframework.beans.factory.annotation.Autowired
    private BolAttestationRepository repository;

    @Test
    void findByLoadIdAndDeletedAtIsNull_returnsAttestation() {
        BolAttestation attestation = new BolAttestation();
        attestation.setTenantId("tenant-1");
        attestation.setLoadId("load-1");
        attestation.setTruckerId("trucker-1");
        attestation.setConfirmedAt(LocalDateTime.now());
        repository.save(attestation);

        assertThat(repository.findByLoadIdAndDeletedAtIsNull("load-1")).isPresent();
        assertThat(repository.existsByLoadIdAndDeletedAtIsNull("load-1")).isTrue();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=BolAttestationRepositoryTest`
Expected: FAIL — compilation error, `BolAttestation`/`BolAttestationRepository` do not exist.

- [ ] **Step 3: Write the entity**

```java
package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bol_attestations")
public class BolAttestation {

    @Id
    @Column(columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "load_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String loadId;

    @Column(name = "trucker_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String truckerId;

    @Column(name = "confirmed_at", nullable = false)
    private LocalDateTime confirmedAt;

    @Column(name = "exception_notes", columnDefinition = "TEXT")
    private String exceptionNotes;

    @Column(name = "exception_photo_document_id", columnDefinition = "VARCHAR(36)")
    private String exceptionPhotoDocumentId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    private void assignId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getLoadId() { return loadId; }
    public void setLoadId(String loadId) { this.loadId = loadId; }
    public String getTruckerId() { return truckerId; }
    public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public String getExceptionNotes() { return exceptionNotes; }
    public void setExceptionNotes(String exceptionNotes) { this.exceptionNotes = exceptionNotes; }
    public String getExceptionPhotoDocumentId() { return exceptionPhotoDocumentId; }
    public void setExceptionPhotoDocumentId(String exceptionPhotoDocumentId) { this.exceptionPhotoDocumentId = exceptionPhotoDocumentId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
```

- [ ] **Step 4: Write the repository**

```java
package com.freightclub.repository;

import com.freightclub.domain.BolAttestation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BolAttestationRepository extends JpaRepository<BolAttestation, String> {
    Optional<BolAttestation> findByLoadIdAndDeletedAtIsNull(String loadId);
    boolean existsByLoadIdAndDeletedAtIsNull(String loadId);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=BolAttestationRepositoryTest`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/freightclub/domain/BolAttestation.java backend/src/main/java/com/freightclub/repository/BolAttestationRepository.java backend/src/test/java/com/freightclub/repository/BolAttestationRepositoryTest.java
git commit -m "feat(US-302-v2): add BolAttestation entity and repository"
```

---

## Task 3: `BolAttestationService` — create attestation + lock the BOL document

**Files:**
- Create: `backend/src/main/java/com/freightclub/service/BolAttestationService.java`
- Test: `backend/src/test/java/com/freightclub/service/BolAttestationServiceTest.java`

**Interfaces:**
- Consumes: `DocumentRepository.findByLoadIdAndDeletedAtIsNull(String): List<LoadDocument>` (existing, `DocumentRepository.java:10`); `BolAttestationRepository` (Task 2); `DocumentAuditService.logEvent(String documentId, String userId, String action, Map<String,Object> metadata)` (existing, used throughout `DocumentService.java`); `LocalStorageService.store(tenantId, loadId, DocumentType, filename, contentType, bytes): String` (existing, `DocumentService.java:64-66` shows call shape).
- Produces: `BolAttestationService.recordAttestation(String loadId, String tenantId, String truckerId, String exceptionNotes, MultipartFile exceptionPhoto): BolAttestation` — used by `LoadService` in Task 4.

- [ ] **Step 1: Write the failing test**

```java
package com.freightclub.service;

import com.freightclub.domain.BolAttestation;
import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import com.freightclub.repository.BolAttestationRepository;
import com.freightclub.repository.DocumentRepository;
import com.freightclub.modules.document.application.DocumentAuditService;
import com.freightclub.storage.LocalStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BolAttestationServiceTest {

    @Mock private BolAttestationRepository attestationRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private LocalStorageService storageService;
    @Mock private DocumentAuditService auditService;

    private BolAttestationService service;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        service = new BolAttestationService(attestationRepository, documentRepository, storageService, auditService);
    }

    @Test
    void recordAttestation_locksTheGeneratedBolDocument() {
        LoadDocument bolDoc = new LoadDocument();
        bolDoc.setId("doc-1");
        bolDoc.setDocumentType(DocumentType.BOL_GENERATED);
        when(documentRepository.findByLoadIdAndDeletedAtIsNull("load-1"))
                .thenReturn(List.of(bolDoc));
        when(attestationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        BolAttestation result = service.recordAttestation("load-1", "tenant-1", "trucker-1", null, null);

        assertThat(result.getLoadId()).isEqualTo("load-1");
        assertThat(result.getTruckerId()).isEqualTo("trucker-1");
        assertThat(bolDoc.isLocked()).isTrue();
        assertThat(bolDoc.getLockedAt()).isNotNull();
        verify(documentRepository).save(bolDoc);
    }

    @Test
    void recordAttestation_withExceptionPhoto_storesAndLinksPhoto() {
        LoadDocument bolDoc = new LoadDocument();
        bolDoc.setId("doc-1");
        bolDoc.setDocumentType(DocumentType.BOL_GENERATED);
        when(documentRepository.findByLoadIdAndDeletedAtIsNull("load-1"))
                .thenReturn(List.of(bolDoc));
        when(storageService.store(eq("tenant-1"), eq("load-1"), eq(DocumentType.PICKUP_EXCEPTION_PHOTO), anyString(), anyString(), any()))
                .thenReturn("storage-key-123");
        when(attestationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MockMultipartFile photo = new MockMultipartFile("exceptionPhoto", "damage.jpg", "image/jpeg", new byte[]{1, 2, 3});
        BolAttestation result = service.recordAttestation("load-1", "tenant-1", "trucker-1", "Two pallets damaged", photo);

        assertThat(result.getExceptionNotes()).isEqualTo("Two pallets damaged");
        assertThat(result.getExceptionPhotoDocumentId()).isNotNull();
        verify(documentRepository, times(2)).save(any(LoadDocument.class)); // exception photo doc + locked BOL doc
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=BolAttestationServiceTest`
Expected: FAIL — `BolAttestationService` does not exist; `LoadDocument.isLocked()`/`getLockedAt()` do not exist.

- [ ] **Step 3: Add `locked`/`lockedAt` fields to `LoadDocument`**

Modify `backend/src/main/java/com/freightclub/domain/LoadDocument.java` — add after the `deletedAt` field (line 53):

```java
    @Column(name = "locked", nullable = false)
    private boolean locked = false;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;
```

And add getters/setters after `setDeletedAt` (line 86):

```java
    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }
```

- [ ] **Step 4: Write `BolAttestationService`**

```java
package com.freightclub.service;

import com.freightclub.domain.BolAttestation;
import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import com.freightclub.repository.BolAttestationRepository;
import com.freightclub.repository.DocumentRepository;
import com.freightclub.modules.document.application.DocumentAuditService;
import com.freightclub.storage.LocalStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class BolAttestationService {

    private final BolAttestationRepository attestationRepository;
    private final DocumentRepository documentRepository;
    private final LocalStorageService storageService;
    private final DocumentAuditService auditService;

    public BolAttestationService(BolAttestationRepository attestationRepository,
                                  DocumentRepository documentRepository,
                                  LocalStorageService storageService,
                                  DocumentAuditService auditService) {
        this.attestationRepository = attestationRepository;
        this.documentRepository = documentRepository;
        this.storageService = storageService;
        this.auditService = auditService;
    }

    public BolAttestation recordAttestation(String loadId, String tenantId, String truckerId,
                                             String exceptionNotes, MultipartFile exceptionPhoto) {
        BolAttestation attestation = new BolAttestation();
        attestation.setTenantId(tenantId);
        attestation.setLoadId(loadId);
        attestation.setTruckerId(truckerId);
        attestation.setConfirmedAt(LocalDateTime.now());
        attestation.setExceptionNotes(exceptionNotes);

        if (exceptionPhoto != null && !exceptionPhoto.isEmpty()) {
            attestation.setExceptionPhotoDocumentId(storeExceptionPhoto(loadId, tenantId, truckerId, exceptionPhoto));
        }

        lockGeneratedBol(loadId, truckerId);

        BolAttestation saved = attestationRepository.save(attestation);
        auditService.logEvent(saved.getId(), truckerId, "CREATED",
                Map.of("type", "BOL_ATTESTATION", "hasException", exceptionNotes != null));
        return saved;
    }

    private String storeExceptionPhoto(String loadId, String tenantId, String truckerId, MultipartFile photo) {
        byte[] bytes;
        try {
            bytes = photo.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read exception photo upload", e);
        }
        String filename = photo.getOriginalFilename() != null ? photo.getOriginalFilename() : "pickup-exception.jpg";
        String contentType = photo.getContentType() != null ? photo.getContentType() : "application/octet-stream";
        String key = storageService.store(tenantId, loadId, DocumentType.PICKUP_EXCEPTION_PHOTO, filename, contentType, bytes);

        LoadDocument doc = new LoadDocument();
        doc.setTenantId(tenantId);
        doc.setLoadId(loadId);
        doc.setUploadedBy(truckerId);
        doc.setDocumentType(DocumentType.PICKUP_EXCEPTION_PHOTO);
        doc.setStorageKey(key);
        doc.setFileUrl(key);
        doc.setOriginalFilename(filename);
        doc.setContentType(contentType);
        doc.setFileSizeBytes(bytes.length);
        LoadDocument saved = documentRepository.save(doc);

        auditService.logEvent(saved.getId(), truckerId, "UPLOADED",
                Map.of("fileName", filename, "type", "PICKUP_EXCEPTION_PHOTO", "size", bytes.length));
        return saved.getId();
    }

    private void lockGeneratedBol(String loadId, String truckerId) {
        List<LoadDocument> docs = documentRepository.findByLoadIdAndDeletedAtIsNull(loadId);
        docs.stream()
                .filter(d -> d.getDocumentType() == DocumentType.BOL_GENERATED)
                .findFirst()
                .ifPresent(doc -> {
                    doc.setLocked(true);
                    doc.setLockedAt(LocalDateTime.now());
                    documentRepository.save(doc);
                    auditService.logEvent(doc.getId(), truckerId, "LOCKED",
                            Map.of("type", "BOL_GENERATED"));
                });
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=BolAttestationServiceTest`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/freightclub/domain/LoadDocument.java backend/src/main/java/com/freightclub/service/BolAttestationService.java backend/src/test/java/com/freightclub/service/BolAttestationServiceTest.java
git commit -m "feat(US-302-v2): add BolAttestationService that locks the generated BOL"
```

---

## Task 4: Wire attestation into `LoadService.markPickedUp`

**Files:**
- Modify: `backend/src/main/java/com/freightclub/service/LoadService.java:270-285`
- Modify: `backend/src/test/java/com/freightclub/service/LoadServiceTest.java:388-446`

**Interfaces:**
- Consumes: `BolAttestationService.recordAttestation(String, String, String, String, MultipartFile)` (Task 3).
- Produces: `LoadService.markPickedUp(String id, String truckerId, String exceptionNotes, MultipartFile exceptionPhoto): LoadResponse` — new signature, used by both controllers in Task 5.

- [ ] **Step 1: Update the existing `markPickedUp` tests for the new signature**

Modify the three call sites in `LoadServiceTest.java`'s `MarkPickedUp` nested class (lines 400, 414, 429, 443) to pass `null, null` for the two new params, e.g. line 400:

```java
            assertThatThrownBy(() -> loadService.markPickedUp(LOAD_ID, "trucker-1", null, null))
                    .isInstanceOf(LoadStatusTransitionException.class)
                    .hasMessageContaining("CLAIMED");
```

Apply the same `, null, null` addition at lines 414, 429, 443. Add one new test in the same nested class:

```java
        @Test
        @DisplayName("records a BOL attestation and locks the BOL on successful pickup")
        void bolPhotoPresent_recordsAttestation() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(documentService.hasBolPhoto(LOAD_ID)).thenReturn(true);
            when(loadRepository.save(any())).thenReturn(load);

            loadService.markPickedUp(LOAD_ID, "trucker-1", "Minor scuff on one pallet", null);

            verify(bolAttestationService).recordAttestation(
                    eq(LOAD_ID), eq(load.getTenantId()), eq("trucker-1"),
                    eq("Minor scuff on one pallet"), isNull());
        }
```

Add the mock field near the other `@Mock` declarations at the top of `LoadServiceTest.java` (alongside the existing `documentService` mock):

```java
    @Mock private BolAttestationService bolAttestationService;
```

And add it to the `loadService = new LoadService(...)` constructor call wherever `LoadServiceTest` builds `loadService` in `@BeforeEach` (matches whatever position `documentService` is passed in).

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=LoadServiceTest`
Expected: FAIL — compilation error (signature mismatch) and missing `bolAttestationService` constructor param.

- [ ] **Step 3: Update `LoadService`**

In `backend/src/main/java/com/freightclub/service/LoadService.java`, add the `BolAttestationService` field + constructor param (mirror however `documentService` is currently wired in), then replace lines 270-285:

```java
    public LoadResponse markPickedUp(String id, String truckerId, String exceptionNotes, MultipartFile exceptionPhoto) {
        Load load = findAssignedLoad(id, truckerId);
        if (load.getStatus() != LoadStatus.CLAIMED) {
            throw new LoadStatusTransitionException("Load must be CLAIMED to mark as picked up");
        }
        if (!documentService.hasBolPhoto(id)) {
            throw new DocumentUploadRequiredException(
                    "A BOL photo is required before marking the load as picked up. Upload a photo of the Bill of Lading first.");
        }
        bolAttestationService.recordAttestation(id, load.getTenantId(), truckerId, exceptionNotes, exceptionPhoto);
        load.setStatus(LoadStatus.IN_TRANSIT);
        load.setPickedUpAt(LocalDateTime.now());
        Load saved = loadRepository.save(load);
        writeEvent(saved, "PICKED_UP", truckerId);
        eventPublisher.publishEvent(new LoadPickedUpEvent(saved));
        return buildResponse(saved);
    }
```

Add the import: `import org.springframework.web.multipart.MultipartFile;`

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=LoadServiceTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/freightclub/service/LoadService.java backend/src/test/java/com/freightclub/service/LoadServiceTest.java
git commit -m "feat(US-302-v2): call BolAttestationService from LoadService.markPickedUp"
```

---

## Task 5: Update both `markPickedUp` controller endpoints to accept multipart attestation data

**Files:**
- Modify: `backend/src/main/java/com/freightclub/controller/LoadController.java:109-114`
- Modify: `backend/src/main/java/com/freightclub/controller/LoadBoardController.java:79-84`
- Test: `backend/src/test/java/com/freightclub/controller/LoadBoardControllerTest.java` (add case; create file per `*ControllerTest` convention if none exists for this controller yet)

**Interfaces:**
- Consumes: `LoadService.markPickedUp(String, String, String, MultipartFile)` (Task 4).
- Produces: `POST /api/v1/board/{id}/pickup` and `PATCH /api/v1/loads/{id}/pickup`, both now `consumes = MULTIPART_FORM_DATA_VALUE` with optional `exceptionNotes` (String) and `exceptionPhoto` (file) parts.

- [ ] **Step 1: Write the failing controller test**

```java
package com.freightclub.controller;

import com.freightclub.service.LoadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LoadBoardController.class)
class LoadBoardControllerPickupTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private LoadService loadService;

    @Test
    void markPickedUp_acceptsMultipartExceptionNotes() throws Exception {
        when(loadService.markPickedUp(eq("load-1"), eq("trucker-1"), eq("Damaged pallet"), any()))
                .thenReturn(null);

        RequestPostProcessor authTrucker = authentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "trucker-1", null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_TRUCKER"))));

        mockMvc.perform(multipart("/api/v1/board/load-1/pickup")
                        .param("exceptionNotes", "Damaged pallet")
                        .with(authTrucker))
                .andExpect(status().isOk());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=LoadBoardControllerPickupTest`
Expected: FAIL — 415 Unsupported Media Type (endpoint doesn't accept multipart yet) or compile error on `markPickedUp` signature.

- [ ] **Step 3: Update `LoadBoardController.java:79-84`**

```java
    @PostMapping(value = "/{id}/pickup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TRUCKER')")
    public LoadResponse markPickedUp(@PathVariable String id,
                                     @RequestParam(required = false) String exceptionNotes,
                                     @RequestPart(name = "exceptionPhoto", required = false) MultipartFile exceptionPhoto,
                                     @AuthenticationPrincipal String userId) {
        return loadService.markPickedUp(id, userId, exceptionNotes, exceptionPhoto);
    }
```

Add imports: `import org.springframework.http.MediaType;`, `import org.springframework.web.multipart.MultipartFile;`.

- [ ] **Step 4: Update `LoadController.java:109-114`** (mirror the same change, keep `@PatchMapping`)

```java
    @PatchMapping(value = "/{id}/pickup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse markPickedUp(@PathVariable String id,
                                     @RequestParam(required = false) String exceptionNotes,
                                     @RequestPart(name = "exceptionPhoto", required = false) MultipartFile exceptionPhoto,
                                     @AuthenticationPrincipal String userId) {
        return loadService.markPickedUp(id, userId, exceptionNotes, exceptionPhoto);
    }
```

Add the same two imports if not already present in this file.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=LoadBoardControllerPickupTest`
Expected: PASS

- [ ] **Step 6: Run the full backend suite (multipart + `consumes` change touches a shared endpoint)**

```bash
docker compose -f docker-compose.test.yml down -v
cd backend && mvn clean package -DskipTests -Djacoco.skip=true -q && cd ..
docker compose -f docker-compose.test.yml up --build -d
docker compose -f docker-compose.test.yml run --rm backend-tester
```

Expected: BUILD SUCCESS, all `*ControllerTest`/`*ServiceTest` suites pass, including pre-existing `LoadControllerTest`/`LoadBoardControllerTest` pickup cases (now must send multipart, not empty POST/PATCH).

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/freightclub/controller/LoadController.java backend/src/main/java/com/freightclub/controller/LoadBoardController.java backend/src/test/java/com/freightclub/controller/LoadBoardControllerPickupTest.java
git commit -m "feat(US-302-v2): accept exception notes/photo on pickup endpoints"
```

---

## Task 6: `DocumentResponse` DTO — expose `locked`/`lockedAt`

**Files:**
- Modify: `backend/src/main/java/com/freightclub/dto/DocumentResponse.java`
- Test: `backend/src/test/java/com/freightclub/dto/DocumentResponseTest.java` (create if no existing test covers `.from()`; otherwise add a case to the existing one)

**Interfaces:**
- Produces: `DocumentResponse(..., boolean locked, LocalDateTime lockedAt)` — consumed by frontend `LoadDocument` type in Task 7.

- [ ] **Step 1: Write the failing test**

```java
package com.freightclub.dto;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentResponseTest {

    @Test
    void from_includesLockedState() {
        LoadDocument doc = new LoadDocument();
        doc.setId("doc-1");
        doc.setLoadId("load-1");
        doc.setDocumentType(DocumentType.BOL_GENERATED);
        doc.setOriginalFilename("bill-of-lading.pdf");
        doc.setContentType("application/pdf");
        doc.setFileSizeBytes(100);
        doc.setUploadedBy("shipper-1");
        doc.setLocked(true);
        LocalDateTime lockedAt = LocalDateTime.now();
        doc.setLockedAt(lockedAt);

        DocumentResponse response = DocumentResponse.from(doc);

        assertThat(response.locked()).isTrue();
        assertThat(response.lockedAt()).isEqualTo(lockedAt);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=DocumentResponseTest`
Expected: FAIL — `DocumentResponse.locked()`/`.lockedAt()` do not exist.

- [ ] **Step 3: Update `DocumentResponse`**

```java
package com.freightclub.dto;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;

import java.time.LocalDateTime;

public record DocumentResponse(
        String id,
        String loadId,
        DocumentType documentType,
        String originalFilename,
        String contentType,
        long fileSizeBytes,
        String note,
        String uploadedBy,
        LocalDateTime createdAt,
        boolean locked,
        LocalDateTime lockedAt
) {
    public static DocumentResponse from(LoadDocument doc) {
        return new DocumentResponse(
                doc.getId(),
                doc.getLoadId(),
                doc.getDocumentType(),
                doc.getOriginalFilename(),
                doc.getContentType(),
                doc.getFileSizeBytes(),
                doc.getNote(),
                doc.getUploadedBy(),
                doc.getCreatedAt(),
                doc.isLocked(),
                doc.getLockedAt()
        );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=DocumentResponseTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/freightclub/dto/DocumentResponse.java backend/src/test/java/com/freightclub/dto/DocumentResponseTest.java
git commit -m "feat(US-302-v2): expose locked state on DocumentResponse"
```

---

## Task 7: Frontend — types, API client, and `useMarkPickedUp` hook

**Files:**
- Modify: `frontend/src/features/documents/types.ts`
- Modify: `frontend/src/features/loads/api.ts:95-96`
- Modify: `frontend/src/features/loads/hooks/useMarkPickedUp.ts`
- Test: `frontend/src/features/loads/hooks/useMarkPickedUp.test.ts` (create — no existing test file for this hook per the current tree)

**Interfaces:**
- Consumes: backend `DocumentResponse` (Task 6) and `POST /api/v1/board/{id}/pickup` multipart contract (Task 5).
- Produces: `loadsApi.pickup(id: string, payload?: { exceptionNotes?: string; exceptionPhoto?: File }): Promise<Load>`; `useMarkPickedUp()` mutation now called as `markPickedUp({ id, exceptionNotes, exceptionPhoto })` — this changes the call shape used in Task 8's `TruckerLoadDetailPage.tsx` update.

- [ ] **Step 1: Update `types.ts`**

```ts
export type DocumentType = 'BOL_GENERATED' | 'BOL_PHOTO' | 'POD_PHOTO' | 'ISSUE_PHOTO' | 'PICKUP_EXCEPTION_PHOTO'

export interface LoadDocument {
  id: string
  loadId: string
  documentType: DocumentType
  originalFilename: string
  contentType: string
  fileSizeBytes: number
  note: string | null
  uploadedBy: string
  createdAt: string
  locked: boolean
  lockedAt: string | null
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  BOL_GENERATED: 'Bill of Lading',
  BOL_PHOTO: 'BOL Photo',
  POD_PHOTO: 'POD Photo',
  ISSUE_PHOTO: 'Issue Report',
  PICKUP_EXCEPTION_PHOTO: 'Pickup Exception Photo',
}
```

- [ ] **Step 2: Write the failing hook test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMarkPickedUp } from './useMarkPickedUp'
import { loadsApi } from '../api'

vi.mock('../api', () => ({ loadsApi: { pickup: vi.fn() } }))

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useMarkPickedUp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes exceptionNotes and exceptionPhoto through to loadsApi.pickup', async () => {
    vi.mocked(loadsApi.pickup).mockResolvedValue({ id: 'load-1', status: 'IN_TRANSIT' } as any)
    const { result } = renderHook(() => useMarkPickedUp(), { wrapper })

    const photo = new File(['x'], 'damage.jpg', { type: 'image/jpeg' })
    result.current.mutate({ id: 'load-1', exceptionNotes: 'Damaged pallet', exceptionPhoto: photo })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(loadsApi.pickup).toHaveBeenCalledWith('load-1', { exceptionNotes: 'Damaged pallet', exceptionPhoto: photo })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/features/loads/hooks/useMarkPickedUp.test.ts`
Expected: FAIL — `useMarkPickedUp`'s current `mutationFn: (id: string) => loadsApi.pickup(id)` doesn't accept the new object shape.

- [ ] **Step 4: Update `loadsApi.pickup` (`frontend/src/features/loads/api.ts:95-96`)**

```ts
  pickup: (id: string, payload?: { exceptionNotes?: string; exceptionPhoto?: File }) => {
    const form = new FormData()
    if (payload?.exceptionNotes) form.append('exceptionNotes', payload.exceptionNotes)
    if (payload?.exceptionPhoto) form.append('exceptionPhoto', payload.exceptionPhoto)
    return apiPost<Load>(`/board/${id}/pickup`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
```

- [ ] **Step 5: Update `useMarkPickedUp.ts`**

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api'
import { loadQueryInvalidations } from '../utils/queryInvalidation'
import { useToastStore } from '@/store/toastStore'

interface MarkPickedUpInput {
  id: string
  exceptionNotes?: string
  exceptionPhoto?: File
}

export function useMarkPickedUp() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  return useMutation({
    mutationFn: ({ id, exceptionNotes, exceptionPhoto }: MarkPickedUpInput) =>
      loadsApi.pickup(id, { exceptionNotes, exceptionPhoto }),
    onSuccess: (load) => {
      loadQueryInvalidations.onPickup(queryClient, load.id)
      toast("Pickup confirmed — you're now in transit.")
    },
  })
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/features/loads/hooks/useMarkPickedUp.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/documents/types.ts frontend/src/features/loads/api.ts frontend/src/features/loads/hooks/useMarkPickedUp.ts frontend/src/features/loads/hooks/useMarkPickedUp.test.ts
git commit -m "feat(US-302-v2): thread exception notes/photo through pickup API client"
```

---

## Task 8: Frontend — pickup confirmation dialog UI (`TruckerLoadDetailPage.tsx`)

**Files:**
- Modify: `frontend/src/pages/TruckerLoadDetailPage.tsx:39, 56-67, 194-223`

**Interfaces:**
- Consumes: `useMarkPickedUp()` from Task 7 (new `{ id, exceptionNotes, exceptionPhoto }` call shape).
- Produces: two new `data-testid`s — `pickup-exception-notes` (textarea) and `pickup-exception-photo` (file input) — consumed by Task 10's E2E spec.

- [ ] **Step 1: Add local state for the exception fields (after line 39)**

```tsx
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [exceptionNotes, setExceptionNotes] = useState('')
  const [exceptionPhoto, setExceptionPhoto] = useState<File | undefined>(undefined)
```

- [ ] **Step 2: Update `confirmAction` (lines 56-67) to pass the new fields and reset them**

```tsx
  function confirmAction() {
    if (pendingAction === 'pickup') {
      markPickedUp(
        { id: load!.id, exceptionNotes: exceptionNotes.trim() || undefined, exceptionPhoto },
        { onSuccess: () => navigate('/dashboard/trucker') }
      )
    } else if (pendingAction === 'deliver') {
      markDelivered(load!.id, {
        onSuccess: () => navigate('/dashboard/trucker'),
      })
    }
    setPendingAction(null)
    setExceptionNotes('')
    setExceptionPhoto(undefined)
  }
```

- [ ] **Step 3: Add the exception-notes/photo inputs inside the pickup confirm dialog (insert before the button row at line 211, only for `pendingAction === 'pickup'`)**

```tsx
                  {pendingAction === 'pickup' && (
                    <div className="mt-3 space-y-2">
                      <label htmlFor="pickup-exception-notes" className="block text-xs font-medium text-amber-300">
                        Note any exceptions (optional) — damage, shortage, wrong count
                      </label>
                      <textarea
                        id="pickup-exception-notes"
                        data-testid="pickup-exception-notes"
                        className="w-full rounded border border-carrier-border bg-carrier-surface p-2 text-sm text-carrier-text"
                        rows={2}
                        value={exceptionNotes}
                        onChange={(e) => setExceptionNotes(e.target.value)}
                      />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        data-testid="pickup-exception-photo"
                        onChange={(e) => setExceptionPhoto(e.target.files?.[0])}
                      />
                    </div>
                  )}
```

- [ ] **Step 4: Manually verify in the browser** (full Pre-Test Protocol — see Global Constraints)

Navigate to a CLAIMED load with a BOL photo uploaded, as a TRUCKER user; click "Mark as Picked Up"; confirm the exception-notes textarea and photo input render inside the dialog; submit with and without exception data; confirm no console errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/TruckerLoadDetailPage.tsx
git commit -m "feat(US-302-v2): add exception notes/photo capture to pickup confirmation"
```

---

## Task 9: Frontend — "Locked" badge on the BOL in `DocumentSection`

**Files:**
- Modify: `frontend/src/features/documents/components/DocumentSection.tsx`
- Test: `frontend/src/features/documents/__tests__/DocumentSection.test.tsx`

**Interfaces:**
- Consumes: `LoadDocument.locked` (Task 7).
- Produces: `data-testid="bol-locked-badge"` element, rendered when a `BOL_GENERATED` document has `locked === true`.

- [ ] **Step 1: Write the failing test** (add a case to the existing `DocumentSection.test.tsx`, matching its existing render-and-assert style)

```tsx
it('shows a Locked badge on an attested BOL_GENERATED document', () => {
  const documents = [
    {
      id: 'doc-1',
      loadId: 'load-1',
      documentType: 'BOL_GENERATED',
      originalFilename: 'bill-of-lading.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: 100,
      note: null,
      uploadedBy: 'shipper-1',
      createdAt: new Date().toISOString(),
      locked: true,
      lockedAt: new Date().toISOString(),
    },
  ]

  render(<DocumentSection loadId="load-1" loadStatus="IN_TRANSIT" role="SHIPPER" documents={documents} />)

  expect(screen.getByTestId('bol-locked-badge')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/features/documents/__tests__/DocumentSection.test.tsx`
Expected: FAIL — no element with `data-testid="bol-locked-badge"` exists yet.

- [ ] **Step 3: Add the badge in `DocumentSection.tsx`**, next to wherever the document filename/row is rendered (find the row that maps over `documents` and renders `DOCUMENT_LABELS[doc.documentType]`):

```tsx
{doc.documentType === 'BOL_GENERATED' && doc.locked && (
  <span data-testid="bol-locked-badge" className="ml-2 rounded bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-400">
    Locked
  </span>
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/features/documents/__tests__/DocumentSection.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/documents/components/DocumentSection.tsx frontend/src/features/documents/__tests__/DocumentSection.test.tsx
git commit -m "feat(US-302-v2): show Locked badge on attested BOL documents"
```

---

## Task 10: E2E golden-path spec

**Files:**
- Create: `frontend/e2e/bol-pickup-attestation.spec.ts` (mirror the structure of `frontend/e2e/trucker-pod-upload.spec.ts`)

**Interfaces:**
- Consumes: `pickup-exception-notes`/`pickup-exception-photo` testids (Task 8), `bol-locked-badge` testid (Task 9), `POST /api/v1/board/{id}/pickup` multipart contract (Task 5).

- [ ] **Step 1: Write the spec**, reusing `setupCommonRoutes`/`loginAsTrucker`/`inTransitLoad` fixtures from `trucker-pod-upload.spec.ts` (copy the shared setup into the new file, changing the load fixture to `status: 'CLAIMED'` with a `BOL_PHOTO` document already present):

```ts
import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOAD_ID = 'test-load-bol-attest-001'

// ... mockAuthResponse / mockProfile / emptyPage — identical to trucker-pod-upload.spec.ts

const claimedLoad = {
  id: LOAD_ID,
  tenantId: 'tenant-1',
  shipperId: 'shipper-1',
  truckerId: 'trucker-user-1',
  status: 'CLAIMED',
  originCity: 'Dallas', originState: 'TX', originZip: '75201',
  originAddress1: '100 Main St', originAddress2: null,
  destinationCity: 'Houston', destinationState: 'TX', destinationZip: '77001',
  destinationAddress1: '200 Commerce St', destinationAddress2: null,
  distanceMiles: 240,
  pickupFrom: '2026-05-13T09:00:00', pickupTo: '2026-05-13T12:00:00',
  deliveryFrom: '2026-05-13T15:00:00', deliveryTo: '2026-05-13T17:00:00',
  commodity: 'General Freight', weightLbs: 20000,
  lengthFt: null, widthFt: null, heightFt: null,
  equipmentType: 'DRY_VAN', payRate: 2.5, payRateType: 'PER_MILE', paymentTerms: 'QUICK_PAY',
  specialRequirements: null, cancelReason: null, shipperContact: null, truckerContact: null,
  createdAt: '2026-05-12T08:00:00Z', updatedAt: '2026-05-13T09:00:00Z',
}

const bolPhotoDocument = {
  id: 'doc-bol-photo-1', loadId: LOAD_ID, documentType: 'BOL_PHOTO',
  originalFilename: 'bol-photo.png', contentType: 'image/png', fileSizeBytes: 10240,
  note: null, uploadedBy: 'trucker@test.com', createdAt: new Date().toISOString(),
  locked: false, lockedAt: null,
}

// setupCommonRoutes(page) — copy verbatim from trucker-pod-upload.spec.ts, updating
// the board-load route to serve `claimedLoad` at `**/api/v1/board/${LOAD_ID}`.
// loginAsTrucker(page) — copy verbatim.

test.describe('BOL pickup attestation — golden path', () => {
  test('confirming pickup with an exception note locks the BOL and records the attestation', async ({ page }) => {
    await setupCommonRoutes(page)

    await page.route(`**/api/v1/documents/${LOAD_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([bolPhotoDocument]) })
    )

    let pickupBody: string | null = null
    await page.route(`**/api/v1/board/${LOAD_ID}/pickup`, async (route) => {
      pickupBody = route.request().postData()
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ...claimedLoad, status: 'IN_TRANSIT' }),
      })
    })

    await loginAsTrucker(page)
    await page.goto(`/trucker/loads/${LOAD_ID}`)

    await expect(page.getByRole('button', { name: /mark as picked up/i })).toBeEnabled({ timeout: 8000 })
    await page.getByRole('button', { name: /mark as picked up/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('pickup-exception-notes').fill('Two pallets damaged on arrival')

    await page.getByRole('button', { name: /yes, i have the load/i }).click()

    await expect(page).toHaveURL(/dashboard\/trucker/, { timeout: 8000 })
    expect(pickupBody).toContain('Two pallets damaged on arrival')
  })

  test('BOL document shows Locked badge after pickup attestation', async ({ page }) => {
    await setupCommonRoutes(page)

    const lockedBol = {
      id: 'doc-bol-gen-1', loadId: LOAD_ID, documentType: 'BOL_GENERATED',
      originalFilename: 'bill-of-lading.pdf', contentType: 'application/pdf', fileSizeBytes: 5000,
      note: null, uploadedBy: 'shipper-1', createdAt: new Date().toISOString(),
      locked: true, lockedAt: new Date().toISOString(),
    }

    await page.route(`**/api/v1/documents/${LOAD_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([lockedBol, bolPhotoDocument]) })
    )

    await loginAsTrucker(page)
    await page.goto(`/trucker/loads/${LOAD_ID}`)

    await expect(page.getByTestId('bol-locked-badge')).toBeVisible({ timeout: 8000 })
  })
})
```

- [ ] **Step 2: Run the mandatory Pre-Test Protocol, then the spec**

```bash
docker compose -f docker-compose.test.yml down -v
cd backend && mvn clean package -DskipTests -Djacoco.skip=true -q && cd ..
cd frontend && npm run build && cd ..
docker compose -f docker-compose.test.yml up --build -d
cd frontend && npx playwright test bol-pickup-attestation.spec.ts
```

Expected: `2 passed` with real pass/fail output, per `reviewer-checklist.md` E2E evidence requirement. Capture a screenshot to `frontend/test-results/evidence/US-302-v2-bol-locked-badge.png`.

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/bol-pickup-attestation.spec.ts frontend/test-results/evidence/US-302-v2-bol-locked-badge.png
git commit -m "test(US-302-v2): add BOL pickup attestation E2E golden-path spec"
```

---

## Task 11: Full verification + CHG-855 closure

**Files:**
- Modify: `docs/changes/CHG-855.md` (status update)
- Modify: `.claude/learnings.md` (Technical Debt Ledger row — mark resolved)
- Modify: `docs/project/Story_Map.md` (US-302-v2 status → COMPLETED, pending REVIEWER PASS)

- [ ] **Step 1: Run the full mandatory pre-test protocol + full suites one more time**

```bash
docker compose -f docker-compose.test.yml down -v
cd backend && mvn clean package -DskipTests -Djacoco.skip=true -q && cd ..
cd frontend && npm run build && cd ..
docker compose -f docker-compose.test.yml up --build -d
docker compose -f docker-compose.test.yml run --rm backend-tester
cd frontend && npx vitest run && npx playwright test
```

Expected: backend BUILD SUCCESS with JaCoCo ≥80% branch coverage on new classes (`BolAttestationService`, `BolAttestation`, `BolAttestationRepository`); frontend unit + e2e suites green.

- [ ] **Step 2: Update `CHG-855.md` status line** from `OPEN` to:

```markdown
**Status:** CHG-855 RESOLVED — implemented via US-302-v2 (see `docs/superpowers/plans/2026-07-14-bol-pickup-attestation.md`). Option 1 delivered: OO confirm-pickup step locks the generated BOL; shipper-generated BOL remains a pre-pickup draft only.
```

- [ ] **Step 3: Update the CHG-855 Technical Debt Ledger row in `.claude/learnings.md`** — change `OPEN 2026-07-14` to `RESOLVED <today's date>` and append a one-line summary of what shipped.

- [ ] **Step 4: Commit and open PR** (per Git Branch Enforcement Protocol — never push/merge without explicit user confirmation)

```bash
git add docs/changes/CHG-855.md .claude/learnings.md docs/project/Story_Map.md
git commit -m "docs(US-302-v2): close CHG-855, mark story complete pending REVIEWER PASS"
git push origin feature/US-302-v2-bol-pickup-attestation -u
gh pr create --base main --head feature/US-302-v2-bol-pickup-attestation --title "US-302-v2: BOL Pickup Attestation (CHG-855)" --body "Implements the /roast council's recommended fix for CHG-855: adds an OO-side pickup attestation step (timestamp + optional exception note/photo) that locks the platform-generated BOL as canonical. See docs/changes/CHG-855.md and docs/superpowers/plans/2026-07-14-bol-pickup-attestation.md for full design rationale."
```

---

## Self-Review Notes

- **Spec coverage:** CHG-855 Option 1 → Tasks 1-6 (backend attestation + lock), Task 7-9 (frontend capture + display), Task 10 (E2E evidence), Task 11 (closure). US-302-v2 AC1-AC5 (Task 0) each map to a task: AC1→Task 8, AC2→Task 3, AC3→Task 3/6, AC4→Task 9, AC5→Task 4 (gate preserved unchanged, only appended to).
- **Dual-controller note:** Task 5 updates *both* `LoadController` and `LoadBoardController` because both currently route to the same `LoadService.markPickedUp` (known dual-controller debt, `.claude/learnings.md`) — the frontend only calls the `LoadBoardController` path today, but leaving `LoadController`'s copy on the old signature would break compilation immediately since both call the same service method.
- **No new domain event added deliberately:** `LoadPickedUpEvent` already fires on this transition; a distinct `BolLockedEvent` was considered but skipped as YAGNI — nothing currently subscribes to it, and the attestation row itself is the durable record. Add one later if a real consumer (e.g. Quick Pay eligibility) needs to react to the lock specifically.
