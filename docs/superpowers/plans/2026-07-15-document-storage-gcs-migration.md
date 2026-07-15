# Document Storage: GCS-Backed Production Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix CHG-856 — make document storage (BOL, BOL photo, POD photo, issue photos) actually work in production by replacing Cloud Run's ephemeral `/tmp` local-disk storage with Google Cloud Storage, and fix the `@Transient contentType` bug that 400s every document download today in every environment.

**Architecture:** Extract a `StorageService` interface from the existing `LocalStorageService`. Keep `LocalStorageService` unchanged in behavior, scoped to `@Profile({"dev","test"})` — it already works correctly on Windows and in the Docker test containers. Add a new `GcsStorageService` scoped to `@Profile("prod")`, using the `google-cloud-storage` Java client authenticating via Cloud Run's attached service account (Application Default Credentials — no key file). Persist `contentType` as a real column instead of `@Transient` so downloads work on both backends.

**Tech Stack:** Spring Boot 3 / Java 21 (no Lombok), JPA/Hibernate, Flyway, `com.google.cloud:google-cloud-storage`, Google Cloud Run + IAM.

## Global Constraints

- No Lombok — standard Java POJOs with manual getters/setters.
- Migration filename format `VYYYYMMDD_HHmm__Description.sql`, wrapped in idempotent `DO $$ ... EXCEPTION ... END $$;` blocks.
- No existing `@Profile` usage anywhere in this codebase today — this plan introduces the first instance of that pattern; keep it minimal (bean selection only, no profile-conditional business logic).
- Per `testing_standards.md`'s external-config-wiring gate: a green mocked test suite is NOT sufficient evidence the GCS wiring works — Task 5 requires an actual unmocked call against a real GCS bucket before sign-off.
- Cloud infra changes (creating the GCS bucket, granting IAM roles, changing Cloud Run env vars) are hard to reverse and affect the live production service — confirm with the user before executing the `gcloud` commands in Task 3, do not run them autonomously.
- Only one existing consumer of the storage layer: `DocumentService` (`backend/src/main/java/com/freightclub/service/DocumentService.java`), and only one existing test mocking it: `DocumentServiceTest` (`backend/src/test/java/com/freightclub/service/DocumentServiceTest.java`).

---

## Task 1: Extract `StorageService` interface, retrofit `LocalStorageService`

**Files:**
- Create: `backend/src/main/java/com/freightclub/storage/StorageService.java`
- Modify: `backend/src/main/java/com/freightclub/storage/LocalStorageService.java`
- Modify: `backend/src/main/java/com/freightclub/service/DocumentService.java` (constructor + field type only)
- Modify: `backend/src/test/java/com/freightclub/service/DocumentServiceTest.java:16,46` (import + mock field type only)

**Interfaces:**
- Produces: `StorageService.store(String tenantId, String loadId, DocumentType type, String originalFilename, String contentType, byte[] data): String` and `StorageService.retrieve(String storageKey): byte[]` — identical signatures to `LocalStorageService`'s existing public methods, so no call sites elsewhere change.

- [ ] **Step 1: Write the interface**

```java
package com.freightclub.storage;

import com.freightclub.domain.DocumentType;

public interface StorageService {
    String store(String tenantId, String loadId, DocumentType type,
                 String originalFilename, String contentType, byte[] data);

    byte[] retrieve(String storageKey);
}
```

- [ ] **Step 2: Retrofit `LocalStorageService` to implement it and scope it to dev/test**

Modify `backend/src/main/java/com/freightclub/storage/LocalStorageService.java` — add the import and change the class declaration and annotations (lines 1-19):

```java
package com.freightclub.storage;

import com.freightclub.domain.DocumentType;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
@Profile({"dev", "test"})
public class LocalStorageService implements StorageService {
```

Add `@Override` above the existing `store` (line 43) and `retrieve` (line 58) method signatures. No other changes to this file — its internals are already correct for dev/test.

- [ ] **Step 3: Update `DocumentService` to depend on the interface**

In `backend/src/main/java/com/freightclub/service/DocumentService.java`, change the import (line 15 area) from `import com.freightclub.storage.LocalStorageService;` to `import com.freightclub.storage.StorageService;`, and change the field (line 41) and constructor parameter (line 48) from `LocalStorageService storageService` to `StorageService storageService`. No other line in this file changes — all call sites (`storageService.store(...)`, `storageService.retrieve(...)`) already match the interface.

- [ ] **Step 4: Update the existing test to mock the interface**

In `backend/src/test/java/com/freightclub/service/DocumentServiceTest.java`, change line 16 from `import com.freightclub.storage.LocalStorageService;` to `import com.freightclub.storage.StorageService;`, and line 46 from `@Mock private LocalStorageService storageService;` to `@Mock private StorageService storageService;`. No other line changes — every `when(storageService...)`/`verify(storageService...)` call already matches the interface signature.

- [ ] **Step 5: Run the full backend test suite to confirm nothing else broke**

```bash
docker compose -f docker-compose.test.yml down -v
cd backend && mvn clean package -DskipTests -Djacoco.skip=true -q && cd ..
docker compose -f docker-compose.test.yml up --build -d
docker compose -f docker-compose.test.yml run --rm backend-tester
```

Expected: BUILD SUCCESS, `DocumentServiceTest` and all other suites pass unchanged (pure refactor, no behavior change).

- [ ] **Step 6: Commit**

```bash
git checkout -b feature/CHG-856-gcs-document-storage
git add backend/src/main/java/com/freightclub/storage/StorageService.java backend/src/main/java/com/freightclub/storage/LocalStorageService.java backend/src/main/java/com/freightclub/service/DocumentService.java backend/src/test/java/com/freightclub/service/DocumentServiceTest.java
git commit -m "refactor(CHG-856): extract StorageService interface, scope LocalStorageService to dev/test"
```

---

## Task 2: Fix `LoadDocument.contentType` — persist it instead of `@Transient`

**Files:**
- Create: `backend/src/main/resources/db/migration/V20260715_0900__AddContentTypeToLoadDocuments.sql`
- Modify: `backend/src/main/java/com/freightclub/domain/LoadDocument.java:39-40`
- Test: `backend/src/test/java/com/freightclub/repository/LoadDocumentContentTypeRepositoryTest.java` (create — no existing repository-level test would have caught this, since `DocumentServiceTest` mocks the repository entirely and never round-trips through real JPA/Hibernate)

**Interfaces:**
- Produces: `LoadDocument.getContentType()` now returns a value that survives a save-then-reload cycle (previously always `null` after reload). No signature change — same getter/setter as before.

- [ ] **Step 1: Write the failing test — prove contentType survives a real DB round-trip**

```java
package com.freightclub.repository;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import com.freightclub.test.DataJpaSliceTest;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaSliceTest
class LoadDocumentContentTypeRepositoryTest {

    @Autowired private DocumentRepository repository;
    @Autowired private EntityManager entityManager;

    @Test
    void contentType_survivesReloadFromDatabase() {
        LoadDocument doc = new LoadDocument();
        doc.setTenantId("tenant-1");
        doc.setLoadId("load-1");
        doc.setUploadedBy("shipper-1");
        doc.setDocumentType(DocumentType.BOL_GENERATED);
        doc.setStorageKey("tenant-1/load-1/BOL_GENERATED/x.pdf");
        doc.setFileUrl("tenant-1/load-1/BOL_GENERATED/x.pdf");
        doc.setOriginalFilename("bill-of-lading.pdf");
        doc.setContentType("application/pdf");
        doc.setFileSizeBytes(1398);
        LoadDocument saved = repository.save(doc);

        entityManager.flush();
        entityManager.clear(); // force a real reload from the DB, not the persistence context cache

        LoadDocument reloaded = repository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getContentType()).isEqualTo("application/pdf");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=LoadDocumentContentTypeRepositoryTest`
Expected: FAIL — `reloaded.getContentType()` is `null` (the current `@Transient` bug), not `"application/pdf"`.

- [ ] **Step 3: Write the migration**

```sql
-- CHG-856: persist contentType instead of @Transient (was never saved, broke every document download)
DO $$ BEGIN
  ALTER TABLE freightclub.load_documents ADD COLUMN content_type VARCHAR(100);
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;
```

- [ ] **Step 4: Update `LoadDocument.java:39-40`**

Replace:
```java
    @Transient
    private String contentType;
```
with:
```java
    @Column(name = "content_type", length = 100)
    private String contentType;
```
No getter/setter changes needed — `getContentType()`/`setContentType()` already exist unchanged.

- [ ] **Step 5: Rebuild and run test to verify it passes**

```bash
docker compose -f docker-compose.test.yml down -v
cd backend && mvn clean package -DskipTests -Djacoco.skip=true -q && cd ..
docker compose -f docker-compose.test.yml up --build -d
docker compose -f docker-compose.test.yml run --rm backend-tester
```

Run: `mvn test -Dtest=LoadDocumentContentTypeRepositoryTest` inside the tester container (or via the full suite run above).
Expected: PASS.

- [ ] **Step 6: Live-verify the actual bug is fixed** (per `verification-before-completion` — this is the exact failure mode reported live in CHG-856)

```bash
TOKEN=$(curl -s -X POST http://localhost:9091/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"shipper@test.com","password":"N1kk101!"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
LOAD_ID=$(curl -s -X POST http://localhost:9091/api/v1/loads -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"originAddress1":"123 Main St","originCity":"San Francisco","originState":"CA","originZip":"94102","destinationAddress1":"456 Industrial Blvd","destinationCity":"Detroit","destinationState":"MI","destinationZip":"48201","pickupFrom":"2026-08-01T09:00:00","pickupTo":"2026-08-01T12:00:00","deliveryFrom":"2026-08-03T15:00:00","deliveryTo":"2026-08-03T17:00:00","commodity":"General Freight","weightLbs":20000,"equipmentType":"DRY_VAN","payRate":1500,"payRateType":"FLAT_RATE"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
DOC_ID=$(curl -s http://localhost:9091/api/v1/documents/$LOAD_ID -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['id'])")
curl -s -D - -o /dev/null http://localhost:9091/api/v1/documents/file/$DOC_ID -H "Authorization: Bearer $TOKEN"
```

Expected: `HTTP/1.1 200`, `Content-Type: application/pdf` (previously `400`).

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/resources/db/migration/V20260715_0900__AddContentTypeToLoadDocuments.sql backend/src/main/java/com/freightclub/domain/LoadDocument.java backend/src/test/java/com/freightclub/repository/LoadDocumentContentTypeRepositoryTest.java
git commit -m "fix(CHG-856): persist LoadDocument.contentType instead of @Transient"
```

---

## Task 3: GCP infra setup — GCS bucket + IAM (manual, confirm with user before running)

**Files:** None (infrastructure only — no code in this task)

This task is `gcloud` commands only. **Confirm with the user before running any of these** — they create a real bucket and modify IAM bindings on the production project.

- [ ] **Step 1: Create the bucket**

```powershell
gcloud storage buckets create gs://freightclub-documents-prod --project=freight-club-495117 --location=us-central1 --uniform-bucket-level-access
```

- [ ] **Step 2: Find the Cloud Run backend service's runtime service account**

```powershell
gcloud run services describe freightclub-backend --region=us-central1 --project=freight-club-495117 --format="value(spec.template.spec.serviceAccountName)"
```

- [ ] **Step 3: Grant that service account object admin on the bucket**

```powershell
gcloud storage buckets add-iam-policy-binding gs://freightclub-documents-prod --member="serviceAccount:<SERVICE_ACCOUNT_FROM_STEP_2>" --role="roles/storage.objectAdmin"
```

- [ ] **Step 4: Report back** the bucket name and confirm IAM binding succeeded (`gcloud storage buckets get-iam-policy gs://freightclub-documents-prod`) before proceeding to Task 4.

---

## Task 4: `GcsStorageService` implementation

**Files:**
- Modify: `backend/pom.xml`
- Create: `backend/src/main/java/com/freightclub/storage/GcsStorageService.java`
- Test: `backend/src/test/java/com/freightclub/storage/GcsStorageServiceTest.java`
- Modify: `backend/src/main/resources/application-prod.yml:27-28`

**Interfaces:**
- Consumes: `StorageService` (Task 1).
- Produces: `GcsStorageService implements StorageService` — same two methods, backed by a GCS bucket instead of local disk.

- [ ] **Step 1: Add the GCS dependency**

In `backend/pom.xml`, add to `<dependencyManagement><dependencies>` (after the existing `postgresql` entry, line 33):

```xml
            <dependency>
                <groupId>com.google.cloud</groupId>
                <artifactId>libraries-bom</artifactId>
                <version>26.43.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
```

And add to the main `<dependencies>` block (after the `spring-boot-starter-validation` entry, line 55):

```xml
        <dependency>
            <groupId>com.google.cloud</groupId>
            <artifactId>google-cloud-storage</artifactId>
        </dependency>
```

- [ ] **Step 2: Write the failing test**

```java
package com.freightclub.storage;

import com.freightclub.domain.DocumentType;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GcsStorageServiceTest {

    @Mock private Storage storage;

    @Test
    void store_writesToBucketWithTenantScopedKey() {
        GcsStorageService service = new GcsStorageService(storage, "freightclub-documents-prod");
        byte[] data = {1, 2, 3};

        String key = service.store("tenant-1", "load-1", DocumentType.BOL_GENERATED, "bill-of-lading.pdf", "application/pdf", data);

        assertThat(key).startsWith("tenant-1/load-1/BOL_GENERATED/");
        assertThat(key).endsWith(".pdf");
    }

    @Test
    void retrieve_readsBytesFromBucket() {
        GcsStorageService service = new GcsStorageService(storage, "freightclub-documents-prod");
        Blob blob = org.mockito.Mockito.mock(Blob.class);
        when(blob.getContent()).thenReturn(new byte[]{9, 9, 9});
        when(storage.get(any(BlobId.class))).thenReturn(blob);

        byte[] result = service.retrieve("tenant-1/load-1/BOL_GENERATED/x.pdf");

        assertThat(result).containsExactly(9, 9, 9);
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && mvn test -Dtest=GcsStorageServiceTest`
Expected: FAIL — compilation error, `GcsStorageService` does not exist.

- [ ] **Step 4: Write `GcsStorageService`**

```java
package com.freightclub.storage;

import com.freightclub.domain.DocumentType;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@Profile("prod")
public class GcsStorageService implements StorageService {

    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png",  ".png",
            "image/webp", ".webp",
            "application/pdf", ".pdf"
    );

    private final Storage storage;
    private final String bucketName;

    public GcsStorageService(@Value("${app.storage.gcs-bucket}") String bucketName) {
        this(StorageOptions.getDefaultInstance().getService(), bucketName);
    }

    GcsStorageService(Storage storage, String bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
    }

    @Override
    public String store(String tenantId, String loadId, DocumentType type,
                         String originalFilename, String contentType, byte[] data) {
        String ext = EXTENSIONS.getOrDefault(contentType, ".bin");
        String key = tenantId + "/" + loadId + "/" + type.name() + "/" + UUID.randomUUID() + ext;
        BlobId blobId = BlobId.of(bucketName, key);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(contentType).build();
        storage.create(blobInfo, data);
        return key;
    }

    @Override
    public byte[] retrieve(String storageKey) {
        if (storageKey == null || storageKey.isEmpty() || storageKey.contains("..")) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        Blob blob = storage.get(BlobId.of(bucketName, storageKey));
        if (blob == null) {
            throw new IllegalStateException("Object not found in GCS: " + storageKey);
        }
        return blob.getContent();
    }
}
```

The public single-arg constructor is what Spring uses at runtime (reads the bucket name from config and builds the real `Storage` client via Application Default Credentials — this is what authenticates automatically using the Cloud Run service account from Task 3, no key file needed). The package-private two-arg constructor is what the test uses to inject a mock `Storage`.

- [ ] **Step 5: Add the bucket name property to `application-prod.yml`**

Replace `backend/src/main/resources/application-prod.yml:27-28`:
```yaml
  storage:
    local-path: /tmp/freightclub-uploads
```
with:
```yaml
  storage:
    gcs-bucket: ${GCS_BUCKET_NAME:freightclub-documents-prod}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && mvn test -Dtest=GcsStorageServiceTest`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/pom.xml backend/src/main/java/com/freightclub/storage/GcsStorageService.java backend/src/test/java/com/freightclub/storage/GcsStorageServiceTest.java backend/src/main/resources/application-prod.yml
git commit -m "feat(CHG-856): add GcsStorageService for production document storage"
```

---

## Task 5: Deploy and verify against the real bucket (no mocks)

**Files:**
- Modify: `docker-compose.prod.yml` (remove the dead `STORAGE_PATH`/`uploads_data` volume, since GCS replaces local disk in prod)

Per `testing_standards.md`'s external-config-wiring gate, a green mocked `GcsStorageServiceTest` is not evidence the real wiring works — this task requires an actual unmocked call.

- [ ] **Step 1: Remove the now-dead local-storage config from `docker-compose.prod.yml`**

Delete `STORAGE_PATH: /app/uploads` (line 33), the `volumes: - uploads_data:/app/uploads` block (lines 34-35), and the top-level `volumes: uploads_data:` block (lines 44-45) from `docker-compose.prod.yml`. (Note: confirm with the user first whether this file is still used for anything, given real production deploys via Cloud Run per `/start prod` and this file may be legacy — if so, flag it as a candidate for deletion entirely rather than partial edit, but that's a separate decision from this CHG.)

- [ ] **Step 2: Deploy to Cloud Run with the new env var**

```powershell
gcloud run deploy freightclub-backend --image=us-central1-docker.pkg.dev/freight-club-495117/freightclub-repo/freightclub-backend:latest --region=us-central1 --project=freight-club-495117 --set-env-vars="GCS_BUCKET_NAME=freightclub-documents-prod" --platform=managed --quiet
```

- [ ] **Step 3: Hit the live production endpoint with a real request and paste the actual response** (per `testing_standards.md` — required before sign-off, not optional)

```powershell
$token = (Invoke-RestMethod -Uri "https://freightclub-backend-<url>/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"<real-shipper-account>","password":"<password>"}').accessToken
$load = Invoke-RestMethod -Uri "https://freightclub-backend-<url>/api/v1/loads" -Method Post -Headers @{Authorization="Bearer $token"} -ContentType "application/json" -Body '{...}'
$docs = Invoke-RestMethod -Uri "https://freightclub-backend-<url>/api/v1/documents/$($load.id)" -Headers @{Authorization="Bearer $token"}
Invoke-WebRequest -Uri "https://freightclub-backend-<url>/api/v1/documents/file/$($docs[0].id)" -Headers @{Authorization="Bearer $token"} -OutFile bol-test.pdf
```

Expected: the downloaded `bol-test.pdf` opens as a valid PDF. Paste the actual HTTP status/headers into the PR, per the mandatory external-config verification gate.

- [ ] **Step 4: Confirm the object actually landed in the bucket** (not just that the API call succeeded)

```powershell
gcloud storage ls gs://freightclub-documents-prod/ --recursive --project=freight-club-495117
```

- [ ] **Step 5: Commit**

```bash
git add docker-compose.prod.yml
git commit -m "chore(CHG-856): remove dead local-storage config from docker-compose.prod.yml"
```

---

## Task 6: Close out CHG-856

**Files:**
- Modify: `docs/changes/CHG-856.md`
- Modify: `.claude/learnings.md`

- [ ] **Step 1: Update `CHG-856.md` status**

```markdown
**Status:** CHG-856 RESOLVED — GCS-backed storage shipped for production; `LoadDocument.contentType` now persisted. Verified via real (unmocked) GCS upload/download against `gs://freightclub-documents-prod` in Cloud Run. See `docs/superpowers/plans/2026-07-15-document-storage-gcs-migration.md`.
```

- [ ] **Step 2: Update the CHG-856 row in `.claude/learnings.md`'s Technical Debt Ledger** from `OPEN 2026-07-14` to `RESOLVED <date>`, with a one-line summary of the fix.

- [ ] **Step 3: Commit, push, open PR**

```bash
git add docs/changes/CHG-856.md .claude/learnings.md
git commit -m "docs(CHG-856): close out document storage migration"
git push origin feature/CHG-856-gcs-document-storage -u
gh pr create --base main --head feature/CHG-856-gcs-document-storage --title "CHG-856: GCS-backed document storage for production" --body "Fixes ephemeral /tmp storage on Cloud Run and the @Transient contentType bug that 400'd every document download. See docs/changes/CHG-856.md for root-cause detail and docs/superpowers/plans/2026-07-15-document-storage-gcs-migration.md for the implementation plan."
```

---

## Self-Review Notes

- **Spec coverage:** CHG-856 lists two root causes (contentType persistence, ephemeral prod storage) — Task 2 fixes the first, Tasks 3-5 fix the second. Both are independently testable and independently valuable (Task 2 alone already fixes downloads in dev/test/Docker; Tasks 3-5 fix the production-only ephemeral-storage risk).
- **Sequencing relative to CHG-855:** this plan should land before or alongside CHG-855's BOL pickup-attestation work, since attestation-locking a BOL that can't be downloaded (Task 2's bug) or that may vanish on the next Cloud Run recycle (Tasks 3-5's fix) would be unverifiable and low-value until this ships.
- **No behavior change for dev/test:** Task 1 is a pure interface extraction — `LocalStorageService`'s internals, the Docker test environment, and every existing passing test are untouched aside from the mechanical type-rename in Task 1 Steps 3-4.
- **Type/signature consistency check:** `StorageService.store(...)` and `.retrieve(...)` signatures are identical across `LocalStorageService` (Task 1) and `GcsStorageService` (Task 4) — verified against the actual current `LocalStorageService.java` source, not assumed.
