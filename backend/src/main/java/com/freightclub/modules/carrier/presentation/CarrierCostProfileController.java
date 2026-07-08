package com.freightclub.modules.carrier.presentation;

import com.freightclub.modules.carrier.application.CarrierCostProfileService;
import com.freightclub.modules.carrier.application.CostProfileResponse;
import com.freightclub.modules.carrier.application.CostProfileWizardInput;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

// US-730a-v2 (CHG-US730-007): dedicated /carrier/cost-profile endpoint,
// standardizes on CarrierCostProfileEntity so LoadService's RPM coloring
// and this wizard read/write the same data.
@RestController
@RequestMapping("/api/v1/carrier/cost-profile")
@PreAuthorize("hasRole('TRUCKER')")
public class CarrierCostProfileController {

  private final CarrierCostProfileService service;

  public CarrierCostProfileController(CarrierCostProfileService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<CostProfileResponse> getCostProfile(@AuthenticationPrincipal String truckerId) {
    CarrierCostProfile profile = service.getCostProfile(truckerId);
    if (profile == null) {
      return ResponseEntity.ok(null);
    }
    BigDecimal dieselPrice = service.resolveDieselPrice(profile);
    return ResponseEntity.ok(CostProfileResponse.from(profile, dieselPrice));
  }

  @PutMapping
  public ResponseEntity<CostProfileResponse> upsertCostProfile(
      @AuthenticationPrincipal String truckerId, @RequestBody CostProfileWizardInput request) {
    CarrierCostProfile profile = service.upsertWizardProfile(truckerId, request);
    BigDecimal dieselPrice = service.resolveDieselPrice(profile);
    return ResponseEntity.ok(CostProfileResponse.from(profile, dieselPrice));
  }
}
