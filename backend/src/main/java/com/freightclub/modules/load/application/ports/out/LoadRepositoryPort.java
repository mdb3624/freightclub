package com.freightclub.modules.load.application.ports.out;

import com.freightclub.modules.load.domain.LoadAggregate;

import java.util.Optional;

public interface LoadRepositoryPort {

    LoadAggregate save(LoadAggregate aggregate);

    Optional<LoadAggregate> findById(String tenantId, String loadId);
}
