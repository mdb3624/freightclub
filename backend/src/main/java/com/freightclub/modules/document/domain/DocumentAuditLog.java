package com.freightclub.modules.document.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "document_audit_log")
public class DocumentAuditLog {

  @Id
  private String id;

  @Column(name = "document_id", nullable = false)
  private String documentId;

  @Column(name = "user_id", nullable = false)
  private String userId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "action", nullable = false, length = 50)
  private String action;

  @Column(name = "metadata")
  @JdbcTypeCode(SqlTypes.JSON)
  private Map<String, Object> metadata;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  public DocumentAuditLog() {}

  public DocumentAuditLog(
      String id,
      String documentId,
      String userId,
      String tenantId,
      String action,
      Map<String, Object> metadata,
      OffsetDateTime createdAt) {
    this.id = id;
    this.documentId = documentId;
    this.userId = userId;
    this.tenantId = tenantId;
    this.action = action;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getDocumentId() {
    return documentId;
  }

  public void setDocumentId(String documentId) {
    this.documentId = documentId;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public String getAction() {
    return action;
  }

  public void setAction(String action) {
    this.action = action;
  }

  public Map<String, Object> getMetadata() {
    return metadata;
  }

  public void setMetadata(Map<String, Object> metadata) {
    this.metadata = metadata;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
