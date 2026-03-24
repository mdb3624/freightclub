package com.freightclub.repository;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<LoadDocument, String> {
    List<LoadDocument> findByLoadIdAndDeletedAtIsNull(String loadId);
    boolean existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(String loadId, DocumentType documentType);
}
