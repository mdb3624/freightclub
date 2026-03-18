package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.dto.ProfileResponse;
import com.freightclub.dto.UpdateProfileRequest;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProfileService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public ProfileService(UserRepository userRepository, TenantRepository tenantRepository) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String userId) {
        User user = findUser(userId);
        Tenant tenant = resolveTenant(user.getTenantId());
        return ProfileResponse.from(user, tenant);
    }

    public ProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = findUser(userId);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setBusinessName(request.businessName());
        user.setPhone(request.phone());
        user.setBillingAddress1(request.billingAddress1());
        user.setBillingAddress2(request.billingAddress2());
        user.setBillingCity(request.billingCity());
        user.setBillingState(request.billingState());
        user.setBillingZip(request.billingZip());
        user.setDefaultPickupAddress1(request.defaultPickupAddress1());
        user.setDefaultPickupAddress2(request.defaultPickupAddress2());
        user.setDefaultPickupCity(request.defaultPickupCity());
        user.setDefaultPickupState(request.defaultPickupState());
        user.setDefaultPickupZip(request.defaultPickupZip());
        user.setNotifyEmail(request.notifyEmail());
        user.setNotifySms(request.notifySms());
        user.setNotifyInApp(request.notifyInApp());
        user.setMcNumber(request.mcNumber());
        user.setDotNumber(request.dotNumber());
        user.setEquipmentType(request.equipmentType());
        User saved = userRepository.save(user);
        Tenant tenant = resolveTenant(saved.getTenantId());
        return ProfileResponse.from(saved, tenant);
    }

    private User findUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
    }

    @Nullable
    private Tenant resolveTenant(@Nullable String tenantId) {
        if (tenantId == null) return null;
        return tenantRepository.findById(tenantId).orElse(null);
    }
}
