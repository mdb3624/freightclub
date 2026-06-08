package com.freightclub.service;

import com.freightclub.domain.UserPreferences;
import com.freightclub.dto.ThemePreferencesResponse;
import com.freightclub.dto.UpdateThemePreferencesRequest;
import com.freightclub.repository.UserPreferencesRepository;
import com.freightclub.security.TenantContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ThemePreferencesService {

    private final UserPreferencesRepository userPreferencesRepository;

    public ThemePreferencesService(UserPreferencesRepository userPreferencesRepository) {
        this.userPreferencesRepository = userPreferencesRepository;
    }

    @Transactional(readOnly = true)
    public ThemePreferencesResponse getPreferences(String userId) {
        String tenantId = TenantContextHolder.getTenantId();
        UserPreferences entity = userPreferencesRepository
                .findByUserIdAndTenantIdAndDeletedAtIsNull(userId, tenantId)
                .orElseGet(() -> createDefault(userId, tenantId));
        return ThemePreferencesResponse.from(entity);
    }

    public ThemePreferencesResponse updatePreferences(String userId, UpdateThemePreferencesRequest request) {
        String tenantId = TenantContextHolder.getTenantId();
        UserPreferences entity = userPreferencesRepository
                .findByUserIdAndTenantIdAndDeletedAtIsNull(userId, tenantId)
                .orElseGet(() -> createDefault(userId, tenantId));

        entity.setThemeMode(request.themeMode());
        entity.setSidebarCollapsed(Boolean.TRUE.equals(request.sidebarCollapsed()));
        entity.setDashboardLayout(request.dashboardLayout());

        UserPreferences saved = userPreferencesRepository.save(entity);
        return ThemePreferencesResponse.from(saved);
    }

    private UserPreferences createDefault(String userId, String tenantId) {
        UserPreferences entity = new UserPreferences();
        entity.setUserId(userId);
        entity.setTenantId(tenantId);
        entity.setThemeMode("SYSTEM");
        entity.setSidebarCollapsed(false);
        return userPreferencesRepository.save(entity);
    }
}
