package com.freightclub.controller;

import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.service.LoadService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/board")
public class LoadBoardController {

    private final LoadService loadService;

    public LoadBoardController(LoadService loadService) {
        this.loadService = loadService;
    }

    @GetMapping
    public Page<LoadSummaryResponse> listOpenLoads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String userId) {
        return loadService.listOpenLoads(userId, page, size);
    }

    @GetMapping("/{id}")
    public LoadResponse getLoad(@PathVariable String id,
                                @AuthenticationPrincipal String userId) {
        return loadService.getOpenLoad(id);
    }

    @GetMapping("/my-history")
    public Page<LoadSummaryResponse> getMyLoadHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String userId) {
        return loadService.getMyLoadHistory(userId, page, size);
    }

    @GetMapping("/my-load")
    public ResponseEntity<LoadResponse> getMyActiveLoad(@AuthenticationPrincipal String userId) {
        return loadService.getMyActiveLoad(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{id}/pickup")
    public LoadResponse markPickedUp(@PathVariable String id,
                                     @AuthenticationPrincipal String userId) {
        return loadService.markPickedUp(id, userId);
    }

    @PostMapping("/{id}/deliver")
    public LoadResponse markDelivered(@PathVariable String id,
                                      @AuthenticationPrincipal String userId) {
        return loadService.markDelivered(id, userId);
    }
}
