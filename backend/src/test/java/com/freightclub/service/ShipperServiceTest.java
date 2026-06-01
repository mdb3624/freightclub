package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.ProfileResponse;
import com.freightclub.dto.UpdateProfileRequest;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Shipper-domain behaviour exercised through ProfileService.
 *
 * ShipperService does not yet exist as a dedicated class; cost calculations
 * and profile management that apply to shippers live in ProfileService.
 * This test covers all branches of that service that are relevant to the
 * Shipper role.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ShipperService (ProfileService — shipper branches)")
class ShipperServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private ProfileService service;

    private static final String USER_ID   = "shipper-user-1";
    private static final String TENANT_ID = "tenant-abc";

    @AfterEach
    void clearTenantContext() {
        TenantContextHolder.clear();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private User buildShipper() {
        User u = new User();
        ReflectionTestUtils.setField(u, "id", USER_ID);
        u.setTenantId(TENANT_ID);
        u.setEmail("shipper@example.com");
        u.setFirstName("Sam");
        u.setLastName("Shipper");
        u.setRole(UserRole.SHIPPER);
        return u;
    }

    private Tenant buildTenant() {
        Tenant t = new Tenant();
        ReflectionTestUtils.setField(t, "id", TENANT_ID);
        t.setName("Acme Freight");
        return t;
    }

    private UpdateProfileRequest minimalRequest(String firstName, String lastName) {
        return new UpdateProfileRequest(
                firstName, lastName, null, null,
                null, null, null, null, null,
                null, null, null, null, null,
                true, false, true,
                null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null);
    }

    // ------------------------------------------------------------------
    // getProfile
    // ------------------------------------------------------------------

    @Nested
    @DisplayName("getProfile()")
    class GetProfile {

        @Test
        @DisplayName("returns profile when user and tenant both exist")
        void happyPath_userAndTenantFound() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(buildShipper()));
            when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(buildTenant()));

            ProfileResponse response = service.getProfile(USER_ID);

            assertThat(response).isNotNull();
            assertThat(response.email()).isEqualTo("shipper@example.com");
        }

        @Test
        @DisplayName("returns profile when tenant is missing (tenant resolves to null)")
        void tenantNotFound_profileStillReturned() {
            User user = buildShipper();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.empty());

            ProfileResponse response = service.getProfile(USER_ID);

            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("throws IllegalStateException when user not found")
        void userNotFound_throwsIllegalState() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.getProfile(USER_ID))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining(USER_ID);
        }
    }

    // ------------------------------------------------------------------
    // updateProfile
    // ------------------------------------------------------------------

    @Nested
    @DisplayName("updateProfile()")
    class UpdateProfile {

        @Test
        @DisplayName("persists updated name fields and returns response")
        void happyPath_fieldsUpdated() {
            User user = buildShipper();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            doReturn(user).when(userRepository).save(any(User.class));
            when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(buildTenant()));

            service.updateProfile(USER_ID, minimalRequest("NewFirst", "NewLast"));

            assertThat(user.getFirstName()).isEqualTo("NewFirst");
            assertThat(user.getLastName()).isEqualTo("NewLast");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("throws IllegalStateException when user not found")
        void userNotFound_throwsIllegalState() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.updateProfile(USER_ID, minimalRequest("X", "Y")))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining(USER_ID);
        }

        @Test
        @DisplayName("blank billingState is stored as null")
        void blankState_storedAsNull() {
            User user = buildShipper();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            doReturn(user).when(userRepository).save(any(User.class));
            when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(buildTenant()));

            UpdateProfileRequest request = new UpdateProfileRequest(
                    "Sam", "Shipper", null, null,
                    null, null, null, "   ", null,
                    null, null, null, null, null,
                    true, false, true,
                    null, null, null,
                    null, null, null, null, null, null,
                    null, null, null, null, null);

            service.updateProfile(USER_ID, request);

            assertThat(user.getBillingState()).isNull();
        }

        @Test
        @DisplayName("non-blank billingState is preserved")
        void nonBlankState_preserved() {
            User user = buildShipper();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            doReturn(user).when(userRepository).save(any(User.class));
            when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(buildTenant()));

            UpdateProfileRequest request = new UpdateProfileRequest(
                    "Sam", "Shipper", null, null,
                    null, null, null, "TX", null,
                    null, null, null, null, null,
                    true, false, true,
                    null, null, null,
                    null, null, null, null, null, null,
                    null, null, null, null, null);

            service.updateProfile(USER_ID, request);

            assertThat(user.getBillingState()).isEqualTo("TX");
        }
    }

    // ------------------------------------------------------------------
    // isOwner
    // ------------------------------------------------------------------

    @Nested
    @DisplayName("isOwner()")
    class IsOwner {

        @Test
        @DisplayName("returns true when user belongs to current tenant")
        void matchingTenant_returnsTrue() {
            TenantContextHolder.setTenantId(TENANT_ID);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(buildShipper()));

            assertThat(service.isOwner(USER_ID)).isTrue();
        }

        @Test
        @DisplayName("returns false when user belongs to a different tenant")
        void differentTenant_returnsFalse() {
            TenantContextHolder.setTenantId("other-tenant");
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(buildShipper()));

            assertThat(service.isOwner(USER_ID)).isFalse();
        }

        @Test
        @DisplayName("returns false when user not found")
        void userNotFound_returnsFalse() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThat(service.isOwner(USER_ID)).isFalse();
        }
    }

    // ------------------------------------------------------------------
    // Static cost calculations
    // ------------------------------------------------------------------

    @Nested
    @DisplayName("calculateTotalFixedCosts()")
    class CalculateTotalFixedCosts {

        @Test
        @DisplayName("sums all non-null fields including per-diem product")
        void allFieldsPresent() {
            User u = new User();
            u.setTruckPaymentLease(new BigDecimal("1000"));
            u.setInsurance(new BigDecimal("500"));
            u.setIftaIrpPermits(new BigDecimal("200"));
            u.setPhoneEldMisc(new BigDecimal("100"));
            u.setPerDiemDailyRate(new BigDecimal("50"));
            u.setPerDiemDaysPerMonth(20);

            // 1000 + 500 + 200 + 100 + (50*20=1000) = 2800
            BigDecimal result = ProfileService.calculateTotalFixedCosts(u);

            assertThat(result).isEqualByComparingTo("2800");
        }

        @Test
        @DisplayName("treats null fields as zero")
        void nullFields_treatedAsZero() {
            User u = new User();
            // all fields null

            BigDecimal result = ProfileService.calculateTotalFixedCosts(u);

            assertThat(result).isEqualByComparingTo("0");
        }

        @Test
        @DisplayName("skips per-diem product when dailyRate is null")
        void perDiemDailyRateNull_skipsProduct() {
            User u = new User();
            u.setTruckPaymentLease(new BigDecimal("500"));
            u.setPerDiemDailyRate(null);
            u.setPerDiemDaysPerMonth(20);

            BigDecimal result = ProfileService.calculateTotalFixedCosts(u);

            assertThat(result).isEqualByComparingTo("500");
        }

        @Test
        @DisplayName("skips per-diem product when daysPerMonth is null")
        void perDiemDaysNull_skipsProduct() {
            User u = new User();
            u.setTruckPaymentLease(new BigDecimal("500"));
            u.setPerDiemDailyRate(new BigDecimal("50"));
            u.setPerDiemDaysPerMonth(null);

            BigDecimal result = ProfileService.calculateTotalFixedCosts(u);

            assertThat(result).isEqualByComparingTo("500");
        }
    }

    @Nested
    @DisplayName("calculateFixedCpm()")
    class CalculateFixedCpm {

        @Test
        @DisplayName("divides fixed costs by monthly miles with 4dp precision")
        void normalDivision() {
            BigDecimal result = ProfileService.calculateFixedCpm(new BigDecimal("3000"), 10000);

            assertThat(result).isEqualByComparingTo("0.3000");
        }

        @Test
        @DisplayName("returns zero when monthlyMiles is null")
        void nullMiles_returnsZero() {
            BigDecimal result = ProfileService.calculateFixedCpm(new BigDecimal("3000"), null);

            assertThat(result).isEqualByComparingTo("0");
        }

        @Test
        @DisplayName("returns zero when monthlyMiles is zero")
        void zeroMiles_returnsZero() {
            BigDecimal result = ProfileService.calculateFixedCpm(new BigDecimal("3000"), 0);

            assertThat(result).isEqualByComparingTo("0");
        }
    }

    @Nested
    @DisplayName("calculateFuelCpm()")
    class CalculateFuelCpm {

        @Test
        @DisplayName("divides fuel price by mpg with 4dp precision")
        void normalDivision() {
            // 3.60 / 6.0 = 0.6000
            BigDecimal result = ProfileService.calculateFuelCpm(
                    new BigDecimal("3.60"), new BigDecimal("6"));

            assertThat(result).isEqualByComparingTo("0.6000");
        }

        @Test
        @DisplayName("returns zero when mpg is null")
        void nullMpg_returnsZero() {
            BigDecimal result = ProfileService.calculateFuelCpm(new BigDecimal("4.00"), null);

            assertThat(result).isEqualByComparingTo("0");
        }

        @Test
        @DisplayName("returns zero when mpg is zero")
        void zeroMpg_returnsZero() {
            BigDecimal result = ProfileService.calculateFuelCpm(new BigDecimal("4.00"), BigDecimal.ZERO);

            assertThat(result).isEqualByComparingTo("0");
        }
    }

    @Nested
    @DisplayName("calculateVariableCpm()")
    class CalculateVariableCpm {

        @Test
        @DisplayName("adds fuelCpm and maintenanceCpm")
        void addsComponents() {
            BigDecimal result = ProfileService.calculateVariableCpm(
                    new BigDecimal("0.60"), new BigDecimal("0.15"));

            assertThat(result).isEqualByComparingTo("0.75");
        }
    }

    @Nested
    @DisplayName("calculateTotalCpm()")
    class CalculateTotalCpm {

        @Test
        @DisplayName("adds fixedCpm and variableCpm")
        void addsComponents() {
            BigDecimal result = ProfileService.calculateTotalCpm(
                    new BigDecimal("0.30"), new BigDecimal("0.75"));

            assertThat(result).isEqualByComparingTo("1.05");
        }
    }

    @Nested
    @DisplayName("calculateMinimumRpm()")
    class CalculateMinimumRpm {

        @Test
        @DisplayName("adds totalCpm and marginPerMile")
        void addsComponents() {
            BigDecimal result = ProfileService.calculateMinimumRpm(
                    new BigDecimal("1.05"), new BigDecimal("0.20"));

            assertThat(result).isEqualByComparingTo("1.25");
        }
    }
}
