package com.freightclub.dto;

import com.freightclub.domain.UserPreferences;

import java.util.Map;

public record ThemePreferencesResponse(
        String id,
        String userId,
        String themeMode,
        boolean sidebarCollapsed,
        Map<String, Object> dashboardLayout
) {
    public static ThemePreferencesResponse from(UserPreferences entity) {
        return new ThemePreferencesResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getThemeMode(),
                entity.isSidebarCollapsed(),
                entity.getDashboardLayout());
    }
}
