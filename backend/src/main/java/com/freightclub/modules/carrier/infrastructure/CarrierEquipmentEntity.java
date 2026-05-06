package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.CarrierEquipment;
import com.freightclub.modules.carrier.domain.EquipmentCondition;
import com.freightclub.modules.carrier.domain.EquipmentStatus;
import com.freightclub.modules.carrier.domain.EquipmentType;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "carrier_equipment",
    indexes = {
        @Index(name = "idx_carrier_equipment_trucker", columnList = "tenant_id, trucker_id, deleted_at"),
        @Index(name = "idx_carrier_equipment_type", columnList = "equipment_type, tenant_id")
    }
)
public class CarrierEquipmentEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "trucker_id", nullable = false, length = 36)
    private String truckerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_type", nullable = false)
    private EquipmentType equipmentType;

    @Column(name = "length_feet", nullable = false)
    private int lengthFeet;

    @Column(name = "width_feet", nullable = false)
    private int widthFeet;

    @Column(name = "height_feet", nullable = false)
    private int heightFeet;

    @Column(name = "capacity_lbs", nullable = false)
    private long capacityLbs;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_condition", nullable = false)
    private EquipmentCondition equipmentCondition;

    @Column(name = "year_model", length = 20)
    private String yearModel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EquipmentStatus status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    public CarrierEquipmentEntity() {
    }

    public CarrierEquipmentEntity(String id, String tenantId, String truckerId, EquipmentType equipmentType,
                                  int lengthFeet, int widthFeet, int heightFeet, long capacityLbs,
                                  EquipmentCondition equipmentCondition, String yearModel,
                                  EquipmentStatus status, OffsetDateTime createdAt, OffsetDateTime deletedAt) {
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

    // Mapper: Entity → Domain
    public CarrierEquipment toDomain() {
        return new CarrierEquipment(
            id, tenantId, truckerId, equipmentType, lengthFeet, widthFeet, heightFeet,
            capacityLbs, equipmentCondition, yearModel, status, createdAt, deletedAt
        );
    }

    // Mapper: Domain → Entity
    public static CarrierEquipmentEntity fromDomain(CarrierEquipment domain) {
        return new CarrierEquipmentEntity(
            domain.getId(), domain.getTenantId(), domain.getTruckerId(),
            domain.getEquipmentType(), domain.getLengthFeet(), domain.getWidthFeet(),
            domain.getHeightFeet(), domain.getCapacityLbs(), domain.getEquipmentCondition(),
            domain.getYearModel(), domain.getStatus(), domain.getCreatedAt(), domain.getDeletedAt()
        );
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getTruckerId() { return truckerId; }
    public void setTruckerId(String truckerId) { this.truckerId = truckerId; }

    public EquipmentType getEquipmentType() { return equipmentType; }
    public void setEquipmentType(EquipmentType equipmentType) { this.equipmentType = equipmentType; }

    public int getLengthFeet() { return lengthFeet; }
    public void setLengthFeet(int lengthFeet) { this.lengthFeet = lengthFeet; }

    public int getWidthFeet() { return widthFeet; }
    public void setWidthFeet(int widthFeet) { this.widthFeet = widthFeet; }

    public int getHeightFeet() { return heightFeet; }
    public void setHeightFeet(int heightFeet) { this.heightFeet = heightFeet; }

    public long getCapacityLbs() { return capacityLbs; }
    public void setCapacityLbs(long capacityLbs) { this.capacityLbs = capacityLbs; }

    public EquipmentCondition getEquipmentCondition() { return equipmentCondition; }
    public void setEquipmentCondition(EquipmentCondition equipmentCondition) { this.equipmentCondition = equipmentCondition; }

    public String getYearModel() { return yearModel; }
    public void setYearModel(String yearModel) { this.yearModel = yearModel; }

    public EquipmentStatus getStatus() { return status; }
    public void setStatus(EquipmentStatus status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }
}
