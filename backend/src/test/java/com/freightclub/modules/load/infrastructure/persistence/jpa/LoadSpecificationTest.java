package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.domain.EquipmentType;
import com.freightclub.modules.load.application.LoadSearchCriteria;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class LoadSpecificationTest {

    @Test
    @DisplayName("forCriteria returns non-null Specification for empty criteria")
    void emptyCriteria_returnsSpec() {
        Specification<LoadEntity> spec = LoadSpecification.forCriteria("tenant-1", LoadSearchCriteria.empty());
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("forCriteria returns non-null Specification with all filters set")
    void allFilters_returnsSpec() {
        LoadSearchCriteria criteria = new LoadSearchCriteria("Dallas", EquipmentType.FLATBED, BigDecimal.valueOf(2000));
        Specification<LoadEntity> spec = LoadSpecification.forCriteria("tenant-1", criteria);
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("Specifications can be composed via and()")
    void specs_canBeComposed() {
        Specification<LoadEntity> a = LoadSpecification.forCriteria("tenant-1", LoadSearchCriteria.empty());
        Specification<LoadEntity> b = LoadSpecification.forCriteria("tenant-1",
                new LoadSearchCriteria(null, EquipmentType.REEFER, null));
        assertThat(a.and(b)).isNotNull();
    }
}
