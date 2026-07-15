package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bol_attestations")
public class BolAttestation {

    @Id
    @Column(columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "load_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String loadId;

    @Column(name = "trucker_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String truckerId;

    @Column(name = "confirmed_at", nullable = false)
    private LocalDateTime confirmedAt;

    @Column(name = "exception_notes", columnDefinition = "TEXT")
    private String exceptionNotes;

    @Column(name = "exception_photo_document_id", columnDefinition = "VARCHAR(36)")
    private String exceptionPhotoDocumentId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    private void assignId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getLoadId() { return loadId; }
    public void setLoadId(String loadId) { this.loadId = loadId; }
    public String getTruckerId() { return truckerId; }
    public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public String getExceptionNotes() { return exceptionNotes; }
    public void setExceptionNotes(String exceptionNotes) { this.exceptionNotes = exceptionNotes; }
    public String getExceptionPhotoDocumentId() { return exceptionPhotoDocumentId; }
    public void setExceptionPhotoDocumentId(String exceptionPhotoDocumentId) { this.exceptionPhotoDocumentId = exceptionPhotoDocumentId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
