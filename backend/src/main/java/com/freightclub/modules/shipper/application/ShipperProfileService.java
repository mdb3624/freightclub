package com.freightclub.modules.shipper.application;

import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.ShipperProfileRepository;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.security.TenantContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ShipperProfileService {

  private final ShipperProfileRepository repository;
  private static final Pattern EMAIL_PATTERN =
    Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
  private static final Pattern PHONE_PATTERN =
    Pattern.compile("^\\(\\d{3}\\)\\s?\\d{3}-\\d{4}$");
  private static final Pattern ZIP_PATTERN =
    Pattern.compile("^\\d{5}$");

  public ShipperProfileService(ShipperProfileRepository repository) {
    this.repository = repository;
  }

  // For testing without repository
  public ShipperProfileService() {
    this.repository = null;
  }

  @Transactional(readOnly = true)
  public Optional<ShipperProfile> getProfile() {
    String tenantId = TenantContextHolder.getTenantId();
    return repository.findByTenantIdAndDeletedAtIsNull(tenantId);
  }

  @Transactional
  public ShipperProfile saveProfile(ShipperProfileRequest request) {
    String tenantId = TenantContextHolder.getTenantId();

    // Validate required fields
    validateRequired(request);

    // Find existing or create new
    ShipperProfile profile = repository.findByTenantIdAndDeletedAtIsNull(tenantId)
      .orElseGet(() -> {
        ShipperProfile newProfile = new ShipperProfile(
          UUID.randomUUID().toString(),
          tenantId
        );
        newProfile.setCreatedAt(OffsetDateTime.now());
        return newProfile;
      });

    // Update fields
    profile.setCompanyName(request.companyName());
    profile.setBillingEmail(request.billingEmail());
    profile.setPhoneNumber(request.phoneNumber());
    profile.setCity(request.city());
    profile.setState(request.state());
    profile.setZipCode(request.zipCode());
    profile.setMcNumber(request.mcNumber());
    profile.setUsdotNumber(request.usdotNumber());
    profile.setLogoUrl(request.logoUrl());
    profile.setUpdatedAt(OffsetDateTime.now());

    // Calculate and set completeness
    int completeness = calculateCompleteness(profile);
    profile.setCompletenessPercent(completeness);

    return repository.save(profile);
  }

  @Transactional(readOnly = true)
  public int getCompletenessPercent() {
    return getProfile()
      .map(ShipperProfile::getCompletenessPercent)
      .orElse(0);
  }

  @Transactional(readOnly = true)
  public boolean isPublishReady() {
    return getProfile()
      .map(this::isPublishReady)
      .orElse(false);
  }

  // Public for testing
  public int calculateCompleteness(ShipperProfile profile) {
    int completeness = 0;

    // Required fields
    if (profile.getCompanyName() != null && !profile.getCompanyName().isEmpty()) {
      completeness += 20;
    }
    if (profile.getBillingEmail() != null && isValidEmail(profile.getBillingEmail())) {
      completeness += 20;
    }
    if (profile.getPhoneNumber() != null && isValidPhone(profile.getPhoneNumber())) {
      completeness += 15;
    }
    if (profile.getCity() != null && !profile.getCity().isEmpty()) {
      completeness += 15;
    }
    if (profile.getState() != null && isValidStateCode(profile.getState())) {
      completeness += 5;
    }
    if (profile.getZipCode() != null && isValidZip(profile.getZipCode())) {
      completeness += 10;
    }

    // Optional but high-value fields
    if ((profile.getMcNumber() != null && !profile.getMcNumber().isEmpty()) ||
        (profile.getUsdotNumber() != null && !profile.getUsdotNumber().isEmpty())) {
      completeness += 15;
    }
    if (profile.getLogoUrl() != null && !profile.getLogoUrl().isEmpty()) {
      completeness += 5;
    }

    return Math.min(completeness, 100);
  }

  // Public for testing
  public boolean isPublishReady(ShipperProfile profile) {
    return profile.getCompletenessPercent() != null &&
           profile.getCompletenessPercent() >= 80;
  }

  // Validation helpers
  private void validateRequired(ShipperProfileRequest request) {
    if (request.companyName() == null || request.companyName().isEmpty()) {
      throw new IllegalArgumentException("Company name is required");
    }
    if (!isValidEmail(request.billingEmail())) {
      throw new IllegalArgumentException("Invalid email format");
    }
    if (!isValidPhone(request.phoneNumber())) {
      throw new IllegalArgumentException("Invalid phone format. Expected: (XXX) XXX-XXXX");
    }
    if (request.city() == null || request.city().isEmpty()) {
      throw new IllegalArgumentException("City is required");
    }
    if (!isValidStateCode(request.state())) {
      throw new IllegalArgumentException("Invalid state code");
    }
    if (!isValidZip(request.zipCode())) {
      throw new IllegalArgumentException("Invalid ZIP code format. Expected: 5 digits");
    }
  }

  private boolean isValidEmail(String email) {
    return email != null && EMAIL_PATTERN.matcher(email).matches();
  }

  private boolean isValidPhone(String phone) {
    return phone != null && PHONE_PATTERN.matcher(phone).matches();
  }

  private boolean isValidZip(String zip) {
    return zip != null && ZIP_PATTERN.matcher(zip).matches();
  }

  private boolean isValidStateCode(String state) {
    // Simplified: 2-letter uppercase state code
    return state != null && state.matches("[A-Z]{2}");
  }

  @Transactional
  public void deleteProfile() {
    String tenantId = TenantContextHolder.getTenantId();
    repository.findByTenantIdAndDeletedAtIsNull(tenantId)
      .ifPresent(profile -> {
        profile.softDelete();
        repository.save(profile);
      });
  }
}
