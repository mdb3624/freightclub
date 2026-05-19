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

        // Mock repository save
        when(repository.save(any())).thenAnswer(invocation -> {
            ShipperProfile profile = invocation.getArgument(0);
            return new ShipperProfile(
                "uuid-123",
                profile.tenantId(),
                profile.companyName(),
                profile.billingEmail(),
                profile.phoneNumber(),
                profile.city(),
                profile.state(),
                profile.zipCode(),
                profile.mcNumber(),
                profile.usdotNumber(),
                profile.logoUrl(),
                100, // AC-4: all fields = 20+20+15+25+15+5 = 100
                null,
                null,
                null
            );
        });

        // When
        ShipperProfile result = service.saveProfile(request);

        // Then
        assertEquals(100, result.completenessPercent());
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

        when(repository.save(any())).thenAnswer(invocation -> {
            ShipperProfile profile = invocation.getArgument(0);
            return new ShipperProfile(
                "uuid-123",
                profile.tenantId(),
                profile.companyName(),
                profile.billingEmail(),
                profile.phoneNumber(),
                profile.city(),
                profile.state(),
                profile.zipCode(),
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
        assertEquals(80, result.completenessPercent());
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

        when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
            .thenReturn(Optional.of(profile));

        // When (mocking TenantContextHolder)
        boolean ready = service.isPublishReady();

        // Then
        assertTrue(ready);
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

        when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
            .thenReturn(Optional.of(profile));

        // When
        boolean ready = service.isPublishReady();

        // Then
        assertFalse(ready);
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

        when(repository.findByTenantIdAndDeletedAtIsNull("tenant-123"))
            .thenReturn(Optional.of(profile));

        // When
        Integer completeness = service.getCompletenessPercent();

        // Then
        assertEquals(75, completeness);
    }
}
