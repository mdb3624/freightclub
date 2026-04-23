package com.freightclub.modules.load.infrastructure.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.modules.load.application.MatchDiscoveryService;
import com.freightclub.modules.load.domain.LoadPublishedEvent;
import com.freightclub.modules.load.infrastructure.persistence.jpa.MessageOutboxEntity;
import com.freightclub.modules.load.infrastructure.persistence.jpa.SpringDataOutboxRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Polls the message_outbox table for unprocessed LoadPublishedEvent entries
 * and dispatches them to MatchDiscoveryService. Runs in its own transaction so a
 * single bad entry cannot roll back successfully processed ones.
 */
@Component
public class LoadPublishedListener {

    private static final Logger log = LoggerFactory.getLogger(LoadPublishedListener.class);
    private static final String EVENT_TYPE = "LoadPublishedEvent";

    private final SpringDataOutboxRepository outboxRepository;
    private final MatchDiscoveryService autoMatchService;
    private final ObjectMapper objectMapper;

    public LoadPublishedListener(SpringDataOutboxRepository outboxRepository,
                                 MatchDiscoveryService autoMatchService,
                                 ObjectMapper objectMapper) {
        this.outboxRepository = outboxRepository;
        this.autoMatchService = autoMatchService;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelayString = "${app.outbox.poll-interval-ms:5000}")
    public void pollOutbox() {
        List<MessageOutboxEntity> pending = outboxRepository
                .findByStatusAndEventTypeOrderByOccurredAtAsc("PENDING", EVENT_TYPE);

        for (MessageOutboxEntity entry : pending) {
            processEntry(entry);
        }
    }

    @Transactional
    public void processEntry(MessageOutboxEntity entry) {
        try {
            LoadPublishedEvent event = objectMapper.readValue(entry.getPayload(), LoadPublishedEvent.class);
            autoMatchService.processLoadPublished(event);
            entry.markProcessed();
            outboxRepository.save(entry);
        } catch (Exception ex) {
            log.error("Failed to process outbox entry {} ({}): {}", entry.getId(), EVENT_TYPE, ex.getMessage());
        }
    }
}
