package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    @Column(name = "billing_address", length = 500)
    private String billingAddress;

    @Column(name = "billing_city", length = 100)
    private String billingCity;

    @Column(name = "billing_state", length = 100)
    private String billingState;

    @Column(name = "billing_zip", length = 10)
    private String billingZip;

    @Column(name = "default_pickup_address", length = 500)
    private String defaultPickupAddress;

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
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    public String getBillingCity() { return billingCity; }
    public void setBillingCity(String billingCity) { this.billingCity = billingCity; }
    public String getBillingState() { return billingState; }
    public void setBillingState(String billingState) { this.billingState = billingState; }
    public String getBillingZip() { return billingZip; }
    public void setBillingZip(String billingZip) { this.billingZip = billingZip; }
    public String getDefaultPickupAddress() { return defaultPickupAddress; }
    public void setDefaultPickupAddress(String defaultPickupAddress) { this.defaultPickupAddress = defaultPickupAddress; }
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
    public boolean isNotifyEmail() { return notifyEmail; }
    public void setNotifyEmail(boolean notifyEmail) { this.notifyEmail = notifyEmail; }
    public boolean isNotifySms() { return notifySms; }
    public void setNotifySms(boolean notifySms) { this.notifySms = notifySms; }
    public boolean isNotifyInApp() { return notifyInApp; }
    public void setNotifyInApp(boolean notifyInApp) { this.notifyInApp = notifyInApp; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
}
