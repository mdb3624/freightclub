package com.freightclub.modules.document.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.freightclub.security.TenantContextHolder;
import com.freightclub.modules.document.domain.DocumentAuditLog;
import com.freightclub.modules.document.infrastructure.persistence.DocumentAuditLogRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class DocumentAuditServiceTest {

  @Mock
  private DocumentAuditLogRepository auditRepository;

  @Mock
  private CacheManager cacheManager;

  private DocumentAuditService service;
  private String tenantId = "tenant-123";
  private String userId = "user-456";
  private String documentId = "doc-789";

  @BeforeEach
  void setUp() {
    service = new DocumentAuditService(auditRepository);
    TenantContextHolder.setTenantId(tenantId);
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
  }

  @Test
  void testUploadEventLogged() {
    // AC-308-1: Audit log entry created on document upload
    Map<String, Object> metadata = Map.of(
        "fileName", "pod-photo.jpg",
        "size", 1024,
        "contentType", "image/jpeg"
    );

    service.logEvent(documentId, userId, "UPLOADED", metadata);

    ArgumentCaptor<DocumentAuditLog> captor = ArgumentCaptor.forClass(DocumentAuditLog.class);
    verify(auditRepository).save(captor.capture());

    DocumentAuditLog logged = captor.getValue();
    assertThat(logged.getDocumentId()).isEqualTo(documentId);
    assertThat(logged.getUserId()).isEqualTo(userId);
    assertThat(logged.getTenantId()).isEqualTo(tenantId);
    assertThat(logged.getAction()).isEqualTo("UPLOADED");
    assertThat(logged.getMetadata()).containsEntry("fileName", "pod-photo.jpg");
    assertThat(logged.getCreatedAt()).isNotNull();
  }

  @Test
  void testDownloadEventLogged() {
    // AC-308-2: Audit log entry created on document download/view
    Map<String, Object> metadata = Map.of(
        "ipAddress", "192.168.1.1",
        "userAgent", "Mozilla/5.0"
    );

    service.logEvent(documentId, userId, "DOWNLOADED", metadata);

    ArgumentCaptor<DocumentAuditLog> captor = ArgumentCaptor.forClass(DocumentAuditLog.class);
    verify(auditRepository).save(captor.capture());

    DocumentAuditLog logged = captor.getValue();
    assertThat(logged.getAction()).isEqualTo("DOWNLOADED");
    assertThat(logged.getMetadata()).containsEntry("ipAddress", "192.168.1.1");
  }

  @Test
  void testSignatureEventLogged() {
    // AC-308-3: Audit log entry created on document signature
    Map<String, Object> metadata = Map.of(
        "signatureType", "electronic",
        "signedAt", OffsetDateTime.now().toString(),
        "proofId", "proof-xyz"
    );

    service.logEvent(documentId, userId, "SIGNED", metadata);

    ArgumentCaptor<DocumentAuditLog> captor = ArgumentCaptor.forClass(DocumentAuditLog.class);
    verify(auditRepository).save(captor.capture());

    DocumentAuditLog logged = captor.getValue();
    assertThat(logged.getAction()).isEqualTo("SIGNED");
    assertThat(logged.getMetadata()).containsEntry("signatureType", "electronic");
  }

  @Test
  void testGetAuditTrailOrdered() {
    // AC-308-7: Query audit trail in chronological order
    DocumentAuditLog entry1 = new DocumentAuditLog(
        "audit-1", documentId, userId, tenantId, "UPLOADED", null, OffsetDateTime.now().minusHours(2)
    );
    DocumentAuditLog entry2 = new DocumentAuditLog(
        "audit-2", documentId, userId, tenantId, "DOWNLOADED", null, OffsetDateTime.now().minusHours(1)
    );
    DocumentAuditLog entry3 = new DocumentAuditLog(
        "audit-3", documentId, userId, tenantId, "SIGNED", null, OffsetDateTime.now()
    );

    when(auditRepository.findByDocumentIdAndTenantId(
        eq(documentId),
        eq(tenantId),
        any(Sort.class)
    )).thenReturn(List.of(entry3, entry2, entry1));

    List<DocumentAuditLog> trail = service.getAuditTrail(documentId);

    assertThat(trail).hasSize(3);
    assertThat(trail.get(0).getAction()).isEqualTo("SIGNED");
    assertThat(trail.get(1).getAction()).isEqualTo("DOWNLOADED");
    assertThat(trail.get(2).getAction()).isEqualTo("UPLOADED");
  }

  @Test
  void testGetUserAuditTrail() {
    // Query user activity
    DocumentAuditLog entry1 = new DocumentAuditLog(
        "audit-1", "doc-1", userId, tenantId, "DOWNLOADED", null, OffsetDateTime.now().minusHours(1)
    );
    DocumentAuditLog entry2 = new DocumentAuditLog(
        "audit-2", "doc-2", userId, tenantId, "SIGNED", null, OffsetDateTime.now()
    );

    when(auditRepository.findByUserIdAndTenantId(
        eq(userId),
        eq(tenantId),
        any(Sort.class)
    )).thenReturn(List.of(entry2, entry1));

    List<DocumentAuditLog> trail = service.getUserAuditTrail(userId);

    assertThat(trail).hasSize(2);
    assertThat(trail).allMatch(log -> log.getUserId().equals(userId));
  }
}
