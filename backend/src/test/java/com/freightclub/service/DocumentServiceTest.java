package com.freightclub.service;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadDocument;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.User;
import com.freightclub.exception.DocumentUploadRequiredException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.repository.DocumentRepository;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.storage.StorageService;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private LoadRepository loadRepository;
    @Mock private UserRepository userRepository;
    @Mock private StorageService storageService;
    @Mock private BolGeneratorService bolGeneratorService;

    @InjectMocks
    private DocumentService documentService;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Load makeLoad(String id, String tenantId, String shipperId, String truckerId, LoadStatus status) {
        Load load = new Load();
        setField(load, "id", id);
        setField(load, "tenantId", tenantId);
        setField(load, "shipperId", shipperId);
        load.setTruckerId(truckerId);
        load.setStatus(status);
        return load;
    }

    private User makeUser(String id) {
        User user = new User();
        setField(user, "id", id);
        user.setFirstName("Test");
        user.setLastName("Shipper");
        return user;
    }

    private LoadDocument makeDoc(String id, String loadId, DocumentType type) {
        LoadDocument doc = new LoadDocument();
        setField(doc, "id", id);
        doc.setLoadId(loadId);
        doc.setDocumentType(type);
        doc.setStorageKey("key-1");
        doc.setOriginalFilename("file.jpg");
        doc.setContentType("image/jpeg");
        doc.setFileSizeBytes(1024);
        return doc;
    }

    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // -------------------------------------------------------------------------
    // generateBolOnPublish
    // -------------------------------------------------------------------------

    @Nested
    class GenerateBolOnPublish {

        @Test
        void happyPath_storesDocumentAndSaves() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", null, LoadStatus.OPEN);
            User shipper = makeUser("shipper-1");
            when(userRepository.findById("shipper-1")).thenReturn(Optional.of(shipper));
            when(bolGeneratorService.generateBol(load, shipper)).thenReturn(new byte[]{1, 2, 3});
            when(storageService.store(any(), any(), any(), any(), any(), any())).thenReturn("storage-key");
            when(documentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            documentService.generateBolOnPublish(load);

            verify(storageService).store(eq("tenant-1"), eq("load-1"), eq(DocumentType.BOL_GENERATED),
                    anyString(), eq("application/pdf"), any(byte[].class));
            verify(documentRepository).save(any(LoadDocument.class));
        }

        @Test
        void throws_whenShipperNotFound() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-missing", null, LoadStatus.OPEN);
            when(userRepository.findById("shipper-missing")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> documentService.generateBolOnPublish(load))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Shipper not found");
        }
    }

    // -------------------------------------------------------------------------
    // uploadBolPhoto
    // -------------------------------------------------------------------------

    @Nested
    class UploadBolPhoto {

        @Test
        void happyPath_storesAndSavesDocument() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), any(), any(), any())).thenReturn("key-bol");
            when(documentRepository.save(any())).thenAnswer(inv -> {
                LoadDocument d = inv.getArgument(0);
                setField(d, "id", "doc-1");
                return d;
            });

            MockMultipartFile file = new MockMultipartFile("file", "bol.jpg", "image/jpeg", new byte[1024]);
            var result = documentService.uploadBolPhoto("load-1", "trucker-1", file);

            assertThat(result).isNotNull();
            verify(documentRepository).save(any(LoadDocument.class));
        }

        @Test
        void throws_whenTruckerNotAssigned() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "other-trucker", LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile("file", "bol.jpg", "image/jpeg", new byte[1024]);
            assertThatThrownBy(() -> documentService.uploadBolPhoto("load-1", "trucker-1", file))
                    .isInstanceOf(LoadNotFoundException.class);
        }

        @Test
        void throws_whenStatusIsNotClaimed() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.OPEN);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile("file", "bol.jpg", "image/jpeg", new byte[1024]);
            assertThatThrownBy(() -> documentService.uploadBolPhoto("load-1", "trucker-1", file))
                    .isInstanceOf(DocumentUploadRequiredException.class);
        }

        @Test
        void throws_whenFileTypeInvalid() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile("file", "bol.pdf", "application/pdf", new byte[512]);
            assertThatThrownBy(() -> documentService.uploadBolPhoto("load-1", "trucker-1", file))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("JPEG, PNG");
        }

        @Test
        void throws_whenFileTooLarge() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));

            // 26 MB > 25 MB limit
            byte[] bigFile = new byte[26 * 1024 * 1024];
            MockMultipartFile file = new MockMultipartFile("file", "big.jpg", "image/jpeg", bigFile);
            assertThatThrownBy(() -> documentService.uploadBolPhoto("load-1", "trucker-1", file))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("25 MB");
        }
    }

    // -------------------------------------------------------------------------
    // uploadPodPhoto
    // -------------------------------------------------------------------------

    @Nested
    class UploadPodPhoto {

        @Test
        void happyPath_storesAndSavesDocument() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), any(), any(), any())).thenReturn("key-pod");
            when(documentRepository.save(any())).thenAnswer(inv -> {
                LoadDocument d = inv.getArgument(0);
                setField(d, "id", "doc-2");
                return d;
            });

            MockMultipartFile file = new MockMultipartFile("file", "pod.jpg", "image/jpeg", new byte[2048]);
            var result = documentService.uploadPodPhoto("load-1", "trucker-1", file);

            assertThat(result).isNotNull();
            verify(documentRepository).save(any(LoadDocument.class));
        }

        @Test
        void throws_whenStatusIsNotInTransit() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));

            MockMultipartFile file = new MockMultipartFile("file", "pod.jpg", "image/jpeg", new byte[1024]);
            assertThatThrownBy(() -> documentService.uploadPodPhoto("load-1", "trucker-1", file))
                    .isInstanceOf(DocumentUploadRequiredException.class);
        }
    }

    // -------------------------------------------------------------------------
    // reportIssue
    // -------------------------------------------------------------------------

    @Nested
    class ReportIssue {

        @Test
        void withPhoto_savesDocument() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));
            when(storageService.store(any(), any(), any(), any(), any(), any())).thenReturn("key-issue");
            when(documentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            MockMultipartFile photo = new MockMultipartFile("photo", "issue.jpg", "image/jpeg", new byte[512]);
            documentService.reportIssue("load-1", "trucker-1", "Tire flat", photo);

            verify(documentRepository).save(any(LoadDocument.class));
        }

        @Test
        void textOnly_savesDocumentWithoutFile() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));
            when(documentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            documentService.reportIssue("load-1", "trucker-1", "Delay due to traffic", null);

            verify(documentRepository).save(any(LoadDocument.class));
            verifyNoInteractions(storageService);
        }

        @Test
        void throws_whenDescriptionIsBlank() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> documentService.reportIssue("load-1", "trucker-1", "  ", null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("description is required");
        }

        @Test
        void throws_whenStatusIsNotInTransit() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNull("load-1")).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> documentService.reportIssue("load-1", "trucker-1", "Issue here", null))
                    .isInstanceOf(DocumentUploadRequiredException.class);
        }
    }

    // -------------------------------------------------------------------------
    // hasBolPhoto / hasPodPhoto
    // -------------------------------------------------------------------------

    @Nested
    class HasPhoto {

        @Test
        void hasBolPhoto_delegatesToRepository() {
            when(documentRepository.existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(
                    "load-1", DocumentType.BOL_PHOTO)).thenReturn(true);

            assertThat(documentService.hasBolPhoto("load-1")).isTrue();
        }

        @Test
        void hasPodPhoto_delegatesToRepository() {
            when(documentRepository.existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(
                    "load-1", DocumentType.POD_PHOTO)).thenReturn(false);

            assertThat(documentService.hasPodPhoto("load-1")).isFalse();
        }
    }

    // -------------------------------------------------------------------------
    // getLoadDocuments
    // -------------------------------------------------------------------------

    @Nested
    class GetLoadDocuments {

        @Test
        void returnsDocumentsForAuthorizedUser() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.IN_TRANSIT);
            LoadDocument doc = makeDoc("doc-1", "load-1", DocumentType.BOL_PHOTO);
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));
                when(documentRepository.findByLoadIdAndDeletedAtIsNull("load-1"))
                        .thenReturn(List.of(doc));

                var result = documentService.getLoadDocuments("load-1", "shipper-1");

                assertThat(result).hasSize(1);
            }
        }

        @Test
        void throws_whenUserNotAuthorized() {
            Load load = makeLoad("load-1", "tenant-1", "shipper-1", "trucker-1", LoadStatus.IN_TRANSIT);
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
                when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull("load-1", "tenant-1"))
                        .thenReturn(Optional.of(load));

                assertThatThrownBy(() -> documentService.getLoadDocuments("load-1", "random-user"))
                        .isInstanceOf(LoadNotFoundException.class);
            }
        }
    }
}
