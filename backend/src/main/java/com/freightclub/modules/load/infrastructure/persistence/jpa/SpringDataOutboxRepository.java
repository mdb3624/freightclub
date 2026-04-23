package com.freightclub.modules.load.infrastructure.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataOutboxRepository extends JpaRepository<MessageOutboxEntity, String> {

    List<MessageOutboxEntity> findByStatusOrderByOccurredAtAsc(String status);

    List<MessageOutboxEntity> findByStatusAndEventTypeOrderByOccurredAtAsc(String status, String eventType);
}
