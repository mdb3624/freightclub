package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

// US-751 (Dispute Resolution Tools): a Shipper or Carrier flags a problem with a load; a
// Super User resolves it. Per CHG-869, this is intentionally separate from `Claim` (load
// claiming) — an unrelated concept that happens to share a "someone did something to a load"
// shape.
@Entity
@Table(name = "disputes")
public class Dispute {

    @Id
    @Column(columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "load_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String loadId;

    @Column(name = "raised_by_user_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String raisedByUserId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private DisputeStatus status = DisputeStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "resolution_outcome", columnDefinition = "VARCHAR(30)")
    private DisputeOutcome resolutionOutcome;

    @Column(name = "resolution_reason", columnDefinition = "TEXT")
    private String resolutionReason;

    @Column(name = "resolved_by_user_id", columnDefinition = "VARCHAR(36)")
    private String resolvedByUserId;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    private void assignId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getLoadId() { return loadId; }
    public void setLoadId(String loadId) { this.loadId = loadId; }
    public String getRaisedByUserId() { return raisedByUserId; }
    public void setRaisedByUserId(String raisedByUserId) { this.raisedByUserId = raisedByUserId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public DisputeStatus getStatus() { return status; }
    public void setStatus(DisputeStatus status) { this.status = status; }
    public DisputeOutcome getResolutionOutcome() { return resolutionOutcome; }
    public void setResolutionOutcome(DisputeOutcome resolutionOutcome) { this.resolutionOutcome = resolutionOutcome; }
    public String getResolutionReason() { return resolutionReason; }
    public void setResolutionReason(String resolutionReason) { this.resolutionReason = resolutionReason; }
    public String getResolvedByUserId() { return resolvedByUserId; }
    public void setResolvedByUserId(String resolvedByUserId) { this.resolvedByUserId = resolvedByUserId; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
}
