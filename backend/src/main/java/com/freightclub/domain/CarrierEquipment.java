package com.freightclub.domain;

import com.freightclub.modules.carrier.domain.EquipmentType;
import com.freightclub.modules.carrier.domain.EquipmentCondition;
import com.freightclub.modules.carrier.domain.EquipmentStatus;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

public class CarrierEquipment {

    private String id;
    private String tenantId;
    private String truckerId;
    private EquipmentType equipmentType;
    private int lengthFeet;
    private int widthFeet;
    private int heightFeet;
    private long capacityLbs;
    private EquipmentCondition equipmentCondition;
    private String yearModel;
    private EquipmentStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime deletedAt;

    // Public constructor for mapper
    public CarrierEquipment(
        String id,
        String tenantId,
        String truckerId,
        EquipmentType equipmentType,
        int lengthFeet,
        int widthFeet,
        int heightFeet,
        long capacityLbs,
        EquipmentCondition equipmentCondition,
        String yearModel,
        EquipmentStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime deletedAt
    ) {
        this.id = id;
        this.tenantId = tenantId;
        this.truckerId = truckerId;
        this.equipmentType = equipmentType;
        this.lengthFeet = lengthFeet;
        this.widthFeet = widthFeet;
        this.heightFeet = heightFeet;
        this.capacityLbs = capacityLbs;
        this.equipmentCondition = equipmentCondition;
        this.yearModel = yearModel;
        this.status = status;
        this.createdAt = createdAt;
        this.deletedAt = deletedAt;
    }

    // Factory method: Create new equipment (AC-1)
    public static CarrierEquipment createNew(
        EquipmentType equipmentType,
        int lengthFeet,
        int widthFeet,
        int heightFeet,
        long capacityLbs,
        EquipmentCondition equipmentCondition,
        String yearModel,
        String tenantId,
        String truckerId
    ) {
        // Validate dimensions
        validateDimensions(lengthFeet, widthFeet, heightFeet);
        // Validate capacity
        validateCapacity(capacityLbs);

        return new CarrierEquipment(
            UUID.randomUUID().toString(),
            tenantId,
            truckerId,
            equipmentType,
            lengthFeet,
            widthFeet,
            heightFeet,
            capacityLbs,
            equipmentCondition,
            yearModel,
            EquipmentStatus.ACTIVE,
            OffsetDateTime.now(ZoneOffset.UTC),
            null
        );
    }

    // Domain method: Update condition (AC-5)
    public void updateCondition(EquipmentCondition newCondition) {
        if (this.deletedAt != null) {
            throw new IllegalStateException("Cannot update deleted equipment");
        }
        this.equipmentCondition = newCondition;
    }

    // Domain method: Update full equipment (AC-3)
    public void updateEquipment(double lengthFeet, double widthFeet, double heightFeet, long capacityLbs, EquipmentCondition condition) {
        if (this.deletedAt != null) {
            throw new IllegalStateException("Cannot update deleted equipment");
        }
        validateDimensions((int)lengthFeet, (int)widthFeet, (int)heightFeet);
        validateCapacity(capacityLbs);
        this.lengthFeet = (int)lengthFeet;
        this.widthFeet = (int)widthFeet;
        this.heightFeet = (int)heightFeet;
        this.capacityLbs = capacityLbs;
        this.equipmentCondition = condition;
    }

    // Domain method: Soft delete (AC-5)
    public void softDelete() {
        this.deletedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    // Validation methods
    private static void validateDimensions(int length, int width, int height) {
        if (length <= 0 || width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Dimensions must be positive: length=" + length + ", width=" + width + ", height=" + height);
        }
    }

    private static void validateCapacity(long capacity) {
        if (capacity <= 0) {
            throw new IllegalArgumentException("Capacity must be positive: " + capacity);
        }
    }

    // Getters
    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public String getTruckerId() { return truckerId; }
    public EquipmentType getEquipmentType() { return equipmentType; }
    public int getLengthFeet() { return lengthFeet; }
    public int getWidthFeet() { return widthFeet; }
    public int getHeightFeet() { return heightFeet; }
    public long getCapacityLbs() { return capacityLbs; }
    public EquipmentCondition getEquipmentCondition() { return equipmentCondition; }
    public String getYearModel() { return yearModel; }
    public EquipmentStatus getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getDeletedAt() { return deletedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CarrierEquipment)) return false;
        CarrierEquipment that = (CarrierEquipment) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "CarrierEquipment{" +
                "id='" + id + '\'' +
                ", type=" + equipmentType +
                ", dimensions=" + lengthFeet + "x" + widthFeet + "x" + heightFeet +
                ", capacity=" + capacityLbs +
                ", status=" + status +
                '}';
    }
}
