package com.freightclub.modules.shipper;

import com.freightclub.modules.shipper.application.ShipperProfileService;
import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.ShipperProfileRepository;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShipperProfileServiceTest {

    @Mock
    private ShipperProfileRepository repository;

    private ShipperProfileService service;

    @BeforeEach
    void setup() {
        service = new ShipperProfileService(repository);
    }

    @Test
    void saveProfile_calculatesCompletenessAsHundredPercentWithAllFields() {
        // Given
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            "123456",
            "12345678",
            "https://logo.png"
        );

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            // Mock repository save
            when(repository.save(any())).thenAnswer(invocation -> {
                ShipperProfile profile = invocation.getArgument(0);
                return new ShipperProfile(
                    "uuid-123",
                    profile.getTenantId(),
                    profile.getCompanyName(),
                    profile.getBillingEmail(),
                    profile.getPhoneNumber(),
                    profile.getCity(),
                    profile.getState(),
                    profile.getZipCode(),
                    profile.getMcNumber(),
                    profile.getUsdotNumber(),
                    profile.getLogoUrl(),
                    100, // AC-4: all fields = 20+20+15+25+15+5 = 100
                    null,
                    null,
                    null
                );
            });

            // When
            ShipperProfile result = service.saveProfile(request);

            // Then
            ArgumentCaptor<ShipperProfile> captor = ArgumentCaptor.forClass(ShipperProfile.class);
            verify(repository).save(captor.capture());
            assertEquals("tenant-123", captor.getValue().getTenantId());
            assertEquals(100, result.getCompletenessPercent());
        }
    }

    @Test
    void saveProfile_calculatesCompletenessAsEightyPercentWithRequiredFieldsOnly() {
        // Given
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null, // no MC
            null, // no USDOT
            null  // no logo
        );

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            when(repository.save(any())).thenAnswer(invocation -> {
                ShipperProfile profile = invocation.getArgument(0);
                return new ShipperProfile(
                    "uuid-123",
                    profile.getTenantId(),
                    profile.getCompanyName(),
                    profile.getBillingEmail(),
                    profile.getPhoneNumber(),
                    profile.getCity(),
                    profile.getState(),
                    profile.getZipCode(),
                    null,
                    null,
                    null,
                    80, // AC-4: required only = 20+20+15+25 = 80
                    null,
                    null,
                    null
                );
            });

            // When
            ShipperProfile result = service.saveProfile(request);

            // Then
            ArgumentCaptor<ShipperProfile> captor = ArgumentCaptor.forClass(ShipperProfile.class);
            verify(repository).save(captor.capture());
            assertEquals("tenant-123", captor.getValue().getTenantId());
            assertEquals(80, result.getCompletenessPercent());
        }
    }

    @Test
    void isPublishReady_returnsTrueWhenCompletenessGreaterOrEqualEighty() {
        // Given
        ShipperProfile profile = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Apex",
            "email@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            80,
            null,
            null,
            null
        );

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
                .thenReturn(Optional.of(profile));

            // When
            boolean ready = service.isPublishReady();

            // Then
            assertTrue(ready);
            verify(repository).findByTenantIdAndDeletedAtIsNull("tenant-123");
        }
    }

    @Test
    void isPublishReady_returnsFalseWhenCompletenessLessThanEighty() {
        // Given
        ShipperProfile profile = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Apex",
            "email@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            60, // Less than 80
            null,
            null,
            null
        );

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
                .thenReturn(Optional.of(profile));

            // When
            boolean ready = service.isPublishReady();

            // Then
            assertFalse(ready);
            verify(repository).findByTenantIdAndDeletedAtIsNull("tenant-123");
        }
    }

    @Test
    void getCompletenessPercent_returnsProfileCompleteness() {
        // Given
        ShipperProfile profile = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Apex",
            "email@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            75,
            null,
            null,
            null
        );

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
                .thenReturn(Optional.of(profile));

            // When
            Integer completeness = service.getCompletenessPercent();

            // Then
            assertEquals(75, completeness);
            verify(repository).findByTenantIdAndDeletedAtIsNull("tenant-123");
        }
    }

    // ============= EDGE CASES - COMPLETENESS CALCULATION =============

    @Test
    void saveProfile_calculatesCompletenessAsSixtyPercentWithPhoneEmailAddressNoCompanyName() {
        // Given: email, phone, address (no company name) → 20+15+25 = 60%
        ShipperProfileRequest request = new ShipperProfileRequest(
            null, // no company name
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null, // no MC
            null, // no USDOT
            null  // no logo
        );

        when(repository.save(any())).thenAnswer(invocation -> {
            ShipperProfile profile = invocation.getArgument(0);
            return new ShipperProfile(
                "uuid-123",
                profile.getTenantId(),
                profile.getCompanyName(),
                profile.getBillingEmail(),
                profile.getPhoneNumber(),
                profile.getCity(),
                profile.getState(),
                profile.getZipCode(),
                null,
                null,
                null,
                60, // email(20) + phone(15) + address(25) = 60
                null,
                null,
                null
            );
        });

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            // When
            ShipperProfile result = service.saveProfile(request);

            // Then
            assertEquals(60, result.getCompletenessPercent());
        }
    }

    @Test
    void saveProfile_calculatesCompletenessAsZeroPercentWhenAllFieldsEmpty() {
        // Given: all fields null/empty
        ShipperProfileRequest request = new ShipperProfileRequest(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );

        when(repository.save(any())).thenAnswer(invocation -> {
            ShipperProfile profile = invocation.getArgument(0);
            return new ShipperProfile(
                "uuid-123",
                profile.getTenantId(),
                profile.getCompanyName(),
                profile.getBillingEmail(),
                profile.getPhoneNumber(),
                profile.getCity(),
                profile.getState(),
                profile.getZipCode(),
                null,
                null,
                null,
                0, // no fields = 0%
                null,
                null,
                null
            );
        });

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            // When
            ShipperProfile result = service.saveProfile(request);

            // Then
            assertEquals(0, result.getCompletenessPercent());
        }
    }

    @Test
    void saveProfile_calculatesCompletenessAsEightyFivePercentWithLogoIncluded() {
        // Given: all required fields + logo URL
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null, // no MC
            null, // no USDOT
            "https://logo.png"
        );

        when(repository.save(any())).thenAnswer(invocation -> {
            ShipperProfile profile = invocation.getArgument(0);
            return new ShipperProfile(
                "uuid-123",
                profile.getTenantId(),
                profile.getCompanyName(),
                profile.getBillingEmail(),
                profile.getPhoneNumber(),
                profile.getCity(),
                profile.getState(),
                profile.getZipCode(),
                null,
                null,
                profile.getLogoUrl(),
                85, // required(80) + logo(5) = 85
                null,
                null,
                null
            );
        });

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            // When
            ShipperProfile result = service.saveProfile(request);

            // Then
            assertEquals(85, result.getCompletenessPercent());
        }
    }

    @Test
    void saveProfile_calculatesCompletenessAsNinetyFivePercentWithMCNumberIncluded() {
        // Given: all required fields + MC number (no USDOT, no logo)
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            "123456", // MC number
            null,     // no USDOT
            null      // no logo
        );

        when(repository.save(any())).thenAnswer(invocation -> {
            ShipperProfile profile = invocation.getArgument(0);
            return new ShipperProfile(
                "uuid-123",
                profile.getTenantId(),
                profile.getCompanyName(),
                profile.getBillingEmail(),
                profile.getPhoneNumber(),
                profile.getCity(),
                profile.getState(),
                profile.getZipCode(),
                profile.getMcNumber(),
                null,
                null,
                95, // required(80) + MC(15) = 95
                null,
                null,
                null
            );
        });

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            // When
            ShipperProfile result = service.saveProfile(request);

            // Then
            assertEquals(95, result.getCompletenessPercent());
        }
    }

    // ============= PERSISTENCE TESTS =============

    @Test
    void saveProfile_createsNewProfileWithTenantId() {
        // Given: no existing profile for tenant "tenant-123"
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Apex Freight",
            "billing@apex.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null
        );

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            ArgumentCaptor<ShipperProfile> profileCaptor = ArgumentCaptor.forClass(ShipperProfile.class);
            when(repository.save(profileCaptor.capture())).thenAnswer(invocation -> {
                ShipperProfile profile = invocation.getArgument(0);
                return new ShipperProfile(
                    "uuid-123",
                    profile.getTenantId(),
                    profile.getCompanyName(),
                    profile.getBillingEmail(),
                    profile.getPhoneNumber(),
                    profile.getCity(),
                    profile.getState(),
                    profile.getZipCode(),
                    null,
                    null,
                    null,
                    80,
                    null,
                    null,
                    null
                );
            });

            // When
            ShipperProfile result = service.saveProfile(request);

            // Then
            assertNotNull(result);
            assertEquals("tenant-123", profileCaptor.getValue().getTenantId());
            verify(repository, times(1)).save(any(ShipperProfile.class));
        }
    }

    @Test
    void saveProfile_updatesExistingProfile() {
        // Given: existing profile already in repository
        ShipperProfileRequest request = new ShipperProfileRequest(
            "Updated Freight Co",
            "newemail@updated.com",
            "512-555-0999",
            "Dallas",
            "TX",
            "75201",
            null,
            null,
            null
        );

        ShipperProfile existingProfile = new ShipperProfile(
            "uuid-123",
            "tenant-123",
            "Old Company",
            "old@company.com",
            "512-555-0182",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            80,
            null,
            null,
            null
        );

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            when(repository.save(any())).thenAnswer(invocation -> {
                ShipperProfile profile = invocation.getArgument(0);
                return new ShipperProfile(
                    existingProfile.getId(), // ID remains same
                    profile.getTenantId(),
                    profile.getCompanyName(),
                    profile.getBillingEmail(),
                    profile.getPhoneNumber(),
                    profile.getCity(),
                    profile.getState(),
                    profile.getZipCode(),
                    null,
                    null,
                    null,
                    80,
                    null,
                    null,
                    null
                );
            });

            // When
            ShipperProfile result = service.saveProfile(request);

            // Then
            ArgumentCaptor<ShipperProfile> captor = ArgumentCaptor.forClass(ShipperProfile.class);
            verify(repository).save(captor.capture());
            assertEquals("tenant-123", captor.getValue().getTenantId());
            assertEquals("uuid-123", result.getId());
            verify(repository, times(1)).save(any(ShipperProfile.class));
        }
    }

    @Test
    void getProfile_respectsSoftDelete() {
        // Given: profile with deleted_at = NOT_NULL (soft deleted)
        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-123");

            when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
                .thenReturn(Optional.empty()); // no profile found because it's soft-deleted

            // When: getProfile called for soft-deleted profile
            Optional<ShipperProfile> result = service.getProfile();

            // Then
            assertTrue(result.isEmpty(), "Soft-deleted profile should not be returned");
            verify(repository, times(1)).findByTenantIdAndDeletedAtIsNull("tenant-123");
        }
    }

    // ============= MULTI-TENANCY TESTS =============

    @Test
    void getProfile_returnsDifferentProfilesForDifferentTenants() {
        // Given: two tenants (tenant-1, tenant-2)
        ShipperProfile profile1 = new ShipperProfile(
            "uuid-1",
            "tenant-1",
            "Company One",
            "one@company.com",
            "512-555-0111",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            80,
            null,
            null,
            null
        );

        ShipperProfile profile2 = new ShipperProfile(
            "uuid-2",
            "tenant-2",
            "Company Two",
            "two@company.com",
            "512-555-0222",
            "Dallas",
            "TX",
            "75201",
            null,
            null,
            null,
            80,
            null,
            null,
            null
        );

        when(repository.findByTenantIdAndDeletedAtIsNull("tenant-1"))
            .thenReturn(Optional.of(profile1));
        when(repository.findByTenantIdAndDeletedAtIsNull("tenant-2"))
            .thenReturn(Optional.of(profile2));

        // When: tenant-1 calls getProfile
        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");
            Optional<ShipperProfile> result1 = service.getProfile();

            // Then: tenant-1 gets their profile
            assertTrue(result1.isPresent());
            assertEquals("tenant-1", result1.get().getTenantId());
            assertEquals("uuid-1", result1.get().getId());
            verify(repository, times(1)).findByTenantIdAndDeletedAtIsNull("tenant-1");
        }

        // When: tenant-2 calls getProfile
        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-2");
            Optional<ShipperProfile> result2 = service.getProfile();

            // Then: tenant-2 gets their profile
            assertTrue(result2.isPresent());
            assertEquals("tenant-2", result2.get().getTenantId());
            assertEquals("uuid-2", result2.get().getId());
            verify(repository, times(1)).findByTenantIdAndDeletedAtIsNull("tenant-2");
        }
    }

    @Test
    void getProfile_doesNotReturnCrossTenantProfiles() {
        // Given: TenantContextHolder returns "tenant-1"
        ShipperProfile tenant1Profile = new ShipperProfile(
            "uuid-1",
            "tenant-1",
            "Company One",
            "one@company.com",
            "512-555-0111",
            "Austin",
            "TX",
            "78701",
            null,
            null,
            null,
            80,
            null,
            null,
            null
        );

        try (MockedStatic<TenantContextHolder> mockStatic = mockStatic(TenantContextHolder.class)) {
            mockStatic.when(TenantContextHolder::getTenantId).thenReturn("tenant-1");

            when(repository.findByTenantIdAndDeletedAtIsNull("tenant-1"))
                .thenReturn(Optional.of(tenant1Profile));

            // When: getProfile called for tenant-1
            Optional<ShipperProfile> result = service.getProfile();

            // Then: repository queried with tenant-1 only, not other tenants
            assertTrue(result.isPresent());
            assertEquals("tenant-1", result.get().getTenantId());
            verify(repository, times(1)).findByTenantIdAndDeletedAtIsNull("tenant-1");
            verify(repository, never()).findByTenantIdAndDeletedAtIsNull("tenant-2");
        }
    }
}
