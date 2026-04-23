package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.modules.load.application.ports.out.CarrierSearchPort;
import com.freightclub.modules.load.domain.CarrierCandidate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Transactional(readOnly = true)
public class JpaCarrierSearchAdapter implements CarrierSearchPort {

    private final SpringDataCarrierProfileRepository repo;

    public JpaCarrierSearchAdapter(SpringDataCarrierProfileRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<CarrierCandidate> findCandidates(String tenantId) {
        return repo.findByTenantIdAndDeletedAtIsNull(tenantId)
                .stream()
                .map(e -> new CarrierCandidate(e.getId(), e.getPreferredEquipment(), e.getServiceArea()))
                .toList();
    }
}
