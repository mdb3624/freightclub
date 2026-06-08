package com.freightclub.repository;

import com.freightclub.domain.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, String> {

    Optional<UserPreferences> findByUserIdAndTenantIdAndDeletedAtIsNull(String userId, String tenantId);
}
