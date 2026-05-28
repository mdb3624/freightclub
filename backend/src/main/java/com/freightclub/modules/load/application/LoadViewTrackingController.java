package com.freightclub.modules.load.application;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/loads")
public class LoadViewTrackingController {

  private final LoadViewTrackingService service;

  public LoadViewTrackingController(LoadViewTrackingService service) {
    this.service = service;
  }

  @PostMapping("/{loadId}/record-view")
  public ResponseEntity<Void> recordLoadView(
      @PathVariable String loadId,
      @RequestParam String carrierId) {
    service.recordLoadView(loadId, carrierId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{loadId}/view-count")
  public ResponseEntity<Map<String, Long>> getLoadViewCount(@PathVariable String loadId) {
    long count = service.getLoadViewCount(loadId);
    Map<String, Long> response = new HashMap<>();
    response.put("viewCount", count);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{loadId}/interest")
  public ResponseEntity<Map<String, Long>> getLoadInterest(@PathVariable String loadId) {
    long interest = service.getLoadInterest(loadId);
    Map<String, Long> response = new HashMap<>();
    response.put("interest", interest);
    return ResponseEntity.ok(response);
  }
}
