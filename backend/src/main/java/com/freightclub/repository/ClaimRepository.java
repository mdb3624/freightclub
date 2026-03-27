package com.freightclub.repository;

import com.freightclub.domain.Claim;
import com.freightclub.domain.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, String> {

    Optional<Claim> findFirstByLoadIdAndStatus(String loadId, ClaimStatus status);
}
