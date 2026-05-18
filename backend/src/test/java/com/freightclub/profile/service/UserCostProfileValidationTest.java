package com.freightclub.profile.service;

import static org.assertj.core.api.Assertions.*;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.exception.ValidationException;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserCostProfileValidationTest {

  private static final String TENANT_ID = "test-tenant-user-cost";
  private static final String TRUCKER_ID = "trucker-user-cost";

  @Autowired private UserCostProfileValidator validator;
  @Autowired private TenantRepository tenantRepository;
  @Autowired private UserRepository userRepository;

  private User trucker;

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TENANT_ID);

    // Create tenant
    Tenant tenant = new Tenant();
    tenant.setId(TENANT_ID);
    tenant.setName("User Cost Test Tenant");
    tenantRepository.save(tenant);

    // Create trucker user
    trucker = new User(TRUCKER_ID);
    trucker.setTenantId(TENANT_ID);
    trucker.setEmail("trucker@test.com");
    trucker.setPasswordHash("$2a$10$testpassword");
    trucker.setRole(UserRole.TRUCKER);
    trucker.setFirstName("Test");
    trucker.setLastName("Trucker");
    userRepository.save(trucker);
  }

  @AfterEach
  void cleanup() {
    TenantContextHolder.clear();
  }

  @Test
  void validateTruckerCostFields_withValidInput_succeeds() {
    // Arrange: Set valid cost profile fields
    trucker.setMonthlyFixedCosts(new BigDecimal("2500.00"));
    trucker.setFuelCostPerGallon(new BigDecimal("3.50"));
    trucker.setMilesPerGallon(new BigDecimal("6.50"));
    trucker.setMaintenanceCostPerMile(new BigDecimal("0.15"));
    trucker.setMonthlyMilesTarget(10000);
    trucker.setTargetMarginPerMile(new BigDecimal("0.50"));
    trucker.setPerDiemDaysPerMonth(20);
    trucker.setPerDiemDailyRate(new BigDecimal("70.00"));
    trucker.setTruckPaymentLease(new BigDecimal("1500.00"));
    trucker.setInsurance(new BigDecimal("300.00"));
    trucker.setIftaIrpPermits(new BigDecimal("500.00"));
    trucker.setPhoneEldMisc(new BigDecimal("150.00"));

    // Act & Assert: Should not throw
    assertThatNoException()
        .isThrownBy(() -> validator.validateTruckerCostFields(trucker));
  }

  @Test
  void validateTruckerCostFields_withNegativeCost_throwsException() {
    // Arrange: Set negative cost
    trucker.setMonthlyFixedCosts(new BigDecimal("-100.00"));
    trucker.setFuelCostPerGallon(new BigDecimal("3.50"));
    trucker.setMilesPerGallon(new BigDecimal("6.50"));
    trucker.setMaintenanceCostPerMile(new BigDecimal("0.15"));
    trucker.setMonthlyMilesTarget(10000);

    // Act & Assert
    assertThatThrownBy(() -> validator.validateTruckerCostFields(trucker))
        .isInstanceOf(ValidationException.class)
        .hasMessageContaining("must be greater than or equal to 0");
  }

  @Test
  void validateTruckerCostFields_withPerDiemDaysOutOfRange_throwsException() {
    // Arrange: Set days > 31
    trucker.setMonthlyFixedCosts(new BigDecimal("2500.00"));
    trucker.setFuelCostPerGallon(new BigDecimal("3.50"));
    trucker.setMilesPerGallon(new BigDecimal("6.50"));
    trucker.setMaintenanceCostPerMile(new BigDecimal("0.15"));
    trucker.setMonthlyMilesTarget(10000);
    trucker.setPerDiemDaysPerMonth(32); // Invalid: > 31

    // Act & Assert
    assertThatThrownBy(() -> validator.validateTruckerCostFields(trucker))
        .isInstanceOf(ValidationException.class)
        .hasMessageContaining("between 1 and 31");
  }

  @Test
  void validateTruckerCostFields_withZeroMiles_throwsException() {
    // Arrange: Set monthlyMilesTarget to 0
    trucker.setMonthlyFixedCosts(new BigDecimal("2500.00"));
    trucker.setFuelCostPerGallon(new BigDecimal("3.50"));
    trucker.setMilesPerGallon(new BigDecimal("6.50"));
    trucker.setMaintenanceCostPerMile(new BigDecimal("0.15"));
    trucker.setMonthlyMilesTarget(0); // Invalid: must be > 0 if set

    // Act & Assert
    assertThatThrownBy(() -> validator.validateTruckerCostFields(trucker))
        .isInstanceOf(ValidationException.class)
        .hasMessageContaining("must be greater than 0");
  }

  @Test
  void validateTruckerCostFields_withNullOptionalFields_succeeds() {
    // Arrange: Set required fields, leave optional fields null
    trucker.setMonthlyFixedCosts(new BigDecimal("2500.00"));
    trucker.setFuelCostPerGallon(new BigDecimal("3.50"));
    trucker.setMilesPerGallon(new BigDecimal("6.50"));
    trucker.setMaintenanceCostPerMile(new BigDecimal("0.15"));
    trucker.setMonthlyMilesTarget(10000);
    // Leave optional fields as null: perDiemDaysPerMonth, truckPaymentLease, etc.

    // Act & Assert: Should not throw
    assertThatNoException()
        .isThrownBy(() -> validator.validateTruckerCostFields(trucker));
  }

  @Test
  void validateTruckerCostFields_withPerDiemDaysZero_throwsException() {
    // Arrange: Set perDiemDaysPerMonth to 0
    trucker.setMonthlyFixedCosts(new BigDecimal("2500.00"));
    trucker.setFuelCostPerGallon(new BigDecimal("3.50"));
    trucker.setMilesPerGallon(new BigDecimal("6.50"));
    trucker.setMaintenanceCostPerMile(new BigDecimal("0.15"));
    trucker.setMonthlyMilesTarget(10000);
    trucker.setPerDiemDaysPerMonth(0); // Invalid: must be between 1-31 if set

    // Act & Assert
    assertThatThrownBy(() -> validator.validateTruckerCostFields(trucker))
        .isInstanceOf(ValidationException.class)
        .hasMessageContaining("between 1 and 31");
  }
}
