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
import com.freightclub.storage.StorageService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class DocumentService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, "image/webp");
    private static final long MAX_BYTES = 25L * 1024 * 1024; // 25 MB

    private final DocumentRepository documentRepository;
    private final LoadRepository loadRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final BolGeneratorService bolGeneratorService;

    public DocumentService(DocumentRepository documentRepository,
                           LoadRepository loadRepository,
                           UserRepository userRepository,
                           StorageService storageService,
                           BolGeneratorService bolGeneratorService) {
        this.documentRepository = documentRepository;
        this.loadRepository = loadRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.bolGeneratorService = bolGeneratorService;
    }

    public void generateBolOnPublish(Load load) {
        User shipper = userRepository.findById(load.getShipperId())
                .orElseThrow(() -> new IllegalStateException("Shipper not found: " + load.getShipperId()));
        byte[] pdf = bolGeneratorService.generateBol(load, shipper);
        String key = storageService.store(
                load.getTenantId(), load.getId(), DocumentType.BOL_GENERATED,
                "bill-of-lading.pdf", "application/pdf", pdf);

        LoadDocument doc = new LoadDocument();
        doc.setTenantId(load.getTenantId());
        doc.setLoadId(load.getId());
        doc.setUploadedBy(load.getShipperId());
        doc.setDocumentType(DocumentType.BOL_GENERATED);
        doc.setStorageKey(key);
        doc.setOriginalFilename("bill-of-lading.pdf");
        doc.setContentType("application/pdf");
        doc.setFileSizeBytes(pdf.length);
        documentRepository.save(doc);
    }

    public DocumentResponse uploadBolPhoto(String loadId, String truckerId, MultipartFile file) {
        Load load = requireAssignedLoad(loadId, truckerId);
        if (load.getStatus() != LoadStatus.CLAIMED) {
            throw new DocumentUploadRequiredException("BOL photo can only be uploaded when load is CLAIMED");
        }
        return storePhoto(load, truckerId, DocumentType.BOL_PHOTO, file);
    }

    public DocumentResponse uploadPodPhoto(String loadId, String truckerId, MultipartFile file) {
        Load load = requireAssignedLoad(loadId, truckerId);
        if (load.getStatus() != LoadStatus.IN_TRANSIT) {
            throw new DocumentUploadRequiredException("POD photo can only be uploaded when load is IN_TRANSIT");
        }
        return storePhoto(load, truckerId, DocumentType.POD_PHOTO, file);
    }

    public void reportIssue(String loadId, String truckerId, String description, MultipartFile photo) {
        Load load = requireAssignedLoad(loadId, truckerId);
        if (load.getStatus() != LoadStatus.IN_TRANSIT) {
            throw new DocumentUploadRequiredException("Issues can only be reported when load is IN_TRANSIT");
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Issue description is required");
        }

        LoadDocument doc = new LoadDocument();
        doc.setTenantId(load.getTenantId());
        doc.setLoadId(loadId);
        doc.setUploadedBy(truckerId);
        doc.setDocumentType(DocumentType.ISSUE_PHOTO);
        doc.setNote(description.trim());

        if (photo != null && !photo.isEmpty()) {
            validateImageFile(photo);
            String contentType = resolveContentType(photo);
            byte[] bytes = readBytes(photo);
            String key = storageService.store(load.getTenantId(), loadId, DocumentType.ISSUE_PHOTO,
                    safeFilename(photo.getOriginalFilename(), "issue.jpg"), contentType, bytes);
            doc.setStorageKey(key);
            doc.setOriginalFilename(safeFilename(photo.getOriginalFilename(), "issue.jpg"));
            doc.setContentType(contentType);
            doc.setFileSizeBytes(bytes.length);
        } else {
            // Text-only report: no file stored
            doc.setStorageKey("");
            doc.setOriginalFilename("issue-report.txt");
            doc.setContentType("text/plain");
            doc.setFileSizeBytes(description.getBytes().length);
        }
        documentRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getLoadDocuments(String loadId, String requesterId) {
        requireAccessToLoad(loadId, requesterId);
        return documentRepository.findByLoadIdAndDeletedAtIsNull(loadId)
                .stream().map(DocumentResponse::from).toList();
    }

    public record DocumentContent(byte[] bytes, String contentType, String filename) {}

    @Transactional(readOnly = true)
    public DocumentContent getDocumentContent(String documentId, String requesterId) {
        LoadDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException(documentId));
        requireAccessToLoad(doc.getLoadId(), requesterId);
        if (doc.getStorageKey().isEmpty()) {
            String text = doc.getNote() != null ? doc.getNote() : "";
            return new DocumentContent(text.getBytes(), "text/plain", doc.getOriginalFilename());
        }
        byte[] bytes = storageService.retrieve(doc.getStorageKey());
        return new DocumentContent(bytes, doc.getContentType(), doc.getOriginalFilename());
    }

    @Transactional(readOnly = true)
    public byte[] exportLoadPdf(String loadId, String requesterId) {
        Load load = requireAccessToLoad(loadId, requesterId);
        User shipper = userRepository.findById(load.getShipperId()).orElse(null);
        User trucker = load.getTruckerId() != null
                ? userRepository.findById(load.getTruckerId()).orElse(null) : null;
        List<LoadDocument> docs = documentRepository.findByLoadIdAndDeletedAtIsNull(loadId);
        return bolGeneratorService.generateExport(load, shipper, trucker, docs);
    }

    public boolean hasBolPhoto(String loadId) {
        return documentRepository.existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(loadId, DocumentType.BOL_PHOTO);
    }

    public boolean hasPodPhoto(String loadId) {
        return documentRepository.existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(loadId, DocumentType.POD_PHOTO);
    }

    // ── Private helpers ──

    private Load requireAssignedLoad(String loadId, String truckerId) {
        Load load = loadRepository.findByIdAndDeletedAtIsNull(loadId)
                .orElseThrow(() -> new LoadNotFoundException(loadId));
        if (!truckerId.equals(load.getTruckerId())) {
            throw new LoadNotFoundException(loadId);
        }
        return load;
    }

    private Load requireAccessToLoad(String loadId, String requesterId) {
        Load load = loadRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(loadId, TenantContextHolder.getTenantId())
                .orElseThrow(() -> new LoadNotFoundException(loadId));
        if (!requesterId.equals(load.getShipperId()) && !requesterId.equals(load.getTruckerId())) {
            throw new LoadNotFoundException(loadId);
        }
        return load;
    }

    private DocumentResponse storePhoto(Load load, String uploaderId,
                                         DocumentType type, MultipartFile file) {
        validateImageFile(file);
        String contentType = resolveContentType(file);
        byte[] bytes = readBytes(file);
        String key = storageService.store(load.getTenantId(), load.getId(), type,
                safeFilename(file.getOriginalFilename(), "photo.jpg"), contentType, bytes);

        LoadDocument doc = new LoadDocument();
        doc.setTenantId(load.getTenantId());
        doc.setLoadId(load.getId());
        doc.setUploadedBy(uploaderId);
        doc.setDocumentType(type);
        doc.setStorageKey(key);
        doc.setOriginalFilename(safeFilename(file.getOriginalFilename(), "photo.jpg"));
        doc.setContentType(contentType);
        doc.setFileSizeBytes(bytes.length);
        return DocumentResponse.from(documentRepository.save(doc));
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(resolveContentType(file))) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are accepted");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("File exceeds the maximum size of 25 MB");
        }
    }

    private String resolveContentType(MultipartFile file) {
        String ct = file.getContentType();
        return (ct != null && !ct.isBlank()) ? ct : "application/octet-stream";
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded file", e);
        }
    }

    private String safeFilename(String name, String fallback) {
        return (name != null && !name.isBlank()) ? name : fallback;
    }
}
