package com.freightclub.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

public record UpdateThemePreferencesRequest(
        @NotNull
        @Pattern(regexp = "LIGHT|DARK|SYSTEM", message = "themeMode must be LIGHT, DARK, or SYSTEM")
        String themeMode,

        @NotNull
        Boolean sidebarCollapsed,

        Map<String, Object> dashboardLayout
) {
}
