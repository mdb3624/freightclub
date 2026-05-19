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
            existing != null ? existing.id() : UUID.randomUUID().toString(),
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
            existing != null ? existing.createdAt() : OffsetDateTime.now(),
            OffsetDateTime.now(),
            null
        );

        return repository.save(profile);
    }

    public Integer getCompletenessPercent() {
        return getProfile()
            .map(ShipperProfile::completenessPercent)
            .orElse(0);
    }

    public boolean isPublishReady() {
        return getCompletenessPercent() >= 80;
    }

    public int calculateCompleteness(ShipperProfile profile) {
        // AC-4 Completeness Calculation
        // Company name (20%), Email (20%), Phone (15%), Address (25%), MC/USDOT (15%), Logo (5%)
        int total = 0;
        if (profile.companyName() != null && !profile.companyName().isBlank()) total += 20;
        if (profile.billingEmail() != null && !profile.billingEmail().isBlank()) total += 20;
        if (profile.phoneNumber() != null && !profile.phoneNumber().isBlank()) total += 15;
        if (profile.city() != null && !profile.city().isBlank() &&
            profile.state() != null && !profile.state().isBlank() &&
            profile.zipCode() != null && !profile.zipCode().isBlank()) total += 25;
        boolean hasMC = profile.mcNumber() != null && !profile.mcNumber().isBlank();
        boolean hasUSDOT = profile.usdotNumber() != null && !profile.usdotNumber().isBlank();
        if (hasMC || hasUSDOT) total += 15;
        if (profile.logoUrl() != null && !profile.logoUrl().isBlank()) total += 5;
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
