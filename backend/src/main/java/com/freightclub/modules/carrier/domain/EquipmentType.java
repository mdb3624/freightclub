package com.freightclub.modules.carrier.domain;

public enum EquipmentType {
    FLATBED("Flatbed", "Open deck for pallets and machinery"),
    DRY_VAN("Dry Van", "Enclosed trailer for standard cargo"),
    REFRIGERATED("Refrigerated", "Temperature-controlled for perishables"),
    TANKER("Tanker", "Liquid transport"),
    SPECIALIZED("Specialized", "Custom equipment for oversized loads");

    private final String displayName;
    private final String description;

    EquipmentType(String displayName, String description) {
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
