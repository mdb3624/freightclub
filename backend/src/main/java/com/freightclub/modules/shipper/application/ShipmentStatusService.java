package com.freightclub.modules.shipper.application;

import com.freightclub.domain.Load;
import com.freightclub.domain.User;
import com.freightclub.repository.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
@Transactional(readOnly = true)
public class ShipmentStatusService {

    private final LoadQueryService loadQueryService;
    private final UserRepository userRepository;

    public ShipmentStatusService(LoadQueryService loadQueryService, UserRepository userRepository) {
        this.loadQueryService = loadQueryService;
        this.userRepository = userRepository;
    }

    private static final Map<String, Integer> STATUS_ORDER = Map.of(
        "DELAYED", 1,
        "OPEN", 2,
        "CLAIMED", 3,
        "IN_TRANSIT", 4,
        "DELIVERED", 5
    );

    @Cacheable(value = "shipment-status", key = "#tenantId")
    public List<ShipmentStatusDTO> getActiveShipments(String tenantId) {
        // Shared query (LoadQueryService.findDashboardLoads) — single source of truth for
        // "which loads are dashboard-relevant", also used by KPISummaryService, so the two
        // can't independently drift on what counts as active again (see US-820 fix, 2026-07-20).
        List<Load> loads = loadQueryService.findDashboardLoads(tenantId);

        Map<String, User> truckersById = batchLoadTruckers(loads);

        return loads.stream()
            .sorted(Comparator
                .comparing((Load l) -> STATUS_ORDER.getOrDefault(l.getStatus().name(), 6))
                .thenComparing(Load::getDeliveryTo, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(load -> toDto(load, truckersById))
            .toList();
    }

    // Batch lane-repository-style lookup (matches the CarrierSearchService.lanesByTruckerId
    // pattern) to avoid N+1 — one query for every distinct trucker across the result set,
    // not one per load.
    private Map<String, User> batchLoadTruckers(List<Load> loads) {
        List<String> truckerIds = loads.stream()
            .map(Load::getTruckerId)
            .filter(java.util.Objects::nonNull)
            .distinct()
            .toList();
        if (truckerIds.isEmpty()) {
            return Map.of();
        }
        return userRepository.findAllById(truckerIds).stream()
            .collect(java.util.stream.Collectors.toMap(User::getId, Function.identity()));
    }

    private ShipmentStatusDTO toDto(Load load, Map<String, User> truckersById) {
        String status = load.getStatus().name();
        BigDecimal progress = calculateProgress(status, load.getPickupFrom(), load.getDeliveryTo(), load.getPickedUpAt());
        User trucker = load.getTruckerId() != null ? truckersById.get(load.getTruckerId()) : null;
        String carrierName = carrierName(trucker);

        return new ShipmentStatusDTO(
            load.getId(),
            status,
            progress,
            load.getEquipmentType() != null ? load.getEquipmentType().name() : null,
            carrierName,
            null, // rating: no rating join existed in the prior native-query implementation either
            load.getDestinationCity(),
            load.getOriginCity(),
            load.getOriginState(),
            load.getDestinationState()
        );
    }

    private String carrierName(User trucker) {
        if (trucker == null) {
            return null;
        }
        if (trucker.getBusinessName() != null) {
            return trucker.getBusinessName();
        }
        return trucker.getFirstName() + " " + trucker.getLastName();
    }

    private BigDecimal calculateProgress(String status, LocalDateTime pickupFrom, LocalDateTime deliveryTo, LocalDateTime pickedUpAt) {
        return switch (status) {
            case "OPEN" -> BigDecimal.ZERO;
            case "CLAIMED" -> new BigDecimal("15");
            case "IN_TRANSIT" -> calculateInTransitProgress(pickupFrom, deliveryTo, pickedUpAt);
            case "DELIVERED" -> new BigDecimal("100");
            default -> new BigDecimal("50"); // Fallback
        };
    }

    private BigDecimal calculateInTransitProgress(LocalDateTime pickupFrom, LocalDateTime deliveryTo, LocalDateTime pickedUpAt) {
        // If timestamps are missing, return 50%
        if (pickupFrom == null || deliveryTo == null || pickedUpAt == null) {
            return new BigDecimal("50");
        }

        LocalDateTime now = LocalDateTime.now();

        // If delivery window hasn't started, return 20%
        if (now.isBefore(pickupFrom)) {
            return new BigDecimal("20");
        }

        // If already delivered, return 100% (shouldn't happen with IN_TRANSIT status)
        if (now.isAfter(deliveryTo)) {
            return new BigDecimal("100");
        }

        long totalSeconds = java.time.temporal.ChronoUnit.SECONDS.between(pickedUpAt, deliveryTo);
        long elapsedSeconds = java.time.temporal.ChronoUnit.SECONDS.between(pickedUpAt, now);

        if (totalSeconds <= 0) {
            return new BigDecimal("50");
        }

        BigDecimal percentage = new BigDecimal(elapsedSeconds)
            .divide(new BigDecimal(totalSeconds), 2, RoundingMode.HALF_UP)
            .multiply(new BigDecimal("100"));

        // Clamp between 20% and 95%
        if (percentage.compareTo(new BigDecimal("20")) < 0) {
            return new BigDecimal("20");
        }
        if (percentage.compareTo(new BigDecimal("95")) > 0) {
            return new BigDecimal("95");
        }

        return percentage;
    }
}
