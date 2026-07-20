package com.freightclub.modules.shipper.infrastructure.rest;

import com.freightclub.modules.shipper.application.LoadQueryService;
import com.freightclub.modules.shipper.application.ShipmentStatusDTO;
import com.freightclub.modules.shipper.application.ShipmentStatusService;
import com.freightclub.modules.shipper.application.ShipperService;
import com.freightclub.modules.shipper.domain.ShipperReputation;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadListResponse;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadStatsResponse;
import com.freightclub.security.TenantContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasRole('SHIPPER')")
public class ShipperController {

    private final LoadQueryService loadQueryService;
    private final ShipperService shipperService;
    private final ShipmentStatusService shipmentStatusService;

    public ShipperController(LoadQueryService loadQueryService, ShipperService shipperService,
                             ShipmentStatusService shipmentStatusService) {
        this.loadQueryService = loadQueryService;
        this.shipperService = shipperService;
        this.shipmentStatusService = shipmentStatusService;
    }

    @GetMapping("/shipper/loads/stats")
    public ResponseEntity<LoadStatsResponse> getLoadStats(
        @RequestParam(defaultValue = "active") String view
    ) {
        LoadStatsResponse stats = loadQueryService.getLoadStats(view);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/shipper/loads")
    public ResponseEntity<LoadListResponse> getShipperLoads(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int limit,
        @RequestParam(defaultValue = "active") String view,
        @RequestParam(defaultValue = "pickupFrom") String sort,
        @RequestParam(defaultValue = "asc") String order
    ) {
        var response = loadQueryService.getShipperLoads(page, limit, view, sort, order);
        return ResponseEntity.ok(response);
    }

    // US-822 AC-1: Get active shipments with status, progress, and carrier info
    @GetMapping("/shipper/shipments/active")
    public ResponseEntity<List<ShipmentStatusDTO>> getActiveShipments() {
        String tenantId = TenantContextHolder.getTenantId();
        List<ShipmentStatusDTO> shipments = shipmentStatusService.getActiveShipments(tenantId);
        return ResponseEntity.ok(shipments);
    }

    @GetMapping("/shippers/{shipperId}/public-reputation")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ShipperReputationResponse> getPublicReputation(
        @PathVariable String shipperId
    ) {
        ShipperReputation reputation = shipperService.getShipperReputation(shipperId);
        if (reputation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ShipperReputationResponse.from(reputation));
    }
}
