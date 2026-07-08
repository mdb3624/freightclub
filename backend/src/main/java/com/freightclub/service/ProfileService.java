package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.dto.ProfileResponse;
import com.freightclub.dto.UpdateProfileRequest;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@Transactional
public class ProfileService {
    private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public ProfileService(UserRepository userRepository, TenantRepository tenantRepository) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String userId) {
        User user = findUser(userId);
        Tenant tenant = resolveTenant(user.getTenantId());
        return ProfileResponse.from(user, tenant);
    }

    public ProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        logger.info("Updating profile for user: {} with businessName: {}", userId, request.businessName());
        User user = findUser(userId);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setBusinessName(request.businessName());
        logger.info("After setting businessName: {}", user.getBusinessName());
        user.setPhone(request.phone());
        user.setBillingAddress1(request.billingAddress1());
        user.setBillingAddress2(request.billingAddress2());
        user.setBillingCity(request.billingCity());
        user.setBillingState(emptyToNull(request.billingState()));
        user.setBillingZip(request.billingZip());
        user.setDefaultPickupAddress1(request.defaultPickupAddress1());
        user.setDefaultPickupAddress2(request.defaultPickupAddress2());
        user.setDefaultPickupCity(request.defaultPickupCity());
        user.setDefaultPickupState(emptyToNull(request.defaultPickupState()));
        user.setDefaultPickupZip(request.defaultPickupZip());
        user.setNotifyEmail(request.notifyEmail());
        user.setNotifySms(request.notifySms());
        user.setNotifyInApp(request.notifyInApp());
        user.setMcNumber(request.mcNumber());
        user.setDotNumber(request.dotNumber());
        user.setEquipmentType(request.equipmentType());
        user.setEquipmentYear(request.equipmentYear());
        user.setEquipmentMake(request.equipmentMake());
        user.setEquipmentModel(request.equipmentModel());
        user.setLicensePlate(request.licensePlate());
        user.setVin(request.vin());
        user.setCdlClass(request.cdlClass());
        user.setCdlExpiry(request.cdlExpiry());
        user.setInsuranceCarrier(request.insuranceCarrier());
        user.setInsuranceExpiry(request.insuranceExpiry());
        user.setMedCardExpiry(request.medCardExpiry());
        user.setTruckPaymentLease(request.truckPaymentLease());
        user.setInsurance(request.insurance());
        user.setIftaIrpPermits(request.iftaIrpPermits());
        user.setPhoneEldMisc(request.phoneEldMisc());
        user.setPerDiemDailyRate(request.perDiemDailyRate());
        user.setPerDiemDaysPerMonth(request.perDiemDaysPerMonth());
        user.setFuelCostPerGallon(request.fuelCostPerGallon());
        user.setMilesPerGallon(request.milesPerGallon());
        user.setMaintenanceCostPerMile(request.maintenanceCostPerMile());
        user.setMonthlyMilesTarget(request.monthlyMilesTarget());
        user.setTargetMarginPerMile(request.targetMarginPerMile());
        User saved = userRepository.save(user);
        logger.info("Profile saved. BusinessName in response: {}", saved.getBusinessName());
        Tenant tenant = resolveTenant(saved.getTenantId());
        return ProfileResponse.from(saved, tenant);
    }

    /**
     * AC1: Calculate total fixed monthly costs.
     * Formula: truckPaymentLease + insurance + iftaIrpPermits + phoneEldMisc + (perDiemDailyRate * perDiemDaysPerMonth)
     */
    public static BigDecimal calculateTotalFixedCosts(User user) {
        BigDecimal truckPayment = user.getTruckPaymentLease() != null ? user.getTruckPaymentLease() : BigDecimal.ZERO;
        BigDecimal insurance = user.getInsurance() != null ? user.getInsurance() : BigDecimal.ZERO;
        BigDecimal ifta = user.getIftaIrpPermits() != null ? user.getIftaIrpPermits() : BigDecimal.ZERO;
        BigDecimal phone = user.getPhoneEldMisc() != null ? user.getPhoneEldMisc() : BigDecimal.ZERO;

        BigDecimal perDiem = BigDecimal.ZERO;
        if (user.getPerDiemDailyRate() != null && user.getPerDiemDaysPerMonth() != null) {
            perDiem = user.getPerDiemDailyRate().multiply(new BigDecimal(user.getPerDiemDaysPerMonth()));
        }

        return truckPayment.add(insurance).add(ifta).add(phone).add(perDiem);
    }

    /**
     * AC2: Calculate fixed cost per mile.
     * Formula: totalFixedCosts / monthlyMiles
     */
    public static BigDecimal calculateFixedCpm(BigDecimal fixedCosts, Integer monthlyMiles) {
        if (monthlyMiles == null || monthlyMiles == 0) {
            return BigDecimal.ZERO;
        }
        return fixedCosts.divide(new BigDecimal(monthlyMiles), 4, RoundingMode.HALF_UP);
    }

    /**
     * AC3: Calculate fuel cost per mile.
     * Formula: fuelPrice / mpg
     */
    public static BigDecimal calculateFuelCpm(BigDecimal fuelPrice, BigDecimal mpg) {
        if (mpg == null || mpg.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return fuelPrice.divide(mpg, 4, RoundingMode.HALF_UP);
    }

    /**
     * AC4: Calculate variable cost per mile.
     * Formula: fuelCpm + maintenanceCpm
     */
    public static BigDecimal calculateVariableCpm(BigDecimal fuelCpm, BigDecimal maintenanceCpm) {
        return fuelCpm.add(maintenanceCpm);
    }

    /**
     * AC5: Calculate total cost per mile.
     * Formula: fixedCpm + variableCpm
     */
    public static BigDecimal calculateTotalCpm(BigDecimal fixedCpm, BigDecimal variableCpm) {
        return fixedCpm.add(variableCpm);
    }

    /**
     * AC6: Calculate minimum revenue per mile.
     * Formula: totalCpm + marginPerMile
     */
    public static BigDecimal calculateMinimumRpm(BigDecimal totalCpm, BigDecimal marginPerMile) {
        return totalCpm.add(marginPerMile);
    }

    /**
     * SEC-001-AC-003: Authorization check for @PreAuthorize annotation.
     * Verify user ownership (tenant_id match) for PUT endpoints.
     * Returns false if user not found or tenant mismatch (no exception).
     */
    @Transactional(readOnly = true)
    public boolean isOwner(String userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return false;
        }
        return user.get().getTenantId().equals(TenantContextHolder.getTenantId());
    }

    private static String emptyToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    private User findUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
    }

    @Nullable
    private Tenant resolveTenant(@Nullable String tenantId) {
        if (tenantId == null) return null;
        return tenantRepository.findById(tenantId).orElse(null);
    }
}
