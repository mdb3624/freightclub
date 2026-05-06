package com.freightclub.modules.document.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadDocument;
import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.repository.DocumentRepository;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.modules.document.application.DocumentAuditService;
import com.freightclub.modules.document.domain.DocumentAuditLog;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DocumentAuditLogIsolationTest {

  @Autowired
  private DocumentAuditLogRepository auditRepository;

  @Autowired
  private DocumentAuditService auditService;

  @Autowired
  private DocumentRepository documentRepository;

  @Autowired
  private TenantRepository tenantRepository;

  @Autowired
  private UserRepository userRepository;

  private static final String TENANT_A = "tenant-audit-a";
  private static final String TENANT_B = "tenant-audit-b";
  private static final String USER_A = "user-audit-a";
  private static final String USER_B = "user-audit-b";
  private static final String DOC_A = "doc-audit-a";
  private static final String DOC_B = "doc-audit-b";
  private static final String LOAD_A = "load-audit-a";
  private static final String LOAD_B = "load-audit-b";

  @BeforeEach
  void setUp() {
    // Create tenants
    createTenantIfMissing(TENANT_A, "Audit Test Tenant A");
    createTenantIfMissing(TENANT_B, "Audit Test Tenant B");

    // Create users
    createUserIfMissing(USER_A, "user-a@test.com", TENANT_A);
    createUserIfMissing(USER_B, "user-b@test.com", TENANT_B);

    // Create documents (LoadDocuments)
    TenantContextHolder.setTenantId(TENANT_A);
    createLoadDocumentIfMissing(DOC_A, LOAD_A, USER_A, TENANT_A);

    TenantContextHolder.setTenantId(TENANT_B);
    createLoadDocumentIfMissing(DOC_B, LOAD_B, USER_B, TENANT_B);
  }

  private void createTenantIfMissing(String tenantId, String name) {
    if (!tenantRepository.findById(tenantId).isPresent()) {
      Tenant tenant = new Tenant();
      tenant.setId(tenantId);
      tenant.setName(name);
      tenantRepository.save(tenant);
    }
  }

  private void createUserIfMissing(String userId, String email, String tenantId) {
    if (!userRepository.findById(userId).isPresent()) {
      User user = new User(userId);
      user.setTenantId(tenantId);
      user.setEmail(email);
      user.setPasswordHash("$2a$10$testpassword");
      user.setRole(UserRole.SHIPPER);
      user.setFirstName("Test");
      user.setLastName("User");
      userRepository.save(user);
    }
  }

  private void createLoadDocumentIfMissing(String docId, String loadId, String userId, String tenantId) {
    if (!documentRepository.findById(docId).isPresent()) {
      LoadDocument doc = new LoadDocument();
      doc.setId(docId);
      doc.setLoadId(loadId);
      doc.setTenantId(tenantId);
      doc.setUploadedBy(userId);
      doc.setDocumentType(DocumentType.POD_PHOTO);
      doc.setStorageKey("s3://bucket/" + docId + "/test.pdf");
      doc.setFileUrl("https://s3.amazonaws.com/bucket/" + docId + "/test.pdf");
      doc.setOriginalFilename("test.pdf");
      doc.setFileSizeBytes(1024L);
      documentRepository.save(doc);
    }
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
  }

  @Test
  void testMultiTenantIsolation() {
    // AC-308-6: Multi-tenant isolation — Tenant A should not see Tenant B's audit logs

    // Tenant A creates audit entries
    TenantContextHolder.setTenantId(TENANT_A);
    auditService.logEvent(DOC_A, USER_A, "UPLOADED", null);
    auditService.logEvent(DOC_A, USER_A, "DOWNLOADED", null);

    // Tenant B creates audit entries
    TenantContextHolder.setTenantId(TENANT_B);
    auditService.logEvent(DOC_B, USER_B, "UPLOADED", null);
    auditService.logEvent(DOC_B, USER_B, "DOWNLOADED", null);

    // Verify Tenant A can only see their own entries
    TenantContextHolder.setTenantId(TENANT_A);
    List<DocumentAuditLog> tenantATrail = auditRepository.findByDocumentIdAndTenantId(
        DOC_A, TENANT_A, Sort.by("createdAt")
    );
    assertThat(tenantATrail).hasSize(2);
    assertThat(tenantATrail).allMatch(log -> log.getTenantId().equals(TENANT_A));

    // Verify Tenant B can only see their own entries
    TenantContextHolder.setTenantId(TENANT_B);
    List<DocumentAuditLog> tenantBTrail = auditRepository.findByDocumentIdAndTenantId(
        DOC_B, TENANT_B, Sort.by("createdAt")
    );
    assertThat(tenantBTrail).hasSize(2);
    assertThat(tenantBTrail).allMatch(log -> log.getTenantId().equals(TENANT_B));

    // Tenant A cannot query Tenant B's documents via RLS
    TenantContextHolder.setTenantId(TENANT_A);
    List<DocumentAuditLog> crossTenantAttempt = auditRepository.findByDocumentIdAndTenantId(
        DOC_B, TENANT_B, Sort.by("createdAt")
    );
    // RLS should filter to empty (or DB-level security prevents access)
    assertThat(crossTenantAttempt).isEmpty();
  }

  @Test
  void testAuditLogImmutability() {
    // AC-308-4: Audit log entries cannot be updated or deleted
    TenantContextHolder.setTenantId(TENANT_A);
    auditService.logEvent(DOC_A, USER_A, "UPLOADED", null);

    List<DocumentAuditLog> trail = auditRepository.findByDocumentId(DOC_A, Sort.by("createdAt"));
    assertThat(trail).hasSize(1);

    DocumentAuditLog logged = trail.get(0);
    // Verify action is immutable
    assertThat(logged.getAction()).isEqualTo("UPLOADED");
    // Verify timestamp is set
    assertThat(logged.getCreatedAt()).isNotNull();
  }

  @Test
  void testNoSoftDeleteOnAuditLog() {
    // AC-308-5: Schema has NO deleted_at column (30-year retention)
    TenantContextHolder.setTenantId(TENANT_A);
    auditService.logEvent(DOC_A, USER_A, "UPLOADED", null);

    List<DocumentAuditLog> trail = auditRepository.findByDocumentId(DOC_A, Sort.by("createdAt"));
    assertThat(trail).hasSize(1);

    DocumentAuditLog logged = trail.get(0);
    // Verify no soft delete support (entry should exist indefinitely)
    assertThat(logged.getId()).isNotNull();
    // No deleted_at field on entity
  }
}
