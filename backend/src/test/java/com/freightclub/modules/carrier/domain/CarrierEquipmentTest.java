package com.freightclub.modules.carrier.domain;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.core.context.SecurityContextHolder;
import com.freightclub.security.TenantContextHolder;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("CarrierEquipment Domain Entity Tests")
class CarrierEquipmentTest {

    private CarrierEquipment equipment;
    private String testTenantId;
    private String testTruckerId;

    @BeforeEach
    void setUp() {
        testTenantId = UUID.randomUUID().toString();
        testTruckerId = UUID.randomUUID().toString();
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("AC-1: Should create equipment with validation")
    void testCreateEquipment_WithValidation() {
        // Arrange & Act
        equipment = CarrierEquipment.createNew(
            EquipmentType.FLATBED,
            48,
            8,
            6,
            45000,
            EquipmentCondition.GOOD,
            "2022 Wabash",
            testTenantId,
            testTruckerId
        );

        // Assert
        assertNotNull(equipment.getId());
        assertEquals(EquipmentType.FLATBED, equipment.getEquipmentType());
        assertEquals(48, equipment.getLengthFeet());
        assertEquals(8, equipment.getWidthFeet());
        assertEquals(6, equipment.getHeightFeet());
        assertEquals(45000, equipment.getCapacityLbs());
        assertEquals(EquipmentCondition.GOOD, equipment.getEquipmentCondition());
        assertEquals(EquipmentStatus.ACTIVE, equipment.getStatus());
        assertNull(equipment.getDeletedAt());
    }

    @ParameterizedTest
    @DisplayName("AC-1: Should accept all equipment types")
    @ValueSource(strings = {"FLATBED", "DRY_VAN", "REFRIGERATED", "TANKER", "SPECIALIZED"})
    void testCreateEquipment_AllTypes(String typeString) {
        // Arrange & Act
        EquipmentType type = EquipmentType.valueOf(typeString);
        equipment = CarrierEquipment.createNew(
            type,
            40,
            8,
            6,
            40000,
            EquipmentCondition.GOOD,
            null,
            testTenantId,
            testTruckerId
        );

        // Assert
        assertEquals(type, equipment.getEquipmentType());
    }

    @Test
    @DisplayName("AC-1: Should reject invalid dimensions (negative)")
    void testCreateEquipment_RejectsNegativeDimensions() {
        // Assert
        assertThrows(IllegalArgumentException.class, () ->
            CarrierEquipment.createNew(
                EquipmentType.FLATBED,
                -48,  // Invalid negative length
                8,
                6,
                45000,
                EquipmentCondition.GOOD,
                null,
                testTenantId,
                testTruckerId
            )
        );
    }

    @Test
    @DisplayName("AC-1: Should reject zero capacity")
    void testCreateEquipment_RejectsZeroCapacity() {
        // Assert
        assertThrows(IllegalArgumentException.class, () ->
            CarrierEquipment.createNew(
                EquipmentType.FLATBED,
                48,
                8,
                6,
                0,  // Invalid zero capacity
                EquipmentCondition.GOOD,
                null,
                testTenantId,
                testTruckerId
            )
        );
    }

    @Test
    @DisplayName("AC-5: Should update equipment condition")
    void testUpdateCondition() {
        // Arrange
        equipment = CarrierEquipment.createNew(
            EquipmentType.FLATBED,
            48,
            8,
            6,
            45000,
            EquipmentCondition.GOOD,
            null,
            testTenantId,
            testTruckerId
        );

        // Act
        equipment.updateCondition(EquipmentCondition.NEEDS_REPAIR);

        // Assert
        assertEquals(EquipmentCondition.NEEDS_REPAIR, equipment.getEquipmentCondition());
    }

    @Test
    @DisplayName("AC-5: Should soft delete equipment")
    void testSoftDelete() {
        // Arrange
        equipment = CarrierEquipment.createNew(
            EquipmentType.FLATBED,
            48,
            8,
            6,
            45000,
            EquipmentCondition.GOOD,
            null,
            testTenantId,
            testTruckerId
        );

        // Act
        equipment.softDelete();

        // Assert
        assertNotNull(equipment.getDeletedAt());
    }

    @Test
    @DisplayName("Should enforce tenant isolation")
    void testTenantIsolation() {
        // Arrange
        String altTenantId = UUID.randomUUID().toString();

        // Act
        equipment = CarrierEquipment.createNew(
            EquipmentType.FLATBED,
            48,
            8,
            6,
            45000,
            EquipmentCondition.GOOD,
            null,
            altTenantId,
            testTruckerId
        );

        // Assert
        assertEquals(altTenantId, equipment.getTenantId());
    }
}
