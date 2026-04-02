package com.freightclub.controller;

import com.freightclub.domain.EquipmentType;
import com.freightclub.dto.LoadBoardFilter;
import com.freightclub.dto.LoadEventResponse;
import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.service.LoadService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
            @RequestParam(required = false) String originState,
            @RequestParam(required = false) String destinationState,
            @RequestParam(required = false) EquipmentType equipmentType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deliveryDate,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir,
            @AuthenticationPrincipal String userId) {
        LoadBoardFilter filter = new LoadBoardFilter(originState, destinationState, equipmentType, pickupDate, deliveryDate, sortBy, sortDir);
        return loadService.listOpenLoads(userId, filter, page, size);
    }

    @GetMapping("/available-states")
    public Map<String, List<String>> getAvailableStates(@AuthenticationPrincipal String userId) {
        return loadService.getAvailableStates(userId);
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

    @GetMapping("/{id}/events")
    public List<LoadEventResponse> getEvents(@PathVariable String id,
                                             @AuthenticationPrincipal String userId) {
        return loadService.getLoadEvents(id, userId);
    }
}
