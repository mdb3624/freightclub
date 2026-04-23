package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.modules.load.application.LoadSearchCriteria;
import com.freightclub.modules.load.domain.LoadStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class LoadSpecification {

    private LoadSpecification() {}

    public static Specification<LoadEntity> forCriteria(String tenantId, LoadSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("tenantId"), tenantId));
            predicates.add(cb.equal(root.get("status"), LoadStatus.PUBLISHED));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (criteria.originCity() != null && !criteria.originCity().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("originCity")),
                        criteria.originCity().toLowerCase() + "%"));
            }
            if (criteria.equipmentType() != null) {
                predicates.add(cb.equal(root.get("equipmentType"), criteria.equipmentType()));
            }
            if (criteria.minRate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("payRate"), criteria.minRate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
