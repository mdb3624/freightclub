package com.freightclub.repository;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.dto.LoadBoardFilter;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LoadSpecifications {

    public static Specification<Load> openAndNotDeleted() {
        return (root, query, cb) -> cb.and(
                cb.equal(root.<LoadStatus>get("status"), LoadStatus.OPEN),
                cb.isNull(root.get("deletedAt"))
        );
    }

    public static Specification<Load> withFilter(LoadBoardFilter filter) {
        Specification<Load> spec = openAndNotDeleted();

        if (filter.originState() != null && !filter.originState().isBlank()) {
            String state = filter.originState().toUpperCase();
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.upper(root.<String>get("originState")), state));
        }

        if (filter.destinationState() != null && !filter.destinationState().isBlank()) {
            String state = filter.destinationState().toUpperCase();
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.upper(root.<String>get("destinationState")), state));
        }

        if (filter.equipmentType() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.<EquipmentType>get("equipmentType"), filter.equipmentType()));
        }

        if (filter.pickupDate() != null) {
            LocalDateTime dayStart = filter.pickupDate().atStartOfDay();
            LocalDateTime dayEnd = dayStart.plusDays(1);
            spec = spec.and((root, query, cb) ->
                    cb.and(
                            cb.lessThanOrEqualTo(root.<LocalDateTime>get("pickupFrom"), dayEnd),
                            cb.greaterThanOrEqualTo(root.<LocalDateTime>get("pickupTo"), dayStart)
                    ));
        }

        if (filter.deliveryDate() != null) {
            LocalDateTime dayStart = filter.deliveryDate().atStartOfDay();
            LocalDateTime dayEnd = dayStart.plusDays(1);
            spec = spec.and((root, query, cb) ->
                    cb.and(
                            cb.lessThanOrEqualTo(root.<LocalDateTime>get("deliveryFrom"), dayEnd),
                            cb.greaterThanOrEqualTo(root.<LocalDateTime>get("deliveryTo"), dayStart)
                    ));
        }

        return spec;
    }
}
