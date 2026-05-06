package com.freightclub.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

/**
 * AC-1: TenantContextHolder Thread-Safety Tests
 *
 * Verifies that ThreadLocal isolation prevents tenant context leakage across concurrent threads.
 * Each thread must maintain its own tenant_id without cross-thread contamination.
 */
@DisplayName("TenantContextHolder Thread-Safety")
class TenantContextHolderTest {

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    @Test
    @DisplayName("AC-1.1: ThreadLocal isolation - parallel threads maintain separate contexts")
    void testThreadLocalIsolation() throws InterruptedException {
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<String> results = new ArrayList<>();
        AtomicBoolean leakageDetected = new AtomicBoolean(false);

        try {
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                final String tenantId = "tenant-" + threadId;

                executor.submit(() -> {
                    String result = null;
                    try {
                        // Each thread sets its own tenant ID
                        TenantContextHolder.setTenantId(tenantId);

                        // Verify thread retrieved its own tenant ID, not another thread's
                        String retrieved = TenantContextHolder.getTenantId();
                        if (!retrieved.equals(tenantId)) {
                            leakageDetected.set(true);
                            result = "LEAK: Thread " + threadId + " expected '" + tenantId +
                                      "' but got '" + retrieved + "'";
                        } else {
                            result = "OK: Thread " + threadId;
                        }
                    } catch (Exception e) {
                        leakageDetected.set(true);
                        result = "ERROR: Thread " + threadId + " - " + e.getMessage();
                    } finally {
                        try {
                            TenantContextHolder.clear();
                        } catch (Exception ignored) {
                        }
                        if (result != null) {
                            synchronized (results) {
                                results.add(result);
                            }
                        }
                    }
                });
            }

            executor.shutdown();
            boolean completed = executor.awaitTermination(15, java.util.concurrent.TimeUnit.SECONDS);
            if (!completed) {
                executor.shutdownNow();
                throw new AssertionError("Executor did not terminate within timeout");
            }

            assertFalse(leakageDetected.get(),
                       "ThreadLocal leakage detected: " + String.join(", ", results));
            assertEquals(threadCount, results.size(), "All threads completed");
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    @DisplayName("AC-1.2: Validation - rejects null tenant ID")
    void testSetTenantIdRejectsNull() {
        assertThrows(IllegalArgumentException.class,
                     () -> TenantContextHolder.setTenantId(null),
                     "Should reject null tenant ID");
    }

    @Test
    @DisplayName("AC-1.3: Validation - rejects blank tenant ID")
    void testSetTenantIdRejectsBlank() {
        assertThrows(IllegalArgumentException.class,
                     () -> TenantContextHolder.setTenantId("   "),
                     "Should reject blank tenant ID");
    }

    @Test
    @DisplayName("AC-1.4: Get without set - throws IllegalStateException")
    void testGetWithoutSetThrows() {
        TenantContextHolder.clear();
        assertThrows(IllegalStateException.class,
                     () -> TenantContextHolder.getTenantId(),
                     "Should throw when no context bound");
    }

    @Test
    @DisplayName("AC-1.5: Clear removes context - prevents memory leaks")
    void testClearRemovesContext() {
        TenantContextHolder.setTenantId("tenant-to-clear");
        assertEquals("tenant-to-clear", TenantContextHolder.getTenantId());

        TenantContextHolder.clear();

        assertThrows(IllegalStateException.class,
                     () -> TenantContextHolder.getTenantId(),
                     "Context should be removed after clear()");
    }

    @Test
    @DisplayName("AC-1.6: Sequential thread reuse - no stale context leakage")
    void testThreadPoolReuse() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        try {
            // Task 1: thread-pool-0 sets tenant-1
            executor.submit(() -> {
                TenantContextHolder.setTenantId("tenant-1");
                assertEquals("tenant-1", TenantContextHolder.getTenantId());
                TenantContextHolder.clear();
            }).get(10, java.util.concurrent.TimeUnit.SECONDS);

            // Task 2: thread-pool-0 reused; should not have stale tenant-1
            executor.submit(() -> {
                assertThrows(IllegalStateException.class,
                           () -> TenantContextHolder.getTenantId(),
                           "Reused thread should not inherit stale context");
                TenantContextHolder.setTenantId("tenant-2");
                assertEquals("tenant-2", TenantContextHolder.getTenantId());
                TenantContextHolder.clear();
            }).get(10, java.util.concurrent.TimeUnit.SECONDS);
        } catch (java.util.concurrent.ExecutionException e) {
            throw new AssertionError("Task execution failed", e);
        } catch (java.util.concurrent.TimeoutException e) {
            throw new AssertionError("Task execution timed out", e);
        } finally {
            executor.shutdownNow();
        }
    }
}
