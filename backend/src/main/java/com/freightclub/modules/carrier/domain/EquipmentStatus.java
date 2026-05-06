package com.freightclub.modules.carrier.domain;

public enum EquipmentStatus {
    ACTIVE("Active", "Equipment available for load matching"),
    INACTIVE("Inactive", "Equipment temporarily unavailable");

    private final String displayName;
    private final String description;

    EquipmentStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
