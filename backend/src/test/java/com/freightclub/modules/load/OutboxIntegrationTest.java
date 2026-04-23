package com.freightclub.modules.load;

import com.freightclub.modules.load.application.LoadApplicationService;
import com.freightclub.modules.load.application.ports.out.LoadRepositoryPort;
import com.freightclub.modules.load.domain.CarrierId;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.Weight;
import com.freightclub.modules.load.infrastructure.persistence.jpa.MessageOutboxEntity;
import com.freightclub.modules.load.infrastructure.persistence.jpa.SpringDataOutboxRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Verifies that domain events are written to the message_outbox table within the same
 * transaction as the aggregate state change — the core guarantee of the outbox pattern.
 *
 * LoadRepositoryPort is mocked to isolate the test from the PostgreSQL-specific
 * set_config call in JpaLoadAdapter, allowing H2 to handle the outbox assertions.
 */
@SpringBootTest
@ActiveProfiles("test")
class OutboxIntegrationTest {

    private static final String TENANT_ID  = UUID.randomUUID().toString();
    private static final String LOAD_ID    = UUID.randomUUID().toString();
    private static final String SHIPPER_ID = UUID.randomUUID().toString();
    private static final String CARRIER_ID = UUID.randomUUID().toString();

    @Autowired LoadApplicationService loadApplicationService;
    @Autowired SpringDataOutboxRepository outboxRepository;

    // Mocked to avoid JpaLoadAdapter's PostgreSQL-specific set_config call on H2
    @MockBean LoadRepositoryPort loadRepositoryPort;

    @BeforeEach
    void setUp() {
        outboxRepository.deleteAll();

        LoadAggregate publishedLoad = LoadAggregate.reconstitute(
                LOAD_ID, TENANT_ID, SHIPPER_ID,
                Weight.of(BigDecimal.valueOf(5000)),
                LoadStatus.PUBLISHED,
                null, null, null
        );

        when(loadRepositoryPort.findById(TENANT_ID, LOAD_ID))
                .thenReturn(Optional.of(publishedLoad));
        when(loadRepositoryPort.save(any(LoadAggregate.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("claiming a load writes a LoadClaimedEvent to the outbox in the same transaction")
    @Transactional
    void claim_writesLoadClaimedEvent_toOutbox() {
        loadApplicationService.claim(TENANT_ID, LOAD_ID, CARRIER_ID);

        List<MessageOutboxEntity> entries = outboxRepository.findAll();
        assertThat(entries).hasSize(1);

        MessageOutboxEntity entry = entries.get(0);
        assertThat(entry.getEventType()).isEqualTo("LoadClaimedEvent");
        assertThat(entry.getAggregateId()).isEqualTo(LOAD_ID);
        assertThat(entry.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(entry.getStatus()).isEqualTo("PENDING");
        assertThat(entry.getPayload()).contains(CARRIER_ID);
    }

    @Test
    @DisplayName("publishing a load writes a LoadPublishedEvent to the outbox in the same transaction")
    @Transactional
    void publish_writesLoadPublishedEvent_toOutbox() {
        LoadAggregate draftLoad = LoadAggregate.reconstitute(
                LOAD_ID, TENANT_ID, SHIPPER_ID,
                Weight.of(BigDecimal.valueOf(5000)),
                LoadStatus.DRAFT,
                null, null, null
        );
        when(loadRepositoryPort.findById(anyString(), anyString()))
                .thenReturn(Optional.of(draftLoad));

        loadApplicationService.publish(TENANT_ID, LOAD_ID);

        List<MessageOutboxEntity> entries = outboxRepository.findAll();
        assertThat(entries).hasSize(1);

        MessageOutboxEntity entry = entries.get(0);
        assertThat(entry.getEventType()).isEqualTo("LoadPublishedEvent");
        assertThat(entry.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(entry.getStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("outbox entry payload includes tenant_id for RLS relay consistency")
    @Transactional
    void outboxPayload_includesTenantId_forRlsConsistency() {
        loadApplicationService.claim(TENANT_ID, LOAD_ID, CARRIER_ID);

        MessageOutboxEntity entry = outboxRepository.findAll().get(0);
        assertThat(entry.getPayload()).contains(TENANT_ID);
        assertThat(entry.getTenantId()).isEqualTo(TENANT_ID);
    }
}
