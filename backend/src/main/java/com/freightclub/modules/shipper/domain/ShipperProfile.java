package com.freightclub.modules.shipper.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "shipper_profiles")
public class ShipperProfile {
    @Id
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(nullable = false, columnDefinition = "VARCHAR(36)")
    private String tenantId;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "billing_email")
    private String billingEmail;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String city;
    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    @Column(name = "mc_number")
    private String mcNumber;

    @Column(name = "usdot_number")
    private String usdotNumber;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "completeness_percent")
    private Integer completenessPercent;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime deletedAt;

    public ShipperProfile() {}

    public ShipperProfile(String id, String tenantId, String companyName, String billingEmail, String phoneNumber,
                         String city, String state, String zipCode, String mcNumber, String usdotNumber,
                         String logoUrl, Integer completenessPercent, OffsetDateTime createdAt,
                         OffsetDateTime updatedAt, OffsetDateTime deletedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.companyName = companyName;
        this.billingEmail = billingEmail;
        this.phoneNumber = phoneNumber;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.mcNumber = mcNumber;
        this.usdotNumber = usdotNumber;
        this.logoUrl = logoUrl;
        this.completenessPercent = completenessPercent;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getBillingEmail() { return billingEmail; }
    public void setBillingEmail(String billingEmail) { this.billingEmail = billingEmail; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getMcNumber() { return mcNumber; }
    public void setMcNumber(String mcNumber) { this.mcNumber = mcNumber; }

    public String getUsdotNumber() { return usdotNumber; }
    public void setUsdotNumber(String usdotNumber) { this.usdotNumber = usdotNumber; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Integer getCompletenessPercent() { return completenessPercent; }
    public void setCompletenessPercent(Integer completenessPercent) { this.completenessPercent = completenessPercent; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public OffsetDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }
}
