package com.freightclub.modules.carrier.domain;

public enum EquipmentCondition {
    GOOD("Good", "Equipment in excellent working condition"),
    FAIR("Fair", "Equipment operational but with minor wear"),
    NEEDS_REPAIR("Needs Repair", "Equipment requires maintenance before use");

    private final String displayName;
    private final String description;

    EquipmentCondition(String displayName, String description) {
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
