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

    // 1. Add this back for JPA and AuthService
    public User() {
    }

    // 2. Keep this one for your MinRpmFilteringTest
    public User(String id) {
        this.id = id;
    }

    @Id
    @Column(columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", columnDefinition = "VARCHAR(36)", nullable = false, updatable = false)
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

    @Column(name = "billing_state", columnDefinition = "CHAR(2)")
    private String billingState;

    @Column(name = "billing_zip", length = 10)
    private String billingZip;

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

    @Column(name = "mc_number", length = 20)
    private String mcNumber;

    @Column(name = "dot_number", length = 20)
    private String dotNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_type", columnDefinition = "VARCHAR(30)")
    private EquipmentType equipmentType;

    @Column(name = "equipment_year", length = 4)
    private String equipmentYear;

    @Column(name = "equipment_make", length = 50)
    private String equipmentMake;

    @Column(name = "equipment_model", length = 50)
    private String equipmentModel;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @Column(name = "vin", length = 17)
    private String vin;

    @Enumerated(EnumType.STRING)
    @Column(name = "cdl_class", columnDefinition = "VARCHAR(10)")
    private CdlClass cdlClass;

    @Column(name = "cdl_expiry")
    private java.time.LocalDate cdlExpiry;

    @Column(name = "insurance_carrier", length = 100)
    private String insuranceCarrier;

    @Column(name = "insurance_expiry")
    private java.time.LocalDate insuranceExpiry;

    @Column(name = "med_card_expiry")
    private java.time.LocalDate medCardExpiry;

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

    @Column(name = "truck_payment_lease", nullable = true)
    private BigDecimal truckPaymentLease;

    @Column(name = "insurance", nullable = true)
    private BigDecimal insurance;

    @Column(name = "ifta_irp_permits", nullable = true)
    private BigDecimal iftaIrpPermits;

    @Column(name = "phone_eld_misc", nullable = true)
    private BigDecimal phoneEldMisc;

    @Column(name = "per_diem_daily_rate", nullable = true)
    private BigDecimal perDiemDailyRate;

    @Column(name = "per_diem_days_per_month", nullable = true)
    private Integer perDiemDaysPerMonth;

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
    public String getEquipmentYear() { return equipmentYear; }
    public void setEquipmentYear(String equipmentYear) { this.equipmentYear = equipmentYear; }
    public String getEquipmentMake() { return equipmentMake; }
    public void setEquipmentMake(String equipmentMake) { this.equipmentMake = equipmentMake; }
    public String getEquipmentModel() { return equipmentModel; }
    public void setEquipmentModel(String equipmentModel) { this.equipmentModel = equipmentModel; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }
    public CdlClass getCdlClass() { return cdlClass; }
    public void setCdlClass(CdlClass cdlClass) { this.cdlClass = cdlClass; }
    public java.time.LocalDate getCdlExpiry() { return cdlExpiry; }
    public void setCdlExpiry(java.time.LocalDate cdlExpiry) { this.cdlExpiry = cdlExpiry; }
    public String getInsuranceCarrier() { return insuranceCarrier; }
    public void setInsuranceCarrier(String insuranceCarrier) { this.insuranceCarrier = insuranceCarrier; }
    public java.time.LocalDate getInsuranceExpiry() { return insuranceExpiry; }
    public void setInsuranceExpiry(java.time.LocalDate insuranceExpiry) { this.insuranceExpiry = insuranceExpiry; }
    public java.time.LocalDate getMedCardExpiry() { return medCardExpiry; }
    public void setMedCardExpiry(java.time.LocalDate medCardExpiry) { this.medCardExpiry = medCardExpiry; }
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
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
    public BigDecimal getTruckPaymentLease() { return truckPaymentLease; }
    public void setTruckPaymentLease(BigDecimal truckPaymentLease) { this.truckPaymentLease = truckPaymentLease; }
    public BigDecimal getInsurance() { return insurance; }
    public void setInsurance(BigDecimal insurance) { this.insurance = insurance; }
    public BigDecimal getIftaIrpPermits() { return iftaIrpPermits; }
    public void setIftaIrpPermits(BigDecimal iftaIrpPermits) { this.iftaIrpPermits = iftaIrpPermits; }
    public BigDecimal getPhoneEldMisc() { return phoneEldMisc; }
    public void setPhoneEldMisc(BigDecimal phoneEldMisc) { this.phoneEldMisc = phoneEldMisc; }
    public BigDecimal getPerDiemDailyRate() { return perDiemDailyRate; }
    public void setPerDiemDailyRate(BigDecimal perDiemDailyRate) { this.perDiemDailyRate = perDiemDailyRate; }
    public Integer getPerDiemDaysPerMonth() { return perDiemDaysPerMonth; }
    public void setPerDiemDaysPerMonth(Integer perDiemDaysPerMonth) { this.perDiemDaysPerMonth = perDiemDaysPerMonth; }
}
