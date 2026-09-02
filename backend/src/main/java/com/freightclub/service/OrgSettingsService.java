package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.dto.OrgSettingsResponse;
import com.freightclub.dto.UpdateOrgSettingsRequest;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// US-876 (Shipper Admin) / US-878 (Carrier Admin): one shared org-defaults capability,
// persona-agnostic per the same ARCHITECT reuse flag as TeamService — only the persona
// theme rendering this on the frontend differs, and only a subset of fields is relevant to
// either persona (the frontend renders just its own persona's fields).
@Service
@Transactional
public class OrgSettingsService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public OrgSettingsService(UserRepository userRepository, TenantRepository tenantRepository) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public OrgSettingsResponse getOrgSettings(String actingUserId) {
        String tenantId = tenantIdOf(actingUserId);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for admin user"));
        long memberCount = userRepository.countByTenantIdAndDeletedAtIsNull(tenantId);
        return OrgSettingsResponse.from(tenant, memberCount);
    }

    // US-876/878 AC-1: only non-null fields in the request are applied — null means "leave
    // unchanged," never "clear."
    public void updateOrgSettings(String actingUserId, UpdateOrgSettingsRequest request) {
        String tenantId = tenantIdOf(actingUserId);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for admin user"));

        if (request.defaultPickupAddress1() != null) tenant.setDefaultPickupAddress1(request.defaultPickupAddress1());
        if (request.defaultPickupAddress2() != null) tenant.setDefaultPickupAddress2(request.defaultPickupAddress2());
        if (request.defaultPickupCity() != null) tenant.setDefaultPickupCity(request.defaultPickupCity());
        if (request.defaultPickupState() != null) tenant.setDefaultPickupState(request.defaultPickupState());
        if (request.defaultPickupZip() != null) tenant.setDefaultPickupZip(request.defaultPickupZip());
        if (request.billingAddress1() != null) tenant.setBillingAddress1(request.billingAddress1());
        if (request.billingAddress2() != null) tenant.setBillingAddress2(request.billingAddress2());
        if (request.billingCity() != null) tenant.setBillingCity(request.billingCity());
        if (request.billingState() != null) tenant.setBillingState(request.billingState());
        if (request.billingZip() != null) tenant.setBillingZip(request.billingZip());
        if (request.fuelCostPerGallon() != null) tenant.setFuelCostPerGallon(request.fuelCostPerGallon());
        if (request.maintenanceCostPerMile() != null) tenant.setMaintenanceCostPerMile(request.maintenanceCostPerMile());
        if (request.monthlyFixedCosts() != null) tenant.setMonthlyFixedCosts(request.monthlyFixedCosts());
        if (request.targetMarginPerMile() != null) tenant.setTargetMarginPerMile(request.targetMarginPerMile());
        if (request.notifyEmail() != null) tenant.setNotifyEmail(request.notifyEmail());
        if (request.notifySms() != null) tenant.setNotifySms(request.notifySms());
        if (request.notifyInApp() != null) tenant.setNotifyInApp(request.notifyInApp());

        tenantRepository.save(tenant);
    }

    private String tenantIdOf(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + userId));
        return user.getTenantId();
    }
}
