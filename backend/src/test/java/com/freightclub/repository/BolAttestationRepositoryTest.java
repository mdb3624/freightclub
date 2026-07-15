package com.freightclub.repository;

import com.freightclub.domain.BolAttestation;
import com.freightclub.test.DataJpaSliceTest;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaSliceTest
class BolAttestationRepositoryTest {

    @org.springframework.beans.factory.annotation.Autowired
    private BolAttestationRepository repository;

    @Test
    void findByLoadIdAndDeletedAtIsNull_returnsAttestation() {
        BolAttestation attestation = new BolAttestation();
        attestation.setTenantId("tenant-1");
        attestation.setLoadId("load-1");
        attestation.setTruckerId("trucker-1");
        attestation.setConfirmedAt(LocalDateTime.now());
        repository.save(attestation);

        assertThat(repository.findByLoadIdAndDeletedAtIsNull("load-1")).isPresent();
        assertThat(repository.existsByLoadIdAndDeletedAtIsNull("load-1")).isTrue();
    }
}
