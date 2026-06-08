package com.freightclub.controller;

import com.freightclub.dto.ThemePreferencesResponse;
import com.freightclub.dto.UpdateThemePreferencesRequest;
import com.freightclub.service.ThemePreferencesService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/preferences/theme")
public class ThemePreferencesController {

    private final ThemePreferencesService themePreferencesService;

    public ThemePreferencesController(ThemePreferencesService themePreferencesService) {
        this.themePreferencesService = themePreferencesService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ThemePreferencesResponse> getThemePreferences(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(themePreferencesService.getPreferences(userId));
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ThemePreferencesResponse> updateThemePreferences(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateThemePreferencesRequest request) {
        return ResponseEntity.ok(themePreferencesService.updatePreferences(userId, request));
    }
}
