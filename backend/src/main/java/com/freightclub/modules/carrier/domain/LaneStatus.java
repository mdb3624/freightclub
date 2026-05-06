package com.freightclub.modules.carrier.domain;

public enum LaneStatus {
    ACTIVE("Active", "Lane preference is active"),
    INACTIVE("Inactive", "Lane preference is inactive");

    private final String displayName;
    private final String description;

    LaneStatus(String displayName, String description) {
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
