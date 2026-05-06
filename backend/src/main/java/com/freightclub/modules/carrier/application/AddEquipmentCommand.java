package com.freightclub.modules.carrier.application;

import com.freightclub.modules.carrier.domain.EquipmentCondition;
import com.freightclub.modules.carrier.domain.EquipmentType;

public record AddEquipmentCommand(
    String tenantId,
    String truckerId,
    EquipmentType equipmentType,
    int lengthFeet,
    int widthFeet,
    int heightFeet,
    long capacityLbs,
    EquipmentCondition equipmentCondition,
    String yearModel
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String tenantId;
        private String truckerId;
        private EquipmentType equipmentType;
        private int lengthFeet;
        private int widthFeet;
        private int heightFeet;
        private long capacityLbs;
        private EquipmentCondition equipmentCondition;
        private String yearModel;

        public Builder tenantId(String tenantId) {
            this.tenantId = tenantId;
            return this;
        }

        public Builder truckerId(String truckerId) {
            this.truckerId = truckerId;
            return this;
        }

        public Builder equipmentType(EquipmentType equipmentType) {
            this.equipmentType = equipmentType;
            return this;
        }

        public Builder lengthFeet(int lengthFeet) {
            this.lengthFeet = lengthFeet;
            return this;
        }

        public Builder widthFeet(int widthFeet) {
            this.widthFeet = widthFeet;
            return this;
        }

        public Builder heightFeet(int heightFeet) {
            this.heightFeet = heightFeet;
            return this;
        }

        public Builder capacityLbs(long capacityLbs) {
            this.capacityLbs = capacityLbs;
            return this;
        }

        public Builder equipmentCondition(EquipmentCondition equipmentCondition) {
            this.equipmentCondition = equipmentCondition;
            return this;
        }

        public Builder yearModel(String yearModel) {
            this.yearModel = yearModel;
            return this;
        }

        public AddEquipmentCommand build() {
            return new AddEquipmentCommand(
                tenantId, truckerId, equipmentType, lengthFeet, widthFeet, heightFeet,
                capacityLbs, equipmentCondition, yearModel
            );
        }
    }
}
