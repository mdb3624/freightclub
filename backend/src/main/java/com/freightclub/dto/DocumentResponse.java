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
        LocalDateTime createdAt
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
                doc.getCreatedAt()
        );
    }
}
