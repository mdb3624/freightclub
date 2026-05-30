package com.freightclub.modules.shipper.infrastructure.rest;

import com.freightclub.modules.shipper.application.ShipperProfileService;
import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileResponse;
import com.freightclub.modules.shipper.infrastructure.rest.dto.CompletenessResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController("shipperProfileController")
@RequestMapping("/api/v1/profile")
public class ProfileController {

  private final ShipperProfileService service;

  public ProfileController(ShipperProfileService service) {
    this.service = service;
  }

  @GetMapping("/company-info")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ShipperProfileResponse> getCompanyInfo() {
    return service.getProfile()
        .map(ShipperProfileResponse::from)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping("/company-info")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ShipperProfileResponse> saveCompanyInfo(@Valid @RequestBody ShipperProfileRequest request) {
    ShipperProfile profile = service.saveProfile(request);
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ShipperProfileResponse.from(profile));
  }

  @PutMapping("/company-info")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ShipperProfileResponse> updateCompanyInfo(@Valid @RequestBody ShipperProfileRequest request) {
    ShipperProfile profile = service.saveProfile(request);
    return ResponseEntity.ok(ShipperProfileResponse.from(profile));
  }

  @GetMapping("/completeness")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<CompletenessResponse> getCompleteness() {
    var profileOptional = service.getProfile();
    if (profileOptional.isPresent()) {
      var profile = profileOptional.get();
      var completeness = service.calculateCompleteness(profile);
      return ResponseEntity.ok(CompletenessResponse.from(profile, completeness));
    } else {
      return ResponseEntity.ok(new CompletenessResponse(0, false, java.util.List.of()));
    }
  }
}
