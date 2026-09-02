package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.OrgSettingsResponse;
import com.freightclub.dto.UpdateOrgSettingsRequest;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// US-876 (Shipper Admin) / US-878 (Carrier Admin): OrgSettingsService is the single shared
// implementation covering both stories' identical mechanics.
@ExtendWith(MockitoExtension.class)
class OrgSettingsServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TenantRepository tenantRepository;

    @InjectMocks
    private OrgSettingsService orgSettingsService;

    private User makeAdmin(String tenantId) {
        User admin = new User();
        setField(admin, "id", "admin-1");
        admin.setTenantId(tenantId);
        admin.setRole(UserRole.SHIPPER);
        admin.setTenantAdmin(true);
        return admin;
    }

    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Nested
    class GetOrgSettings {

        @Test
        void returnsTenantDefaultsAndMemberCount() {
            User admin = makeAdmin("tenant-1");
            Tenant tenant = new Tenant();
            tenant.setDefaultPickupAddress1("123 Main St");
            tenant.setNotifyEmail(true);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));
            when(userRepository.countByTenantIdAndDeletedAtIsNull("tenant-1")).thenReturn(3L);

            OrgSettingsResponse result = orgSettingsService.getOrgSettings("admin-1");

            assertThat(result.defaultPickupAddress1()).isEqualTo("123 Main St");
            assertThat(result.notifyEmail()).isTrue();
            assertThat(result.memberCount()).isEqualTo(3L);
        }
    }

    @Nested
    class UpdateOrgSettings {

        @Test
        void appliesOnlyNonNullFields() {
            User admin = makeAdmin("tenant-1");
            Tenant tenant = new Tenant();
            tenant.setDefaultPickupCity("Old City");
            tenant.setFuelCostPerGallon(new BigDecimal("3.50"));
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));

            UpdateOrgSettingsRequest request = new UpdateOrgSettingsRequest(
                    null, null, "New City", null, null,
                    null, null, null, null, null,
                    null, null, null, null,
                    null, null, null
            );

            orgSettingsService.updateOrgSettings("admin-1", request);

            assertThat(tenant.getDefaultPickupCity()).isEqualTo("New City");
            // Untouched field (request left it null) must remain unchanged, not cleared.
            assertThat(tenant.getFuelCostPerGallon()).isEqualByComparingTo("3.50");
            verify(tenantRepository).save(tenant);
        }
    }
}
