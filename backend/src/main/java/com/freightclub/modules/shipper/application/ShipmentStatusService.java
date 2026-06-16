package com.freightclub.modules.shipper.application;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ShipmentStatusService {

    private final EntityManager em;

    public ShipmentStatusService(EntityManager em) {
        this.em = em;
    }

    @Cacheable(value = "shipment-status", key = "#tenantId")
    public List<ShipmentStatusDTO> getActiveShipments(String tenantId) {
        // Activate RLS context
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
            .setParameter("tid", tenantId)
            .getSingleResult();

        String sql = """
            SELECT l.id, l.status, l.equipment_type, l.destination_city,
                   c.name, sr.avg_score, l.pickup_from, l.delivery_to, l.picked_up_at
            FROM freightclub.loads l
            LEFT JOIN freightclub.carriers c ON l.trucker_id = c.id
            LEFT JOIN freightclub.shipper_reputation sr ON l.trucker_id = sr.shipper_id
            WHERE l.tenant_id = :tid
              AND l.deleted_at IS NULL
              AND l.status NOT IN ('DRAFT', 'CANCELLED', 'SETTLED', 'DISPUTED')
            ORDER BY CASE l.status
                WHEN 'DELAYED' THEN 1
                WHEN 'OPEN' THEN 2
                WHEN 'CLAIMED' THEN 3
                WHEN 'IN_TRANSIT' THEN 4
                WHEN 'DELIVERED' THEN 5
                ELSE 6
            END ASC, l.delivery_to ASC
            """;

        Query query = em.createNativeQuery(sql);
        query.setParameter("tid", tenantId);

        @SuppressWarnings("unchecked")
        List<Object[]> results = (List<Object[]>) query.getResultList();
        List<ShipmentStatusDTO> shipments = new ArrayList<>();

        for (Object[] row : results) {
            String loadId = (String) row[0];
            String status = (String) row[1];
            String equipment = (String) row[2];
            String destination = (String) row[3];
            String carrierName = (String) row[4];
            BigDecimal rating = (BigDecimal) row[5];
            LocalDateTime pickupFrom = (LocalDateTime) row[6];
            LocalDateTime deliveryTo = (LocalDateTime) row[7];
            LocalDateTime pickedUpAt = (LocalDateTime) row[8];

            BigDecimal progress = calculateProgress(status, pickupFrom, deliveryTo, pickedUpAt);

            ShipmentStatusDTO dto = new ShipmentStatusDTO(
                loadId,
                status,
                progress,
                equipment,
                carrierName,
                rating,
                destination
            );

            shipments.add(dto);
        }

        return shipments;
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
