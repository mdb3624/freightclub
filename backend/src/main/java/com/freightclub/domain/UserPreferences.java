package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "user_preferences", schema = "freightclub")
public class UserPreferences {

    @Id
    @Column(columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "user_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String userId;

    @Column(name = "theme_mode", nullable = false, length = 20)
    private String themeMode = "SYSTEM";

    @Column(name = "sidebar_collapsed", nullable = false)
    private boolean sidebarCollapsed = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dashboard_layout")
    private Map<String, Object> dashboardLayout;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @PrePersist
    private void assignId() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
    }

    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getThemeMode() { return themeMode; }
    public void setThemeMode(String themeMode) { this.themeMode = themeMode; }
    public boolean isSidebarCollapsed() { return sidebarCollapsed; }
    public void setSidebarCollapsed(boolean sidebarCollapsed) { this.sidebarCollapsed = sidebarCollapsed; }
    public Map<String, Object> getDashboardLayout() { return dashboardLayout; }
    public void setDashboardLayout(Map<String, Object> dashboardLayout) { this.dashboardLayout = dashboardLayout; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public OffsetDateTime getDeletedAt() { return deletedAt; }
}
