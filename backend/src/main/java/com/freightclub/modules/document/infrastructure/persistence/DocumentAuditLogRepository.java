package com.freightclub.modules.document.infrastructure.persistence;

import com.freightclub.modules.document.domain.DocumentAuditLog;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentAuditLogRepository extends JpaRepository<DocumentAuditLog, String> {

  // AC-308-7: Query audit trail by document and tenant
  List<DocumentAuditLog> findByDocumentIdAndTenantId(String documentId, String tenantId, Sort sort);

  // Query audit trail by document only (tenant filtering via RLS)
  List<DocumentAuditLog> findByDocumentId(String documentId, Sort sort);

  // Query audit trail by user (for user activity reports)
  List<DocumentAuditLog> findByUserIdAndTenantId(String userId, String tenantId, Sort sort);
}
