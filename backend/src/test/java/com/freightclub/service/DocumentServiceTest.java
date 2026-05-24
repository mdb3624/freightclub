package com.freightclub.service;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadDocument;
import com.freightclub.domain.LoadStatus;
import com.freightclub.dto.DocumentResponse;
import com.freightclub.exception.DocumentUploadRequiredException;
import com.freightclub.repository.DocumentRepository;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.storage.LocalStorageService;
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

import static org.assertj.core.api.Assertions.assertThat;
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
            saved.setDocumentType(DocumentType.BOL_PHOTO);
            saved.setLoadId(LOAD_ID);
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
            saved.setDocumentType(DocumentType.POD_PHOTO);
            saved.setLoadId(LOAD_ID);
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
}
