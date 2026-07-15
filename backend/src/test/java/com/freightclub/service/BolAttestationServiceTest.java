package com.freightclub.service;

import com.freightclub.domain.BolAttestation;
import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import com.freightclub.repository.BolAttestationRepository;
import com.freightclub.repository.DocumentRepository;
import com.freightclub.modules.document.application.DocumentAuditService;
import com.freightclub.storage.StorageService;
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
    @Mock private StorageService storageService;
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
        when(documentRepository.save(any(LoadDocument.class))).thenAnswer(inv -> {
            LoadDocument doc = inv.getArgument(0);
            if (doc.getId() == null) {
                doc.setId("photo-doc-1");
            }
            return doc;
        });
        when(attestationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MockMultipartFile photo = new MockMultipartFile("exceptionPhoto", "damage.jpg", "image/jpeg", new byte[]{1, 2, 3});
        BolAttestation result = service.recordAttestation("load-1", "tenant-1", "trucker-1", "Two pallets damaged", photo);

        assertThat(result.getExceptionNotes()).isEqualTo("Two pallets damaged");
        assertThat(result.getExceptionPhotoDocumentId()).isNotNull();
        verify(documentRepository, times(2)).save(any(LoadDocument.class)); // exception photo doc + locked BOL doc
    }
}
