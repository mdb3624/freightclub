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
