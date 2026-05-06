package com.freightclub.modules.document.application;

import com.freightclub.security.TenantContextHolder;
import com.freightclub.modules.document.domain.DocumentAuditLog;
import com.freightclub.modules.document.infrastructure.persistence.DocumentAuditLogRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class DocumentAuditService {

  private final DocumentAuditLogRepository auditRepository;

  public DocumentAuditService(DocumentAuditLogRepository auditRepository) {
    this.auditRepository = auditRepository;
  }

  // AC-308-1, AC-308-2, AC-308-3: Log audit event on document action
  @CacheEvict(value = "documentAudit", key = "#documentId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public void logEvent(String documentId, String userId, String action, Map<String, Object> metadata) {
    String tenantId = TenantContextHolder.getTenantId();

    DocumentAuditLog entry = new DocumentAuditLog(
        UUID.randomUUID().toString(),
        documentId,
        userId,
        tenantId,
        action,
        metadata,
        OffsetDateTime.now()
    );

    auditRepository.save(entry);
  }

  // AC-308-6, AC-308-7, AC-308-8: Query audit trail with caching
  @Cacheable(
      value = "documentAudit",
      key = "#documentId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()",
      unless = "#result == null"
  )
  public List<DocumentAuditLog> getAuditTrail(String documentId) {
    String tenantId = TenantContextHolder.getTenantId();
    return auditRepository.findByDocumentIdAndTenantId(
        documentId,
        tenantId,
        Sort.by("createdAt").descending()
    );
  }

  // Query audit trail by user (for compliance reports)
  public List<DocumentAuditLog> getUserAuditTrail(String userId) {
    String tenantId = TenantContextHolder.getTenantId();
    return auditRepository.findByUserIdAndTenantId(
        userId,
        tenantId,
        Sort.by("createdAt").descending()
    );
  }
}
