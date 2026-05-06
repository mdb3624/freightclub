package com.freightclub.modules.carrier.domain;

public enum FrequencyPreference {
    DAILY("Daily", "Loads preferred daily"),
    WEEKLY("Weekly", "Loads preferred weekly"),
    MONTHLY("Monthly", "Loads preferred monthly"),
    ANY("Any", "No frequency preference");

    private final String displayName;
    private final String description;

    FrequencyPreference(String displayName, String description) {
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
