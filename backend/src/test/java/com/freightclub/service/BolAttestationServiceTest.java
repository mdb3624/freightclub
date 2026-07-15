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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

    @Test
    void recordAttestation_whenNoGeneratedBolDocumentExists_doesNotLockOrSaveAnyDocument() {
        LoadDocument otherDoc = new LoadDocument();
        otherDoc.setId("doc-2");
        otherDoc.setDocumentType(DocumentType.PICKUP_EXCEPTION_PHOTO);
        when(documentRepository.findByLoadIdAndDeletedAtIsNull("load-1"))
                .thenReturn(Collections.singletonList(otherDoc));
        when(attestationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        BolAttestation result = service.recordAttestation("load-1", "tenant-1", "trucker-1", null, null);

        assertThat(result.getLoadId()).isEqualTo("load-1");
        assertThat(otherDoc.isLocked()).isFalse();
        verify(documentRepository, never()).save(any(LoadDocument.class));
        verify(auditService, never()).logEvent(eq("doc-2"), anyString(), eq("LOCKED"), anyMap());
    }

    @Test
    void recordAttestation_withEmptyExceptionPhoto_doesNotStorePhoto() {
        when(documentRepository.findByLoadIdAndDeletedAtIsNull("load-1"))
                .thenReturn(Collections.emptyList());
        when(attestationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MockMultipartFile emptyPhoto = new MockMultipartFile("exceptionPhoto", "empty.jpg", "image/jpeg", new byte[0]);
        BolAttestation result = service.recordAttestation("load-1", "tenant-1", "trucker-1", "Notes only", emptyPhoto);

        assertThat(result.getExceptionPhotoDocumentId()).isNull();
        verify(documentRepository, never()).save(any(LoadDocument.class));
        verify(storageService, never()).store(anyString(), anyString(), any(), anyString(), anyString(), any());
    }

    @Test
    void recordAttestation_withPhotoMissingFilenameAndContentType_fallsBackToDefaults() {
        when(documentRepository.findByLoadIdAndDeletedAtIsNull("load-1"))
                .thenReturn(Collections.emptyList());
        when(storageService.store(eq("tenant-1"), eq("load-1"), eq(DocumentType.PICKUP_EXCEPTION_PHOTO),
                eq("pickup-exception.jpg"), eq("application/octet-stream"), any()))
                .thenReturn("storage-key-456");
        when(documentRepository.save(any(LoadDocument.class))).thenAnswer(inv -> {
            LoadDocument doc = inv.getArgument(0);
            doc.setId("photo-doc-2");
            return doc;
        });
        when(attestationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MultipartFile photo = mock(MultipartFile.class);
        when(photo.isEmpty()).thenReturn(false);
        try {
            when(photo.getBytes()).thenReturn(new byte[]{9, 9});
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        when(photo.getOriginalFilename()).thenReturn(null);
        when(photo.getContentType()).thenReturn(null);

        BolAttestation result = service.recordAttestation("load-1", "tenant-1", "trucker-1", "Notes", photo);

        assertThat(result.getExceptionPhotoDocumentId()).isEqualTo("photo-doc-2");
        verify(storageService).store(eq("tenant-1"), eq("load-1"), eq(DocumentType.PICKUP_EXCEPTION_PHOTO),
                eq("pickup-exception.jpg"), eq("application/octet-stream"), any());
    }

    @Test
    void recordAttestation_whenPhotoBytesThrowIOException_wrapsInIllegalStateException() throws IOException {
        MultipartFile brokenPhoto = mock(MultipartFile.class);
        when(brokenPhoto.isEmpty()).thenReturn(false);
        when(brokenPhoto.getBytes()).thenThrow(new IOException("disk read failed"));

        assertThatThrownBy(() -> service.recordAttestation("load-1", "tenant-1", "trucker-1", "Notes", brokenPhoto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to read exception photo upload")
                .hasCauseInstanceOf(IOException.class);

        verify(attestationRepository, never()).save(any());
    }
}
