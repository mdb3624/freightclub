package com.freightclub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

// 2026-09-02: @EnableScheduling was never added despite @Scheduled already being used by
// LoadPublishedListener's outbox poller (fixedDelayString="${app.outbox.poll-interval-ms}")
// — without this annotation, Spring silently never registers @Scheduled methods at all, so
// that poller (and the auto-match discovery it drives) has likely never actually run in any
// environment. Discovered while wiring TenantAdminReconciliationService, which needs the same
// annotation to run; fixing it here fixes both.
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class FreightClubApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreightClubApplication.class, args);
    }
}
