package com.freightclub.modules.shipper.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "shipper_profiles", indexes = {
  @Index(name = "idx_shipper_profiles_tenant", columnList = "tenant_id, deleted_at"),
  @Index(name = "idx_shipper_profiles_completeness", columnList = "tenant_id, deleted_at, completeness_pct")
})
public class ShipperProfile {

  @Id
  @Column(name = "id", length = 36)
  private String id;

  @Column(name = "tenant_id", length = 36, nullable = false)
  private String tenantId;

  @Column(name = "company_name", length = 120, nullable = false)
  private String companyName;

  @Column(name = "billing_email", length = 255, nullable = false)
  private String billingEmail;

  @Column(name = "phone_number", length = 20, nullable = false)
  private String phoneNumber;

  @Column(name = "city", length = 100, nullable = false)
  private String city;

  @Column(name = "state", length = 2, nullable = false)
  private String state;

  @Column(name = "zip_code", length = 5, nullable = false)
  private String zipCode;

  @Column(name = "mc_number", length = 8)
  private String mcNumber;

  @Column(name = "usdot_number", length = 8)
  private String usdotNumber;

  @Column(name = "logo_url", length = 500)
  private String logoUrl;

  @Column(name = "completeness_pct", nullable = false)
  private Integer completenessPercent = 0;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  // Cost Profile Fields (US-757: Cost Per Mile Calculator)
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

  @Column(name = "fuel_cost_per_gallon", nullable = true)
  private BigDecimal fuelCostPerGallon;

  @Column(name = "miles_per_gallon", nullable = true)
  private BigDecimal milesPerGallon;

  @Column(name = "maintenance_cost_per_mile", nullable = true)
  private BigDecimal maintenanceCostPerMile;

  @Column(name = "monthly_miles_target", nullable = true)
  private Integer monthlyMilesTarget;

  @Column(name = "target_margin_per_mile", nullable = true)
  private BigDecimal targetMarginPerMile;

  // Constructors
  public ShipperProfile() {
  }

  public ShipperProfile(String id, String tenantId) {
    this.id = id;
    this.tenantId = tenantId;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public String getCompanyName() {
    return companyName;
  }

  public void setCompanyName(String companyName) {
    this.companyName = companyName;
  }

  public String getBillingEmail() {
    return billingEmail;
  }

  public void setBillingEmail(String billingEmail) {
    this.billingEmail = billingEmail;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getState() {
    return state;
  }

  public void setState(String state) {
    this.state = state;
  }

  public String getZipCode() {
    return zipCode;
  }

  public void setZipCode(String zipCode) {
    this.zipCode = zipCode;
  }

  public String getMcNumber() {
    return mcNumber;
  }

  public void setMcNumber(String mcNumber) {
    this.mcNumber = mcNumber;
  }

  public String getUsdotNumber() {
    return usdotNumber;
  }

  public void setUsdotNumber(String usdotNumber) {
    this.usdotNumber = usdotNumber;
  }

  public String getLogoUrl() {
    return logoUrl;
  }

  public void setLogoUrl(String logoUrl) {
    this.logoUrl = logoUrl;
  }

  public Integer getCompletenessPercent() {
    return completenessPercent;
  }

  public void setCompletenessPercent(Integer completenessPercent) {
    this.completenessPercent = Math.min(completenessPercent, 100);
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(OffsetDateTime deletedAt) {
    this.deletedAt = deletedAt;
  }

  // Cost Profile Getters and Setters (US-757)
  public BigDecimal getTruckPaymentLease() {
    return truckPaymentLease;
  }

  public void setTruckPaymentLease(BigDecimal truckPaymentLease) {
    this.truckPaymentLease = truckPaymentLease;
  }

  public BigDecimal getInsurance() {
    return insurance;
  }

  public void setInsurance(BigDecimal insurance) {
    this.insurance = insurance;
  }

  public BigDecimal getIftaIrpPermits() {
    return iftaIrpPermits;
  }

  public void setIftaIrpPermits(BigDecimal iftaIrpPermits) {
    this.iftaIrpPermits = iftaIrpPermits;
  }

  public BigDecimal getPhoneEldMisc() {
    return phoneEldMisc;
  }

  public void setPhoneEldMisc(BigDecimal phoneEldMisc) {
    this.phoneEldMisc = phoneEldMisc;
  }

  public BigDecimal getPerDiemDailyRate() {
    return perDiemDailyRate;
  }

  public void setPerDiemDailyRate(BigDecimal perDiemDailyRate) {
    this.perDiemDailyRate = perDiemDailyRate;
  }

  public Integer getPerDiemDaysPerMonth() {
    return perDiemDaysPerMonth;
  }

  public void setPerDiemDaysPerMonth(Integer perDiemDaysPerMonth) {
    this.perDiemDaysPerMonth = perDiemDaysPerMonth;
  }

  public BigDecimal getFuelCostPerGallon() {
    return fuelCostPerGallon;
  }

  public void setFuelCostPerGallon(BigDecimal fuelCostPerGallon) {
    this.fuelCostPerGallon = fuelCostPerGallon;
  }

  public BigDecimal getMilesPerGallon() {
    return milesPerGallon;
  }

  public void setMilesPerGallon(BigDecimal milesPerGallon) {
    this.milesPerGallon = milesPerGallon;
  }

  public BigDecimal getMaintenanceCostPerMile() {
    return maintenanceCostPerMile;
  }

  public void setMaintenanceCostPerMile(BigDecimal maintenanceCostPerMile) {
    this.maintenanceCostPerMile = maintenanceCostPerMile;
  }

  public Integer getMonthlyMilesTarget() {
    return monthlyMilesTarget;
  }

  public void setMonthlyMilesTarget(Integer monthlyMilesTarget) {
    this.monthlyMilesTarget = monthlyMilesTarget;
  }

  public BigDecimal getTargetMarginPerMile() {
    return targetMarginPerMile;
  }

  public void setTargetMarginPerMile(BigDecimal targetMarginPerMile) {
    this.targetMarginPerMile = targetMarginPerMile;
  }

  // Business logic
  public boolean isDeleted() {
    return deletedAt != null;
  }

  public void softDelete() {
    this.deletedAt = OffsetDateTime.now();
  }
}
