package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.JoinCodeResponse;
import com.freightclub.dto.TeamMemberResponse;
import com.freightclub.exception.LastTenantAdminException;
import com.freightclub.exception.TeamMemberNotFoundException;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// US-875 (Shipper Admin) / US-877 (Carrier Admin): TeamService is the single shared
// implementation covering both stories' identical mechanics per the ARCHITECT reuse flag —
// these tests exercise both stories' ACs in one place rather than duplicating them.
@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TenantRepository tenantRepository;

    @InjectMocks
    private TeamService teamService;

    private User makeUser(String id, String tenantId, UserRole role, boolean isTenantAdmin) {
        User user = new User();
        setField(user, "id", id);
        user.setTenantId(tenantId);
        user.setEmail(id + "@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(role);
        user.setTenantAdmin(isTenantAdmin);
        return user;
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

    // -------------------------------------------------------------------------
    // listMembers — AC-1
    // -------------------------------------------------------------------------

    @Nested
    class ListMembers {

        @Test
        void returnsOnlyMembersOfActingAdminsTenant() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.SHIPPER, true);
            User member = makeUser("member-1", "tenant-1", UserRole.SHIPPER, false);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.findAllByTenantIdAndDeletedAtIsNull("tenant-1"))
                    .thenReturn(List.of(admin, member));

            List<TeamMemberResponse> result = teamService.listMembers("admin-1");

            assertThat(result).hasSize(2);
            assertThat(result).extracting(TeamMemberResponse::id).containsExactly("admin-1", "member-1");
            assertThat(result.get(0).isTenantAdmin()).isTrue();
            assertThat(result.get(1).isTenantAdmin()).isFalse();
        }
    }

    // -------------------------------------------------------------------------
    // getJoinCode — AC-2
    // -------------------------------------------------------------------------

    @Nested
    class GetJoinCode {

        @Test
        void returnsTenantsExistingJoinCode() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.TRUCKER, true);
            Tenant tenant = new Tenant();
            tenant.setJoinCode("ABCD1234");
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));

            JoinCodeResponse result = teamService.getJoinCode("admin-1");

            assertThat(result.joinCode()).isEqualTo("ABCD1234");
        }
    }

    // -------------------------------------------------------------------------
    // removeMember — AC-3/AC-4
    // -------------------------------------------------------------------------

    @Nested
    class RemoveMember {

        @Test
        void softDeletesMember_whenNotLastAdmin() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.SHIPPER, true);
            User member = makeUser("member-1", "tenant-1", UserRole.SHIPPER, false);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.findById("member-1")).thenReturn(Optional.of(member));

            teamService.removeMember("admin-1", "member-1");

            assertThat(member.getDeletedAt()).isNotNull();
            verify(userRepository).save(member);
        }

        @Test
        void rejects_whenRemovingLastRemainingAdmin() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.SHIPPER, true);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.countTenantAdmins("tenant-1")).thenReturn(1L);

            assertThatThrownBy(() -> teamService.removeMember("admin-1", "admin-1"))
                    .isInstanceOf(LastTenantAdminException.class);

            verify(userRepository, never()).save(any());
        }

        @Test
        void allowsRemovingAnAdmin_whenAnotherAdminRemains() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.SHIPPER, true);
            User otherAdmin = makeUser("admin-2", "tenant-1", UserRole.SHIPPER, true);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.findById("admin-2")).thenReturn(Optional.of(otherAdmin));
            when(userRepository.countTenantAdmins("tenant-1")).thenReturn(2L);

            teamService.removeMember("admin-1", "admin-2");

            assertThat(otherAdmin.getDeletedAt()).isNotNull();
        }

        @Test
        void throws_whenTargetBelongsToDifferentTenant() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.SHIPPER, true);
            User otherTenantUser = makeUser("member-x", "tenant-2", UserRole.SHIPPER, false);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.findById("member-x")).thenReturn(Optional.of(otherTenantUser));

            assertThatThrownBy(() -> teamService.removeMember("admin-1", "member-x"))
                    .isInstanceOf(TeamMemberNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // setTenantAdminStatus — AC-4/AC-6
    // -------------------------------------------------------------------------

    @Nested
    class SetTenantAdminStatus {

        @Test
        void grantsAdminStatus_withoutChangingRole() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.SHIPPER, true);
            User member = makeUser("member-1", "tenant-1", UserRole.SHIPPER, false);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.findById("member-1")).thenReturn(Optional.of(member));

            teamService.setTenantAdminStatus("admin-1", "member-1", true);

            assertThat(member.isTenantAdmin()).isTrue();
            assertThat(member.getRole()).isEqualTo(UserRole.SHIPPER);
            verify(userRepository).save(member);
        }

        @Test
        void rejects_whenRevokingLastRemainingAdmin() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.TRUCKER, true);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.countTenantAdmins("tenant-1")).thenReturn(1L);

            assertThatThrownBy(() -> teamService.setTenantAdminStatus("admin-1", "admin-1", false))
                    .isInstanceOf(LastTenantAdminException.class);

            verify(userRepository, never()).save(any());
        }

        @Test
        void allowsRevoking_whenAnotherAdminRemains() {
            User admin = makeUser("admin-1", "tenant-1", UserRole.TRUCKER, true);
            User otherAdmin = makeUser("admin-2", "tenant-1", UserRole.TRUCKER, true);
            when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
            when(userRepository.findById("admin-2")).thenReturn(Optional.of(otherAdmin));
            when(userRepository.countTenantAdmins("tenant-1")).thenReturn(2L);

            teamService.setTenantAdminStatus("admin-1", "admin-2", false);

            assertThat(otherAdmin.isTenantAdmin()).isFalse();
            assertThat(otherAdmin.getRole()).isEqualTo(UserRole.TRUCKER);
        }
    }
}
