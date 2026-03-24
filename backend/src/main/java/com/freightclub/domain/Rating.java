package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "load_ratings")
public class Rating {

    @Id
    @Column(columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "load_id", columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String loadId;

    @Column(name = "reviewer_id", columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String reviewerId;

    @Column(name = "reviewed_id", columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String reviewedId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reviewer_role", nullable = false, columnDefinition = "VARCHAR(10)")
    private UserRole reviewerRole;

    @Column(nullable = false, columnDefinition = "TINYINT")
    private int stars;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void assignId() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
    }

    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getLoadId() { return loadId; }
    public void setLoadId(String loadId) { this.loadId = loadId; }
    public String getReviewerId() { return reviewerId; }
    public void setReviewerId(String reviewerId) { this.reviewerId = reviewerId; }
    public String getReviewedId() { return reviewedId; }
    public void setReviewedId(String reviewedId) { this.reviewedId = reviewedId; }
    public UserRole getReviewerRole() { return reviewerRole; }
    public void setReviewerRole(UserRole reviewerRole) { this.reviewerRole = reviewerRole; }
    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
