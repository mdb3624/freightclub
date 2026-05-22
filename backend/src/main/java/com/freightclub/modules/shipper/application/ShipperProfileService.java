package com.freightclub.modules.shipper.application;

import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.ShipperProfileRepository;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.security.TenantContextHolder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ShipperProfileService {

    private final ShipperProfileRepository repository;

    public ShipperProfileService(ShipperProfileRepository repository) {
        this.repository = repository;
    }

    @Cacheable(value = "shipper-profiles", key = "#root.targetClass.name + '.' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
    public Optional<ShipperProfile> getProfile() {
        String tenantId = TenantContextHolder.getTenantId();
        return repository.findByTenantIdAndDeletedAtIsNull(tenantId);
    }

    @CacheEvict(value = "shipper-profiles", allEntries = true)
    public ShipperProfile saveProfile(ShipperProfileRequest request) {
        String tenantId = TenantContextHolder.getTenantId();
        ShipperProfile existing = repository.findByTenantIdAndDeletedAtIsNull(tenantId).orElse(null);

        int completeness = calculateCompleteness(request);

        ShipperProfile profile = new ShipperProfile(
            existing != null ? existing.getId() : UUID.randomUUID().toString(),
            tenantId,
            request.companyName(),
            request.billingEmail(),
            request.phoneNumber(),
            request.city(),
            request.state(),
            request.zipCode(),
            request.mcNumber(),
            request.usdotNumber(),
            request.logoUrl(),
            completeness,
            existing != null ? existing.getCreatedAt() : OffsetDateTime.now(),
            OffsetDateTime.now(),
            null
        );

        return repository.save(profile);
    }

    public Integer getCompletenessPercent() {
        return getProfile()
            .map(ShipperProfile::getCompletenessPercent)
            .orElse(0);
    }

    public boolean isPublishReady() {
        return getCompletenessPercent() >= 80;
    }

    /**
     * SEC-001-AC-003: Authorization check for @PreAuthorize annotation.
     * ShipperProfile is per-tenant (singleton); verify tenant ownership.
     * Returns true if profile exists for current tenant context.
     */
    @Transactional(readOnly = true)
    public boolean isOwner(String profileId) {
        String tenantId = TenantContextHolder.getTenantId();
        return repository.findByTenantIdAndDeletedAtIsNull(tenantId)
                .map(p -> p.getId().equals(profileId))
                .orElse(false);
    }

    public int calculateCompleteness(ShipperProfile profile) {
        // AC-4 Completeness Calculation
        // Company name (20%), Email (20%), Phone (15%), Address (25%), MC/USDOT (15%), Logo (5%)
        int total = 0;
        if (profile.getCompanyName() != null && !profile.getCompanyName().isBlank()) total += 20;
        if (profile.getBillingEmail() != null && !profile.getBillingEmail().isBlank()) total += 20;
        if (profile.getPhoneNumber() != null && !profile.getPhoneNumber().isBlank()) total += 15;
        if (profile.getCity() != null && !profile.getCity().isBlank() &&
            profile.getState() != null && !profile.getState().isBlank() &&
            profile.getZipCode() != null && !profile.getZipCode().isBlank()) total += 25;
        boolean hasMC = profile.getMcNumber() != null && !profile.getMcNumber().isBlank();
        boolean hasUSDOT = profile.getUsdotNumber() != null && !profile.getUsdotNumber().isBlank();
        if (hasMC || hasUSDOT) total += 15;
        if (profile.getLogoUrl() != null && !profile.getLogoUrl().isBlank()) total += 5;
        return Math.min(total, 100);
    }

    private int calculateCompleteness(ShipperProfileRequest request) {
        // AC-4 Completeness Calculation
        // Company name (20%), Email (20%), Phone (15%), Address (25%), MC/USDOT (15%), Logo (5%)
        int total = 0;
        if (request.companyName() != null && !request.companyName().isBlank()) total += 20;
        if (request.billingEmail() != null && !request.billingEmail().isBlank()) total += 20;
        if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) total += 15;
        if (request.city() != null && !request.city().isBlank() &&
            request.state() != null && !request.state().isBlank() &&
            request.zipCode() != null && !request.zipCode().isBlank()) total += 25;
        boolean hasMC = request.mcNumber() != null && !request.mcNumber().isBlank();
        boolean hasUSDOT = request.usdotNumber() != null && !request.usdotNumber().isBlank();
        if (hasMC || hasUSDOT) total += 15;
        if (request.logoUrl() != null && !request.logoUrl().isBlank()) total += 5;
        return Math.min(total, 100);
    }
}
