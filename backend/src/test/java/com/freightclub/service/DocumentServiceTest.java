package com.freightclub.service;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadDocument;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.User;
import com.freightclub.dto.DocumentResponse;
import com.freightclub.exception.DocumentNotFoundException;
import com.freightclub.exception.DocumentUploadRequiredException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.repository.DocumentRepository;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.storage.LocalStorageService;
import com.freightclub.modules.document.application.DocumentAuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DocumentService")
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private LoadRepository loadRepository;
    @Mock private UserRepository userRepository;
    @Mock private LocalStorageService storageService;
    @Mock private BolGeneratorService bolGeneratorService;
    @Mock private DocumentAuditService auditService;

    @InjectMocks
    private DocumentService documentService;

    private static final String LOAD_ID    = "load-1";
    private static final String TRUCKER_ID = "trucker-1";
    private static final String TENANT_ID  = "tenant-1";

    @BeforeEach
    void setUp() {
        TenantContextHolder.setTenantId(TENANT_ID);
    }

    private Load buildLoad(LoadStatus status) {
        Load load = new Load();
        load.setTenantId(TENANT_ID);
        load.setStatus(status);
        load.setTruckerId(TRUCKER_ID);
        // id field is private with no setter — use reflection
        org.springframework.test.util.ReflectionTestUtils.setField(load, "id", LOAD_ID);
        return load;
    }

    // ── File validation ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("validateImageFile (via uploadBolPhoto)")
    class FileValidation {

        @Test
        @DisplayName("rejects file larger than 25 MB")
        void shouldRejectFileLargerThan25MB() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            byte[] bigFile = new byte[26 * 1024 * 1024];
            MockMultipartFile file = new MockMultipartFile(
                    "file", "bol.jpg", "image/jpeg", bigFile);

            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("25 MB");
        }

        @Test
        @DisplayName("rejects non-image content type")
        void shouldRejectNonImageFile() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile(
                    "file", "bol.exe", "application/octet-stream", new byte[100]);

            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("JPEG");
        }

        @Test
        @DisplayName("rejects PDF (not an image type)")
        void shouldRejectPdfFile() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile(
                    "file", "bol.pdf", "application/pdf", new byte[100]);

            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("JPEG");
        }

        @Test
        @DisplayName("rejects empty file")
        void shouldRejectEmptyFile() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile(
                    "file", "bol.jpg", "image/jpeg", new byte[0]);

            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("required");
        }

        @Test
        @DisplayName("accepts file at exactly 25 MB")
        void shouldAcceptFileAtExactSizeLimit() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), any(), any(), any()))
                    .thenReturn("storage/photo.jpg");
            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setOriginalFilename("photo.jpg");
            saved.setFileSizeBytes(25 * 1024 * 1024L);
            when(documentRepository.save(any())).thenReturn(saved);

            byte[] exactLimit = new byte[25 * 1024 * 1024];
            MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", exactLimit);
            assertThatNoException().isThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file));
        }

        @Test
        @DisplayName("rejects file one byte over 25 MB")
        void shouldRejectFileOneByteOverSizeLimit() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            byte[] overLimit = new byte[25 * 1024 * 1024 + 1];
            MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", overLimit);
            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("accepts WebP file")
        void shouldAcceptWebpFile() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), any(), any(), any()))
                    .thenReturn("storage/delivery.webp");
            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setOriginalFilename("delivery.webp");
            saved.setFileSizeBytes(1000L);
            when(documentRepository.save(any())).thenReturn(saved);

            MockMultipartFile file = new MockMultipartFile("file", "delivery.webp", "image/webp", new byte[1000]);
            assertThatNoException().isThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file));
        }
    }

    // ── BOL photo upload ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("uploadBolPhoto")
    class BolPhotoUpload {

        @Test
        @DisplayName("saves document record after valid upload")
        void shouldSaveDocumentRecordAfterUpload() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), any(), any(), any()))
                    .thenReturn("storage/bol.jpg");

            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setDocumentType(DocumentType.BOL_PHOTO);
            saved.setLoadId(LOAD_ID);
            saved.setOriginalFilename("bol.jpg");
            saved.setFileSizeBytes(500L);
            when(documentRepository.save(any())).thenReturn(saved);

            MockMultipartFile file = new MockMultipartFile(
                    "file", "bol.jpg", "image/jpeg", new byte[500]);

            DocumentResponse result = documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file);

            assertThat(result).isNotNull();
            verify(documentRepository).save(any(LoadDocument.class));
            verify(storageService).store(eq(TENANT_ID), eq(LOAD_ID),
                    eq(DocumentType.BOL_PHOTO), any(), eq("image/jpeg"), any());
        }

        @Test
        @DisplayName("rejects BOL upload when load is not CLAIMED")
        void shouldRejectBolUploadWhenNotClaimed() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile(
                    "file", "bol.jpg", "image/jpeg", new byte[100]);

            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(DocumentUploadRequiredException.class)
                    .hasMessageContaining("CLAIMED");
        }
    }

    // ── POD photo upload ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("uploadPodPhoto")
    class PodPhotoUpload {

        @Test
        @DisplayName("saves document record after valid POD upload")
        void shouldSaveDocumentRecordAfterPodUpload() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), any(), any(), any()))
                    .thenReturn("storage/pod.jpg");

            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setDocumentType(DocumentType.POD_PHOTO);
            saved.setLoadId(LOAD_ID);
            saved.setOriginalFilename("pod.jpg");
            saved.setFileSizeBytes(600L);
            when(documentRepository.save(any())).thenReturn(saved);

            MockMultipartFile file = new MockMultipartFile(
                    "file", "pod.jpg", "image/jpeg", new byte[600]);

            DocumentResponse result = documentService.uploadPodPhoto(LOAD_ID, TRUCKER_ID, file);

            assertThat(result).isNotNull();
            verify(documentRepository).save(any(LoadDocument.class));
            verify(storageService).store(eq(TENANT_ID), eq(LOAD_ID),
                    eq(DocumentType.POD_PHOTO), any(), eq("image/jpeg"), any());
        }

        @Test
        @DisplayName("rejects POD upload when load is not IN_TRANSIT")
        void shouldRejectPodUploadWhenNotInTransit() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile(
                    "file", "pod.jpg", "image/jpeg", new byte[100]);

            assertThatThrownBy(() -> documentService.uploadPodPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(DocumentUploadRequiredException.class)
                    .hasMessageContaining("IN_TRANSIT");
        }
    }

    // ── Document listing ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("getLoadDocuments")
    class DocumentListing {

        @Test
        @DisplayName("returns all documents for a load")
        void shouldListDocumentsByLoadId() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setShipperId("shipper-1");
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            LoadDocument doc1 = new LoadDocument();
            doc1.setDocumentType(DocumentType.BOL_PHOTO);
            doc1.setLoadId(LOAD_ID);
            doc1.setFileSizeBytes(100L);

            LoadDocument doc2 = new LoadDocument();
            doc2.setDocumentType(DocumentType.POD_PHOTO);
            doc2.setLoadId(LOAD_ID);
            doc2.setFileSizeBytes(200L);

            when(documentRepository.findByLoadIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(List.of(doc1, doc2));

            List<DocumentResponse> docs = documentService.getLoadDocuments(LOAD_ID, TRUCKER_ID);

            assertThat(docs).hasSize(2);
        }
    }

    // ── hasPodPhoto / hasBolPhoto ────────────────────────────────────────────

    @Nested
    @DisplayName("hasPodPhoto / hasBolPhoto")
    class DocumentPresenceChecks {

        @Test
        @DisplayName("hasPodPhoto returns true when POD exists")
        void hasPodReturnsTrueWhenPodExists() {
            when(documentRepository.existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(
                    LOAD_ID, DocumentType.POD_PHOTO)).thenReturn(true);

            assertThat(documentService.hasPodPhoto(LOAD_ID)).isTrue();
        }

        @Test
        @DisplayName("hasPodPhoto returns false when no POD")
        void hasPodReturnsFalseWhenNoPod() {
            when(documentRepository.existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(
                    LOAD_ID, DocumentType.POD_PHOTO)).thenReturn(false);

            assertThat(documentService.hasPodPhoto(LOAD_ID)).isFalse();
        }

        @Test
        @DisplayName("hasBolPhoto returns true when BOL photo exists")
        void hasBolReturnsTrueWhenBolExists() {
            when(documentRepository.existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(
                    LOAD_ID, DocumentType.BOL_PHOTO)).thenReturn(true);

            assertThat(documentService.hasBolPhoto(LOAD_ID)).isTrue();
        }

        @Test
        @DisplayName("hasBolPhoto returns false when no BOL photo")
        void hasBolReturnsFalseWhenNoBol() {
            when(documentRepository.existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(
                    LOAD_ID, DocumentType.BOL_PHOTO)).thenReturn(false);

            assertThat(documentService.hasBolPhoto(LOAD_ID)).isFalse();
        }
    }

    // ── requireAssignedLoad error paths ──────────────────────────────────────

    @Nested
    @DisplayName("requireAssignedLoad")
    class RequireAssignedLoad {

        @Test
        @DisplayName("throws LoadNotFoundException when load does not exist")
        void throwsWhenLoadNotFound() {
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.empty());

            MockMultipartFile file = new MockMultipartFile(
                    "file", "bol.jpg", "image/jpeg", new byte[100]);

            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(LoadNotFoundException.class);
        }

        @Test
        @DisplayName("throws LoadNotFoundException when truckerId does not match load")
        void throwsWhenTruckerIdMismatch() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("different-trucker");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile(
                    "file", "bol.jpg", "image/jpeg", new byte[100]);

            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    // ── requireAccessToLoad error paths ──────────────────────────────────────

    @Nested
    @DisplayName("requireAccessToLoad")
    class RequireAccessToLoad {

        @Test
        @DisplayName("throws LoadNotFoundException when load not found by tenant")
        void throwsWhenLoadNotFoundForTenant() {
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> documentService.getLoadDocuments(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }

        @Test
        @DisplayName("throws LoadNotFoundException when requester is neither shipper nor trucker")
        void throwsWhenRequesterIsUnauthorized() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setShipperId("shipper-1");
            // truckerId is already TRUCKER_ID from buildLoad; pass a different requester
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> documentService.getLoadDocuments(LOAD_ID, "unauthorized-user"))
                    .isInstanceOf(LoadNotFoundException.class);
        }

        @Test
        @DisplayName("shipper can access load documents")
        void shipperCanAccessLoadDocuments() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setShipperId("shipper-1");
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(documentRepository.findByLoadIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(List.of());

            assertThatNoException().isThrownBy(
                    () -> documentService.getLoadDocuments(LOAD_ID, "shipper-1"));
        }
    }

    // ── reportIssue branches ──────────────────────────────────────────────────

    @Nested
    @DisplayName("reportIssue")
    class ReportIssue {

        @Test
        @DisplayName("throws when description is null")
        void throwsWhenDescriptionNull() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> documentService.reportIssue(LOAD_ID, TRUCKER_ID, null, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("description is required");
        }

        @Test
        @DisplayName("throws when description is blank")
        void throwsWhenDescriptionBlank() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> documentService.reportIssue(LOAD_ID, TRUCKER_ID, "   ", null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("description is required");
        }

        @Test
        @DisplayName("saves text-only report when photo is null")
        void savesTextOnlyReportWhenPhotoNull() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setOriginalFilename("issue-report.txt");
            saved.setFileSizeBytes(10L);
            when(documentRepository.save(any())).thenReturn(saved);

            assertThatNoException().isThrownBy(
                    () -> documentService.reportIssue(LOAD_ID, TRUCKER_ID, "cargo damaged", null));

            verify(storageService, never()).store(any(), any(), any(), any(), any(), any());
            verify(documentRepository).save(any(LoadDocument.class));
        }

        @Test
        @DisplayName("saves text-only report when photo is empty MultipartFile")
        void savesTextOnlyReportWhenPhotoEmpty() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setOriginalFilename("issue-report.txt");
            saved.setFileSizeBytes(10L);
            when(documentRepository.save(any())).thenReturn(saved);

            MockMultipartFile emptyPhoto = new MockMultipartFile(
                    "photo", "issue.jpg", "image/jpeg", new byte[0]);

            assertThatNoException().isThrownBy(
                    () -> documentService.reportIssue(LOAD_ID, TRUCKER_ID, "scratched surface", emptyPhoto));

            verify(storageService, never()).store(any(), any(), any(), any(), any(), any());
        }

        @Test
        @DisplayName("stores photo and saves document when valid photo provided")
        void storesPhotoWhenValid() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), any(), any(), any()))
                    .thenReturn("storage/issue.jpg");
            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setOriginalFilename("issue.jpg");
            saved.setFileSizeBytes(200L);
            when(documentRepository.save(any())).thenReturn(saved);

            MockMultipartFile photo = new MockMultipartFile(
                    "photo", "issue.jpg", "image/jpeg", new byte[200]);

            assertThatNoException().isThrownBy(
                    () -> documentService.reportIssue(LOAD_ID, TRUCKER_ID, "spilled cargo", photo));

            verify(storageService).store(eq(TENANT_ID), eq(LOAD_ID),
                    eq(DocumentType.ISSUE_PHOTO), any(), eq("image/jpeg"), any());
        }

        @Test
        @DisplayName("rejects issue photo with invalid file type")
        void rejectsInvalidPhotoType() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            MockMultipartFile photo = new MockMultipartFile(
                    "photo", "issue.pdf", "application/pdf", new byte[100]);

            assertThatThrownBy(() ->
                    documentService.reportIssue(LOAD_ID, TRUCKER_ID, "cargo damaged", photo))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("JPEG");
        }
    }

    // ── getDocumentContent branches ───────────────────────────────────────────

    @Nested
    @DisplayName("getDocumentContent")
    class GetDocumentContent {

        @Test
        @DisplayName("throws DocumentNotFoundException when document does not exist")
        void throwsWhenDocumentNotFound() {
            when(documentRepository.findById("missing-doc")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> documentService.getDocumentContent("missing-doc", TRUCKER_ID))
                    .isInstanceOf(DocumentNotFoundException.class);
        }

        @Test
        @DisplayName("returns text content when storageKey is empty (text-only issue report)")
        void returnsTextContentWhenStorageKeyEmpty() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setShipperId("shipper-1");

            LoadDocument doc = new LoadDocument();
            doc.setId("doc-1");
            doc.setLoadId(LOAD_ID);
            doc.setStorageKey("");
            doc.setNote("broken pallet");
            doc.setOriginalFilename("issue-report.txt");
            doc.setContentType("text/plain");
            doc.setDocumentType(DocumentType.ISSUE_PHOTO);

            when(documentRepository.findById("doc-1")).thenReturn(Optional.of(doc));
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            DocumentService.DocumentContent content =
                    documentService.getDocumentContent("doc-1", TRUCKER_ID);

            assertThat(content.contentType()).isEqualTo("text/plain");
            assertThat(new String(content.bytes())).isEqualTo("broken pallet");
            verify(storageService, never()).retrieve(any());
        }

        @Test
        @DisplayName("returns text content with empty string when note is null")
        void returnsEmptyTextWhenNoteNull() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setShipperId("shipper-1");

            LoadDocument doc = new LoadDocument();
            doc.setId("doc-2");
            doc.setLoadId(LOAD_ID);
            doc.setStorageKey("");
            doc.setNote(null);
            doc.setOriginalFilename("issue-report.txt");
            doc.setContentType("text/plain");
            doc.setDocumentType(DocumentType.ISSUE_PHOTO);

            when(documentRepository.findById("doc-2")).thenReturn(Optional.of(doc));
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            DocumentService.DocumentContent content =
                    documentService.getDocumentContent("doc-2", TRUCKER_ID);

            assertThat(new String(content.bytes())).isEmpty();
            verify(storageService, never()).retrieve(any());
        }

        @Test
        @DisplayName("retrieves bytes from storage when storageKey is non-empty")
        void retrievesBytesFromStorageWhenKeyPresent() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setShipperId("shipper-1");

            LoadDocument doc = new LoadDocument();
            doc.setId("doc-3");
            doc.setLoadId(LOAD_ID);
            doc.setStorageKey("storage/bol.jpg");
            doc.setOriginalFilename("bol.jpg");
            doc.setContentType("image/jpeg");
            doc.setDocumentType(DocumentType.BOL_PHOTO);

            when(documentRepository.findById("doc-3")).thenReturn(Optional.of(doc));
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(storageService.retrieve("storage/bol.jpg")).thenReturn(new byte[]{1, 2, 3});

            DocumentService.DocumentContent content =
                    documentService.getDocumentContent("doc-3", TRUCKER_ID);

            assertThat(content.bytes()).containsExactly(1, 2, 3);
            assertThat(content.contentType()).isEqualTo("image/jpeg");
            verify(storageService).retrieve("storage/bol.jpg");
        }
    }

    // ── isOwner branches ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("isOwner")
    class IsOwner {

        @Test
        @DisplayName("returns false when document not found")
        void returnsFalseWhenDocumentAbsent() {
            when(documentRepository.findById("no-doc")).thenReturn(Optional.empty());
            assertThat(documentService.isOwner("no-doc")).isFalse();
        }

        @Test
        @DisplayName("returns true when document tenantId matches context")
        void returnsTrueWhenTenantMatches() {
            LoadDocument doc = new LoadDocument();
            doc.setTenantId(TENANT_ID);
            when(documentRepository.findById("doc-ok")).thenReturn(Optional.of(doc));

            assertThat(documentService.isOwner("doc-ok")).isTrue();
        }

        @Test
        @DisplayName("returns false when document tenantId does not match context")
        void returnsFalseWhenTenantMismatch() {
            LoadDocument doc = new LoadDocument();
            doc.setTenantId("other-tenant");
            when(documentRepository.findById("doc-mismatch")).thenReturn(Optional.of(doc));

            assertThat(documentService.isOwner("doc-mismatch")).isFalse();
        }
    }

    // ── resolveContentType fallback ───────────────────────────────────────────

    @Nested
    @DisplayName("resolveContentType fallback (via uploadBolPhoto)")
    class ResolveContentType {

        @Test
        @DisplayName("falls back to octet-stream when content type is null — rejected as non-image")
        void nullContentTypeRejectedAsNonImage() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile(
                    "file", "photo.jpg", null, new byte[100]);

            assertThatThrownBy(() -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("JPEG");
        }
    }

    // ── safeFilename fallback ─────────────────────────────────────────────────

    @Nested
    @DisplayName("safeFilename fallback (via uploadBolPhoto)")
    class SafeFilename {

        @Test
        @DisplayName("uses fallback filename when original filename is null")
        void usesFallbackWhenOriginalFilenameNull() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), eq("photo.jpg"), any(), any()))
                    .thenReturn("storage/photo.jpg");
            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setOriginalFilename("photo.jpg");
            saved.setFileSizeBytes(100L);
            when(documentRepository.save(any())).thenReturn(saved);

            // MockMultipartFile with null name
            MockMultipartFile file = new MockMultipartFile(
                    "file", null, "image/jpeg", new byte[100]);

            assertThatNoException().isThrownBy(
                    () -> documentService.uploadBolPhoto(LOAD_ID, TRUCKER_ID, file));

            verify(storageService).store(any(), any(), any(), eq("photo.jpg"), any(), any());
        }
    }

    // ── generateBolOnPublish ──────────────────────────────────────────────────

    @Nested
    @DisplayName("generateBolOnPublish")
    class GenerateBolOnPublish {

        @Test
        @DisplayName("throws IllegalStateException when shipper not found")
        void throwsWhenShipperNotFound() {
            Load load = buildLoad(LoadStatus.OPEN);
            load.setShipperId("missing-shipper");
            when(userRepository.findById("missing-shipper")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> documentService.generateBolOnPublish(load))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Shipper not found");
        }

        @Test
        @DisplayName("saves BOL document and logs audit event when shipper exists")
        void savesBolDocumentWhenShipperExists() {
            Load load = buildLoad(LoadStatus.OPEN);
            load.setShipperId("shipper-1");

            User shipper = new User();
            when(userRepository.findById("shipper-1")).thenReturn(Optional.of(shipper));
            when(bolGeneratorService.generateBol(load, shipper)).thenReturn(new byte[]{10, 20});
            when(storageService.store(any(), any(), any(), any(), any(), any()))
                    .thenReturn("storage/bol.pdf");
            LoadDocument saved = new LoadDocument();
            saved.setId(UUID.randomUUID().toString());
            saved.setOriginalFilename("bill-of-lading.pdf");
            saved.setFileSizeBytes(2L);
            @SuppressWarnings("null")
            LoadDocument nonNullSaved = saved;
            doReturn(nonNullSaved).when(documentRepository).save(any(LoadDocument.class));

            assertThatNoException().isThrownBy(() -> documentService.generateBolOnPublish(load));

            verify(documentRepository).save(any(LoadDocument.class));
            verify(auditService).logEvent(any(), eq("shipper-1"), eq("UPLOADED"), any());
        }
    }

    // ── exportLoadPdf ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("exportLoadPdf")
    class ExportLoadPdf {

        @Test
        @DisplayName("generates export with null trucker when truckerId is null")
        void generatesExportWithNullTruckerWhenNoTrucker() {
            Load load = buildLoad(LoadStatus.OPEN);
            load.setShipperId("shipper-1");
            load.setTruckerId(null);

            User shipper = new User();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(userRepository.findById("shipper-1")).thenReturn(Optional.of(shipper));
            when(documentRepository.findByLoadIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(List.of());
            when(bolGeneratorService.generateExport(eq(load), eq(shipper), eq(null), any()))
                    .thenReturn(new byte[]{1});

            byte[] result = documentService.exportLoadPdf(LOAD_ID, "shipper-1");

            assertThat(result).containsExactly(1);
            verify(bolGeneratorService).generateExport(eq(load), eq(shipper), eq(null), any());
        }

        @Test
        @DisplayName("generates export with trucker when truckerId is set")
        void generatesExportWithTruckerWhenSet() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setShipperId("shipper-1");
            // truckerId already set to TRUCKER_ID in buildLoad

            User shipper = new User();
            User trucker = new User();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(userRepository.findById("shipper-1")).thenReturn(Optional.of(shipper));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(documentRepository.findByLoadIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(List.of());
            when(bolGeneratorService.generateExport(eq(load), eq(shipper), eq(trucker), any()))
                    .thenReturn(new byte[]{5, 6});

            byte[] result = documentService.exportLoadPdf(LOAD_ID, "shipper-1");

            assertThat(result).containsExactly(5, 6);
        }
    }
}
