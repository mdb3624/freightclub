package com.freightclub.controller;

import com.freightclub.dto.CancelLoadRequest;
import com.freightclub.dto.DisputeRequest;
import com.freightclub.dto.CreateLoadRequest;
import com.freightclub.dto.LoadEventResponse;
import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.dto.UpdateLoadRequest;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.LoadService;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/loads")
public class LoadController {

    private final LoadService loadService;

    public LoadController(LoadService loadService) {
        this.loadService = loadService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse create(@Valid @RequestBody CreateLoadRequest request,
                               @AuthenticationPrincipal String userId) {
        return loadService.createLoad(request, userId);
    }

    @PostMapping("/draft")
    @ResponseStatus(HttpStatus.CREATED)
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse createDraft(@Valid @RequestBody CreateLoadRequest request,
                                    @AuthenticationPrincipal String userId) {
        return loadService.createDraft(request, userId);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("@loadService.isOwner(#id)")
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse publish(@PathVariable String id,
                                @AuthenticationPrincipal String userId) {
        return loadService.publishLoad(id, userId);
    }

    @GetMapping
    @Cacheable(cacheNames = "loads", key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':list:' + #page + ':' + #size")
    public Page<LoadSummaryResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String userId) {
        return loadService.listLoads(userId, page, size);
    }

    @GetMapping("/{id}")
    @Cacheable(cacheNames = "loads", key = "#id + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
    public LoadResponse getById(@PathVariable String id,
                                @AuthenticationPrincipal String userId) {
        return loadService.getLoad(id, userId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@loadService.isOwner(#id)")
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse update(@PathVariable String id,
                               @Valid @RequestBody UpdateLoadRequest request,
                               @AuthenticationPrincipal String userId) {
        return loadService.updateLoad(id, request, userId);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("@loadService.isOwner(#id)")
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse cancel(@PathVariable String id,
                               @Valid @RequestBody CancelLoadRequest request,
                               @AuthenticationPrincipal String userId) {
        return loadService.cancelLoad(id, userId, request.reason());
    }

    @GetMapping("/{id}/events")
    public List<LoadEventResponse> getEvents(@PathVariable String id,
                                             @AuthenticationPrincipal String userId) {
        return loadService.getLoadEvents(id, userId);
    }

    @PostMapping("/{id}/claim")
    public LoadResponse claim(@PathVariable String id,
                              @AuthenticationPrincipal String userId) {
        return loadService.claimLoad(id, userId);
    }

    @GetMapping("/counts")
    public Map<String, Long> statusCounts(@AuthenticationPrincipal String userId) {
        return loadService.getLoadStatusCounts(userId);
    }

    @PatchMapping(value = "/{id}/pickup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse markPickedUp(@PathVariable String id,
                                     @RequestParam(required = false) String exceptionNotes,
                                     @RequestPart(name = "exceptionPhoto", required = false) MultipartFile exceptionPhoto,
                                     @AuthenticationPrincipal String userId) {
        return loadService.markPickedUp(id, userId, exceptionNotes, exceptionPhoto);
    }

    @PatchMapping("/{id}/deliver")
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse markDelivered(@PathVariable String id,
                                      @AuthenticationPrincipal String userId) {
        return loadService.markDelivered(id, userId);
    }

    @PatchMapping("/{id}/settle")
    @PreAuthorize("hasRole('SHIPPER')")
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse settleLoad(@PathVariable String id,
                                   @AuthenticationPrincipal String userId) {
        return loadService.settleLoad(id, userId);
    }

    @PatchMapping("/{id}/dispute")
    @PreAuthorize("hasRole('SHIPPER')")
    @CacheEvict(cacheNames = {"loads", "shipment-status"}, allEntries = true)
    public LoadResponse disputeLoad(@PathVariable String id,
                                    @AuthenticationPrincipal String userId,
                                    @Valid @RequestBody DisputeRequest request) {
        return loadService.disputeLoad(id, userId, request.reason());
    }
}
