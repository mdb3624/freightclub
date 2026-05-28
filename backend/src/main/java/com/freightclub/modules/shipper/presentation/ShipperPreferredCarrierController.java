package com.freightclub.modules.shipper.presentation;

import com.freightclub.modules.shipper.application.ShipperPreferredCarrierService;
import com.freightclub.modules.shipper.domain.ShipperPreferredCarrier;
import com.freightclub.security.TenantContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shippers")
public class ShipperPreferredCarrierController {

  private final ShipperPreferredCarrierService service;

  public ShipperPreferredCarrierController(ShipperPreferredCarrierService service) {
    this.service = service;
  }

  @PostMapping("/{shipperId}/preferred-carriers")
  public ResponseEntity<PreferredCarrierResponse> addPreferredCarrier(
      @PathVariable String shipperId,
      @RequestParam String carrierId,
      @RequestParam(required = false) String notes) {
    String tenantId = TenantContextHolder.getTenantId();

    ShipperPreferredCarrier result = service.addPreferredCarrier(shipperId, carrierId, notes);

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(mapToResponse(result));
  }

  @GetMapping("/{shipperId}/preferred-carriers")
  public ResponseEntity<Page<PreferredCarrierResponse>> getPreferredCarriers(
      @PathVariable String shipperId,
      @RequestParam(defaultValue = "0") int page) {
    Page<ShipperPreferredCarrier> carriers = service.getPreferredCarriers(shipperId, page);
    return ResponseEntity.ok(
        carriers.map(this::mapToResponse));
  }

  @GetMapping("/{shipperId}/preferred-carriers/count")
  public ResponseEntity<PreferredCarrierCountResponse> getPreferredCarrierCount(
      @PathVariable String shipperId) {
    long count = service.getPreferredCarrierCount(shipperId);
    return ResponseEntity.ok(new PreferredCarrierCountResponse(count));
  }

  @DeleteMapping("/{shipperId}/preferred-carriers/{carrierId}")
  public ResponseEntity<Void> removePreferredCarrier(
      @PathVariable String shipperId,
      @PathVariable String carrierId) {
    service.removePreferredCarrier(shipperId, carrierId);
    return ResponseEntity.noContent().build();
  }

  private PreferredCarrierResponse mapToResponse(ShipperPreferredCarrier carrier) {
    return new PreferredCarrierResponse(
        carrier.getId(),
        carrier.getCarrierId(),
        carrier.getNotes(),
        carrier.getCreatedAt().toString());
  }

  public record PreferredCarrierResponse(
      String id,
      String carrierId,
      String notes,
      String createdAt) {}

  public record PreferredCarrierCountResponse(long count) {}
}
