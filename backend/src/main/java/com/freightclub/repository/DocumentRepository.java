package com.freightclub.repository;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<LoadDocument, String> {
    List<LoadDocument> findByLoadIdAndDeletedAtIsNull(String loadId);
    boolean existsByLoadIdAndDocumentTypeAndDeletedAtIsNull(String loadId, DocumentType documentType);

    @Query("SELECT d FROM LoadDocument d WHERE d.deletedAt IS NULL AND d.loadId IN " +
            "(SELECT l.id FROM Load l WHERE l.shipperId = :shipperId AND l.deletedAt IS NULL) " +
            "ORDER BY d.createdAt DESC")
    List<LoadDocument> findAllForShipper(@Param("shipperId") String shipperId);
}
