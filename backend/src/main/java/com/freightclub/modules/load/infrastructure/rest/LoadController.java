package com.freightclub.modules.load.infrastructure.rest;

import com.freightclub.modules.load.application.LoadNotFoundException;
import com.freightclub.modules.load.application.ports.in.LoadUseCase;
import com.freightclub.modules.load.infrastructure.rest.dto.ClaimLoadRequest;
import com.freightclub.modules.load.infrastructure.rest.dto.CreateLoadRequest;
import com.freightclub.modules.load.infrastructure.rest.dto.LoadResponse;
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
        LoadResponse body = LoadResponse.from(
                useCase.createDraft(request.shipperId(), request.weightLbs()));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<LoadResponse> publish(@PathVariable("id") String loadId) {
        return ResponseEntity.ok(LoadResponse.from(useCase.publish(loadId)));
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<LoadResponse> claim(
            @PathVariable("id") String loadId,
            @Valid @RequestBody ClaimLoadRequest request) {
        return ResponseEntity.ok(LoadResponse.from(useCase.claim(loadId, request.carrierId())));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<LoadResponse> cancel(
            @PathVariable("id") String loadId,
            @RequestBody(required = false) String reason) {
        return ResponseEntity.ok(LoadResponse.from(useCase.cancelLoad(loadId, reason)));
    }

    @PutMapping("/{id}/start-trip")
    public ResponseEntity<LoadResponse> startTrip(@PathVariable("id") String loadId) {
        return ResponseEntity.ok(LoadResponse.from(useCase.startTrip(loadId)));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<LoadResponse> deliver(
            @PathVariable("id") String loadId,
            @RequestBody String podUrl) {
        return ResponseEntity.ok(LoadResponse.from(useCase.completeDelivery(loadId, podUrl)));
    }

    @ExceptionHandler(LoadNotFoundException.class)
    public ResponseEntity<Void> handleNotFound() {
        return ResponseEntity.notFound().build();
    }
}
