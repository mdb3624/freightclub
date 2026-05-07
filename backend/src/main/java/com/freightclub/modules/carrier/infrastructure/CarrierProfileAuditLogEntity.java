package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.CarrierProfileAuditLog;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "carrier_profile_audit_log",
    indexes = {
        @Index(name = "idx_carrier_profile_audit_tenant_date", columnList = "tenant_id, created_at"),
        @Index(name = "idx_carrier_profile_audit_trucker_date", columnList = "trucker_id, created_at")
    }
)
public class CarrierProfileAuditLogEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "trucker_id", nullable = false, length = 36)
    private String truckerId;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data_before", columnDefinition = "JSONB")
    private String dataBefore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data_after", columnDefinition = "JSONB")
    private String dataAfter;

    @Column(name = "status_code", nullable = false, length = 50)
    private String statusCode;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public CarrierProfileAuditLogEntity() {}

    public CarrierProfileAuditLogEntity(String id, String tenantId, String truckerId, String action,
                                       String dataBefore, String dataAfter, String statusCode,
                                       String ipAddress, String userAgent, OffsetDateTime createdAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.truckerId = truckerId;
        this.action = action;
        this.dataBefore = dataBefore;
        this.dataAfter = dataAfter;
        this.statusCode = statusCode;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.createdAt = createdAt;
    }

    public static CarrierProfileAuditLogEntity fromDomain(CarrierProfileAuditLog domain) {
        return new CarrierProfileAuditLogEntity(
            domain.getId(),
            domain.getTenantId(),
            domain.getTruckerId(),
            domain.getAction(),
            domain.getDataBefore(),
            domain.getDataAfter(),
            domain.getStatusCode(),
            domain.getIpAddress(),
            domain.getUserAgent(),
            domain.getCreatedAt()
        );
    }

    public CarrierProfileAuditLog toDomain() {
        return new CarrierProfileAuditLog(
            id, tenantId, truckerId, action, dataBefore, dataAfter,
            statusCode, ipAddress, userAgent, createdAt
        );
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getTruckerId() { return truckerId; }
    public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDataBefore() { return dataBefore; }
    public void setDataBefore(String dataBefore) { this.dataBefore = dataBefore; }
    public String getDataAfter() { return dataAfter; }
    public void setDataAfter(String dataAfter) { this.dataAfter = dataAfter; }
    public String getStatusCode() { return statusCode; }
    public void setStatusCode(String statusCode) { this.statusCode = statusCode; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
