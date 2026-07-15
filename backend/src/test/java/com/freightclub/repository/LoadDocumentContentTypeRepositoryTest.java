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
