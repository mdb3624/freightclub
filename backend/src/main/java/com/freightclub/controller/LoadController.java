package com.freightclub.controller;

import com.freightclub.dto.CreateLoadRequest;
import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.dto.UpdateLoadRequest;
import com.freightclub.service.LoadService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loads")
public class LoadController {

    private final LoadService loadService;

    public LoadController(LoadService loadService) {
        this.loadService = loadService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoadResponse create(@Valid @RequestBody CreateLoadRequest request,
                               @AuthenticationPrincipal String userId) {
        return loadService.createLoad(request, userId);
    }

    @GetMapping
    public Page<LoadSummaryResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String userId) {
        return loadService.listLoads(userId, page, size);
    }

    @GetMapping("/{id}")
    public LoadResponse getById(@PathVariable String id,
                                @AuthenticationPrincipal String userId) {
        return loadService.getLoad(id, userId);
    }

    @PutMapping("/{id}")
    public LoadResponse update(@PathVariable String id,
                               @Valid @RequestBody UpdateLoadRequest request,
                               @AuthenticationPrincipal String userId) {
        return loadService.updateLoad(id, request, userId);
    }

    @PatchMapping("/{id}/cancel")
    public LoadResponse cancel(@PathVariable String id,
                               @AuthenticationPrincipal String userId) {
        return loadService.cancelLoad(id, userId);
    }
}
