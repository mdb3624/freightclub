package com.freightclub.modules.carrier.domain;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for CarrierProfileAuditLog domain class.
 * Covers createNew validation (action/statusCode blank/null) and equals/hashCode branches.
 */
class CarrierProfileAuditLogTest {

    // ── helpers ───────────────────────────────────────────────────────────────

    private CarrierProfileAuditLog validLog() {
        return CarrierProfileAuditLog.createNew(
            "tenant-1",
            "trucker-1",
            "PROFILE_UPDATE",
            "{\"name\":\"old\"}",
            "{\"name\":\"new\"}",
            "200",
            "192.168.1.1",
            "Mozilla/5.0"
        );
    }

    // ── createNew ─────────────────────────────────────────────────────────────

    @Nested
    class CreateNew {

        @Test
        void happyPath_returnsLogWithExpectedFields() {
            CarrierProfileAuditLog log = CarrierProfileAuditLog.createNew(
                "tenant-abc",
                "trucker-xyz",
                "EQUIPMENT_ADD",
                null,
                "{\"type\":\"FLATBED\"}",
                "201",
                "10.0.0.1",
                "PostmanRuntime/7.0"
            );

            assertNotNull(log.getId());
            assertEquals("tenant-abc", log.getTenantId());
            assertEquals("trucker-xyz", log.getTruckerId());
            assertEquals("EQUIPMENT_ADD", log.getAction());
            assertNull(log.getDataBefore());
            assertEquals("{\"type\":\"FLATBED\"}", log.getDataAfter());
            assertEquals("201", log.getStatusCode());
            assertEquals("10.0.0.1", log.getIpAddress());
            assertEquals("PostmanRuntime/7.0", log.getUserAgent());
            assertNotNull(log.getCreatedAt());
        }

        @Test
        void createdAtIsInUTC() {
            CarrierProfileAuditLog log = validLog();
            assertEquals(ZoneOffset.UTC, log.getCreatedAt().getOffset());
        }

        @Test
        void eachCallProducesUniqueId() {
            CarrierProfileAuditLog a = validLog();
            CarrierProfileAuditLog b = validLog();
            assertNotEquals(a.getId(), b.getId());
        }

        @Test
        void nullAction_throws() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierProfileAuditLog.createNew(
                    "t1", "tr1", null, null, null, "200", "127.0.0.1", "agent"
                )
            );
            assertEquals("Action is required", ex.getMessage());
        }

        @Test
        void blankAction_throws() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierProfileAuditLog.createNew(
                    "t1", "tr1", "  ", null, null, "200", "127.0.0.1", "agent"
                )
            );
            assertEquals("Action is required", ex.getMessage());
        }

        @Test
        void emptyAction_throws() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierProfileAuditLog.createNew(
                    "t1", "tr1", "", null, null, "200", "127.0.0.1", "agent"
                )
            );
        }

        @Test
        void nullStatusCode_throws() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierProfileAuditLog.createNew(
                    "t1", "tr1", "SOME_ACTION", null, null, null, "127.0.0.1", "agent"
                )
            );
            assertEquals("Status code is required", ex.getMessage());
        }

        @Test
        void blankStatusCode_throws() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierProfileAuditLog.createNew(
                    "t1", "tr1", "SOME_ACTION", null, null, "  ", "127.0.0.1", "agent"
                )
            );
            assertEquals("Status code is required", ex.getMessage());
        }

        @Test
        void emptyStatusCode_throws() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierProfileAuditLog.createNew(
                    "t1", "tr1", "SOME_ACTION", null, null, "", "127.0.0.1", "agent"
                )
            );
        }

        @Test
        void nullDataBeforeAndAfter_isAllowed() {
            CarrierProfileAuditLog log = CarrierProfileAuditLog.createNew(
                "t1", "tr1", "DELETE", null, null, "204", "127.0.0.1", "agent"
            );
            assertNull(log.getDataBefore());
            assertNull(log.getDataAfter());
        }

        @Test
        void nullIpAndUserAgent_isAllowed() {
            CarrierProfileAuditLog log = CarrierProfileAuditLog.createNew(
                "t1", "tr1", "SYSTEM_EVENT", null, null, "200", null, null
            );
            assertNull(log.getIpAddress());
            assertNull(log.getUserAgent());
        }
    }

    // ── equals / hashCode ─────────────────────────────────────────────────────

    @Nested
    class EqualsAndHashCode {

        @Test
        void sameInstance_isEqual() {
            CarrierProfileAuditLog log = validLog();
            assertEquals(log, log);
        }

        @Test
        void differentInstances_sameId_areEqual() {
            String sharedId = "same-id";
            CarrierProfileAuditLog a = new CarrierProfileAuditLog(
                sharedId, "t1", "tr1", "ACTION_A", null, null, "200", "1.1.1.1", "agentA",
                OffsetDateTime.now(ZoneOffset.UTC));
            CarrierProfileAuditLog b = new CarrierProfileAuditLog(
                sharedId, "t2", "tr2", "ACTION_B", "before", "after", "404", "2.2.2.2", "agentB",
                OffsetDateTime.now(ZoneOffset.UTC));
            assertEquals(a, b);
            assertEquals(a.hashCode(), b.hashCode());
        }

        @Test
        void differentIds_areNotEqual() {
            CarrierProfileAuditLog a = validLog();
            CarrierProfileAuditLog b = validLog();
            assertNotEquals(a, b);
        }

        @Test
        void nullId_notEqualToAnyOther() {
            CarrierProfileAuditLog nullId = new CarrierProfileAuditLog(
                null, "t1", "tr1", "ACTION", null, null, "200", "1.1.1.1", "agent",
                OffsetDateTime.now(ZoneOffset.UTC));
            assertNotEquals(nullId, validLog());
        }

        @Test
        void nullId_hashCodeIsZero() {
            CarrierProfileAuditLog nullId = new CarrierProfileAuditLog(
                null, "t1", "tr1", "ACTION", null, null, "200", "1.1.1.1", "agent",
                OffsetDateTime.now(ZoneOffset.UTC));
            assertEquals(0, nullId.hashCode());
        }

        @Test
        void notEqualToNull() {
            assertNotEquals(null, validLog());
        }

        @Test
        void notEqualToDifferentType() {
            assertNotEquals(validLog(), "some-string");
        }
    }
}
