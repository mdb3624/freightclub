package com.freightclub.modules.load.infrastructure.rest;

import com.freightclub.modules.load.application.LoadNotFoundException;
import com.freightclub.modules.load.application.ports.in.LoadUseCase;
import com.freightclub.modules.load.infrastructure.rest.dto.ClaimLoadRequest;
import com.freightclub.modules.load.infrastructure.rest.dto.CreateLoadRequest;
import com.freightclub.modules.load.infrastructure.rest.dto.LoadResponse;
import com.freightclub.security.TenantContextHolder;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController("modulesLoadController")
@RequestMapping("/api/v2/loads")
public class LoadController {

    private final LoadUseCase useCase;

    public LoadController(LoadUseCase useCase) {
        this.useCase = useCase;
    }

    @PostMapping
    public ResponseEntity<LoadResponse> createDraft(@Valid @RequestBody CreateLoadRequest request) {
        String tenantId = TenantContextHolder.getTenantId();
        LoadResponse body = LoadResponse.from(
                useCase.createDraft(tenantId, request.shipperId(), request.weightLbs()));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<LoadResponse> publish(@PathVariable("id") String loadId) {
        String tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(LoadResponse.from(useCase.publish(tenantId, loadId)));
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<LoadResponse> claim(
            @PathVariable("id") String loadId,
            @Valid @RequestBody ClaimLoadRequest request) {
        String tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(LoadResponse.from(useCase.claim(tenantId, loadId, request.carrierId())));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<LoadResponse> cancel(
            @PathVariable("id") String loadId,
            @RequestBody(required = false) String reason) {
        String tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(LoadResponse.from(useCase.cancelLoad(tenantId, loadId, reason)));
    }

    @PutMapping("/{id}/start-trip")
    public ResponseEntity<LoadResponse> startTrip(@PathVariable("id") String loadId) {
        String tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(LoadResponse.from(useCase.startTrip(tenantId, loadId)));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<LoadResponse> deliver(
            @PathVariable("id") String loadId,
            @RequestBody String podUrl) {
        String tenantId = TenantContextHolder.getTenantId();
        return ResponseEntity.ok(LoadResponse.from(useCase.completeDelivery(tenantId, loadId, podUrl)));
    }

    @ExceptionHandler(LoadNotFoundException.class)
    public ResponseEntity<Void> handleNotFound() {
        return ResponseEntity.notFound().build();
    }
}
