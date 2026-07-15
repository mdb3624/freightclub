package com.freightclub.service;

import com.freightclub.domain.BolAttestation;
import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import com.freightclub.repository.BolAttestationRepository;
import com.freightclub.repository.DocumentRepository;
import com.freightclub.modules.document.application.DocumentAuditService;
import com.freightclub.storage.StorageService;
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
    private final StorageService storageService;
    private final DocumentAuditService auditService;

    public BolAttestationService(BolAttestationRepository attestationRepository,
                                  DocumentRepository documentRepository,
                                  StorageService storageService,
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
