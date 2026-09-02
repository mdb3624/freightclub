package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @Column(columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "join_code", nullable = true, unique = true, length = 12)
    private String joinCode;

    @Column(nullable = false, length = 50)
    private String plan = "FREE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // US-876/878: org-level defaults. All nullable — null means "no org default set", per
    // BR-3/BR-5 in both stories (never conflated with "explicitly set to blank/zero").
    @Column(name = "default_pickup_address_1", length = 500)
    private String defaultPickupAddress1;
    @Column(name = "default_pickup_address_2", length = 500)
    private String defaultPickupAddress2;
    @Column(name = "default_pickup_city", length = 100)
    private String defaultPickupCity;
    @Column(name = "default_pickup_state", columnDefinition = "CHAR(2)")
    private String defaultPickupState;
    @Column(name = "default_pickup_zip", length = 10)
    private String defaultPickupZip;
    @Column(name = "billing_address_1", length = 500)
    private String billingAddress1;
    @Column(name = "billing_address_2", length = 500)
    private String billingAddress2;
    @Column(name = "billing_city", length = 100)
    private String billingCity;
    @Column(name = "billing_state", columnDefinition = "CHAR(2)")
    private String billingState;
    @Column(name = "billing_zip", length = 10)
    private String billingZip;
    @Column(name = "fuel_cost_per_gallon", precision = 6, scale = 3)
    private BigDecimal fuelCostPerGallon;
    @Column(name = "maintenance_cost_per_mile", precision = 6, scale = 4)
    private BigDecimal maintenanceCostPerMile;
    @Column(name = "monthly_fixed_costs", precision = 10, scale = 2)
    private BigDecimal monthlyFixedCosts;
    @Column(name = "target_margin_per_mile", precision = 6, scale = 4)
    private BigDecimal targetMarginPerMile;
    @Column(name = "notify_email")
    private Boolean notifyEmail;
    @Column(name = "notify_sms")
    private Boolean notifySms;
    @Column(name = "notify_in_app")
    private Boolean notifyInApp;

    @PrePersist
    private void assignId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }
    public String getPlan() { return plan; }

    public String getDefaultPickupAddress1() { return defaultPickupAddress1; }
    public void setDefaultPickupAddress1(String v) { this.defaultPickupAddress1 = v; }
    public String getDefaultPickupAddress2() { return defaultPickupAddress2; }
    public void setDefaultPickupAddress2(String v) { this.defaultPickupAddress2 = v; }
    public String getDefaultPickupCity() { return defaultPickupCity; }
    public void setDefaultPickupCity(String v) { this.defaultPickupCity = v; }
    public String getDefaultPickupState() { return defaultPickupState; }
    public void setDefaultPickupState(String v) { this.defaultPickupState = v; }
    public String getDefaultPickupZip() { return defaultPickupZip; }
    public void setDefaultPickupZip(String v) { this.defaultPickupZip = v; }
    public String getBillingAddress1() { return billingAddress1; }
    public void setBillingAddress1(String v) { this.billingAddress1 = v; }
    public String getBillingAddress2() { return billingAddress2; }
    public void setBillingAddress2(String v) { this.billingAddress2 = v; }
    public String getBillingCity() { return billingCity; }
    public void setBillingCity(String v) { this.billingCity = v; }
    public String getBillingState() { return billingState; }
    public void setBillingState(String v) { this.billingState = v; }
    public String getBillingZip() { return billingZip; }
    public void setBillingZip(String v) { this.billingZip = v; }
    public BigDecimal getFuelCostPerGallon() { return fuelCostPerGallon; }
    public void setFuelCostPerGallon(BigDecimal v) { this.fuelCostPerGallon = v; }
    public BigDecimal getMaintenanceCostPerMile() { return maintenanceCostPerMile; }
    public void setMaintenanceCostPerMile(BigDecimal v) { this.maintenanceCostPerMile = v; }
    public BigDecimal getMonthlyFixedCosts() { return monthlyFixedCosts; }
    public void setMonthlyFixedCosts(BigDecimal v) { this.monthlyFixedCosts = v; }
    public BigDecimal getTargetMarginPerMile() { return targetMarginPerMile; }
    public void setTargetMarginPerMile(BigDecimal v) { this.targetMarginPerMile = v; }
    public Boolean getNotifyEmail() { return notifyEmail; }
    public void setNotifyEmail(Boolean v) { this.notifyEmail = v; }
    public Boolean getNotifySms() { return notifySms; }
    public void setNotifySms(Boolean v) { this.notifySms = v; }
    public Boolean getNotifyInApp() { return notifyInApp; }
    public void setNotifyInApp(Boolean v) { this.notifyInApp = v; }
}
