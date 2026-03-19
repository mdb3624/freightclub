package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String tenantId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private UserRole role;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "business_name")
    private String businessName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "billing_address_1", length = 500)
    private String billingAddress1;

    @Column(name = "billing_address_2", length = 500)
    private String billingAddress2;

    @Column(name = "billing_city", length = 100)
    private String billingCity;

    @Column(name = "billing_state", length = 100)
    private String billingState;

    @Column(name = "billing_zip", length = 10)
    private String billingZip;

    @Column(name = "default_pickup_address_1", length = 500)
    private String defaultPickupAddress1;

    @Column(name = "default_pickup_address_2", length = 500)
    private String defaultPickupAddress2;

    @Column(name = "default_pickup_city", length = 100)
    private String defaultPickupCity;

    @Column(name = "default_pickup_state", length = 100)
    private String defaultPickupState;

    @Column(name = "default_pickup_zip", length = 10)
    private String defaultPickupZip;

    @Column(name = "mc_number", length = 20)
    private String mcNumber;

    @Column(name = "dot_number", length = 20)
    private String dotNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_type", columnDefinition = "VARCHAR(30)")
    private EquipmentType equipmentType;

    @Column(name = "monthly_fixed_costs", precision = 10, scale = 2)
    private BigDecimal monthlyFixedCosts;

    @Column(name = "fuel_cost_per_gallon", precision = 6, scale = 3)
    private BigDecimal fuelCostPerGallon;

    @Column(name = "miles_per_gallon", precision = 6, scale = 2)
    private BigDecimal milesPerGallon;

    @Column(name = "maintenance_cost_per_mile", precision = 6, scale = 4)
    private BigDecimal maintenanceCostPerMile;

    @Column(name = "monthly_miles_target")
    private Integer monthlyMilesTarget;

    @Column(name = "target_margin_per_mile", precision = 6, scale = 4)
    private BigDecimal targetMarginPerMile;

    @Column(name = "notify_email", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1")
    private boolean notifyEmail = true;

    @Column(name = "notify_sms", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean notifySms = false;

    @Column(name = "notify_in_app", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1")
    private boolean notifyInApp = true;

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
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getBillingAddress1() { return billingAddress1; }
    public void setBillingAddress1(String billingAddress1) { this.billingAddress1 = billingAddress1; }
    public String getBillingAddress2() { return billingAddress2; }
    public void setBillingAddress2(String billingAddress2) { this.billingAddress2 = billingAddress2; }
    public String getBillingCity() { return billingCity; }
    public void setBillingCity(String billingCity) { this.billingCity = billingCity; }
    public String getBillingState() { return billingState; }
    public void setBillingState(String billingState) { this.billingState = billingState; }
    public String getBillingZip() { return billingZip; }
    public void setBillingZip(String billingZip) { this.billingZip = billingZip; }
    public String getDefaultPickupAddress1() { return defaultPickupAddress1; }
    public void setDefaultPickupAddress1(String defaultPickupAddress1) { this.defaultPickupAddress1 = defaultPickupAddress1; }
    public String getDefaultPickupAddress2() { return defaultPickupAddress2; }
    public void setDefaultPickupAddress2(String defaultPickupAddress2) { this.defaultPickupAddress2 = defaultPickupAddress2; }
    public String getDefaultPickupCity() { return defaultPickupCity; }
    public void setDefaultPickupCity(String defaultPickupCity) { this.defaultPickupCity = defaultPickupCity; }
    public String getDefaultPickupState() { return defaultPickupState; }
    public void setDefaultPickupState(String defaultPickupState) { this.defaultPickupState = defaultPickupState; }
    public String getDefaultPickupZip() { return defaultPickupZip; }
    public void setDefaultPickupZip(String defaultPickupZip) { this.defaultPickupZip = defaultPickupZip; }
    public String getMcNumber() { return mcNumber; }
    public void setMcNumber(String mcNumber) { this.mcNumber = mcNumber; }
    public String getDotNumber() { return dotNumber; }
    public void setDotNumber(String dotNumber) { this.dotNumber = dotNumber; }
    public EquipmentType getEquipmentType() { return equipmentType; }
    public void setEquipmentType(EquipmentType equipmentType) { this.equipmentType = equipmentType; }
    public BigDecimal getMonthlyFixedCosts() { return monthlyFixedCosts; }
    public void setMonthlyFixedCosts(BigDecimal monthlyFixedCosts) { this.monthlyFixedCosts = monthlyFixedCosts; }
    public BigDecimal getFuelCostPerGallon() { return fuelCostPerGallon; }
    public void setFuelCostPerGallon(BigDecimal fuelCostPerGallon) { this.fuelCostPerGallon = fuelCostPerGallon; }
    public BigDecimal getMilesPerGallon() { return milesPerGallon; }
    public void setMilesPerGallon(BigDecimal milesPerGallon) { this.milesPerGallon = milesPerGallon; }
    public BigDecimal getMaintenanceCostPerMile() { return maintenanceCostPerMile; }
    public void setMaintenanceCostPerMile(BigDecimal maintenanceCostPerMile) { this.maintenanceCostPerMile = maintenanceCostPerMile; }
    public Integer getMonthlyMilesTarget() { return monthlyMilesTarget; }
    public void setMonthlyMilesTarget(Integer monthlyMilesTarget) { this.monthlyMilesTarget = monthlyMilesTarget; }
    public BigDecimal getTargetMarginPerMile() { return targetMarginPerMile; }
    public void setTargetMarginPerMile(BigDecimal targetMarginPerMile) { this.targetMarginPerMile = targetMarginPerMile; }
    public boolean isNotifyEmail() { return notifyEmail; }
    public void setNotifyEmail(boolean notifyEmail) { this.notifyEmail = notifyEmail; }
    public boolean isNotifySms() { return notifySms; }
    public void setNotifySms(boolean notifySms) { this.notifySms = notifySms; }
    public boolean isNotifyInApp() { return notifyInApp; }
    public void setNotifyInApp(boolean notifyInApp) { this.notifyInApp = notifyInApp; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
}
