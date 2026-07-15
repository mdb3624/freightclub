package com.freightclub.repository;

import com.freightclub.domain.BolAttestation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BolAttestationRepository extends JpaRepository<BolAttestation, String> {
    Optional<BolAttestation> findByLoadIdAndDeletedAtIsNull(String loadId);
    boolean existsByLoadIdAndDeletedAtIsNull(String loadId);
}
