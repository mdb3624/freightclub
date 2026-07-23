package com.freightclub.modules.load.infrastructure.rest;

import com.freightclub.modules.load.application.LoadNotFoundException;
import com.freightclub.modules.load.application.ports.in.LoadUseCase;
import com.freightclub.modules.load.infrastructure.rest.dto.CreateLoadRequest;
import com.freightclub.modules.load.infrastructure.rest.dto.LoadResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController("modulesLoadController")
@RequestMapping("/api/v2/loads")
public class LoadController {

    private final LoadUseCase useCase;

    public LoadController(LoadUseCase useCase) {
        this.useCase = useCase;
    }

    @PostMapping
    public ResponseEntity<LoadResponse> createDraft(
            @Valid @RequestBody CreateLoadRequest request,
            @AuthenticationPrincipal String userId) {
        // shipperId is derived from the authenticated principal, never the request
        // body — a client must not be able to create a draft "as" another shipper.
        LoadResponse body = LoadResponse.from(
                useCase.createDraft(userId, request.weightLbs()));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<LoadResponse> publish(
            @PathVariable("id") String loadId,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(LoadResponse.from(useCase.publish(loadId, userId)));
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<LoadResponse> claim(
            @PathVariable("id") String loadId,
            @AuthenticationPrincipal String userId) {
        // carrierId is the authenticated principal, never a client-supplied value —
        // otherwise any trucker could claim a load "as" a different trucker.
        return ResponseEntity.ok(LoadResponse.from(useCase.claim(loadId, userId)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<LoadResponse> cancel(
            @PathVariable("id") String loadId,
            @RequestBody(required = false) String reason,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(LoadResponse.from(useCase.cancelLoad(loadId, userId, reason)));
    }

    @PutMapping("/{id}/start-trip")
    public ResponseEntity<LoadResponse> startTrip(
            @PathVariable("id") String loadId,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(LoadResponse.from(useCase.startTrip(loadId, userId)));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<LoadResponse> deliver(
            @PathVariable("id") String loadId,
            @RequestBody String podUrl,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(LoadResponse.from(useCase.completeDelivery(loadId, userId, podUrl)));
    }

    @ExceptionHandler(LoadNotFoundException.class)
    public ResponseEntity<Void> handleNotFound() {
        return ResponseEntity.notFound().build();
    }
}
