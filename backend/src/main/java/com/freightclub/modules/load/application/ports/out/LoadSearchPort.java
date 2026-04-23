package com.freightclub.modules.load.application.ports.out;

import com.freightclub.modules.load.application.LoadSearchCriteria;
import com.freightclub.modules.load.application.LoadSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LoadSearchPort {
    Page<LoadSummary> findAvailableLoads(String tenantId, LoadSearchCriteria criteria, Pageable pageable);
}
