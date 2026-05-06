package com.freightclub.modules.carrier.domain;

public enum AvailableDays {
    MON_FRI("Mon-Fri", "Monday through Friday"),
    WEEKENDS("Weekends", "Saturday and Sunday"),
    MON_SUN("Mon-Sun", "All days"),
    CUSTOM("Custom", "Custom schedule");

    private final String displayName;
    private final String description;

    AvailableDays(String displayName, String description) {
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
