package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.ProfileResponse;
import com.freightclub.dto.UpdateProfileRequest;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TenantRepository tenantRepository;

    @InjectMocks
    private ProfileService service;

    private static final String USER_ID   = "user-1";
    private static final String TENANT_ID = "tenant-1";

    private User buildUser() {
        User u = new User();
        ReflectionTestUtils.setField(u, "id", USER_ID);
        u.setTenantId(TENANT_ID);
        u.setEmail("alice@example.com");
        u.setFirstName("Alice");
        u.setLastName("Smith");
        u.setRole(UserRole.SHIPPER);
        return u;
    }

    private Tenant buildTenant() {
        Tenant t = new Tenant();
        ReflectionTestUtils.setField(t, "id", TENANT_ID);
        t.setName("Acme Freight");
        return t;
    }

    @Nested
    class GetProfile {

        @Test
        @DisplayName("returns ProfileResponse built from user and tenant")
        void happyPath() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(buildUser()));
            when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(buildTenant()));

            ProfileResponse response = service.getProfile(USER_ID);

            assertThat(response).isNotNull();
            assertThat(response.email()).isEqualTo("alice@example.com");
        }

        @Test
        @DisplayName("throws when user not found")
        void userNotFound_throws() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.getProfile(USER_ID))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    @Nested
    class UpdateProfile {

        @Test
        @DisplayName("updates user fields and returns response")
        void happyPath() {
            User user = buildUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(userRepository.save(any())).thenReturn(user);
            when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(buildTenant()));

            UpdateProfileRequest request = new UpdateProfileRequest(
                    "Bob", "Jones", "BobFreight LLC", "+1-555-9999",
                    null, null, null, null, null,
                    null, null, null, null, null,
                    true, false, true,
                    null, null, null,
                    null, null, null, null, null,
                    null, null, null, null, null,
                    null, null, null, null, null, null,
                    null, null, null, null, null);

            ProfileResponse response = service.updateProfile(USER_ID, request);

            assertThat(user.getFirstName()).isEqualTo("Bob");
            assertThat(user.getLastName()).isEqualTo("Jones");
            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("throws when user not found on update")
        void userNotFound_throws() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            UpdateProfileRequest request = new UpdateProfileRequest(
                    "Bob", "Jones", null, null,
                    null, null, null, null, null,
                    null, null, null, null, null,
                    true, false, true,
                    null, null, null,
                    null, null, null, null, null,
                    null, null, null, null, null,
                    null, null, null, null, null, null,
                    null, null, null, null, null);

            assertThatThrownBy(() -> service.updateProfile(USER_ID, request))
                    .isInstanceOf(RuntimeException.class);
        }
    }
}
