package com.freightclub.modules.carrier.domain;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

public class CarrierProfileAuditLog {

    private String id;
    private String tenantId;
    private String truckerId;
    private String action;
    private String dataBefore;
    private String dataAfter;
    private String statusCode;
    private String ipAddress;
    private String userAgent;
    private OffsetDateTime createdAt;

    public CarrierProfileAuditLog(
        String id,
        String tenantId,
        String truckerId,
        String action,
        String dataBefore,
        String dataAfter,
        String statusCode,
        String ipAddress,
        String userAgent,
        OffsetDateTime createdAt
    ) {
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

    public static CarrierProfileAuditLog createNew(
        String tenantId,
        String truckerId,
        String action,
        String dataBefore,
        String dataAfter,
        String statusCode,
        String ipAddress,
        String userAgent
    ) {
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("Action is required");
        }
        if (statusCode == null || statusCode.isBlank()) {
            throw new IllegalArgumentException("Status code is required");
        }

        return new CarrierProfileAuditLog(
            UUID.randomUUID().toString(),
            tenantId,
            truckerId,
            action,
            dataBefore,
            dataAfter,
            statusCode,
            ipAddress,
            userAgent,
            OffsetDateTime.now(ZoneOffset.UTC)
        );
    }

    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public String getTruckerId() { return truckerId; }
    public String getAction() { return action; }
    public String getDataBefore() { return dataBefore; }
    public String getDataAfter() { return dataAfter; }
    public String getStatusCode() { return statusCode; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CarrierProfileAuditLog)) return false;
        CarrierProfileAuditLog that = (CarrierProfileAuditLog) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "CarrierProfileAuditLog{" +
                "id='" + id + '\'' +
                ", action='" + action + '\'' +
                ", statusCode='" + statusCode + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
