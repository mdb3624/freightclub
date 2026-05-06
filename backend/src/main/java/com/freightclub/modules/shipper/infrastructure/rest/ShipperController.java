package com.freightclub.modules.shipper.infrastructure.rest;

import com.freightclub.modules.shipper.application.ShipperService;
import com.freightclub.modules.shipper.domain.ShipperReputation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController("modulesShipperController")
@RequestMapping("/api/v1/shippers")
public class ShipperController {

  private final ShipperService shipperService;

  public ShipperController(ShipperService shipperService) {
    this.shipperService = shipperService;
  }

  @GetMapping("/{shipperId}/public-reputation")
  public ResponseEntity<ShipperReputationResponse> getPublicReputation(
      @PathVariable("shipperId") String shipperId) {
    ShipperReputation reputation = shipperService.getShipperReputation(shipperId);

    if (reputation == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    ShipperReputationResponse response = ShipperReputationResponse.from(reputation);
    return ResponseEntity.ok(response);
  }
}
