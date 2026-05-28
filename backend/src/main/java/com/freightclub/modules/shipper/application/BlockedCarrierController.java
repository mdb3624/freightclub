package com.freightclub.modules.shipper.application;

import com.freightclub.modules.shipper.domain.BlockedCarrier;
import java.util.HashMap;
import java.util.Map;
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
public class BlockedCarrierController {

  private final BlockedCarrierService service;

  public BlockedCarrierController(BlockedCarrierService service) {
    this.service = service;
  }

  @PostMapping("/{shipperId}/blocked-carriers")
  public ResponseEntity<BlockedCarrier> blockCarrier(
      @PathVariable String shipperId,
      @RequestParam String carrierId,
      @RequestParam(required = false) String reason) {
    try {
      BlockedCarrier blocked = service.blockCarrier(shipperId, carrierId, reason);
      return ResponseEntity.status(HttpStatus.CREATED).body(blocked);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @GetMapping("/{shipperId}/blocked-carriers")
  public ResponseEntity<Page<BlockedCarrier>> getBlockedCarriers(
      @PathVariable String shipperId,
      @RequestParam(defaultValue = "0") int page) {
    Page<BlockedCarrier> blockedCarriers = service.getBlockedCarriers(shipperId, page);
    return ResponseEntity.ok(blockedCarriers);
  }

  @GetMapping("/{shipperId}/blocked-carriers/count")
  public ResponseEntity<Map<String, Long>> getBlockedCarrierCount(
      @PathVariable String shipperId) {
    long count = service.getBlockedCarrierCount(shipperId);
    Map<String, Long> response = new HashMap<>();
    response.put("count", count);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{shipperId}/blocked-carriers/check")
  public ResponseEntity<Map<String, Boolean>> isCarrierBlocked(
      @PathVariable String shipperId,
      @RequestParam String carrierId) {
    boolean blocked = service.isCarrierBlocked(shipperId, carrierId);
    Map<String, Boolean> response = new HashMap<>();
    response.put("blocked", blocked);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{shipperId}/blocked-carriers/{carrierId}")
  public ResponseEntity<Void> unblockCarrier(
      @PathVariable String shipperId,
      @PathVariable String carrierId) {
    try {
      service.unblockCarrier(shipperId, carrierId);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }
}
