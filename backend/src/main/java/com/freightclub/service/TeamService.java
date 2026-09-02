package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.dto.JoinCodeResponse;
import com.freightclub.dto.TeamMemberResponse;
import com.freightclub.exception.LastTenantAdminException;
import com.freightclub.exception.TeamMemberNotFoundException;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// US-875 (Shipper Admin) / US-877 (Carrier Admin): one shared tenant-admin team-management
// capability, persona-agnostic, per the ARCHITECT reuse flag recorded in both story docs —
// only the persona theme rendering this on the frontend differs, not the backend mechanics.
// Endpoint security (ROLE_TENANT_ADMIN, see US-874's JWT authority) already scopes this to
// admins of either persona without needing a persona check here.
@Service
@Transactional
public class TeamService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public TeamService(UserRepository userRepository, TenantRepository tenantRepository) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> listMembers(String actingUserId) {
        String tenantId = tenantIdOf(actingUserId);
        return userRepository.findAllByTenantIdAndDeletedAtIsNull(tenantId).stream()
                .map(TeamMemberResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JoinCodeResponse getJoinCode(String actingUserId) {
        String tenantId = tenantIdOf(actingUserId);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for admin user"));
        return new JoinCodeResponse(tenant.getJoinCode());
    }

    // US-875/877 AC-3/BR-6: soft delete, never a hard DELETE — preserves historical
    // load/document attribution. AC-4/BR-4: rejects removing the tenant's last admin.
    public void removeMember(String actingUserId, String targetUserId) {
        String tenantId = tenantIdOf(actingUserId);
        User target = findMemberInTenant(tenantId, targetUserId);

        if (target.isTenantAdmin() && userRepository.countTenantAdmins(tenantId) <= 1) {
            throw new LastTenantAdminException();
        }

        target.setDeletedAt(LocalDateTime.now());
        userRepository.save(target);
    }

    // US-875/877 AC-4/AC-6/BR-5: grant/revoke is_tenant_admin only — never touches `role`.
    public void setTenantAdminStatus(String actingUserId, String targetUserId, boolean isTenantAdmin) {
        String tenantId = tenantIdOf(actingUserId);
        User target = findMemberInTenant(tenantId, targetUserId);

        boolean revoking = target.isTenantAdmin() && !isTenantAdmin;
        if (revoking && userRepository.countTenantAdmins(tenantId) <= 1) {
            throw new LastTenantAdminException();
        }

        target.setTenantAdmin(isTenantAdmin);
        userRepository.save(target);
    }

    private String tenantIdOf(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + userId))
                .getTenantId();
    }

    private User findMemberInTenant(String tenantId, String targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new TeamMemberNotFoundException(targetUserId));
        // Defense in depth alongside RLS (findById is already tenant-scoped at the DB session
        // level) — an explicit check here fails loudly rather than relying solely on RLS.
        if (!tenantId.equals(target.getTenantId())) {
            throw new TeamMemberNotFoundException(targetUserId);
        }
        return target;
    }
}
